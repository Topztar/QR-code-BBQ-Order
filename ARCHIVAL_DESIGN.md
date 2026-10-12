# Order Archival Design & State Transitions (M-D16)

## 1. Overview & Current State
When an order is completed, settled (paid), or cancelled, the order document in Firestore historically remained in the `orders` collection indefinitely. While `paid`, `completed`, and `cancelled` are terminal states, client applications (KDS, Cashier, Manager Dashboard) filter them out in memory based on status predicates. Over time, an unbounded `orders` collection increases scan overhead and index size.

## 2. Production Archival Architecture: Scheduled Nightly Batch

To balance high-performance real-time operations, cashier post-checkout grace periods, same-day End-of-Day (EOD) audit trails, and long-term storage hygiene, the system uses a **Scheduled Cloud Function (Nightly Batch Archival)** rather than an immediate reactive trigger:

```
[Active Operations (KDS, Cashier, Live Floor Plan)]
                       │
                       ▼
          Firestore Collection: `orders`
  (Holds active orders + current business day settled orders)
                       │
                       ▼ (Nightly 04:00 AM CST via Cloud Scheduler)
  Batch filter: status in ['paid', 'completed', 'cancelled'] & createdAt < 24h ago
                       │
                       ▼ (Atomic db.batch)
      Firestore Collection: `archived_orders`
     (Read-only archive for historical reporting)
```

### Key Components

### 1. The `archived_orders` Collection
A parallel Firestore collection named `archived_orders`. The schema is identical to an active `Order`, enriched with archival metadata:
- `archivedAt`: Server timestamp of when the order was migrated.
- `archivedReason`: Status indicator ('paid', 'completed', 'cancelled').
- `archivedBy`: Audit author string (e.g. `'cloud_scheduler_eod'`).

### 2. Scheduled Batch Trigger (Cloud Function)
Instead of an immediate trigger on `status: 'paid'` (which would prematurely evict dine-in tables, break same-day EOD cash reconciliations, and race with cashier adjustments in `PaidOrderModificationModal`), archival is executed via `onSchedule`:
- **Function:** `archiveSettledOrdersNightly`
- **Schedule:** `0 4 * * *` (Daily at 04:00 AM Asia/Taipei, post-closing).
- **Grace Period:** Orders must be older than 24 hours (preserving same-day shift records).
- **Atomicity:** Uses `db.batch()` in batches of up to 400 documents to atomically write to `archived_orders` and delete from `orders`.

### 3. Historical Query Routing (`/orders/export`)
The export API (`GET /api/orders/export`) provides a unified query layer:
- For windows spanning historical periods (e.g., 30 days), it queries both `archived_orders` (for older settled records) and active `orders` (for the current 24 hours), deduplicates, and sorts chronologically.

### 4. Security Rules
Client writes directly to `archived_orders` are forbidden. Authenticated staff may read historical archives:
```protobuf
match /archived_orders/{orderId} {
  allow read: if request.auth != null;
  allow write: if false; // Cloud Functions Admin SDK bypasses rules
}
```

## 3. Operational Integrity
This design guarantees:
1. **Zero Table Turnover Glitches:** Paid dine-in tables remain visible until the party vacates and cleaning is complete.
2. **Zero EOD Audit Breakdown:** Same-day cash drawer calculations and Z-reports reflect all shift orders.
3. **No Race Conditions:** Managers can adjust or refund orders within the immediate post-checkout window without facing 404 errors.
