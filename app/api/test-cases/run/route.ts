import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/db';
import { TestCasesTable, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { existsSync } from 'fs';
import { chromium } from 'playwright-core';
import { getGithubToken, readGithubFile } from '../../../../utils/githubHelper';
import { playwrightTestcasePrompt } from '../../../../prompts/playwrightTestcasePrompt';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
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

      const globalIns = repoRecord?.globalInstructions
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstructions}\n`
        : '';

      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : '';

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

      await db
        .update(TestCasesTable)
        .set({
          testScript: scriptText,
          status: 'running',
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
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

    let browser: any = null;
    let context: any = null;
    let page: any = null;

    try {
      const executablePath =
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        process.env.CHROME_HEADLESS_SHELL_PATH ||
        process.env.PLAYWRIGHT_EXECUTABLE_PATH;
      const launchOptions: any = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      };

      if (executablePath) {
        if (!existsSync(executablePath)) {
          throw new Error(
            `Custom Chromium executable not found at ${executablePath}. ` +
              'Please verify PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or CHROME_HEADLESS_SHELL_PATH in your env.',
          );
        }

        launchOptions.executablePath = executablePath;
        logs.push(
          `[SYSTEM] Using custom Chromium executable path: ${executablePath}`,
        );
      } else {
        logs.push('[SYSTEM] Using default Playwright Chromium executable.');
      }

      browser = await chromium.launch(launchOptions);

      context = await browser.newContext();
      page = await context.newPage();

      page.on('console', (msg: any) => {
        logs.push(`[BROWSER] ${msg.type().toUpperCase()} ${msg.text()}`);
      });

      logs.push(
        '[SYSTEM] Playwright browser launched locally, executing script...',
      );

      const AsyncFunction = Object.getPrototypeOf(
        async function () {},
      ).constructor;
      const runFn = new AsyncFunction('page', 'assert', 'console', scriptText);

      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || 'Assertion failed');
        }
      };

      await runFn(page, assertHelper, customConsole);

      logs.push(
        '[SYSTEM] Script execution completed successfully without errors.',
      );

      await page.close().catch(() => {});
      await context.close().catch(() => {});
      await browser.close().catch(() => {});

      await db
        .update(TestCasesTable)
        .set({
          status: 'passed',
          testScript: scriptText,
          logs: logs,
          sessionId: null,
          sessionUrl: null,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: true,
        status: 'passed',
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError: any) {
      console.error('Script execution error:', execError);

      const execMessage = execError.message || String(execError);
      const installHint =
        execMessage.includes(
          'Looks like Playwright was just installed or updated',
        ) || execMessage.includes("Executable doesn't exist")
          ? `Playwright browser executable is missing. Run \`pnpm exec playwright install\` to install the browser binaries, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH / CHROME_HEADLESS_SHELL_PATH in your environment.`
          : undefined;

      logs.push(`[SYSTEM ERROR] Script execution failed: ${execMessage}`);

      await page?.close().catch(() => {});
      await context?.close().catch(() => {});
      await browser?.close().catch(() => {});

      await db
        .update(TestCasesTable)
        .set({
          status: 'failed',
          testScript: scriptText,
          logs: logs,
          sessionId: null,
          sessionUrl: null,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: false,
        status: 'failed',
        error: installHint ? `${execMessage} ${installHint}` : execMessage,
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
