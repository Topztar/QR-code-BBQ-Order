import { describe, it, expect } from 'vitest';
import {
  parseTimeToMinutes,
  formatDateStr,
  isSameDayReservation,
  isReservationTimeAllowed,
  getAvailableReservationSlots,
  getEarliestReservableOption,
  DEFAULT_CANDIDATE_SLOTS,
} from '../reservationValidator';

describe('reservationValidator', () => {
  it('parseTimeToMinutes should correctly convert HH:MM to minutes', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('01:30')).toBe(90);
    expect(parseTimeToMinutes('12:00')).toBe(720);
    expect(parseTimeToMinutes('18:45')).toBe(1125);
    expect(parseTimeToMinutes('')).toBe(0);
  });

  it('formatDateStr formats date as YYYY-MM-DD', () => {
    const d = new Date(2026, 8, 5); // month is 0-indexed (8 = Sept)
    expect(formatDateStr(d)).toBe('2026-09-05');
  });

  it('isSameDayReservation accurately detects same day', () => {
    const d = new Date(2026, 8, 5);
    expect(isSameDayReservation('2026-09-05', d)).toBe(true);
    expect(isSameDayReservation('2026-09-06', d)).toBe(false);
  });

  describe('isReservationTimeAllowed (4-Hour Advance Rule)', () => {
    // Reference date: 2026-09-05 14:00 (14 * 60 = 840 mins)
    // 14:00 + 4h = 18:00 (1080 mins)
    const refDate = new Date(2026, 8, 5, 14, 0, 0);

    it('should reject past dates', () => {
      const result = isReservationTimeAllowed('2026-09-04', '18:00', refDate);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('無法預約過去的日期');
    });

    it('should reject today reservation earlier than now + 4 hours', () => {
      // 14:00 + 4 hours = 18:00. Any time < 18:00 should fail
      const result1 = isReservationTimeAllowed('2026-09-05', '17:30', refDate);
      expect(result1.allowed).toBe(false);
      expect(result1.reason).toContain('預約時間必須為現在時間 4 小時之後');

      const result2 = isReservationTimeAllowed('2026-09-05', '12:00', refDate);
      expect(result2.allowed).toBe(false);
    });

    it('should allow today reservation exactly at or after now + 4 hours', () => {
      // 18:00 is exactly 4 hours after 14:00
      const result1 = isReservationTimeAllowed('2026-09-05', '18:00', refDate);
      expect(result1.allowed).toBe(true);

      // 18:30 is 4.5 hours after 14:00
      const result2 = isReservationTimeAllowed('2026-09-05', '18:30', refDate);
      expect(result2.allowed).toBe(true);
    });

    it('should allow reservations for tomorrow or future dates regardless of time', () => {
      const resultTomorrow = isReservationTimeAllowed('2026-09-06', '11:30', refDate);
      expect(resultTomorrow.allowed).toBe(true);

      const resultNextMonth = isReservationTimeAllowed('2026-10-01', '12:00', refDate);
      expect(resultNextMonth.allowed).toBe(true);
    });
  });

  describe('getAvailableReservationSlots', () => {
    // Reference date: 2026-09-05 14:15 -> +4h = 18:15 (minAllowedMins = 1095)
    const refDate = new Date(2026, 8, 5, 14, 15, 0);

    it('should filter out slots < 18:15 for today', () => {
      const slots = getAvailableReservationSlots('2026-09-05', [], [], refDate);
      // All slots in slots must be >= 18:15 (i.e. starting at 18:30 or later)
      for (const slot of slots) {
        expect(parseTimeToMinutes(slot)).toBeGreaterThanOrEqual(1095);
      }
      expect(slots).not.toContain('11:30');
      expect(slots).not.toContain('17:30');
      expect(slots).not.toContain('18:00');
      expect(slots).toContain('18:30');
      expect(slots).toContain('19:00');
    });

    it('should return empty array if today has no slots >= 4 hours', () => {
      // Late night: 20:00 (1200 mins). +4 hours = 24:00 (1440 mins).
      // Last BBQ slot is 21:00 (1260 mins).
      const lateRef = new Date(2026, 8, 5, 20, 0, 0);
      const slots = getAvailableReservationSlots('2026-09-05', [], [], lateRef);
      expect(slots).toEqual([]);
    });

    it('should return all candidate slots for tomorrow or future dates', () => {
      const slots = getAvailableReservationSlots('2026-09-06', [], [], refDate);
      expect(slots).toEqual(DEFAULT_CANDIDATE_SLOTS);
      expect(slots).toContain('11:30');
    });

    it('should return empty array for rest days', () => {
      const slots = getAvailableReservationSlots('2026-09-06', [], ['2026-09-06'], refDate);
      expect(slots).toEqual([]);
    });
  });

  describe('getEarliestReservableOption', () => {
    it('returns today and earliest valid slot if today has slots >= 4h', () => {
      // 14:15 -> earliest slot is 18:30
      const refDate = new Date(2026, 8, 5, 14, 15, 0);
      const opt = getEarliestReservableOption([], [], refDate);
      expect(opt.date).toBe('2026-09-05');
      expect(opt.time).toBe('18:30');
    });

    it('returns tomorrow if today has no slots >= 4h', () => {
      // 21:30 -> today has no slots >= 4h
      const lateRef = new Date(2026, 8, 5, 21, 30, 0);
      const opt = getEarliestReservableOption([], [], lateRef);
      expect(opt.date).toBe('2026-09-06');
      expect(opt.time).toBe('11:30');
    });

    it('skips tomorrow if tomorrow is a rest day', () => {
      const lateRef = new Date(2026, 8, 5, 21, 30, 0);
      const opt = getEarliestReservableOption([], ['2026-09-06'], lateRef);
      expect(opt.date).toBe('2026-09-07');
      expect(opt.time).toBe('11:30');
    });
  });
});
