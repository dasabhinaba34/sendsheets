import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { getCampaignById, getSentEmailsByCampaign, deleteDraft, updateCampaignStatus } from '@/lib/db/emails';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let campaign = await getCampaignById(id);
  if (!campaign || campaign.user_email !== session.userEmail) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const emails = await getSentEmailsByCampaign(id);

  // Self-heal campaigns stuck as 'sending' — caused by function timeouts before the
  // try/finally fix. If no new emails have arrived in the last 2 minutes, reconcile.
  if (campaign.status === 'sending') {
    const sentCount   = emails.filter((e) => e.status === 'sent').length;
    const failedCount = emails.filter((e) => e.status === 'failed').length;
    const processed   = sentCount + failedCount;
    const allDone     = processed >= campaign.total_rows;
    const lastEmailAt = emails.length > 0
      ? Math.max(...emails.map((e) => new Date(e.sent_at).getTime()))
      : null;
    const stale = lastEmailAt !== null && Date.now() - lastEmailAt > 2 * 60 * 1000;

    if (allDone || stale) {
      const status = sentCount === 0 ? 'failed' : failedCount === 0 ? 'done' : 'partial';
      await updateCampaignStatus(id, status, sentCount, failedCount);
      campaign = { ...campaign, status, sent_count: sentCount, failed_count: failedCount };
    }
  }

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
