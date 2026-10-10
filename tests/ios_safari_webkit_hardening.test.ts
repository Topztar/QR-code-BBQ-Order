import { describe, it, expect } from 'vitest';
import { isChunkLoadError } from '../src/lib/chunkRecovery';
import { parseSafeDate, getTaiwanTimeParts, getTaiwanDateString, isValidDate } from '../src/utils/dateUtils';

describe('iOS Safari / WebKit Compatibility Hardening Test Suite', () => {
  describe('Solution 4: isChunkLoadError detection across browsers', () => {
    it('detects Mobile Safari / WebKit "TypeError: Load failed"', () => {
      const safariErr = new TypeError('Load failed');
      expect(isChunkLoadError(safariErr)).toBe(true);
    });

    it('detects WebKit "TypeError: Importing a module script failed"', () => {
      const safariErr = new TypeError('Importing a module script failed.');
      expect(isChunkLoadError(safariErr)).toBe(true);
    });

    it('detects Chromium "Failed to fetch dynamically imported module"', () => {
      const chromeErr = new TypeError('Failed to fetch dynamically imported module: https://example.com/assets/CustomerOrderView.js');
      expect(isChunkLoadError(chromeErr)).toBe(true);
    });

    it('detects standard ChunkLoadError', () => {
      const chunkErr = new Error('Loading chunk customer failed');
      chunkErr.name = 'ChunkLoadError';
      expect(isChunkLoadError(chunkErr)).toBe(true);
    });

    it('detects 404 HTML fallback SyntaxError (Unexpected token <)', () => {
      const syntaxErr = new SyntaxError("Unexpected token '<', \"<!doctype \"... is not valid JavaScript");
      expect(isChunkLoadError(syntaxErr)).toBe(true);
    });

    it('does NOT misclassify generic application or network errors', () => {
      expect(isChunkLoadError(new Error('Network error'))).toBe(false);
      expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'items')"))).toBe(false);
      expect(isChunkLoadError(new Error('Document does not exist'))).toBe(false);
      expect(isChunkLoadError(null)).toBe(false);
    });
  });

  describe('Solution 2: parseSafeDate & WebKit Invalid Date protection', () => {
    it('parses space-delimited "YYYY-MM-DD HH:mm:ss" into a valid Date without returning NaN', () => {
      const spaceDateStr = '2026-10-10 16:30:00';
      const parsed = parseSafeDate(spaceDateStr);
      expect(isValidDate(parsed)).toBe(true);
      expect(isNaN(parsed.getTime())).toBe(false);
      expect(parsed.getFullYear()).toBe(2026);
    });

    it('parses standard ISO 8601 strings accurately', () => {
      const isoStr = '2026-10-10T16:30:00Z';
      const parsed = parseSafeDate(isoStr);
      expect(isValidDate(parsed)).toBe(true);
      expect(isNaN(parsed.getTime())).toBe(false);
    });

    it('returns a valid fallback Date (now) when passed null or undefined', () => {
      const dNull = parseSafeDate(null);
      const dUndefined = parseSafeDate(undefined);
      const dEmpty = parseSafeDate('');
      expect(isValidDate(dNull)).toBe(true);
      expect(isValidDate(dUndefined)).toBe(true);
      expect(isValidDate(dEmpty)).toBe(true);
    });

    it('returns an invalid Date when fallbackToNow is false and input is invalid', () => {
      const invalid = parseSafeDate('not-a-date', false);
      expect(isNaN(invalid.getTime())).toBe(true);
    });

    it('ensures getTaiwanTimeParts never produces NaN for any time unit', () => {
      const parts = getTaiwanTimeParts('2026-10-10 16:30:00');
      expect(isNaN(parts.year)).toBe(false);
      expect(isNaN(parts.month)).toBe(false);
      expect(isNaN(parts.date)).toBe(false);
      expect(isNaN(parts.dayOfWeek)).toBe(false);
      expect(isNaN(parts.hours)).toBe(false);
      expect(isNaN(parts.minutes)).toBe(false);
      expect(parts.year).toBe(2026);
      expect(parts.dateStr).toContain('2026-10-10');
    });

    it('gracefully handles empty or invalid strings in getTaiwanDateString', () => {
      expect(getTaiwanDateString('invalid-string')).toBe('');
      expect(getTaiwanDateString(null as any)).toBe('');
      expect(getTaiwanDateString('')).toBe('');
      expect(getTaiwanDateString()).not.toBe(''); // default argument = new Date()
    });
  });

  describe('Solution 1: Firestore Cache Degradation & Safety Guards', () => {
    it('verifies persistentSingleTabManager and persistentMultipleTabManager exist in firebase/firestore', async () => {
      const { persistentSingleTabManager, persistentMultipleTabManager, memoryLocalCache } = await import('firebase/firestore');
      expect(typeof persistentSingleTabManager).toBe('function');
      expect(typeof persistentMultipleTabManager).toBe('function');
      expect(typeof memoryLocalCache).toBe('function');
    });
  });
});
