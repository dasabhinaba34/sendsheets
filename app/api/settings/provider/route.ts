import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { getProviderConfig, saveProviderConfig } from '@/lib/db/provider';
import { verifyPostmarkConnection } from '@/lib/providers/postmark-provider';

async function requireAuth(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session.userEmail ?? null;
}

export async function GET() {
  const userEmail = await requireAuth();
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await getProviderConfig(userEmail);
  return NextResponse.json({
    provider: config?.provider ?? 'gmail',
    fromEmail: config?.from_email ?? null,
    fromName: config?.from_name ?? null,
  });
}

export async function POST(req: NextRequest) {
  const userEmail = await requireAuth();
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, provider, fromEmail, fromName } = body as {
    action?: string;
    provider: 'gmail' | 'postmark';
    fromEmail?: string;
    fromName?: string;
  };

  if (provider === 'postmark') {
    if (!fromEmail) {
      return NextResponse.json({ error: 'From address is required for Postmark.' }, { status: 400 });
    }

    if (action === 'test') {
      try {
        await verifyPostmarkConnection();
        return NextResponse.json({ ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connection failed.';
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    await saveProviderConfig({ user_email: userEmail, provider: 'postmark', from_email: fromEmail, from_name: fromName ?? null, api_key: null });
    return NextResponse.json({ ok: true });
  }

  await saveProviderConfig({ user_email: userEmail, provider: 'gmail', from_email: null, from_name: null, api_key: null });
  return NextResponse.json({ ok: true });
}
