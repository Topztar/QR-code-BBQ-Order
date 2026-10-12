import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Wall-Clock Cooldown Hook
 * 🛡️ Resilient against iOS WebKit background timer suspension & tab locks.
 * Stale-closure-free wall-clock timestamp comparison with sessionStorage persistence.
 */
export function useSecureCooldown(storageKey = 'sabay_staff_lock_until') {
  const getStoredLockUntil = useCallback((): number => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return 0;
      return Number(sessionStorage.getItem(storageKey) || 0);
    } catch {
      return 0;
    }
  }, [storageKey]);

  const unlockTimestampRef = useRef<number>(getStoredLockUntil());

  const getRemaining = useCallback(() => {
    const lockUntil = unlockTimestampRef.current || getStoredLockUntil();
    return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
  }, [getStoredLockUntil]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemaining);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCooldown = useCallback((seconds: number) => {
    const lockUntil = Date.now() + seconds * 1000;
    unlockTimestampRef.current = lockUntil;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(storageKey, lockUntil.toString());
      }
    } catch {}
    setRemainingSeconds(seconds);
  }, [storageKey]);

  const resetCooldown = useCallback(() => {
    unlockTimestampRef.current = 0;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}
    setRemainingSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [storageKey]);

  useEffect(() => {
    const isLocked = remainingSeconds > 0;
    if (!isLocked) return;

    const sync = () => {
      const lockUntil = unlockTimestampRef.current || getStoredLockUntil();
      const diff = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        unlockTimestampRef.current = 0;
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem(storageKey);
          }
        } catch {}
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sync();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }
    timerRef.current = setInterval(sync, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [remainingSeconds > 0, getStoredLockUntil, storageKey]);

  return { remainingSeconds, triggerCooldown, resetCooldown };
}
