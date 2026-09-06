import { describe, it, expect } from 'vitest';
import {
  parseTimeToMinutes,
  formatDateStr,
  isSameDayReservation,
  isReservationTimeAllowed,
  getAvailableReservationSlots,
  getEarliestReservableOption,
  calculateReservationAvailability,
  autoSelectOptimalTables,
  validateTableMonopoly,
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

  describe('calculateReservationAvailability & Table Selection', () => {
    const mockTables = [
      { id: 'A1', maxCapacity: 4 },
      { id: 'A2', maxCapacity: 4 },
      { id: 'B1', maxCapacity: 6 },
    ];

    const mockReservations = [
      { id: 'r1', date: '2026-09-10', time: '18:00', tableNumber: 'A1', guestCount: 4, status: 'confirmed' },
    ];

    it('calculateReservationAvailability computes 3h overlapping window capacity correctly', () => {
      // Target time 18:30 overlaps with 18:00 reservation (within 180 mins)
      const avail = calculateReservationAvailability('2026-09-10', '18:30', mockTables, mockReservations);
      expect(avail.totalStoreCapacity).toBe(14);
      expect(avail.bookedGuestsInWindow).toBe(4);
      expect(avail.availableWindowCapacity).toBe(10); // A2(4) + B1(6)
      expect(avail.availableTables.map((t: any) => t.id)).toEqual(['A2', 'B1']);
    });

    it('autoSelectOptimalTables selects single fitting table (exactFit) first', () => {
      // Available: A1(4), A2(4), B1(6). Guest count = 4.
      // Fits A1(4) or A2(4). exactFit should pick single 4-person table.
      const selected = autoSelectOptimalTables(mockTables, 4);
      expect(selected.length).toBe(1);
      expect(mockTables.find((t) => t.id === selected[0])?.maxCapacity).toBe(4);
    });

    it('autoSelectOptimalTables selects single larger table if smaller table is insufficient', () => {
      // Guest count = 5. A1(4) and A2(4) are insufficient, B1(6) fits single table.
      const selected = autoSelectOptimalTables(mockTables, 5);
      expect(selected).toEqual(['B1']);
    });

    it('autoSelectOptimalTables selects minimum combination of tables if no single table fits', () => {
      // Guest count = 8. No single table fits (max is 6).
      // Available: B1(6), A1(4), A2(4).
      // Should pick B1(6) + A1(4) = 10 capacity.
      const selected = autoSelectOptimalTables(mockTables, 8);
      expect(selected).toEqual(['B1', 'A1']);
    });

    it('validateTableMonopoly detects when multiple tables are unnecessarily selected', () => {
      // 2 guests selecting A1(4) + A2(4) -> Capacity 8.
      // Removing A2 leaves A1(4) >= 2 guests. Should fail validation.
      const result = validateTableMonopoly([mockTables[0], mockTables[1]], 2);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('過度佔用桌席');
    });

    it('validateTableMonopoly passes when multiple tables are genuinely required', () => {
      // 7 guests selecting A1(4) + B1(6) -> Capacity 10.
      // Removing B1 leaves 4 < 7. Removing A1 leaves 6 < 7. Valid!
      const result = validateTableMonopoly([mockTables[0], mockTables[2]], 7);
      expect(result.valid).toBe(true);
    });

    describe('Boundary & Edge Cases', () => {
      it('calculateReservationAvailability respects 180-minute window boundaries', () => {
        const reservations = [
          { id: 'r1', date: '2026-09-10', time: '12:00', tableNumber: 'A1', guestCount: 4, status: 'confirmed' }, // 12:00 = 720m
        ];
        // 14:59 = 899m. Math.abs(899 - 720) = 179m < 180m -> Overlaps
        const avail179 = calculateReservationAvailability('2026-09-10', '14:59', mockTables, reservations);
        expect(avail179.availableTables.some((t: any) => t.id === 'A1')).toBe(false);

        // 15:00 = 900m. Math.abs(900 - 720) = 180m -> Does NOT overlap
        const avail180 = calculateReservationAvailability('2026-09-10', '15:00', mockTables, reservations);
        expect(avail180.availableTables.some((t: any) => t.id === 'A1')).toBe(true);
      });

      it('calculateReservationAvailability excludes editing reservation via excludeReservationId', () => {
        const reservations = [
          { id: 'r1', date: '2026-09-10', time: '18:00', tableNumber: 'A1', guestCount: 4, status: 'confirmed' },
        ];
        // Editing r1 should ignore r1 and keep A1 available
        const avail = calculateReservationAvailability('2026-09-10', '18:00', mockTables, reservations, {
          excludeReservationId: 'r1',
        });
        expect(avail.availableTables.some((t: any) => t.id === 'A1')).toBe(true);
      });

      it('calculateReservationAvailability ignores cancelled and rejected reservations', () => {
        const reservations = [
          { id: 'r1', date: '2026-09-10', time: '18:00', tableNumber: 'A1', guestCount: 4, status: 'cancelled' },
          { id: 'r2', date: '2026-09-10', time: '18:00', tableNumber: 'A2', guestCount: 4, status: 'rejected' },
        ];
        const avail = calculateReservationAvailability('2026-09-10', '18:00', mockTables, reservations);
        expect(avail.availableTables.length).toBe(3);
        expect(avail.bookedGuestsInWindow).toBe(0);
      });

      it('autoSelectOptimalTables selects tightest fit single table (avoids wasting larger tables)', () => {
        // Available: A1(4), B1(6). Guest count = 3.
        // Both A1(4) and B1(6) fit 3 guests. Should select A1(4) because it's a tighter fit.
        const tables = [
          { id: 'B1', maxCapacity: 6 },
          { id: 'A1', maxCapacity: 4 },
        ];
        const selected = autoSelectOptimalTables(tables, 3);
        expect(selected).toEqual(['A1']);
      });

      it('autoSelectOptimalTables returns empty array for empty inputs or non-positive guest count', () => {
        expect(autoSelectOptimalTables([], 4)).toEqual([]);
        expect(autoSelectOptimalTables(mockTables, 0)).toEqual([]);
        expect(autoSelectOptimalTables(mockTables, -2)).toEqual([]);
      });

      it('validateTableMonopoly handles exact capacity boundary cases', () => {
        const two4CapTables = [
          { id: 'A1', maxCapacity: 4 },
          { id: 'A2', maxCapacity: 4 },
        ];

        // 4 guests selecting two 4-cap tables (Cap 8). 8 - 4 = 4 >= 4 -> Invalid (A1 alone satisfies 4 guests)!
        const res4 = validateTableMonopoly(two4CapTables, 4);
        expect(res4.valid).toBe(false);

        // 5 guests selecting two 4-cap tables (Cap 8). 8 - 4 = 4 < 5 -> Valid (needs both tables)!
        const res5 = validateTableMonopoly(two4CapTables, 5);
        expect(res5.valid).toBe(true);

        // Single table selected -> Always valid
        const resSingle = validateTableMonopoly([two4CapTables[0]], 2);
        expect(resSingle.valid).toBe(true);
      });
    });
  });
});


