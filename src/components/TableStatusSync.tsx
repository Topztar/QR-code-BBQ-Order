import React, { useEffect, useMemo } from 'react';
import { useOrderData } from '../context/OrderDataContext';
import { useRestaurantData } from '../context/RestaurantDataContext';

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
        let hasChanges = false;
        const newTables = prevTables.map(tb => {
          const tblId = String(tb.id).trim();

          const activeOrders = orders.filter(o => 
            String(o.tableNumber).trim() === tblId && 
            o.status !== 'cancelled'
          );

          const unpaidActiveOrders = activeOrders.filter(o => !o.isPaid && o.status !== 'completed' && o.status !== 'paid');

          if (unpaidActiveOrders.length > 0) {
            const targetStatus: 'pending_checkout' | 'in_use' = tb.status === 'pending_checkout' ? 'pending_checkout' : 'in_use';
            if (tb.status !== targetStatus || tb.preservedFor || tb.cleaningStartedAt) {
              hasChanges = true;
              return { ...tb, status: targetStatus, preservedFor: '', cleaningStartedAt: null };
            }
            return tb;
          }

          if (tb.status === 'in_use' || tb.status === 'pending_checkout') {
            hasChanges = true;
            return {
              ...tb,
              status: 'cleaning' as const,
              cleaningStartedAt: tb.cleaningStartedAt || new Date().toISOString()
            };
          }

          if (tb.status === 'cleaning') {
            let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
            if (!cleaningStartMs || isNaN(cleaningStartMs)) {
              const latestOrder = activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (latestOrder && latestOrder.createdAt) {
                cleaningStartMs = new Date(latestOrder.createdAt).getTime();
              } else {
                cleaningStartMs = nowMs;
              }
            }

            if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
              const todayPendingRes = reservations.find(r => 
                String(r.tableNumber).trim() === tblId &&
                (r.status === 'pending' || r.status === 'upcoming' || r.status === 'confirmed') &&
                r.date.trim() === todayStr
              );

              if (todayPendingRes) {
                hasChanges = true;
                return {
                  ...tb,
                  status: 'preserved' as const,
                  preservedFor: todayPendingRes.customerName,
                  cleaningStartedAt: null
                };
              }

              hasChanges = true;
              return {
                ...tb,
                status: 'available' as const,
                preservedFor: '',
                cleaningStartedAt: null
              };
            }

            return tb;
          }

          return tb;
        });

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
