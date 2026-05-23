import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

import { db, TestCasesTable } from '@/db';

const GET = async (request: NextRequest) => {
  const searchParams = new URL(request.url).searchParams;
  const repoId = searchParams.get('repoId');
  if (!repoId) {
    return new Response('Missing repoId parameter', { status: 400 });
  }

  // Get All test cases for the given repository ID from the database
  const testCases = await db
    .select()
    .from(TestCasesTable)
    .where(eq(TestCasesTable.repoId, parseInt(repoId)));

  return new Response(JSON.stringify(testCases), { status: 200 });
};

const PUT = async (request: NextRequest) => {
  const searchParams = new URL(request.url).searchParams;
  const testcaseId = searchParams.get('testcaseId');
  const { title, description, targetRoute, expectedResult } =
    await request.json();
  if (!testcaseId) {
    return new Response('Missing testcaseId parameter', { status: 400 });
  }
  try {
    const updatedTestCase = await db
      .update(TestCasesTable)
      .set({
        title,
        description,
        targetRoute,
        expectedResult,
      })
      .where(eq(TestCasesTable.id, parseInt(testcaseId)))
      .returning();
    return new Response(JSON.stringify(updatedTestCase), { status: 200 });
  } catch (error) {
    return new Response('Error updating test case', { status: 500 });
  }
};

export { GET, PUT };
