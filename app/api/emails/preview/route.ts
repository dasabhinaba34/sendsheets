import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { interpolate } from '@/lib/template';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { subjectTemplate, bodyTemplate, row } = body;

  if (!subjectTemplate || !bodyTemplate || !row) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const previewSubject = interpolate(subjectTemplate, row);
  const previewBody = interpolate(bodyTemplate, row);

  return NextResponse.json({ previewSubject, previewBody });
}
