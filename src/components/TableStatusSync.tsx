import React, { useEffect, useMemo } from 'react';
import { useOrderData } from '../context/OrderDataContext';
import { useRestaurantData } from '../context/RestaurantDataContext';
import { deriveTableStatuses } from '@sabay/shared';

export function TableStatusSync() {
  const { tables, setTables, reservations } = useRestaurantData();
  const { orders } = useOrderData();

  const tableStatusOrdersSignature = useMemo(() => {
    return orders
      .filter(o => o.tableNumber && o.status !== 'cancelled')
      .map(o => `${o.id}:${o.tableNumber}:${o.status}:${o.isPaid}`)
      .sort()
      .join('|');
  }, [orders]);

  // Real-time Table Status Auto-Sync based on Orders & Reservations
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const checkAndSyncTables = () => {
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
          orders,
          reservations,
          nowMs,
          todayStr
        );

        const hasChanges = JSON.stringify(prevTables) !== JSON.stringify(newTables);
        return hasChanges ? newTables : prevTables;
      });
    };

    checkAndSyncTables();
    
    // S-06: Derive table status natively from snapshot instead of 15s interval loop.
    // Instead of polling every 15s, we only set a timeout if there are tables in 'cleaning' state
    // that need to transition to 'available' or 'preserved'.
    let earliestTimeout = Infinity;
    const nowMs = Date.now();
    
    tables.forEach(tb => {
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
      const delay = earliestTimeout - nowMs;
      timeoutId = setTimeout(checkAndSyncTables, delay + 1000); // add 1s buffer
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tableStatusOrdersSignature, reservations, tables, setTables]);

  return null;
}
