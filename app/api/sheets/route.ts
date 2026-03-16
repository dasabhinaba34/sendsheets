import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { parseSheetId, fetchSheetData, fetchSheetTabs } from '@/lib/google/sheets';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { url, tab = 'Sheet1' } = body;

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const sheetId = parseSheetId(url);
  if (!sheetId) {
    return NextResponse.json({ error: 'Invalid Google Sheet URL' }, { status: 400 });
  }

  try {
    const [tabs, data] = await Promise.all([
      fetchSheetTabs(session.userEmail, sheetId),
      fetchSheetData(session.userEmail, sheetId, tab),
    ]);
    return NextResponse.json({ sheetId, tabs, activeTab: tab, ...data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sheet data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
