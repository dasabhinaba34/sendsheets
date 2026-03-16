import { google } from 'googleapis';
import { getOAuth2Client } from './oauth';
import { getTokensByEmail, saveTokens } from '../db/tokens';

export function parseSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function fetchSheetData(
  userEmail: string,
  sheetId: string,
  tabName = 'Sheet1'
): Promise<{ headers: string[]; rows: Record<string, string>[]; rowCount: number }> {
  const tokenRecord = await getTokensByEmail(userEmail);
  if (!tokenRecord) throw new Error('No tokens found for user');

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenRecord.access_token,
    refresh_token: tokenRecord.refresh_token ?? undefined,
    expiry_date: new Date(tokenRecord.expires_at).getTime(),
  });

  // Auto-refresh listener
  oauth2Client.on('tokens', (newTokens) => {
    void saveTokens({
      ...tokenRecord,
      access_token: newTokens.access_token ?? tokenRecord.access_token,
      refresh_token: newTokens.refresh_token ?? tokenRecord.refresh_token,
      expires_at: newTokens.expiry_date
        ? new Date(newTokens.expiry_date).toISOString()
        : tokenRecord.expires_at,
    });
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName,
  });

  const values = response.data.values ?? [];
  if (values.length === 0) return { headers: [], rows: [], rowCount: 0 };

  const headers = values[0].map(String);
  const rows = values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = String(row[i] ?? '');
    });
    return obj;
  });

  return { headers, rows, rowCount: rows.length };
}
