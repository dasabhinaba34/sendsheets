import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/google/gmail';
import { interpolate } from '@/lib/template';
import { createCampaign, updateCampaignStatus, recordSentEmail, getCampaignsByUser } from '@/lib/db/emails';
import { upsertContact } from '@/lib/db/contacts';
import { v4 as uuidv4 } from 'uuid';

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

  let sentCount = 0;
  let failedCount = 0;

  for (const row of rows) {
    const to = row[recipientColumn];
    const subject = interpolate(subjectTemplate, row);
    const emailBody = interpolate(bodyTemplate, row);
    const emailId = uuidv4();

    try {
      const gmailId = await sendEmail(session.userEmail, to, subject, emailBody, session.userName, emailId, trackOpens);
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
      await upsertContact(session.userEmail, to);
      sentCount++;
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
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
      failedCount++;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  const status = failedCount === 0 ? 'done' : sentCount === 0 ? 'failed' : 'partial';
  await updateCampaignStatus(campaignId, status, sentCount, failedCount);

  return NextResponse.json({ campaignId, sentCount, failedCount, status });
}
