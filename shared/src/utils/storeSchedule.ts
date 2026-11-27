import type { OperatingHourSlot } from '../types';

export const TAIPEI_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export interface TaipeiTimeComponents {
  year: number;
  month: number; // 1-12
  date: number; // 1-31
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  prevDayOfWeek: number; // 0-6
  hours: number; // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
  totalMinutes: number; // 0-1439
  dateStr: string; // YYYY-MM-DD in Asia/Taipei
  prevDateStr: string; // Yesterday YYYY-MM-DD in Asia/Taipei
  dayStartUtcMs: number; // UTC ms corresponding to 00:00:00.000 Asia/Taipei of this date
}

export interface StoreScheduleSlotInput extends Partial<OperatingHourSlot> {
  reservationOnly?: boolean;
}

export interface StoreScheduleSettingsInput {
  liveOperatingHours?: StoreScheduleSlotInput[] | null;
  operatingHours?: StoreScheduleSlotInput[] | null;
  slots?: StoreScheduleSlotInput[] | null;
  sessions?: StoreScheduleSlotInput[] | null;
  liveRestDays?: string[] | null;
  restDays?: string[] | null;
  liveServicePaused?: boolean | null;
  servicePaused?: boolean | { servicePaused?: boolean } | null;
  /** Legacy boolean flags; only consulted when no schedule array is configured */
  manualClosed?: boolean | null;
  isOpen?: boolean | null;
}

export interface StoreScheduleEvaluation {
  isOpen: boolean;
  isRestDay: boolean;
  isServicePaused: boolean;
  isReservableOnlyNow: boolean;
  serverNowMs: number;
  nextTransitionAtMs: number | null;
  activeSlotName: string | null;
}

export interface NormalizedScheduleSlot {
  id: string;
  name: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  isOvernight: boolean;
  isAllDay: boolean;
  days: number[];
  isActive: boolean;
  isReservableOnly: boolean;
}

/**
 * Pure, deterministic Asia/Taipei (UTC+8, no DST) calendar decomposition from epoch ms.
 * Immune to container TZ (UTC vs local) and WebKit Date string parsing quirks.
 */
export function getTaipeiTimeComponents(nowMs: number = Date.now()): TaipeiTimeComponents {
  const safeMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const tw = new Date(safeMs + TAIPEI_UTC_OFFSET_MS);
  const year = tw.getUTCFullYear();
  const month = tw.getUTCMonth() + 1;
  const date = tw.getUTCDate();
  const dayOfWeek = tw.getUTCDay();
  const hours = tw.getUTCHours();
  const minutes = tw.getUTCMinutes();
  const seconds = tw.getUTCSeconds();

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  const dayStartUtcMs = Date.UTC(year, month - 1, date) - TAIPEI_UTC_OFFSET_MS;

  const prevTw = new Date(dayStartUtcMs - DAY_MS + TAIPEI_UTC_OFFSET_MS);
  const prevYear = prevTw.getUTCFullYear();
  const prevMonth = prevTw.getUTCMonth() + 1;
  const prevDate = prevTw.getUTCDate();
  const prevDateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;

  return {
    year,
    month,
    date,
    dayOfWeek,
    prevDayOfWeek: (dayOfWeek + 6) % 7,
    hours,
    minutes,
    seconds,
    totalMinutes: hours * 60 + minutes,
    dateStr,
    prevDateStr,
    dayStartUtcMs,
  };
}

export function parseClockMinutes(timeStr: string | undefined | null, fallbackMinutes: number): number {
  if (typeof timeStr !== 'string') return fallbackMinutes;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return fallbackMinutes;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 24 || m < 0 || m > 59) {
    return fallbackMinutes;
  }
  if (h === 24 && m > 0) return fallbackMinutes;
  return h * 60 + m;
}

function normalizeSlot(slot: StoreScheduleSlotInput, idx: number): NormalizedScheduleSlot {
  const start = typeof slot.start === 'string' && slot.start.trim() ? slot.start.trim() : '00:00';
  const end = typeof slot.end === 'string' && slot.end.trim() ? slot.end.trim() : '23:59';
  const startMinutes = parseClockMinutes(start, 0);
  const rawEndMinutes = parseClockMinutes(end, 23 * 60 + 59);

  // Treat 00:00 - 23:59 / 00:00 - 24:00 as a full 24h day [0, 1440) so emulator/all-day slots do not blink closed at 23:59
  const isAllDay = startMinutes === 0 && (rawEndMinutes === 23 * 60 + 59 || rawEndMinutes === 24 * 60);
  const endMinutes = isAllDay ? 24 * 60 : rawEndMinutes;
  const isOvernight = !isAllDay && endMinutes < startMinutes;

  const days =
    Array.isArray(slot.days) && slot.days.length > 0
      ? slot.days.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      : [0, 1, 2, 3, 4, 5, 6];

  return {
    id: slot.id || `slot-${idx}`,
    name: typeof slot.name === 'string' ? slot.name : '',
    start,
    end,
    startMinutes,
    endMinutes,
    isOvernight,
    isAllDay,
    days,
    isActive: slot.isActive !== false,
    isReservableOnly: Boolean(slot.isReservableOnly ?? slot.reservationOnly),
  };
}

interface NormalizedSettings {
  hasConfiguredSlotsArray: boolean;
  slots: NormalizedScheduleSlot[];
  activeSlots: NormalizedScheduleSlot[];
  restDaySet: Set<string>;
  isServicePaused: boolean;
  legacyExplicitClosed: boolean;
}

function normalizeSettings(input: StoreScheduleSettingsInput | null | undefined): NormalizedSettings {
  if (!input || typeof input !== 'object') {
    return {
      hasConfiguredSlotsArray: false,
      slots: [],
      activeSlots: [],
      restDaySet: new Set(),
      isServicePaused: false,
      legacyExplicitClosed: false,
    };
  }

  const rawSlotsCandidate =
    input.liveOperatingHours ?? input.operatingHours ?? input.slots ?? input.sessions;
  const rawSlots = Array.isArray(rawSlotsCandidate) ? rawSlotsCandidate.filter(Boolean) : [];
  const hasConfiguredSlotsArray = rawSlots.length > 0;
  const slots = rawSlots.map((s, idx) => normalizeSlot(s, idx));
  const activeSlots = slots.filter((s) => s.isActive);

  const rawRestDays = input.liveRestDays ?? input.restDays;
  const restDaySet = new Set<string>(
    Array.isArray(rawRestDays)
      ? rawRestDays.map((d) => String(d).trim()).filter(Boolean)
      : []
  );

  const servicePausedField =
    input.liveServicePaused !== undefined && input.liveServicePaused !== null
      ? Boolean(input.liveServicePaused)
      : typeof input.servicePaused === 'object' && input.servicePaused !== null
        ? Boolean(input.servicePaused.servicePaused)
        : Boolean(input.servicePaused);

  // Legacy boolean flags are ONLY honored when no active schedule slots exist.
  // Prevents stale legacy `isOpen: false` or `manualClosed: true` from silently locking an active schedule.
  const legacyExplicitClosed =
    !hasConfiguredSlotsArray && (input.manualClosed === true || input.isOpen === false);

  return {
    hasConfiguredSlotsArray,
    slots,
    activeSlots,
    restDaySet,
    isServicePaused: servicePausedField,
    legacyExplicitClosed,
  };
}

interface InstantEvaluation {
  isOpen: boolean;
  isRestDay: boolean;
  isServicePaused: boolean;
  isReservableOnlyNow: boolean;
  activeSlotName: string | null;
}

function slotMatchesAt(
  slot: NormalizedScheduleSlot,
  tw: TaipeiTimeComponents,
  restDaySet: Set<string>
): boolean {
  if (slot.isAllDay) {
    return slot.days.includes(tw.dayOfWeek);
  }

  if (!slot.isOvernight) {
    // Half-open interval [startMinutes, endMinutes): e.g., 17:30 open, 23:30 closed
    return (
      slot.days.includes(tw.dayOfWeek) &&
      tw.totalMinutes >= slot.startMinutes &&
      tw.totalMinutes < slot.endMinutes
    );
  }

  // Overnight interval (e.g., 17:00 - 00:30):
  // Segment 1: today [startMinutes, 24:00) on slot's configured weekday
  if (slot.days.includes(tw.dayOfWeek) && tw.totalMinutes >= slot.startMinutes) {
    return true;
  }

  // Segment 2: post-midnight spill [00:00, endMinutes) belonging to yesterday's shift
  if (
    slot.days.includes(tw.prevDayOfWeek) &&
    !restDaySet.has(tw.prevDateStr) &&
    tw.totalMinutes < slot.endMinutes
  ) {
    return true;
  }

  return false;
}

function evaluateInstant(
  normalized: NormalizedSettings,
  nowMs: number,
  isReservation: boolean
): InstantEvaluation {
  const tw = getTaipeiTimeComponents(nowMs);
  const isRestDay = normalized.restDaySet.has(tw.dateStr);

  if (normalized.isServicePaused) {
    return {
      isOpen: false,
      isRestDay,
      isServicePaused: true,
      isReservableOnlyNow: false,
      activeSlotName: null,
    };
  }

  if (isRestDay) {
    return {
      isOpen: false,
      isRestDay: true,
      isServicePaused: false,
      isReservableOnlyNow: false,
      activeSlotName: null,
    };
  }

  if (!normalized.hasConfiguredSlotsArray) {
    return {
      isOpen: !normalized.legacyExplicitClosed,
      isRestDay: false,
      isServicePaused: false,
      isReservableOnlyNow: false,
      activeSlotName: null,
    };
  }

  if (normalized.activeSlots.length === 0) {
    return {
      isOpen: false,
      isRestDay: false,
      isServicePaused: false,
      isReservableOnlyNow: false,
      activeSlotName: null,
    };
  }

  let matchedGeneralSlot: NormalizedScheduleSlot | null = null;
  let matchedReservableSlot: NormalizedScheduleSlot | null = null;

  for (const slot of normalized.activeSlots) {
    if (!slotMatchesAt(slot, tw, normalized.restDaySet)) continue;
    if (slot.isReservableOnly) {
      if (!matchedReservableSlot) matchedReservableSlot = slot;
    } else {
      if (!matchedGeneralSlot) matchedGeneralSlot = slot;
    }
  }

  const isOpen = isReservation
    ? Boolean(matchedGeneralSlot || matchedReservableSlot)
    : Boolean(matchedGeneralSlot);

  const isReservableOnlyNow = !matchedGeneralSlot && Boolean(matchedReservableSlot);
  const activeSlotName = matchedGeneralSlot?.name || (isReservation ? matchedReservableSlot?.name || null : null);

  return {
    isOpen,
    isRestDay: false,
    isServicePaused: false,
    isReservableOnlyNow,
    activeSlotName,
  };
}

function computeNextTransitionAtMs(
  normalized: NormalizedSettings,
  nowMs: number,
  current: InstantEvaluation,
  isReservation: boolean
): number | null {
  if (normalized.isServicePaused) {
    return null;
  }

  const tw = getTaipeiTimeComponents(nowMs);
  const candidateSet = new Set<number>();

  // Scan from dayOffset -1 (yesterday's overnight spill end) through +7 (full weekly cycle + 1 day)
  for (let dayOffset = -1; dayOffset <= 7; dayOffset++) {
    const dayStartMs = tw.dayStartUtcMs + dayOffset * DAY_MS;
    const dayTw = getTaipeiTimeComponents(dayStartMs + 1000);

    // Midnight boundaries matter when restDays toggle or overnight slots cross midnight
    if (dayStartMs > nowMs) {
      candidateSet.add(dayStartMs);
    }

    for (const slot of normalized.activeSlots) {
      if (!slot.days.includes(dayTw.dayOfWeek)) continue;

      const startMs = dayStartMs + slot.startMinutes * MINUTE_MS;
      const endMs = slot.isOvernight
        ? dayStartMs + (24 * 60 + slot.endMinutes) * MINUTE_MS
        : dayStartMs + slot.endMinutes * MINUTE_MS;

      if (startMs > nowMs) candidateSet.add(startMs);
      if (endMs > nowMs) candidateSet.add(endMs);
    }
  }

  const sortedCandidates = Array.from(candidateSet).sort((a, b) => a - b);

  for (const boundaryMs of sortedCandidates) {
    const nextEval = evaluateInstant(normalized, boundaryMs, isReservation);
    if (
      nextEval.isOpen !== current.isOpen ||
      nextEval.isRestDay !== current.isRestDay ||
      nextEval.isReservableOnlyNow !== current.isReservableOnlyNow
    ) {
      return boundaryMs;
    }
  }

  return null;
}

/**
 * Single Source of Truth (SSOT) store schedule evaluator.
 * Evaluates Taiwan (Asia/Taipei, UTC+8) kitchen order acceptance windows, rest days,
 * overnight windows, reservation-only slots, and exact next transition timestamp.
 */
export function evaluateStoreSchedule(
  settings: StoreScheduleSettingsInput | null | undefined,
  nowTimestampMs: number = Date.now(),
  options?: { isReservation?: boolean }
): StoreScheduleEvaluation {
  const safeNowMs = Number.isFinite(nowTimestampMs) ? nowTimestampMs : Date.now();
  const isReservation = Boolean(options?.isReservation);
  const normalized = normalizeSettings(settings);
  const instant = evaluateInstant(normalized, safeNowMs, isReservation);
  const nextTransitionAtMs = computeNextTransitionAtMs(normalized, safeNowMs, instant, isReservation);

  return {
    isOpen: instant.isOpen,
    isRestDay: instant.isRestDay,
    isServicePaused: instant.isServicePaused,
    isReservableOnlyNow: instant.isReservableOnlyNow,
    serverNowMs: safeNowMs,
    nextTransitionAtMs,
    activeSlotName: instant.activeSlotName,
  };
}

/**
 * Boolean convenience wrapper matching legacy isStoreOpenFromData / isStoreOpen callers.
 */
export function isStoreOpenFromSchedule(
  settings: StoreScheduleSettingsInput | null | undefined,
  nowTimestampMs?: number,
  isReservation: boolean = false
): boolean {
  return evaluateStoreSchedule(settings, nowTimestampMs ?? Date.now(), { isReservation }).isOpen;
}

/**
 * Formats an operating hour slot label without duplicating "[預約專用]" / "[Reservation Only]"
 * when the slot name already contains that designation.
 */
export function formatOperatingHourSlotLabel(
  slot: Pick<OperatingHourSlot, 'name' | 'start' | 'end' | 'isReservableOnly'> | StoreScheduleSlotInput
): string {
  const rawName = typeof slot?.name === 'string' ? slot.name.trim() : '';
  const isReservable = Boolean(slot?.isReservableOnly ?? (slot as StoreScheduleSlotInput)?.reservationOnly);
  const alreadyTagged =
    rawName.includes('預約專用') || /reservation\s*only/i.test(rawName);

  const label = isReservable
    ? alreadyTagged
      ? rawName
      : rawName
        ? `${rawName} [預約專用]`
        : '預約專用'
    : rawName || '營業時段';

  const start = typeof slot?.start === 'string' ? slot.start.trim() : '';
  const end = typeof slot?.end === 'string' ? slot.end.trim() : '';
  return `${label} (${start} - ${end})`;
}
