import { getProviderConfig } from '../db/provider';
import { GmailProvider } from './gmail-provider';
import { PostmarkProvider } from './postmark-provider';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  emailId?: string;
  trackOpens?: boolean;
}

export interface SendResult {
  messageId: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<SendResult>;
}

export async function getProvider(userEmail: string, userName?: string): Promise<EmailProvider> {
  const config = await getProviderConfig(userEmail);

  if (!config || config.provider === 'gmail') {
    return new GmailProvider(userEmail, userName);
  }

  if (config.provider === 'postmark') {
    if (!config.from_email) {
      throw new Error('Postmark is configured as your provider but no From address is set. Please check Settings.');
    }
    return new PostmarkProvider(config.from_email, config.from_name ?? undefined);
  }

  throw new Error(`Unknown provider: ${config.provider}`);
}
