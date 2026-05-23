import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

import {
  getGithubToken,
  getRepoTree,
  readGithubFile,
} from '@/utils/githubHelper';
import TestCasesGenerationPrompt from '@/prompts/testcaseGenerationPrompt';
import { db, TestCasesTable } from '@/db';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const POST = async (request: NextRequest) => {
  try {
    const requestData = await request.json();
    const { id, userId, repoId, owner, repo, branch = 'main' } = requestData;
    const githubToken = await getGithubToken();

    //Validate the User Input
    // if (!userId || !repoId || !owner || !repo || !githubToken) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'Missing required parameters',
    //     },
    //     { status: 400 },
    //   );
    // }
    if (!githubToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'GitHub token is missing',
        },
        { status: 400 },
      );
    }
    // 1. Fetch repository tree
    const repoTree = await await getRepoTree({
      owner,
      repo,
      branch,
      githubToken,
    });

    // 2. Read useful files
    const fileContents = await Promise.all(
      repoTree.map((file: any) =>
        readGithubFile({ owner, repo, branch, githubToken }, file.path),
      ),
    );

    const validFiles = fileContents.filter(Boolean);

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No useful source files found in the repository',
        },
        { status: 400 },
      );
    }

    // 3. Prepare compact repo context
    const repoContext = validFiles
      .map(
        (file: any) =>
          `File Path: ${file.path}\nFile Content:\n${file.content}`,
      )
      .join('\n\n---------------------\n\n');
    // 4. Generate test cases using Gemini
    const prompt = TestCasesGenerationPrompt({
      owner,
      repo,
      branch,
      repoContext,
    });

    // 5. Call Gemini API with structured response schema
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                  },
                  description: {
                    type: Type.STRING,
                  },
                  type: {
                    type: Type.STRING,
                    enum: [
                      'ui',
                      'auth',
                      'api',
                      'form',
                      'integration',
                      'edge-case',
                    ],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ['low', 'medium', 'high'],
                  },
                  targetRoute: {
                    type: Type.STRING,
                  },
                  targetFiles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                  expectedResult: {
                    type: Type.STRING,
                  },
                },
                required: [
                  'title',
                  'description',
                  'type',
                  'priority',
                  'targetRoute',
                  'targetFiles',
                  'expectedResult',
                ],
              },
            },
          },
          required: ['testCases'],
        },
      },
    });
    const aiResult = JSON.parse(response.text || '{}');
    const testCases = aiResult.testCases || [];

    if (!testCases.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini did not generate any test cases',
        },
        { status: 400 },
      );
    }

    // 6. Store generated test cases in the database
    const insertedTestCases = await db
      .insert(TestCasesTable)
      .values(
        testCases.map((testCase: any) => ({
          userId,
          repoId: id,
          githubRepoId: repoId,
          repoName: repo,
          repoOwner: owner,
          branch,
          title: testCase.title,
          description: testCase.description,
          type: testCase.type,
          priority: testCase.priority,
          targetRoute: testCase.targetRoute,
          targetFile: JSON.stringify(testCase.targetFiles) || [],
          expectedResult: testCase.expectedResult,
          testScript: '', // Placeholder for future test script generation
          status: 'generated',
        })),
      )
      .returning();

    // 7. Return the generated test cases in the response
    return NextResponse.json(
      {
        success: true,
        message: `${testCases.length} test cases generated successfully`,
        count: testCases.length,
        testCases: insertedTestCases,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error generating test cases:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate test cases',
      },
      { status: 500 },
    );
  }
};

export { POST };
