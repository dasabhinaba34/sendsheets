import { google } from 'googleapis';
import { getOAuth2Client } from './oauth';
import { getTokensByEmail, saveTokens } from '../db/tokens';

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function makeRawEmail({
  to, subject, body, from, fromName, sendAsHtml, trackingPixelUrl,
}: {
  to: string;
  subject: string;
  body: string;
  from: string;
  fromName?: string;
  sendAsHtml: boolean;
  trackingPixelUrl?: string;
}): string {
  const fromHeader = fromName ? `"${fromName}" <${from}>` : from;

  if (!sendAsHtml) {
    // Plain text — strip any HTML tags (body may come from the rich text editor)
    const plain = htmlToPlainText(body);
    const message = [
      `From: ${fromHeader}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      plain,
    ].join('\r\n');
    return Buffer.from(message).toString('base64url');
  }

  // HTML email with plain-text fallback
  const plain = htmlToPlainText(body);
  const pixel = trackingPixelUrl
    ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`
    : '';
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;font-size:15px;color:#222;line-height:1.6">${body}${pixel}</body></html>`;

  const boundary = `boundary_${Date.now()}`;
  const message = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    plain,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    '',
    `--${boundary}--`,
  ].join('\r\n');
  return Buffer.from(message).toString('base64url');
}

export async function sendEmail(
  userEmail: string,
  to: string,
  subject: string,
  body: string,
  fromName?: string,
  emailId?: string,
  trackOpens = false
): Promise<string> {
  const tokenRecord = await getTokensByEmail(userEmail);
  if (!tokenRecord) throw new Error('No tokens found for user');

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenRecord.access_token,
    refresh_token: tokenRecord.refresh_token ?? undefined,
    expiry_date: new Date(tokenRecord.expires_at).getTime(),
  });

  oauth2Client.on('tokens', (newTokens) => {
    void saveTokens({
      ...tokenRecord,
      access_token: newTokens.access_token ?? tokenRecord.access_token,
      refresh_token: newTokens.refresh_token ?? tokenRecord.refresh_token,
      expires_at: newTokens.expiry_date
        ? new Date(newTokens.expiry_date).toISOString()
        : tokenRecord.expires_at,
    });
  });

  const trackingPixelUrl =
    trackOpens && emailId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${emailId}`
      : undefined;

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const raw = makeRawEmail({
    to,
    subject,
    body,
    from: userEmail,
    fromName,
    sendAsHtml: trackOpens, // HTML only when tracking (or when we want formatting)
    trackingPixelUrl,
  });

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return result.data.id ?? '';
}
