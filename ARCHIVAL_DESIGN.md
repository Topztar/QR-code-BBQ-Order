# Order Archival Design & State Transitions (M-D16)

## Current State (As of Phase 4 Implementation)
Currently, when an order is completed, settled (paid), or cancelled, the order document in Firestore remains in the orders collection indefinitely. There is no automated process or API route that archives these inactive orders into a separate rchived_orders collection or marks them for deletion.

While status: 'paid' and status: 'cancelled' are effectively terminal states, the client apps (KDS, Manager Dashboard) filter them out in memory based on status predicates rather than querying a separate table. Over time, the orders collection will grow indefinitely, which will:
1. Increase Firestore read costs (if full collection scans happen).
2. Increase local emulator memory usage (during syncActive).
3. Degrade dashboard payload sizes if clients pull historical data naively.

## Proposed Archival Design (Future Implementation)

To maintain a performant and cost-effective system, we recommend implementing a formal archival workflow.

### 1. The rchived_orders Collection
Create a parallel Firestore collection named rchived_orders. The schema for an archived order is identical to an active Order, with the addition of:
- rchivedAt: Timestamp of when the order was moved.
- rchivedReason: Enum ('settled', 'cancelled', 'abandoned').

### 2. Archival Trigger (Cloud Function)
Instead of relying on the client to move the data (which poses security risks and OCC hazards), use a **Firestore Document Trigger** (onWrite or onUpdate):
- When an order transitions to status: 'paid' or status: 'cancelled', the trigger executes.
- The trigger writes the document to rchived_orders and deletes it from orders.
- The transaction must be atomic to prevent data loss.

### 3. Analytics and Reporting
The Manager Dashboard analytics (e.g., daily revenue, popular items) should query the rchived_orders collection for historical reporting. Active orders should only be queried for real-time operational data.

### 4. Client-Side Cache Eviction
When the order is moved, the active Firestore onSnapshot listener on the client will receive a emoved event for that document. The client store (e.g., Zustand) will automatically evict it from memory, freeing up client resources seamlessly.

## Conclusion
The current implementation handles correctness and concurrency (OCC), but lacks long-term storage hygiene. Implementing the Document Trigger archival strategy described above is the most robust path forward.
