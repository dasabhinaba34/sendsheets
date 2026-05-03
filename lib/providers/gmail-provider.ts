import { sendEmail } from '../google/gmail';
import type { EmailProvider, EmailPayload, SendResult } from './index';

export class GmailProvider implements EmailProvider {
  constructor(private userEmail: string, private userName?: string) {}

  async send(payload: EmailPayload): Promise<SendResult> {
    const messageId = await sendEmail(
      this.userEmail,
      payload.to,
      payload.subject,
      payload.body,
      this.userName,
      payload.emailId,
      payload.trackOpens ?? false,
    );
    return { messageId };
  }
}
