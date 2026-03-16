import { createClient, type Client } from '@libsql/client';
import path from 'path';

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url =
      process.env.TURSO_DATABASE_URL ??
      `file:${path.resolve(process.cwd(), 'data', 'sendsheets.db')}`;
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}
