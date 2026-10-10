import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useOrderData } from '../context/OrderDataContext';
import { useRestaurantData } from '../context/RestaurantDataContext';
import { deriveTableStatuses } from '@sabay/shared';

export function TableStatusSync() {
  const { tables, setTables, reservations } = useRestaurantData();
  const { orders } = useOrderData();

  const tablesRef = useRef(tables);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const reservationsRef = useRef(reservations);
  useEffect(() => {
    reservationsRef.current = reservations;
  }, [reservations]);

  const tableStatusOrdersSignature = useMemo(() => {
    return orders
      .filter(o => o.tableNumber && o.status !== 'cancelled')
      .map(o => `${o.id}:${o.tableNumber}:${o.status}:${o.isPaid}`)
      .sort()
      .join('|');
  }, [orders]);

  const reservationsSignature = useMemo(() => {
    return (reservations || [])
      .map(r => `${r.id}:${r.tableNumber}:${r.status}:${r.date}:${r.time}`)
      .sort()
      .join('|');
  }, [reservations]);

  const checkAndSyncTables = useCallback(() => {
    const currentTables = tablesRef.current;
    if (!currentTables || currentTables.length === 0) return;

    const nowMs = Date.now();
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayStr = formatter.format(now);

    setTables(prevTables => {
      const { tables: newTables } = deriveTableStatuses(
        prevTables,
        ordersRef.current,
        reservationsRef.current,
        nowMs,
        todayStr
      );

      const hasChanges = JSON.stringify(prevTables) !== JSON.stringify(newTables);
      return hasChanges ? newTables : prevTables;
    });
  }, [setTables]);

  const hasInitializedRef = useRef(false);

  // Trigger sync only when order signature changes, reservations signature changes,
  // or on first non-empty tables load. NEVER re-trigger when tables state updates itself!
  useEffect(() => {
    const currentTables = tablesRef.current;
    if (!currentTables || currentTables.length === 0) return;

    checkAndSyncTables();
    hasInitializedRef.current = true;

    // S-06: Derive table status natively from snapshot instead of 15s interval loop.
    let earliestTimeout = Infinity;
    const nowMs = Date.now();
    
    currentTables.forEach(tb => {
      if (tb.status === 'cleaning' && tb.cleaningStartedAt) {
        const start = new Date(tb.cleaningStartedAt).getTime();
        const expiresAt = start + 15 * 60 * 1000;
        if (expiresAt > nowMs && expiresAt < earliestTimeout) {
          earliestTimeout = expiresAt;
        }
      }
    });

    let timeoutId: NodeJS.Timeout;
    if (earliestTimeout !== Infinity) {
      const delay = Math.max(0, earliestTimeout - nowMs);
      timeoutId = setTimeout(checkAndSyncTables, delay + 1000); // add 1s buffer
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tableStatusOrdersSignature, reservationsSignature, checkAndSyncTables, tables?.length > 0]);

  return null;
}
