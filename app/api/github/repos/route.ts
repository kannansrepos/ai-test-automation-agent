import axios from 'axios';
import { clearGithubToken, getGithubToken } from '@/utils/githubHelper';
import { NextRequest, NextResponse } from 'next/server';
import { db, repositories } from '../../../../db';
import { eq } from 'drizzle-orm';

const GET = async () => {
  const token = await getGithubToken();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Github token not found' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const allRepos = [];
  let page = 1;
  while (true) {
    const response = await axios.get(
      `${process.env.GITHUB_USER_REPOS_URI}?per_page=100&page=${page}&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    console.log(`Fetched page ${page} of repositories`, response.status);
    if (response.status === 401) {
      await clearGithubToken();
    }
    const repos = await response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      isPrivate: repo.private,
      language: repo.language,
      default_branch: repo.default_branch,
      owner: repo.owner.login,
      updated_at: repo.updated_at,
    }));
    allRepos.push(...repos);
    if (repos.length < 100) {
      break;
    }
    page++;
  }
  return new Response(JSON.stringify({ repos: allRepos }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

const PUT = async (request: NextRequest) => {
  try {
    const requestData = await request.json();
    const { repoId, targetDomain, globalInstructions } = requestData;
    const response = await db
      .update(repositories)
      .set({
        targetDomain,
        globalInstructions,
        updatedAt: new Date(),
      })
      .where(eq(repositories.repoId, repoId))
      .returning();

    return new NextResponse(JSON.stringify({ repo: response[0] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating repository settings:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update repository settings' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  } finally {
    // Optionally clear the token or perform any cleanup if needed
  }
};

export { GET, PUT };
