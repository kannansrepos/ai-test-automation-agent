import { getGithubToken } from '@/utils/githubHelper';

const GET = async () => {
  const token = await getGithubToken();
  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export { GET };
