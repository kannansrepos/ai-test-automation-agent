import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '@/db';
import { TestCasesTable, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Browserbase from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';
import axios from 'axios';
import { getGithubToken, readGithubFile } from '../../../../utils/githubHelper';
import { playwrightTestcasePrompt } from '../../../../prompts/playwrightTestcasePrompt';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { testCaseId, baseUrl, mode = 'generate', customPrompt = '' } = body;

    if (!testCaseId || !baseUrl) {
      return NextResponse.json(
        {
          error: 'testCaseId and baseUrl are required',
        },
        { status: 400 },
      );
    }

    // 1. Fetch test case from DB
    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 },
      );
    }

    // Fetch repository settings for global instructions
    let repoRecord = null;

    if (testCase.repoId) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.repoId, Number(testCase.repoId)));

      repoRecord = r;
    }

    if (!repoRecord) {
      const [r] = await db
        .select()
        .from(repositories)
        .where(
          eq(
            repositories.fullName,
            `${testCase.repoOwner}/${testCase.repoName}`,
          ),
        );

      repoRecord = r;
    }

    let scriptText = testCase.testScript;

    const forceRegenerate = mode === 'generate' || !scriptText;
    // 2. Generate script using Gemini if forced, or if no script is cached
    if (forceRegenerate) {
      const githubToken = await getGithubToken();
      if (!githubToken) {
        return NextResponse.json(
          { error: 'GitHub token not found in cookies' },
          { status: 400 },
        );
      }
      // Fetch target files context
      const targetFiles = testCase.targetFiles || [];

      let repoContext = '';

      if (targetFiles.length > 0) {
        const fileContents = await Promise.all(
          targetFiles.map((p) =>
            readGithubFile(
              {
                owner: testCase.repoOwner,
                repo: testCase.repoName,
                branch: testCase.branch || 'main',
                githubToken,
              },
              p,
            ),
          ),
        );

        const validFiles = fileContents.filter(Boolean);

        repoContext = validFiles
          .map(
            (file: any) => `
File Path: ${file.path}

File Content:
${file.content}
`,
          )
          .join('\n\n----------------------------------\n\n');
      }

      // Build global instructions and runtime prompt
      const globalIns = repoRecord?.globalInstructions
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstructions}\n`
        : '';

      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : '';

      // Prompt Gemini for Playwright code string
      const prompt = playwrightTestcasePrompt(
        baseUrl,
        testCase,
        globalIns,
        tempIns,
        repoContext,
      );

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        contents: prompt,
      });
      let generatedCode = response.text || '';

      // Clean up any stray markdown wrappers just in case
      generatedCode = generatedCode.replace(/^```javascript\s*/i, '');
      generatedCode = generatedCode.replace(/```$/i, '');
      generatedCode = generatedCode.trim();

      if (!generatedCode) {
        return NextResponse.json(
          { error: 'Gemini failed to generate an automation script' },
          { status: 500 },
        );
      }

      scriptText = generatedCode;

      // Save the generated script immediately to database
      await db
        .update(TestCasesTable)
        .set({
          testScript: scriptText,
          status: 'running',
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      // 3. Mark database status as running
      await db
        .update(TestCasesTable)
        .set({
          status: 'running',
        })
        .where(eq(TestCasesTable.id, testCase.id));
    }
    const logs: string[] = [];

    const customConsole = {
      log: (...args: any[]) =>
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' '),
        ),

      error: (...args: any[]) =>
        logs.push(
          '[ERROR] ' +
            args
              .map((a) =>
                typeof a === 'object' ? JSON.stringify(a) : String(a),
              )
              .join(' '),
        ),

      warn: (...args: any[]) =>
        logs.push(
          '[WARN] ' +
            args
              .map((a) =>
                typeof a === 'object' ? JSON.stringify(a) : String(a),
              )
              .join(' '),
        ),
    };

    let session: any = null;
    let browser: any = null;

    try {
      // 4. Create Browserbase Session
      session = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
      });

      logs.push(
        `[SYSTEM] Browserbase session created successfully with ID: ${session.id}`,
      );

      // 5. Connect Playwright to Session

      browser = await chromium.connectOverCDP(session.connectUrl);

      const context = browser.contexts()[0];

      const page = context.pages()[0];

      // 6. Listen to Browser Console Events
      page.on('console', (msg: any) => {
        logs.push(`[BROWSER] ${msg.type().toUpperCase()} ${msg.text()}`);
      });

      logs.push(
        '[SYSTEM] Connected to Browserbase cloud browser, executing script...',
      );

      // 7. Compile and run script
      const AsyncFunction = Object.getPrototypeOf(
        async function () {},
      ).constructor;

      const runFn = new AsyncFunction('page', 'assert', 'console', scriptText);

      // Mock assertion helper for runtime container if script assumes assert is global
      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || 'Assertion failed');
        }
      };

      await runFn(page, assertHelper, customConsole);

      logs.push(
        '[SYSTEM] Script execution completed successfully without errors.',
      );

      // 8. Clean up session and browser
      await page.close().catch(() => {});
      await browser.close().catch(() => {});

      // Update DB status to passed
      await db
        .update(TestCasesTable)
        .set({
          status: 'passed',
          testScript: scriptText,
          logs: logs,
          sessionId: session.id,
          sessionUrl: `https://app.browserbase.com/sessions/${session.id}`,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: true,
        status: 'passed',
        sessionId: session.id,
        sessionUrl: `https://app.browserbase.com/sessions/${session.id}`,
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError: any) {
      console.error('Script execution error:', execError);

      logs.push(
        `[SYSTEM ERROR] Script execution failed: ${
          execError.message || String(execError)
        }`,
      );

      // Clean up session and browser if still active
      if (browser) {
        await browser.close().catch(() => {});
      }

      // 10. Update DB status to failed
      await db
        .update(TestCasesTable)
        .set({
          status: 'failed',
          testScript: scriptText,
          logs: logs,
          sessionId: session?.id || null,
          sessionUrl: session
            ? `https://www.browserbase.com/sessions/${session.id}`
            : null,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: false,
        status: 'failed',
        error: execError.message || String(execError),
        sessionId: session?.id,
        sessionUrl: session
          ? `https://www.browserbase.com/sessions/${session.id}`
          : null,
        logs,
        browserbaseScript: scriptText,
      });
    }
  } catch (error: any) {
    console.error('API endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
