import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Wall-Clock Cooldown Hook
 * 🛡️ Resilient against iOS WebKit background timer suspension & tab locks.
 * Persists expiration in sessionStorage and recovers instantly on visibilitychange.
 */
export function useSecureCooldown(storageKey = 'sabay_staff_lock_until') {
  const getRemaining = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return 0;
      const lockUntil = Number(sessionStorage.getItem(storageKey) || 0);
      return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
    } catch {
      return 0;
    }
  }, [storageKey]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemaining);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCooldown = useCallback((seconds: number) => {
    const lockUntil = Date.now() + seconds * 1000;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(storageKey, lockUntil.toString());
      }
    } catch {}
    setRemainingSeconds(seconds);
  }, [storageKey]);

  const resetCooldown = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}
    setRemainingSeconds(0);
  }, [storageKey]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const sync = () => {
      const diff = getRemaining();
      setRemainingSeconds(diff);
      if (diff <= 0) {
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem(storageKey);
          }
        } catch {}
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
    timerRef.current = setInterval(sync, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [remainingSeconds, getRemaining, storageKey]);

  return { remainingSeconds, triggerCooldown, resetCooldown };
}
