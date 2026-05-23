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

export { GET };
