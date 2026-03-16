import { getDb } from './client';
import fs from 'fs';
import path from 'path';

export async function migrate() {
  const db = getDb();
  const schema = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf-8');

  // Execute each statement individually (libSQL doesn't batch DDL)
  const statements = schema
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
  ]) {
    try {
      await db.execute(stmt);
    } catch {
      // Column already exists
    }
  }

  console.log('Migration complete');
}
