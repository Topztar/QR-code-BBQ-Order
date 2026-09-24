export function getTaiwanDateString(d: Date | string = new Date()): string {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

export function getTaiwanTimeParts(d: Date | string = new Date()) {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) {
    return { year: 0, month: 0, date: 0, dayOfWeek: 0, hours: 0, minutes: 0, dateStr: '' };
  }

  // A robust way to get parts for Asia/Taipei
  const tzhString = dateObj.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  const tzDate = new Date(tzhString);

  return {
    year: tzDate.getFullYear(),
    month: tzDate.getMonth() + 1,
    date: tzDate.getDate(),
    dayOfWeek: tzDate.getDay(),
    hours: tzDate.getHours(),
    minutes: tzDate.getMinutes(),
    dateStr: getTaiwanDateString(dateObj)
  };
}

export function isSameTaiwanDate(d1: Date | string, d2: Date | string): boolean {
  if (!d1 || !d2) return false;
  return getTaiwanDateString(d1) === getTaiwanDateString(d2);
}

export function getMsUntilTaiwanMidnight(): number {
  const now = new Date();
  const tzhString = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  const tzDate = new Date(tzhString);
  
  const nextMidnight = new Date(tzDate);
  nextMidnight.setHours(24, 0, 0, 100); // 100ms after midnight to be safe
  
  return nextMidnight.getTime() - tzDate.getTime();
}
