export const MIN_RESERVATION_ADVANCE_HOURS = 4;
export const MIN_RESERVATION_ADVANCE_MINUTES = MIN_RESERVATION_ADVANCE_HOURS * 60; // 240 mins

// Default standard BBQ restaurant slots if operatingHours are not specifically defined
export const DEFAULT_CANDIDATE_SLOTS = [
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDayReservation(resDateStr: string, referenceDate: Date = new Date()): boolean {
  return resDateStr.trim() === formatDateStr(referenceDate);
}

/**
 * Validates if the reservation time satisfies the 4-hour advance booking rule.
 * - If reservation is for today: must be >= referenceDate + 4 hours (240 mins).
 * - If reservation is for a future date: allowed.
 * - If reservation is for a past date: forbidden.
 */
export function isReservationTimeAllowed(
  resDateStr: string,
  resTimeStr: string,
  referenceDate: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (!resDateStr || !resTimeStr) {
    return { allowed: false, reason: '請選擇預約日期與時間' };
  }

  const todayStr = formatDateStr(referenceDate);
  if (resDateStr < todayStr) {
    return { allowed: false, reason: '無法預約過去的日期' };
  }

  if (resDateStr === todayStr) {
    const resMins = parseTimeToMinutes(resTimeStr);
    const currentMins = referenceDate.getHours() * 60 + referenceDate.getMinutes();
    const minAllowedMins = currentMins + MIN_RESERVATION_ADVANCE_MINUTES;

    if (resMins < minAllowedMins) {
      const earliestHour = Math.floor(minAllowedMins / 60);
      const earliestMin = minAllowedMins % 60;
      const formattedEarliest = `${String(earliestHour).padStart(2, '0')}:${String(earliestMin).padStart(2, '0')}`;
      return {
        allowed: false,
        reason: `預約時間必須為現在時間 4 小時之後 (最早已為 ${formattedEarliest})，避免與現場顧客發生桌席衝突！`
      };
    }
  }

  return { allowed: true };
}

/**
 * Generates candidate slots for a given date, filtering out any slots
 * earlier than now + 4 hours if the date is today.
 */
export function getAvailableReservationSlots(
  dateStr: string,
  operatingHours: any[] = [],
  restDays: string[] = [],
  referenceDate: Date = new Date()
): string[] {
  if (!dateStr) return [];
  if (restDays && restDays.includes(dateStr)) return [];

  const todayStr = formatDateStr(referenceDate);
  if (dateStr < todayStr) return [];

  // Determine base slots (from operatingHours if defined, else DEFAULT_CANDIDATE_SLOTS)
  let baseSlots = [...DEFAULT_CANDIDATE_SLOTS];

  if (Array.isArray(operatingHours) && operatingHours.length > 0) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const dayOfWeek = targetDate.getDay();
    const activeSlots = operatingHours.filter(
      (slot: any) => slot.isActive && Array.isArray(slot.days) && slot.days.includes(dayOfWeek)
    );

    if (activeSlots.length > 0) {
      const generated: string[] = [];
      for (const slot of activeSlots) {
        const startMins = parseTimeToMinutes(slot.start);
        const endMins = parseTimeToMinutes(slot.end);
        // Step every 30 minutes, ending 30 mins before closing
        for (let m = startMins; m <= endMins - 30; m += 30) {
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          const timeFormatted = `${hh}:${mm}`;
          if (!generated.includes(timeFormatted)) {
            generated.push(timeFormatted);
          }
        }
      }
      if (generated.length > 0) {
        generated.sort();
        baseSlots = generated;
      }
    }
  }

  // If today, filter slots to only >= now + 4 hours (240 mins)
  if (dateStr === todayStr) {
    const currentMins = referenceDate.getHours() * 60 + referenceDate.getMinutes();
    const minAllowedMins = currentMins + MIN_RESERVATION_ADVANCE_MINUTES;
    return baseSlots.filter((slot) => parseTimeToMinutes(slot) >= minAllowedMins);
  }

  return baseSlots;
}

/**
 * Finds the earliest reservable date and slot starting from referenceDate.
 * If today has valid slots >= 4h, returns today + first slot.
 * Otherwise returns tomorrow (or next non-rest day) + first slot.
 */
export function getEarliestReservableOption(
  operatingHours: any[] = [],
  restDays: string[] = [],
  referenceDate: Date = new Date()
): { date: string; time: string } {
  const todayStr = formatDateStr(referenceDate);
  const todaySlots = getAvailableReservationSlots(todayStr, operatingHours, restDays, referenceDate);
  if (todaySlots.length > 0) {
    return { date: todayStr, time: todaySlots[0] };
  }

  // Search forward up to 90 days
  for (let i = 1; i <= 90; i++) {
    const nextD = new Date(referenceDate);
    nextD.setDate(referenceDate.getDate() + i);
    const nextDateStr = formatDateStr(nextD);
    if (restDays && restDays.includes(nextDateStr)) continue;

    const slots = getAvailableReservationSlots(nextDateStr, operatingHours, restDays, referenceDate);
    if (slots.length > 0) {
      return { date: nextDateStr, time: slots[0] };
    }
  }

  return { date: todayStr, time: '' };
}

export interface ReservationAvailabilityResult {
  totalStoreCapacity: number;
  bookedGuestsInWindow: number;
  availableWindowCapacity: number;
  availableTables: any[];
  isFullyBooked: boolean;
  suggestedTimes: Array<{ time: string; freeCount: number; firstFreeTableId?: string }>;
}

/**
 * Calculates total capacity, booked guests, and available tables within a 3-hour overlapping window.
 */
export function calculateReservationAvailability(
  resDate: string,
  resTime: string,
  tables: any[] = [],
  reservations: any[] = [],
  options?: { excludeReservationId?: string; windowMinutes?: number }
): ReservationAvailabilityResult {
  const totalStoreCapacity = (tables || []).reduce((sum, t) => sum + (t.maxCapacity || 4), 0);
  if (!resDate || !resTime || !tables || tables.length === 0) {
    return {
      totalStoreCapacity,
      bookedGuestsInWindow: 0,
      availableWindowCapacity: totalStoreCapacity,
      availableTables: tables || [],
      isFullyBooked: false,
      suggestedTimes: [],
    };
  }

  const targetMins = parseTimeToMinutes(resTime);
  const windowMins = options?.windowMinutes ?? 180;
  const excludeId = options?.excludeReservationId;

  const overlapping = (reservations || []).filter((r) => {
    if (excludeId && (r.id === excludeId || r.reservationNo === excludeId)) return false;
    if (r.status === 'cancelled' || r.status === 'rejected') return false;
    if (r.date.trim() !== resDate.trim()) return false;
    const rMins = parseTimeToMinutes(r.time);
    return Math.abs(rMins - targetMins) < windowMins;
  });

  let bookedGuestsInWindow = 0;
  const unavailableTableIds = new Set<string>();
  overlapping.forEach((r) => {
    bookedGuestsInWindow += Number(r.guestCount) || 0;
    const rTables = String(r.tableNumber || '').split(',').map((t) => t.trim()).filter(Boolean);
    rTables.forEach((tId) => unavailableTableIds.add(tId));
  });

  const availableTables = tables.filter((t) => !unavailableTableIds.has(t.id));
  const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

  return {
    totalStoreCapacity,
    bookedGuestsInWindow,
    availableWindowCapacity,
    availableTables,
    isFullyBooked: availableTables.length === 0 || availableWindowCapacity <= 0,
    suggestedTimes: [],
  };
}

/**
 * Auto-assigns optimal tables for guestCount.
 * 1. Prefer single table that satisfies guestCount (exact or minimum excess capacity)
 * 2. Otherwise sort descending by maxCapacity to assign minimum number of tables
 */
export function autoSelectOptimalTables(
  availableTables: any[] = [],
  guestCount: number
): string[] {
  if (!availableTables || availableTables.length === 0 || guestCount <= 0) {
    return [];
  }

  const tablesCopy = [...availableTables];

  // 1. Prefer single table that satisfies guestCount
  const exactFit = tablesCopy
    .filter((t) => (t.maxCapacity || 4) >= guestCount)
    .sort((a, b) => (a.maxCapacity || 4) - (b.maxCapacity || 4))[0];

  if (exactFit) {
    return [exactFit.id];
  }

  // 2. Otherwise sort descending by maxCapacity to assign minimum number of tables
  tablesCopy.sort((a, b) => (b.maxCapacity || 4) - (a.maxCapacity || 4));
  let currentCap = 0;
  const selectedIds: string[] = [];

  for (const t of tablesCopy) {
    if (currentCap >= guestCount) break;
    selectedIds.push(t.id);
    currentCap += t.maxCapacity || 4;
  }

  return selectedIds;
}

/**
 * Validates that requested tables do not hoard/monopolize multiple tables when fewer tables suffice.
 */
export function validateTableMonopoly(
  requestedTableObjs: any[] = [],
  guestCount: number
): { valid: boolean; error?: string } {
  if (!requestedTableObjs || requestedTableObjs.length <= 1) {
    return { valid: true };
  }

  const selectedTablesCapacity = requestedTableObjs.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

  for (const tbl of requestedTableObjs) {
    if (selectedTablesCapacity - (tbl.maxCapacity || 4) >= guestCount) {
      return {
        valid: false,
        error: `過度佔用桌席：用餐人數 (${guestCount}人) 無需使用多張桌席，請縮減指定桌席以釋出多餘空位！`
      };
    }
  }

  return { valid: true };
}

/**
 * Validates reservation capacity constraints
 */
export function validateCapacity(
  resGuestsInput: number,
  availableWindowCapacity: number,
  designatedCapacity: number
): { valid: boolean; error?: string } {
  if (availableWindowCapacity > 0 && resGuestsInput > availableWindowCapacity) {
    return {
      valid: false,
      error: `⚠️ 用餐人數 (${resGuestsInput}人) 超過該時段（含3小時用餐時段）可容納之剩餘客席上限 (${availableWindowCapacity}人)！`
    };
  }

  if (designatedCapacity > 0 && resGuestsInput > designatedCapacity) {
    return {
      valid: false,
      error: `⚠️ 指定桌號加總人數上限 (${designatedCapacity}人) 不足：不可低於用餐人數 (${resGuestsInput}人)！請於下方加選桌位或調減人數。`
    };
  }

  return { valid: true };
}
