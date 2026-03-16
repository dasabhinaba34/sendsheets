import { getDb } from '../../db/client';

export interface GoogleTokenRecord {
  email: string;
  name: string | null;
  picture: string | null;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  scope: string | null;
}

export async function saveTokens(data: GoogleTokenRecord): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO google_tokens
            (email, name, picture, access_token, refresh_token, expires_at, scope, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [data.email, data.name, data.picture, data.access_token, data.refresh_token, data.expires_at, data.scope],
  });
}

export async function getTokensByEmail(email: string): Promise<GoogleTokenRecord | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM google_tokens WHERE email = ?', args: [email] });
  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    email: r.email as string,
    name: r.name as string | null,
    picture: r.picture as string | null,
    access_token: r.access_token as string,
    refresh_token: r.refresh_token as string | null,
    expires_at: r.expires_at as string,
    scope: r.scope as string | null,
  };
}

export async function clearTokens(email: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM google_tokens WHERE email = ?', args: [email] });
}
