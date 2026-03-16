import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/client';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const db = getDb();
    await db.execute({
      sql: `UPDATE sent_emails
            SET open_count = open_count + 1,
                opened_at  = COALESCE(opened_at, datetime('now'))
            WHERE id = ?`,
      args: [id],
    });
  } catch {
    // never fail on tracking errors
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
    },
  });
}
