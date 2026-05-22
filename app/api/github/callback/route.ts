import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(
      new URL('/workspace?error=missing_code', request.url),
    );
  }
  const tokenResponse = await axios.post(
    process.env.GITHUB_TOKEN_URI!,
    {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  const tokenData = await tokenResponse.data;
  if (!tokenData.access_token) {
    return NextResponse.redirect(
      new URL('/workspace?error=token_generation_failed', request.url),
    );
  }
  const response = NextResponse.redirect(new URL(`/workspace`, request.url));

  // store token in http-only cookie
  response.cookies.set('github_token', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    sameSite: 'lax',
  });
  return response;
};

export { GET };
