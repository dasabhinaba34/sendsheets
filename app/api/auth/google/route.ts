import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/google/oauth';

export async function GET(req: NextRequest) {
  try {
    const returnTo = req.nextUrl.searchParams.get('returnTo')
    const state = returnTo ? Buffer.from(returnTo).toString('base64url') : undefined
    const authUrl = buildAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('[auth/google] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
