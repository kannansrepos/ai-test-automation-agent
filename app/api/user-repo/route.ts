import { NextRequest } from 'next/server';
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
  }
};

export { POST };
