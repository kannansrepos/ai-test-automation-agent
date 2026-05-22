import axios from 'axios';
import { cookies } from 'next/headers';

const GET = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_token')?.value;
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

export { GET };
