import { getDb } from '../../db/client';

export async function getApiKey(): Promise<{ key: string; createdAt: string } | null> {
  const db = getDb();
  const result = await db.execute('SELECT key, created_at FROM api_keys ORDER BY id DESC LIMIT 1');
  if (result.rows.length === 0) return null;
  return {
    key: result.rows[0].key as string,
    createdAt: result.rows[0].created_at as string,
  };
}

export async function setApiKey(key: string): Promise<void> {
  const db = getDb();
  await db.execute('DELETE FROM api_keys');
  await db.execute({ sql: 'INSERT INTO api_keys (key) VALUES (?)', args: [key] });
}
