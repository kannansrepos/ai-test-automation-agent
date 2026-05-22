import { redirect } from 'next/navigation';

const GET = async () => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: 'repo read:user',
  });
  redirect(`${process.env.GITHUB_AUTH_URI}?${params.toString()}`);
};

export { GET };
