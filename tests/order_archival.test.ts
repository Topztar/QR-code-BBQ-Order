import { describe, it, expect } from 'vitest';
import { archiveSettledOrders, TERMINAL_STATUSES } from '../functions/src/services/orderArchival';

describe('Order Archival Strategy (M-D16) Tests', () => {
  it('should define exact terminal statuses for archival', () => {
    expect(TERMINAL_STATUSES).toEqual(['completed', 'paid', 'cancelled']);
  });

  it('should atomically migrate terminal orders older than cutoffIso and preserve active/recent orders', async () => {
    const ordersMap = new Map<string, any>();
    const archivedOrdersMap = new Map<string, any>();

    const now = Date.now();
    const cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
    const cutoffIso = cutoffDate.toISOString();

    const olderDate = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    const recentDate = new Date(now - 2 * 60 * 60 * 1000).toISOString();

    // Seed test orders
    // 1. Terminal + Old -> SHOULD be archived
    ordersMap.set('ord-old-paid', { id: 'ord-old-paid', status: 'paid', createdAt: olderDate, total: 500 });
    ordersMap.set('ord-old-completed', { id: 'ord-old-completed', status: 'completed', createdAt: olderDate, total: 300 });
    ordersMap.set('ord-old-cancelled', { id: 'ord-old-cancelled', status: 'cancelled', createdAt: olderDate, total: 0 });

    // 2. Terminal + Recent (<24h) -> SHOULD NOT be archived (grace period for EOD and cashier adjustment)
    ordersMap.set('ord-recent-paid', { id: 'ord-recent-paid', status: 'paid', createdAt: recentDate, total: 450 });
    ordersMap.set('ord-recent-completed', { id: 'ord-recent-completed', status: 'completed', createdAt: recentDate, total: 200 });

    // 3. Non-terminal + Old -> SHOULD NOT be archived (live operations)
    ordersMap.set('ord-old-pending', { id: 'ord-old-pending', status: 'pending', createdAt: olderDate, total: 100 });
    ordersMap.set('ord-old-preparing', { id: 'ord-old-preparing', status: 'preparing', createdAt: olderDate, total: 100 });
    ordersMap.set('ord-old-served', { id: 'ord-old-served', status: 'served', createdAt: olderDate, total: 100 });

    // Build mock Firestore
    const mockDb: any = {
      collection: (colName: string) => {
        if (colName === 'orders') {
          return {
            where: (field1: string, op1: string, val1: any) => ({
              where: (field2: string, op2: string, val2: any) => ({
                limit: (lim: number) => ({
                  get: async () => {
                    const matches: any[] = [];
                    for (const [id, doc] of ordersMap.entries()) {
                      const match1 = op1 === '==' ? doc[field1] === val1 : true;
                      const match2 = op2 === '<=' ? doc[field2] <= val2 : true;
                      if (match1 && match2) {
                        matches.push({
                          id,
                          ref: { id, path: `orders/${id}` },
                          data: () => ({ ...doc })
                        });
                        if (matches.length >= lim) break;
                      }
                    }
                    return {
                      empty: matches.length === 0,
                      size: matches.length,
                      docs: matches
                    };
                  }
                })
              })
            })
          };
        } else if (colName === 'archived_orders') {
          return {
            doc: (docId: string) => ({
              id: docId,
              path: `archived_orders/${docId}`
            })
          };
        }
        throw new Error(`Unexpected collection: ${colName}`);
      },
      batch: () => {
        const operations: Array<() => void> = [];
        return {
          set: (docRef: any, data: any) => {
            operations.push(() => {
              archivedOrdersMap.set(docRef.id, data);
            });
          },
          delete: (docRef: any) => {
            operations.push(() => {
              ordersMap.delete(docRef.id);
            });
          },
          commit: async () => {
            for (const op of operations) {
              op();
            }
          }
        };
      }
    };

    // Execute archival
    const result = await archiveSettledOrders(mockDb, { cutoffIso });

    // Verify result summary
    expect(result.totalArchived).toBe(3);
    expect(result.archivedByStatus.paid).toBe(1);
    expect(result.archivedByStatus.completed).toBe(1);
    expect(result.archivedByStatus.cancelled).toBe(1);
    expect(result.errors).toHaveLength(0);

    // Verify archived collection
    expect(archivedOrdersMap.has('ord-old-paid')).toBe(true);
    expect(archivedOrdersMap.has('ord-old-completed')).toBe(true);
    expect(archivedOrdersMap.has('ord-old-cancelled')).toBe(true);
    expect(archivedOrdersMap.get('ord-old-paid').archivedBy).toBe('cloud_scheduler_eod');
    expect(archivedOrdersMap.get('ord-old-paid').archivedReason).toBe('paid');

    // Verify orders collection: old settled deleted, recent settled & active preserved
    expect(ordersMap.has('ord-old-paid')).toBe(false);
    expect(ordersMap.has('ord-old-completed')).toBe(false);
    expect(ordersMap.has('ord-old-cancelled')).toBe(false);

    expect(ordersMap.has('ord-recent-paid')).toBe(true);
    expect(ordersMap.has('ord-recent-completed')).toBe(true);
    expect(ordersMap.has('ord-old-pending')).toBe(true);
    expect(ordersMap.has('ord-old-preparing')).toBe(true);
    expect(ordersMap.has('ord-old-served')).toBe(true);
  });

  it('should handle empty results gracefully without errors', async () => {
    const mockDb: any = {
      collection: () => ({
        where: () => ({
          where: () => ({
            limit: () => ({
              get: async () => ({ empty: true, size: 0, docs: [] })
            })
          })
        })
      }),
      batch: () => ({ commit: async () => {} })
    };

    const result = await archiveSettledOrders(mockDb);
    expect(result.totalArchived).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should catch and record batch errors without uncaught crashes', async () => {
    const mockDb: any = {
      collection: () => ({
        where: () => ({
          where: () => ({
            limit: () => ({
              get: async () => {
                throw new Error('Firestore connection timeout');
              }
            })
          })
        })
      }),
      batch: () => ({ commit: async () => {} })
    };

    const result = await archiveSettledOrders(mockDb);
    expect(result.totalArchived).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Firestore connection timeout');
  });
});
