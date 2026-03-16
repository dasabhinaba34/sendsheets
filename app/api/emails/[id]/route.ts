import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { getCampaignById, getSentEmailsByCampaign, deleteDraft } from '@/lib/db/emails';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign || campaign.user_email !== session.userEmail) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const emails = await getSentEmailsByCampaign(id);
  return NextResponse.json({ campaign, emails });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deleteDraft(id, session.userEmail);
  return NextResponse.json({ ok: true });
}
