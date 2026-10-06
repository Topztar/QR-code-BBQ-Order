import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Order } from '../types';
import { announceOrderNotification, formatOrderAnnouncementText, stopSpeech, unlockAudio } from '../utils/kdsAudio';

interface UseKDSAlarmOptions {
  orders: Order[];
  intervalMs?: number; // Repetition cadence, default 8000ms
  enabled?: boolean;   // Kitchen audio toggle
}

export const useKDSContinuousAlarm = ({
  orders,
  intervalMs = 8000,
  enabled = true,
}: UseKDSAlarmOptions) => {
  const isPlayingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Strict SSOT filter for unacknowledged orders
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === 'pending' || order.status === 'confirmed' || order.status === 'pending_kitchen_verification'
    );
  }, [orders]);

  // 2. Execution cycle: Chime -> Vocalize using existing KDS audio utilities
  const executeAlarmCycle = useCallback(async () => {
    if (isPlayingRef.current || pendingOrders.length === 0) return;

    isPlayingRef.current = true;
    try {
      const text = formatOrderAnnouncementText(pendingOrders, 'zh');
      // announceOrderNotification plays Web Audio chime, then speaks text
      await announceOrderNotification(text, true, 'zh');
    } catch (err) {
      console.warn('[KDS Alarm Cycle Error]', err);
    } finally {
      isPlayingRef.current = false;
    }
  }, [pendingOrders]);

  // 3. Polling lifecycle management
  useEffect(() => {
    if (!enabled || pendingOrders.length === 0) {
      // Termination condition: Clear intervals and abort speech immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopSpeech();
      isPlayingRef.current = false;
      return;
    }

    if (!timerRef.current) {
      executeAlarmCycle(); // Trigger first iteration immediately
      timerRef.current = setInterval(() => {
        executeAlarmCycle();
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, pendingOrders, intervalMs, executeAlarmCycle]);

  // 4. Unlock audio policy on user interaction
  const unlockAudioContext = useCallback(() => {
    unlockAudio().catch(() => {});
  }, []);

  return {
    pendingCount: pendingOrders.length,
    unlockAudioContext,
  };
};
