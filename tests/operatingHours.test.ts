import { describe, it, expect } from 'vitest';

export interface OperatingSlot {
  id: string;
  name: string;
  start: string; // "17:00"
  end: string;   // "01:00" or "23:00"
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  isActive: boolean;
}

export function isStoreOpenAtTime(params: {
  dateStr: string; // "YYYY-MM-DD"
  timeStr: string; // "HH:MM"
  slots: OperatingSlot[];
  restDays: string[];
  servicePaused?: boolean;
}): boolean {
  const { dateStr, timeStr, slots, restDays, servicePaused = false } = params;

  if (servicePaused) return false;
  if (restDays.includes(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  const [targetH, targetM] = timeStr.split(':').map(Number);
  const targetMins = targetH * 60 + targetM;

  for (const slot of slots) {
    if (!slot.isActive) continue;
    if (!slot.days.includes(dayOfWeek)) continue;

    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (endMins > startMins) {
      // Normal daytime slot (e.g. 11:30 - 14:30)
      if (targetMins >= startMins && targetMins <= endMins) {
        return true;
      }
    } else {
      // Overnight slot (e.g. 17:00 - 02:00 next day)
      if (targetMins >= startMins || targetMins <= endMins) {
        return true;
      }
    }
  }

  return false;
}

describe('Operating Hours & Rest Day Logic', () => {
  const standardSlots: OperatingSlot[] = [
    {
      id: 'lunch',
      name: '午餐時段',
      start: '11:30',
      end: '14:30',
      days: [1, 2, 3, 4, 5], // Mon-Fri
      isActive: true
    },
    {
      id: 'dinner',
      name: '晚餐時段',
      start: '17:30',
      end: '02:00', // Overnight
      days: [0, 1, 2, 3, 4, 5, 6], // All week
      isActive: true
    }
  ];

  it('determines open status during normal daytime lunch slot', () => {
    const isOpen = isStoreOpenAtTime({
      dateStr: '2026-08-24', // Monday
      timeStr: '12:30',
      slots: standardSlots,
      restDays: []
    });

    expect(isOpen).toBe(true);
  });

  it('determines open status during overnight late night slot (e.g. 00:30)', () => {
    const isOpen = isStoreOpenAtTime({
      dateStr: '2026-08-24',
      timeStr: '00:30',
      slots: standardSlots,
      restDays: []
    });

    expect(isOpen).toBe(true);
  });

  it('determines closed status during afternoon break (15:30)', () => {
    const isOpen = isStoreOpenAtTime({
      dateStr: '2026-08-24',
      timeStr: '15:30',
      slots: standardSlots,
      restDays: []
    });

    expect(isOpen).toBe(false);
  });

  it('strictly marks store closed on specified rest days even during operating hours', () => {
    const isOpen = isStoreOpenAtTime({
      dateStr: '2026-08-24',
      timeStr: '19:00',
      slots: standardSlots,
      restDays: ['2026-08-24'] // Holiday / Closed
    });

    expect(isOpen).toBe(false);
  });

  it('honors emergency service pause state', () => {
    const isOpen = isStoreOpenAtTime({
      dateStr: '2026-08-24',
      timeStr: '19:00',
      slots: standardSlots,
      restDays: [],
      servicePaused: true
    });

    expect(isOpen).toBe(false);
  });
});
