import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { saveDraft, getDraftsByUser } from '@/lib/db/emails';

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const drafts = await getDraftsByUser(session.userEmail);
  return NextResponse.json({ drafts });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sheetUrl, sheetId, sheetTab, subjectTemplate, bodyTemplate, recipientColumn, rowCount } = body;

  if (!sheetUrl || !sheetId || !subjectTemplate || !bodyTemplate || !recipientColumn) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const draft = await saveDraft({
    user_email: session.userEmail,
    sheet_url: sheetUrl,
    sheet_id: sheetId,
    sheet_tab: sheetTab ?? 'Sheet1',
    subject_template: subjectTemplate,
    body_template: bodyTemplate,
    recipient_column: recipientColumn,
    row_count: rowCount ?? 0,
  });

  return NextResponse.json({ draft });
}
