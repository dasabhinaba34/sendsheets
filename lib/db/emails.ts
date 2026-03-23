import { getDb } from '../../db/client';
import { v4 as uuidv4 } from 'uuid';

export interface Draft {
  id: string;
  user_email: string;
  sheet_url: string;
  sheet_id: string;
  sheet_tab: string;
  subject_template: string;
  body_template: string;
  recipient_column: string;
  row_count: number;
  created_at: string;
  updated_at: string;
}

export interface SentCampaign {
  id: string;
  user_email: string;
  draft_id: string | null;
  sheet_id: string;
  sheet_tab: string;
  subject_template: string;
  body_template: string;
  recipient_column: string;
  total_rows: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_at: string;
  completed_at: string | null;
}

export interface SentEmail {
  id: string;
  campaign_id: string;
  recipient: string;
  subject: string;
  body: string;
  gmail_message_id: string | null;
  status: string;
  error: string | null;
  opened_at: string | null;
  open_count: number;
  sent_at: string;
}

function toRow<T>(r: Record<string, unknown>): T {
  return r as unknown as T;
}

export async function saveDraft(data: Omit<Draft, 'id' | 'created_at' | 'updated_at'>): Promise<Draft> {
  const db = getDb();
  const id = uuidv4();
  await db.execute({
    sql: `INSERT INTO drafts (id, user_email, sheet_url, sheet_id, sheet_tab, subject_template, body_template, recipient_column, row_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.user_email, data.sheet_url, data.sheet_id, data.sheet_tab, data.subject_template, data.body_template, data.recipient_column, data.row_count],
  });
  return (await getDraftById(id))!;
}

export async function getDraftById(id: string): Promise<Draft | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM drafts WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return null;
  return toRow<Draft>(result.rows[0] as Record<string, unknown>);
}

export async function getDraftsByUser(userEmail: string): Promise<Draft[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM drafts WHERE user_email = ? ORDER BY updated_at DESC',
    args: [userEmail],
  });
  return result.rows.map((r) => toRow<Draft>(r as Record<string, unknown>));
}

export async function deleteDraft(id: string, userEmail: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM drafts WHERE id = ? AND user_email = ?', args: [id, userEmail] });
}

export async function createCampaign(data: Omit<SentCampaign, 'sent_count' | 'failed_count' | 'status' | 'sent_at' | 'completed_at'>): Promise<SentCampaign> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO sent_campaigns (id, user_email, draft_id, sheet_id, sheet_tab, subject_template, body_template, recipient_column, total_rows)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.id, data.user_email, data.draft_id, data.sheet_id, data.sheet_tab ?? 'Sheet1', data.subject_template, data.body_template, data.recipient_column, data.total_rows],
  });
  return (await getCampaignById(data.id))!;
}

export async function getCampaignById(id: string): Promise<SentCampaign | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM sent_campaigns WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return null;
  return toRow<SentCampaign>(result.rows[0] as Record<string, unknown>);
}

export async function getCampaignsByUser(userEmail: string): Promise<SentCampaign[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sent_campaigns WHERE user_email = ? ORDER BY sent_at DESC',
    args: [userEmail],
  });
  return result.rows.map((r) => toRow<SentCampaign>(r as Record<string, unknown>));
}

export async function updateCampaignStatus(id: string, status: string, sentCount: number, failedCount: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE sent_campaigns SET status = ?, sent_count = ?, failed_count = ?, completed_at = datetime('now') WHERE id = ?`,
    args: [status, sentCount, failedCount, id],
  });
}

export async function updateCampaignProgress(id: string, sentCount: number, failedCount: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE sent_campaigns SET sent_count = ?, failed_count = ? WHERE id = ?`,
    args: [sentCount, failedCount, id],
  });
}

export async function recordSentEmail(data: Omit<SentEmail, 'sent_at' | 'opened_at' | 'open_count'>): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO sent_emails (id, campaign_id, recipient, subject, body, gmail_message_id, status, error)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.id, data.campaign_id, data.recipient, data.subject, data.body, data.gmail_message_id, data.status, data.error],
  });
}

export async function getSentEmailsByCampaign(campaignId: string): Promise<SentEmail[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sent_emails WHERE campaign_id = ? ORDER BY sent_at',
    args: [campaignId],
  });
  return result.rows.map((r) => toRow<SentEmail>(r as Record<string, unknown>));
}
