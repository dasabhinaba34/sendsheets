const TZ = 'Asia/Kolkata';

// SQLite datetime('now') returns "YYYY-MM-DD HH:MM:SS" without timezone — treat as UTC
function toDate(d: string | Date): Date {
  if (d instanceof Date) return d;
  // If already ISO with T/Z, parse as-is; otherwise append Z to force UTC
  return new Date(d.includes('T') || d.endsWith('Z') ? d : d.replace(' ', 'T') + 'Z');
}

export function fmtDate(d: string | Date) {
  return toDate(d).toLocaleDateString('en-IN', { timeZone: TZ });
}

export function fmtTime(d: string | Date) {
  return toDate(d).toLocaleTimeString('en-IN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function fmtDateTime(d: string | Date) {
  return toDate(d).toLocaleString('en-IN', { timeZone: TZ });
}

export function fmtShort(d: string | Date) {
  return toDate(d).toLocaleString('en-IN', { timeZone: TZ, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
