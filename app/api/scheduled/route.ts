import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { getDb } from '@/db/client';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM scheduled_campaigns WHERE user_email = ? ORDER BY send_at',
    args: [session.userEmail],
  });

  return NextResponse.json({ scheduled: result.rows });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { draftId, sendAt } = body;

  if (!sendAt) {
    return NextResponse.json({ error: 'sendAt is required' }, { status: 400 });
  }

  const db = getDb();
  const id = uuidv4();
  await db.execute({
    sql: 'INSERT INTO scheduled_campaigns (id, user_email, draft_id, send_at) VALUES (?, ?, ?, ?)',
    args: [id, session.userEmail, draftId ?? null, sendAt],
  });

  return NextResponse.json({ id });
}
