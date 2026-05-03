import { getDb } from '../../db/client';

export interface ProviderConfig {
  user_email: string;
  provider: 'gmail' | 'postmark';
  from_email: string | null;
  from_name: string | null;
  api_key: string | null;
}

export async function getProviderConfig(userEmail: string): Promise<ProviderConfig | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM provider_configs WHERE user_email = ?',
    args: [userEmail],
  });
  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    user_email: r.user_email as string,
    provider: r.provider as 'gmail' | 'postmark',
    from_email: r.from_email as string | null,
    from_name: r.from_name as string | null,
    api_key: r.api_key as string | null,
  };
}

export async function saveProviderConfig(config: ProviderConfig): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO provider_configs (user_email, provider, from_email, from_name, api_key, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    args: [config.user_email, config.provider, config.from_email, config.from_name, config.api_key],
  });
}
