import { getDb } from '../../db/client';
import { v4 as uuidv4 } from 'uuid';

export interface Contact {
  id: string;
  user_email: string;
  email: string;
  name: string | null;
  emails_received: number;
  last_emailed: string;
}

export async function upsertContact(userEmail: string, contactEmail: string, name?: string): Promise<void> {
  const db = getDb();
  const existing = await db.execute({
    sql: 'SELECT id FROM contacts WHERE user_email = ? AND email = ?',
    args: [userEmail, contactEmail],
  });
  if (existing.rows.length > 0) {
    await db.execute({
      sql: `UPDATE contacts SET emails_received = emails_received + 1, last_emailed = datetime('now'), name = COALESCE(?, name) WHERE user_email = ? AND email = ?`,
      args: [name ?? null, userEmail, contactEmail],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO contacts (id, user_email, email, name) VALUES (?, ?, ?, ?)`,
      args: [uuidv4(), userEmail, contactEmail, name ?? null],
    });
  }
}

export async function getContactsByUser(userEmail: string): Promise<Contact[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM contacts WHERE user_email = ? ORDER BY last_emailed DESC',
    args: [userEmail],
  });
  return result.rows.map((r) => r as unknown as Contact);
}
