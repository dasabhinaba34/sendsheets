import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, fetchUserInfo } from '@/lib/google/oauth';
import { saveTokens } from '@/lib/db/tokens';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`);
  }

  try {
    const tokens = await exchangeCode(code);
    const userInfo = await fetchUserInfo(tokens.access_token!);

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    await saveTokens({
      email: userInfo.email!,
      name: userInfo.name ?? null,
      picture: userInfo.picture ?? null,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      scope: tokens.scope ?? null,
    });

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.userEmail = userInfo.email!;
    session.userName = userInfo.name ?? undefined;
    session.userPicture = userInfo.picture ?? undefined;
    await session.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=token_exchange_failed`);
  }
}
