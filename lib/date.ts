const TZ = 'Asia/Kolkata';

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { timeZone: TZ });
}

export function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-IN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleString('en-IN', { timeZone: TZ });
}

export function fmtShort(d: string | Date) {
  return new Date(d).toLocaleString('en-IN', { timeZone: TZ, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
