import { cookies } from 'next/headers';

const GET = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_token')?.value;
  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export { GET };
