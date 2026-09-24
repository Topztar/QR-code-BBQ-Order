import { describe, it, expect } from 'vitest';
import {
  getTaiwanDateString,
  getTaiwanTimeParts,
  isSameTaiwanDate,
  getMsUntilTaiwanMidnight,
} from '../dateUtils';

describe('Taiwan Timezone & Date Utilities Test Suite (dateUtils)', () => {
  describe('getTaiwanDateString', () => {
    it('should format UTC 15:59:59Z as 23:59:59 Taiwan date (2026-09-24)', () => {
      const utcBoundaryPrev = new Date('2026-09-24T15:59:59Z');
      expect(getTaiwanDateString(utcBoundaryPrev)).toBe('2026-09-24');
    });

    it('should format UTC 16:00:00Z as 00:00:00 next Taiwan date (2026-09-25)', () => {
      const utcBoundaryNext = new Date('2026-09-24T16:00:00Z');
      expect(getTaiwanDateString(utcBoundaryNext)).toBe('2026-09-25');
    });

    it('should handle string ISO inputs correctly', () => {
      expect(getTaiwanDateString('2026-01-01T00:00:00Z')).toBe('2026-01-01');
    });

    it('should return empty string for invalid date inputs', () => {
      expect(getTaiwanDateString('invalid-date-string')).toBe('');
      expect(getTaiwanDateString(new Date('NaN'))).toBe('');
    });
  });

  describe('getTaiwanTimeParts', () => {
    it('should accurately breakdown Taiwan time parts across UTC offset (+8 hours)', () => {
      const d = new Date('2026-09-24T15:30:00Z'); // 23:30 Taiwan time
      const parts = getTaiwanTimeParts(d);

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(9);
      expect(parts.date).toBe(24);
      expect(parts.hours).toBe(23);
      expect(parts.minutes).toBe(30);
      expect(parts.dateStr).toBe('2026-09-24');
    });

    it('should return default zero object for invalid dates', () => {
      const parts = getTaiwanTimeParts('invalid-date');
      expect(parts).toEqual({
        year: 0,
        month: 0,
        date: 0,
        dayOfWeek: 0,
        hours: 0,
        minutes: 0,
        dateStr: '',
      });
    });
  });

  describe('isSameTaiwanDate', () => {
    it('should identify timestamps falling on the same Taiwan date', () => {
      const t1 = '2026-09-24T16:05:00Z'; // 2026-09-25 00:05 Taiwan
      const t2 = '2026-09-24T23:55:00Z'; // 2026-09-25 07:55 Taiwan
      expect(isSameTaiwanDate(t1, t2)).toBe(true);
    });

    it('should return false for timestamps on different Taiwan dates', () => {
      const t1 = '2026-09-24T15:59:00Z'; // 2026-09-24 23:59 Taiwan
      const t2 = '2026-09-24T16:01:00Z'; // 2026-09-25 00:01 Taiwan
      expect(isSameTaiwanDate(t1, t2)).toBe(false);
    });

    it('should return false if either input is empty or invalid', () => {
      expect(isSameTaiwanDate('', '2026-09-24T16:01:00Z')).toBe(false);
      expect(isSameTaiwanDate('invalid', '2026-09-24T16:01:00Z')).toBe(false);
    });
  });

  describe('getMsUntilTaiwanMidnight', () => {
    it('should return a positive millisecond count until next midnight', () => {
      const ms = getMsUntilTaiwanMidnight();
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(86400 * 1000 + 1000);
    });
  });
});
