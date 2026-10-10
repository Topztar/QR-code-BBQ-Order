/**
 * Safely parse any date input (string, number, Date) to a valid Date object.
 * WebKit (iOS Safari) strictly rejects non-ISO formats like "YYYY-MM-DD HH:mm:ss",
 * causing Invalid Date crashes. This helper normalizes strings to ISO 8601 before parsing.
 *
 * @param d The date string, number or Date object to parse
 * @param fallbackToNow If true (default), returns new Date() for null/undefined/invalid values.
 *                      If false, returns new Date(NaN) so caller can detect invalid dates.
 */
export function parseSafeDate(
  d: Date | string | number | null | undefined,
  fallbackToNow: boolean = true
): Date {
  if (d === null || d === undefined || d === '') {
    return fallbackToNow ? new Date() : new Date(NaN);
  }
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return fallbackToNow ? new Date() : d;
    return d;
  }
  if (typeof d === 'number') {
    const res = new Date(d);
    return isNaN(res.getTime()) ? (fallbackToNow ? new Date() : res) : res;
  }
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (!trimmed) return fallbackToNow ? new Date() : new Date(NaN);

    // Convert "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm:ss" for WebKit compatibility
    const isoNormalized = trimmed.replace(
      /^(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/,
      '$1T$2'
    );
    const parsed = new Date(isoNormalized);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Direct fallback attempt for standard ISO or RFC strings
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }

    return fallbackToNow ? new Date() : new Date(NaN);
  }
  return fallbackToNow ? new Date() : new Date(NaN);
}

export function isValidDate(d: any): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

export function getTaiwanDateString(d: Date | string | number = new Date()): string {
  const dateObj = parseSafeDate(d, false);
  if (isNaN(dateObj.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

export function getTaiwanTimeParts(d: Date | string | number = new Date()) {
  const dateObj = parseSafeDate(d, false);
  if (isNaN(dateObj.getTime())) {
    return { year: 0, month: 0, date: 0, dayOfWeek: 0, hours: 0, minutes: 0, dateStr: '' };
  }

  // Use Intl.DateTimeFormat.formatToParts for Asia/Taipei - 100% deterministic across V8 and WebKit
  // Avoids new Date(toLocaleString()) which throws Invalid Date in iOS Safari
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(dateObj);
  let year = 0;
  let month = 0;
  let date = 0;
  let hours = 0;
  let minutes = 0;

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    else if (part.type === 'month') month = parseInt(part.value, 10);
    else if (part.type === 'day') date = parseInt(part.value, 10);
    else if (part.type === 'hour') hours = parseInt(part.value, 10);
    else if (part.type === 'minute') minutes = parseInt(part.value, 10);
  }

  // Mathematically calculate day of week in Taiwan without string parsing
  // Date.UTC(year, month - 1, date) gives exact day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = new Date(Date.UTC(year, month - 1, date)).getUTCDay();

  return {
    year,
    month,
    date,
    dayOfWeek,
    hours,
    minutes,
    dateStr: getTaiwanDateString(dateObj)
  };
}

export function isSameTaiwanDate(d1: Date | string | number, d2: Date | string | number): boolean {
  if (!d1 || !d2) return false;
  return getTaiwanDateString(d1) === getTaiwanDateString(d2);
}

export function getMsUntilTaiwanMidnight(): number {
  const now = new Date();
  const parts = getTaiwanTimeParts(now);
  if (parts.year === 0) return 24 * 3600 * 1000;
  
  // Calculate remaining ms in the current Taiwan day:
  const currentTaiwanSeconds = parts.hours * 3600 + parts.minutes * 60;
  const currentSeconds = now.getUTCSeconds();
  const currentMs = now.getUTCMilliseconds();
  const elapsedTodayMs = (currentTaiwanSeconds + currentSeconds) * 1000 + currentMs;
  const totalDayMs = 24 * 3600 * 1000;
  const remainingMs = totalDayMs - elapsedTodayMs + 100; // 100ms buffer after midnight
  return Math.max(1000, remainingMs);
}
