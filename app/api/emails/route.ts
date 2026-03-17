import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/google/gmail';
import { interpolate } from '@/lib/template';
import { createCampaign, updateCampaignStatus, updateCampaignProgress, recordSentEmail, getCampaignsByUser } from '@/lib/db/emails';
import { upsertContact } from '@/lib/db/contacts';
import { v4 as uuidv4 } from 'uuid';

const PROGRESS_FLUSH_EVERY = 10; // write progress to DB after every N emails

async function runCampaign(
  campaignId: string,
  userEmail: string,
  userName: string | undefined,
  rows: Record<string, string>[],
  recipientColumn: string,
  subjectTemplate: string,
  bodyTemplate: string,
  trackOpens: boolean,
) {
  let sentCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const to = row[recipientColumn];
      const subject = interpolate(subjectTemplate, row);
      const emailBody = interpolate(bodyTemplate, row);
      const emailId = uuidv4();

      try {
        const gmailId = await sendEmail(userEmail, to, subject, emailBody, userName, emailId, trackOpens);
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
        sentCount++;
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        // best-effort — don't let a DB write failure abort the whole loop
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
        failedCount++;
      }

      // best-effort progress flush — don't let a DB hiccup abort the loop
      if ((i + 1) % PROGRESS_FLUSH_EVERY === 0) {
        try {
          await updateCampaignProgress(campaignId, sentCount, failedCount);
        } catch { /* ignore */ }
      }

      await new Promise((r) => setTimeout(r, 100));
    }
  } finally {
    // Always mark the campaign as complete, even if the loop crashed partway through
    const status = sentCount === 0 ? 'failed' : failedCount === 0 ? 'done' : 'partial';
    await updateCampaignStatus(campaignId, status, sentCount, failedCount);
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const campaigns = await getCampaignsByUser(session.userEmail);
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sheetId, subjectTemplate, bodyTemplate, recipientColumn, rows, draftId, trackOpens = false } = body;

  if (!sheetId || !subjectTemplate || !bodyTemplate || !recipientColumn || !rows) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const campaignId = uuidv4();
  await createCampaign({
    id: campaignId,
    user_email: session.userEmail,
    draft_id: draftId ?? null,
    sheet_id: sheetId,
    subject_template: subjectTemplate,
    body_template: bodyTemplate,
    recipient_column: recipientColumn,
    total_rows: rows.length,
  });

  // Kick off sending after the response is returned — does not block the HTTP request
  after(() =>
    runCampaign(
      campaignId,
      session.userEmail!,
      session.userName,
      rows,
      recipientColumn,
      subjectTemplate,
      bodyTemplate,
      trackOpens,
    )
  );

  return NextResponse.json({ campaignId, status: 'sending' });
}
