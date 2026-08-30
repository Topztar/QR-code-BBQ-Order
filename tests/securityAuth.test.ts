import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

const PIN_SALT = 'sabay-bbq-secure-salt-2026';

export function hashPin(pin: string, salt: string = PIN_SALT): string {
  return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
}

export function verifyPinAttempt(params: {
  inputPin: string;
  storedHash: string;
  failedAttempts: number;
  lockedUntil: number | null;
  currentTime?: number;
}): {
  success: boolean;
  locked: boolean;
  remainingMinutes?: number;
  newFailedAttempts: number;
  newLockedUntil: number | null;
  error?: string;
} {
  const now = params.currentTime || Date.now();

  // Check if currently locked
  if (params.lockedUntil && now < params.lockedUntil) {
    const remainingMinutes = Math.ceil((params.lockedUntil - now) / (60 * 1000));
    return {
      success: false,
      locked: true,
      remainingMinutes,
      newFailedAttempts: params.failedAttempts,
      newLockedUntil: params.lockedUntil,
      error: `系統已鎖定！請於 ${remainingMinutes} 分鐘後再試。`
    };
  }

  const inputHash = hashPin(params.inputPin);
  if (inputHash === params.storedHash) {
    return {
      success: true,
      locked: false,
      newFailedAttempts: 0,
      newLockedUntil: null
    };
  }

  const newFailedAttempts = params.failedAttempts + 1;
  if (newFailedAttempts >= 5) {
    const lockDuration = 15 * 60 * 1000; // 15 min lock
    return {
      success: false,
      locked: true,
      remainingMinutes: 15,
      newFailedAttempts,
      newLockedUntil: now + lockDuration,
      error: '連續 5 次輸入金鑰錯誤，系統已啟動防護鎖定 15 分鐘！'
    };
  }

  return {
    success: false,
    locked: false,
    newFailedAttempts,
    newLockedUntil: null,
    error: `解鎖金鑰錯誤！剩餘嘗試次數：${5 - newFailedAttempts} 次`
  };
}

describe('Security & Authentication: PIN Salt Hashing & Anti-Brute-Force', () => {
  it('generates consistent SHA-256 salted hashes and differentiates wrong pins', () => {
    const pin = '952788';
    const hash1 = hashPin(pin);
    const hash2 = hashPin(pin);
    const wrongHash = hashPin('000000');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
    expect(hash1).not.toBe(wrongHash);
  });

  it('authenticates valid PIN correctly and resets failed attempts', () => {
    const pin = '123456';
    const storedHash = hashPin(pin);

    const result = verifyPinAttempt({
      inputPin: '123456',
      storedHash,
      failedAttempts: 3,
      lockedUntil: null
    });

    expect(result.success).toBe(true);
    expect(result.locked).toBe(false);
    expect(result.newFailedAttempts).toBe(0);
    expect(result.newLockedUntil).toBeNull();
  });

  it('increments failed attempts on invalid PIN and shows remaining attempts', () => {
    const storedHash = hashPin('952788');

    const result = verifyPinAttempt({
      inputPin: '111111',
      storedHash,
      failedAttempts: 2,
      lockedUntil: null
    });

    expect(result.success).toBe(false);
    expect(result.locked).toBe(false);
    expect(result.newFailedAttempts).toBe(3);
    expect(result.error).toContain('剩餘嘗試次數：2 次');
  });

  it('triggers 15-minute lockout when 5th consecutive failure occurs', () => {
    const storedHash = hashPin('952788');
    const fixedNow = 1700000000000;

    const result = verifyPinAttempt({
      inputPin: '999999',
      storedHash,
      failedAttempts: 4,
      lockedUntil: null,
      currentTime: fixedNow
    });

    expect(result.success).toBe(false);
    expect(result.locked).toBe(true);
    expect(result.remainingMinutes).toBe(15);
    expect(result.newLockedUntil).toBe(fixedNow + 15 * 60 * 1000);
    expect(result.error).toContain('鎖定 15 分鐘');
  });

  it('blocks even valid PIN attempts while lockedUntil time is still in the future', () => {
    const storedHash = hashPin('952788');
    const fixedNow = 1700000000000;
    const lockExpiry = fixedNow + 10 * 60 * 1000; // 10 mins remaining

    const result = verifyPinAttempt({
      inputPin: '952788', // Correct PIN!
      storedHash,
      failedAttempts: 5,
      lockedUntil: lockExpiry,
      currentTime: fixedNow
    });

    expect(result.success).toBe(false);
    expect(result.locked).toBe(true);
    expect(result.remainingMinutes).toBe(10);
  });
});
