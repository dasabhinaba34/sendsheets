import nodemailer from 'nodemailer';
import { htmlToPlainText } from '../email-utils';
import type { EmailProvider, EmailPayload, SendResult } from './index';

function createTransport() {
  const token = process.env.POSTMARK_SMTP_TOKEN;
  if (!token) throw new Error('POSTMARK_SMTP_TOKEN is not set.');
  return nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    auth: { user: token, pass: token },
    headers: { 'X-PM-Message-Stream': 'outbound' },
  });
}

export class PostmarkProvider implements EmailProvider {
  constructor(private fromEmail: string, private fromName?: string) {}

  async send(payload: EmailPayload): Promise<SendResult> {
    const transport = createTransport();

    const trackingPixelUrl =
      payload.trackOpens && payload.emailId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${payload.emailId}`
        : undefined;

    const pixel = trackingPixelUrl
      ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`
      : '';

    const htmlBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.6;margin:0;padding:0}p{margin:0;padding:0;min-height:1em}p+p{margin-top:.6em}ul,ol{margin:.4em 0;padding-left:1.5em}li{margin:0;padding:0}blockquote{margin:.5em 0 .5em 1em;padding-left:.8em;border-left:3px solid #ccc;color:#555}a{color:#1a73e8}strong{font-weight:700}em{font-style:italic}code{font-family:monospace;background:#f4f4f4;padding:.1em .3em;border-radius:3px;font-size:13px}h1,h2,h3,h4,h5,h6{margin:.5em 0 .3em 0;line-height:1.3}</style></head><body>${payload.body}${pixel}</body></html>`;

    const from = this.fromName
      ? `"${this.fromName}" <${this.fromEmail}>`
      : this.fromEmail;

    const info = await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: htmlBody,
      text: htmlToPlainText(payload.body),
    });

    return { messageId: info.messageId ?? '' };
  }
}

export async function verifyPostmarkConnection(): Promise<void> {
  const transport = createTransport();
  await transport.verify();
}
