"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TERMINAL_STATUSES = void 0;
exports.archiveSettledOrders = archiveSettledOrders;
const firestore_1 = require("firebase-admin/firestore");
exports.TERMINAL_STATUSES = ['completed', 'paid', 'cancelled'];
async function archiveSettledOrders(db, options = {}) {
    const startTime = Date.now();
    const cutoffIso = options.cutoffIso || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const batchSize = Math.min(Math.max(options.batchSize || 400, 1), 450);
    const maxBatches = options.maxBatches || 10;
    const targetStatuses = options.statuses || exports.TERMINAL_STATUSES;
    const archivedBy = options.archivedBy || 'cloud_scheduler_eod';
    let totalArchived = 0;
    const archivedByStatus = {};
    const errors = [];
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
                        archivedAt: firestore_1.FieldValue.serverTimestamp(),
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
            }
            catch (err) {
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
//# sourceMappingURL=orderArchival.js.map