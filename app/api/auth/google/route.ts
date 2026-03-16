import { NextResponse } from 'next/server';
import { buildAuthUrl } from '@/lib/google/oauth';

export async function GET() {
  try {
    const authUrl = buildAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('[auth/google] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
