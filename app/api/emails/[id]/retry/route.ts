import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import {
  getCampaignById,
  getSentEmailsByCampaign,
  resetCampaignForRetry,
  recordSentEmail,
  updateCampaignStatus,
  updateCampaignProgress,
} from '@/lib/db/emails';
import { fetchSheetData } from '@/lib/google/sheets';
import { sendEmail } from '@/lib/google/gmail';
import { interpolate } from '@/lib/template';
import { upsertContact } from '@/lib/db/contacts';
import { v4 as uuidv4 } from 'uuid';

const PROGRESS_FLUSH_EVERY = 10;

async function resumeCampaign(
  campaignId: string,
  userEmail: string,
  userName: string | undefined,
  rows: Record<string, string>[],
  recipientColumn: string,
  subjectTemplate: string,
  bodyTemplate: string,
  baseSentCount: number,
  baseFailedCount: number,
) {
  let newSent = 0;
  let newFailed = 0;

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const to = row[recipientColumn];
      const subject = interpolate(subjectTemplate, row);
      const emailBody = interpolate(bodyTemplate, row);
      const emailId = uuidv4();

      try {
        const gmailId = await sendEmail(userEmail, to, subject, emailBody, userName, emailId, false);
        await recordSentEmail({
          id: emailId,
          campaign_id: campaignId,
          recipient: to,
          subject,
          body: emailBody,
          gmail_message_id: gmailId,
          status: 'sent',
          error: null,
        });
        await upsertContact(userEmail, to);
        newSent++;
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        try {
          await recordSentEmail({
            id: emailId,
            campaign_id: campaignId,
            recipient: to,
            subject,
            body: emailBody,
            gmail_message_id: null,
            status: 'failed',
            error,
          });
        } catch { /* ignore */ }
        newFailed++;
      }

      if ((i + 1) % PROGRESS_FLUSH_EVERY === 0) {
        try {
          await updateCampaignProgress(campaignId, baseSentCount + newSent, baseFailedCount + newFailed);
        } catch { /* ignore */ }
      }

      await new Promise((r) => setTimeout(r, 100));
    }
  } finally {
    const totalSent = baseSentCount + newSent;
    const totalFailed = baseFailedCount + newFailed;
    const status = totalSent === 0 ? 'failed' : totalFailed === 0 ? 'done' : 'partial';
    await updateCampaignStatus(campaignId, status, totalSent, totalFailed);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const isRetryable =
    campaign.status === 'partial' ||
    campaign.status === 'failed' ||
    (campaign.status === 'done' && campaign.sent_count < campaign.total_rows);

  if (!isRetryable) {
    return NextResponse.json({ error: 'No unsent recipients to retry' }, { status: 400 });
  }

  // Find which recipients were already successfully sent to
  const sentEmails = await getSentEmailsByCampaign(id);
  const alreadySent = new Set(
    sentEmails.filter((e) => e.status === 'sent').map((e) => e.recipient.toLowerCase().trim())
  );

  const baseSentCount = sentEmails.filter((e) => e.status === 'sent').length;
  const baseFailedCount = sentEmails.filter((e) => e.status === 'failed').length;

  // Re-fetch the sheet and filter out already-sent recipients
  const tab = campaign.sheet_tab ?? 'Sheet1';
  let sheetData: { rows: Record<string, string>[] };
  try {
    sheetData = await fetchSheetData(session.userEmail, campaign.sheet_id, tab);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sheet';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const remainingRows = sheetData.rows.filter((row) => {
    const recipient = (row[campaign.recipient_column] ?? '').toLowerCase().trim();
    return recipient && !alreadySent.has(recipient);
  });

  if (remainingRows.length === 0) {
    return NextResponse.json({ error: 'No remaining recipients to send to' }, { status: 400 });
  }

  // Reset this campaign back to 'sending' — resume in place
  await resetCampaignForRetry(id);

  after(() =>
    resumeCampaign(
      id,
      session.userEmail!,
      session.userName,
      remainingRows,
      campaign.recipient_column,
      campaign.subject_template,
      campaign.body_template,
      baseSentCount,
      baseFailedCount,
    )
  );

  return NextResponse.json({ status: 'sending', remainingCount: remainingRows.length });
}
