import { getDb } from './client';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS google_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at DATETIME NOT NULL,
  scope TEXT,
  updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  sheet_url TEXT NOT NULL,
  sheet_id TEXT NOT NULL,
  sheet_tab TEXT DEFAULT 'Sheet1',
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  recipient_column TEXT NOT NULL,
  row_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sent_campaigns (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  draft_id TEXT,
  sheet_id TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  recipient_column TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sending',
  sent_at DATETIME DEFAULT (datetime('now')),
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS sent_emails (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  gmail_message_id TEXT,
  status TEXT DEFAULT 'sent',
  error TEXT,
  opened_at DATETIME,
  open_count INTEGER DEFAULT 0,
  sent_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scheduled_campaigns (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  draft_id TEXT,
  send_at DATETIME NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  emails_received INTEGER DEFAULT 1,
  last_emailed DATETIME DEFAULT (datetime('now')),
  UNIQUE(user_email, email)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now'))
)
`;

export async function migrate() {
  const db = getDb();

  const statements = SCHEMA
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await db.execute(stmt);
  }

  // Add new columns safely (ignore if already exist)
  for (const stmt of [
    'ALTER TABLE sent_emails ADD COLUMN opened_at DATETIME',
    'ALTER TABLE sent_emails ADD COLUMN open_count INTEGER DEFAULT 0',
    "ALTER TABLE sent_campaigns ADD COLUMN sheet_tab TEXT DEFAULT 'Sheet1'",
    'ALTER TABLE sent_campaigns ADD COLUMN track_opens INTEGER DEFAULT 0',
  ]) {
    try {
      await db.execute(stmt);
    } catch {
      // Column already exists
    }
  }

  console.log('Migration complete');
}
