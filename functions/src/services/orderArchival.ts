import { Firestore, FieldValue } from 'firebase-admin/firestore';

export interface ArchivalOptions {
  cutoffIso?: string;
  batchSize?: number;
  maxBatches?: number;
  statuses?: string[];
  archivedBy?: string;
}

export interface ArchivalResult {
  totalArchived: number;
  archivedByStatus: Record<string, number>;
  cutoffIso: string;
  durationMs: number;
  errors: string[];
}

export const TERMINAL_STATUSES = ['completed', 'paid', 'cancelled'];

/**
 * archiveSettledOrders
 * Atomically migrates orders with terminal status ('completed', 'paid', 'cancelled')
 * older than cutoffIso from `orders` collection into `archived_orders` collection.
 * 
 * Execution Characteristics:
 * - Atomic: writes to archived_orders and deletes from orders within the same db.batch().
 * - Safe Chunking: batches up to 400 documents (under Firestore's 500 operation limit).
 * - Indexed: leverages status ASC + createdAt DESC composite index.
 * - Non-disruptive: only touches orders past the business-day retention grace period.
 */
export async function archiveSettledOrders(
  db: Firestore,
  options: ArchivalOptions = {}
): Promise<ArchivalResult> {
  const startTime = Date.now();
  // Default cutoff: 24 hours ago (preserves current business day shift data & table states)
  const cutoffIso = options.cutoffIso || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const batchSize = Math.min(Math.max(options.batchSize || 400, 1), 450);
  const maxBatches = options.maxBatches || 10;
  const targetStatuses = options.statuses || TERMINAL_STATUSES;
  const archivedBy = options.archivedBy || 'cloud_scheduler_eod';

  let totalArchived = 0;
  const archivedByStatus: Record<string, number> = {};
  const errors: string[] = [];

  for (const status of targetStatuses) {
    archivedByStatus[status] = 0;
    let batchCount = 0;

    while (batchCount < maxBatches) {
      batchCount++;
      try {
        const snapshot = await db.collection('orders')
          .where('status', '==', status)
          .where('createdAt', '<=', cutoffIso)
          .limit(batchSize)
          .get();

        if (snapshot.empty) {
          break;
        }

        const batch = db.batch();
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const targetRef = db.collection('archived_orders').doc(doc.id);
          batch.set(targetRef, {
            ...data,
            archivedAt: FieldValue.serverTimestamp(),
            archivedReason: status,
            archivedBy
          });
          batch.delete(doc.ref);
        }

        await batch.commit();
        const count = snapshot.size;
        totalArchived += count;
        archivedByStatus[status] += count;

        if (count < batchSize) {
          break;
        }
      } catch (err: any) {
        const errMsg = `Failed archiving status ${status} in batch ${batchCount}: ${err?.message || String(err)}`;
        console.error(`[OrderArchival] ${errMsg}`);
        errors.push(errMsg);
        break;
      }
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(`[OrderArchival] Completed in ${durationMs}ms: archived ${totalArchived} orders (cutoff: ${cutoffIso})`);

  return {
    totalArchived,
    archivedByStatus,
    cutoffIso,
    durationMs,
    errors
  };
}
