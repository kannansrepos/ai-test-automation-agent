import { NextRequest } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db, repositories } from '../../../db';

const POST = async (request: NextRequest) => {
  try {
    const {
      userId,
      repoId,
      repoName,
      fullName,
      description,
      htmlUrl,
      stargazersCount,
      isPrivate,
      language,
      defaultBranch,
      owner,
      updatedAt,
    } = await request.json();
    const result = await db
      .insert(repositories)
      .values({
        userId,
        repoId,
        name: repoName,
        fullName,
        description,
        htmlUrl,
        stargazersCount,
        private: isPrivate ? 1 : 0,
        language,
        defaultBranch,
        owner,
        updatedAt: new Date(updatedAt),
      })
      .returning();
    return new Response(JSON.stringify({ repository: result[0] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding user repository:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    const userRepos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, Number(userId)))
      .orderBy(desc(repositories.updatedAt));
    return new Response(JSON.stringify({ repositories: userRepos }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

export { POST, GET };
