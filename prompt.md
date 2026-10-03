<USER_REQUEST>
Ordering Lifecycle Master Audit
MASTER CONSOLIDATION — synthesis of four prior audits. READ-ONLY; no repository source was modified.
Repo
/home/user/Doubao/chats/38445017022685186/repo
Branch
ai006027-12576367682858005278, HEAD 8064b75
Audit date
2026-10-03
Scope
Entire ordering lifecycle: cart -> submit -> ingestion/validation -> persistence/real-time fan-out -> settlement/state transition.
Prior audits fused
ManagerDashboard (S1-01..S5-10, 54 IDs) + Server Runtime (SR-01..SR-74) + Orders Domain (OR-01..OR-62) + QA/E2E (QA-01..QA-42, 26 real rows).
New work this pass
Bounded cross-checks only: schema-drift census (18 rows) + duplicate-state census (17 rows), written to crosscheck_schema_state.md. No full re-audit.
Executive Summary
This master report fuses four prior, independently-verified audits into one ordering-lifecycle inventory and a phased implementation plan. It does not re-derive findings; every defect below carries its originating audit ID as an alias, and each physical defect appears exactly once in the master matrix.
Headline counts (after deduplication):
Class
Master rows
Source aliases
Confirmed Dead Code (safe to remove)
20 (M-E01..E20) + 6 client dead (M-A08..A13)
SR-01..09, OR-01..08, OR-19, OR-52..55, OR-57, OR-09..11, QA-01/16/17, S3-01/02/07/08
Active Duplication (consolidate, do not delete)
21
SR-10..30 family, OR-21..30, OR-43..47, OR-50/51
Confirmed defects / Needs Verification (fix)
19
OR-32, OR-33, SR-20/21/54/63, SR-49..74 family, OR-35..38
QA-lens hardening (Warning/NV, never High)
14 (M-F01..F14)
QA-03/04/05/06/18/21/33/34/35/36/37/40/41 + OR-20
Retained guardrails (False Positive — Necessary)
18
SR-31..48, OR-14..18, OR-39..42, OR-59..62
New schema-drift rows (this pass)
14 net-new (+4 cited-known)
D-01..D-18
New duplicate-state rows (this pass)
17
S-01..S-17
Total master rows
93 (M-A01..F14)
216 raw labels reconciled explicitly in 2.4
Risk-tier headline:
High (act first): cloud single-checkout double-pay race (M-4-01 = OR-32/QA-29); production restock 400s (M-2-06 = SR-21/S2-02); member financial routes missing in production (M-4-11 = SR-54/S5-07); cloud PUT /items missing OCC version (M-4-07 = SR-63/OR-31).
Medium: cached menu read cache never invalidated (M-3-03 = SR-49); local checkout trusts client money (M-4-02 = OR-33); per-instance cloud rate limiter under-count (M-3-10 = SR-70); pos_bridge binds 0.0.0.0 (M-4-16 = SR-68).
Low: dead-code pruning batch (M-1-dead series); hygiene (stale comments, unused aliases).
Retained (explicitly NOT defects): the offline triple-write queue, idempotent retries, validators guards, client-UX-vs-server-authority dual-layer pricing, KDS mutex/heartbeat, optimistic order rollback-by-resync, refundLogs audit trail, error boundaries / lazy chunk recovery, null/legacy order fallbacks, and read caches. Each is justified in Part 2's Retained list with code and audit row.
Observed baseline (unchanged, cite verbatim): npm run lint exits 0; npm test = 23 files, 226/227 pass. The single failure is tests/kds_quantity_aggregation.test.ts, an environment-only Firestore-emulator probe (a sandbox proxy accepts TCP on 0.0.0.0:8080, so the TCP-only emulator check falsely reports the emulator present and writes fail RST_STREAM/UNAVAILABLE). Not a code regression.
Table of Contents
Part 1 — Architecture Overview & Data Flow
1.1 Deployment topology
1.2 Combined lifecycle sequence
1.3 Order status state machine (code-reconciled)
1.4 Chapter 1 — Creation & Cart Mutation
1.5 Chapter 2 — Ingestion & Validation
1.6 Chapter 3 — Persistence & Real-time Fan-out
1.7 Chapter 4 — Settlement & State Transitions
Part 2 — Master Candidate Verification Matrix
2.1 Deduplicated master matrix
2.2 Itemized cross-verification — confirmed for removal/consolidation
2.3 Explicit Retained list (necessary guardrails)
2.4 Reconciliation table: raw IDs -> master IDs
Part 3 — Fresh gap cross-checks
3.1 Schema drift census
3.2 Duplicate state census
Part 4 — Phased Refactoring Roadmap
Part 5 — Verification & Regression Strategy
<a id="part-1"></a>
Part 1 — Architecture Overview & Data Flow
<a id="1-1"></a>
1.1 Deployment topology
The app is a SPA served by Firebase Hosting with two interchangeable API planes: a Cloud Function (api) on asia-east1 backed by Firestore + Cloud Storage, and a local Express server (server.ts) used for development that mirrors most routes against in-memory state persisted to persisted_state.json. A loopback POS bridge (pos_bridge.js) reaches local ESC/POS printers and the cash drawer.
flowchart TB
subgraph Browser["Browser SPA (React)"]
CUST["Customer order view"]
KDS["Kitchen Display System"]
MGR["Manager / Cashier dashboard"]
Q["offlineQueue memory + idb"]
end
subgraph Hosting["Firebase Hosting"]
SPA["index.html SPA fallback"]
REW["rewrites /api/** -> api, ** -> index.html"]
end
subgraph Cloud["Cloud Function api@asia-east1"]
FN["functions/src/index.ts router"]
TRIG["triggers onOrderCreated onMenuItemWritten onReservationCreated onSchedule"]
end
FS[("Firestore orders menu tables checkouts ingredients")]
RTDB[("RTDB presence")]
GCS[("Cloud Storage images")]
subgraph LocalDev["Local Express dev server"]
LS["server.ts + src/server/routes/*"]
PERS["persisted_state.json"]
end
BRIDGE["pos_bridge.js loopback"]
PRN["ESC/POS printer + cash drawer"]
CUST --> SPA
KDS --> SPA
MGR --> SPA
SPA --> REW
REW --> FN
FN --> FS
FN --> GCS
FN --> TRIG
TRIG --> FS
KDS -.realtime.-> FS
KDS -.presence.-> RTDB
MGR -.dev mode.-> LS
LS --> PERS
MGR --> BRIDGE
BRIDGE --> PRN
Key anchors: SPA fallback + rewrites firebase.json:142-153; named DB firebase.json:3; cloud router mounts functions/src/index.ts:181-188, 404 :191-193, api export :195; local printer mount server.ts:1428, modular orders mount :3121, API 404 :3321, listen :3357.
<a id="1-2"></a>
1.2 Combined lifecycle sequence
One end-to-end trace from cart placement through settlement, folding the four audits' per-capability diagrams into a single chain.
sequenceDiagram
participant Cart as CustomerCartDrawer
participant Submit as useOrderSubmit
participant API as POST /orders
participant Tx as Firestore transaction
participant KDS as KitchenDisplaySystem
participant Cash as CashierCheckoutPanel
participant Ledger as checkouts collection
Cart->>Submit: optimistic order + clientOrderId
Submit->>API: POST /api/orders (validated by validators.ts)
API->>Tx: runTransaction
Tx->>Tx: idempotency key check _idempotency_keys
Tx->>Tx: sold-out scan from menu
Tx->>Tx: SSOT recompute unit price + promo + total
Tx->>Tx: set orders doc, table status in_use
API-->>Submit: 201 order
Tx-->>KDS: onOrderCreated notification trigger
KDS->>KDS: onSnapshot orders fan-out
KDS->>KDS: claim-kitchen mutex + heartbeat lease
KDS->>API: item-complete with expectedVersion OCC
Cash->>API: PUT checkout (paymentMethod cashTendered)
API->>Tx: transaction set checkouts ledger, table cleaning
API-->>Cash: paid
Cash->>API: print receipt via pos_bridge
<a id="1-3"></a>
1.3 Order status state machine (code-reconciled)
The user-facing brief uses labels PENDING -> PREPARING -> SERVED -> COMPLETED / ARCHIVED. The actual code order-status enum is OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'paid' | 'completed' | 'cancelled' (src/types.ts:66), enforced by the whitelist at src/server/routes/orders.ts:323.
Naming reconciliation (important):
There is no served order status in code. "Served" maps to the kitchen item-level isPrepared / isCompleted flags on OrderItem (src/types.ts:62-63), not the order-level status.
There is no archived order status. Historical orders are deleted by bulk-delete ({thresholdDate} cloud / {orderIds} local) rather than archived (QA-38, SR-61). "Archived" = completed + bulk-deleted later.
delivering exists for takeout/delivery but is not used by the table lifecycle.
Table status is a separate machine: available | preserved | reserved | in_use | pending_checkout | cleaning (src/types.ts:197). Order settlement flips the table to cleaning (cloud functions/src/routes/orders.ts:570-576), then a 15-min read-repair returns it to available or preserved (functions/src/routes/tables.ts:50-59; client mirror OrderDataContext.tsx:181-275).
stateDiagram-v2
[*] --> pending : POST /orders
pending --> confirmed : staff accept
confirmed --> preparing : kitchen starts
preparing --> preparing : item isPrepared
preparing --> paid : cashier checkout
paid --> completed : all items complete
pending --> cancelled : void
confirmed --> cancelled : void
preparing --> cancelled : void
paid --> completed : close
completed --> [*] : bulk-delete by thresholdDate
note right of paid : no archived status exists in code
<a id="1-4"></a>
1.4 Chapter 1 — Creation & Cart Mutation
Where the payload is built on the client and priced optimistically.
Cart tally. useCustomerCart.ts:142-173 re-implements the promo loop inline (activeCombosAndDiscounts), diverging from the server calculatePromoComboDiscount — alias OR-43. The express fee hardcodes 10% on the post-promo subtotal (useCustomerCart.ts:187-191) while the SSOT charges 10% on pre-discount subtotal — alias OR-44.
Optimistic submit. useOrderSubmit.ts:48-54 mints clientOrderId and guards in-flight duplicates with activeOrderSubmissionsRef; its optimistic pricing call omits the resolved promo discount (:63-67), so optimistic order.discount=0 while the cart shows a discounted total — alias OR-45, which fires the (currently unlistened) order_price_reconciliation_warning event — alias OR-12.
Customizer. FoodCustomization (src/types.ts:12-18) carries spiciness / noodleType / soupBase / selectedAddOns; these add-ons are priced in server computeOrderItemUnitPrice but omitted from the drilldown receipt line total it.price*qty — alias OR-46.
Dead client state. OrderDataContext exposes setOrders unnecessarily (OR-09), localOrderIds useState is write-only (OR-10), skipRefresh param is vestigial (OR-11), pushNotifications is never populated (OR-06 = master S-16), currentPath prop unused (OR-07), reservationsRef never read (OR-08).
Evidence links: OR-43/44/45/46/49/50/51/58 (Orders audit §2.2/§2.5); OR-06..12 (Orders audit §2.1/§2.4/§2.5).
<a id="1-5"></a>
1.5 Chapter 2 — Ingestion & Validation
Two interchangeable ingestion planes, one shared validator.
Shared sanitizer. functions/src/validators.ts exports validateOrderPayload:27, validateReservationPayload:108, validateImageUploadPayload:177, validateRatingPayload:245. Both cloud (functions/src/routes/orders.ts:246) and local (src/server/routes/orders.ts:99) call validateOrderPayload.
SSOT price lookup. Cloud recomputes authoritative unit price inside the transaction from the menu collection (functions/src/routes/orders.ts:335-343) and overwrites subtotal/discount/serviceCharge/total (:370-373). Local does the same from liveMenu (src/server/routes/orders.ts:218-233). The client tally (total/subtotal/serviceCharge/discount) is therefore not trusted at order create — it is overwritten.
Auth / session. Cloud staff routes gate on requireStaffAuth (functions/src/auth.ts:45-73) with a 30s cachedAuthCredentials token cache (:18-40, alias SR-33). Local /api/staff/verify accepts a weaker literal token (server.ts:2880, alias SR-28). Customer POST /orders is protected by soft requireAppCheck (functions/src/index.ts:133-151, alias SR-47) plus order rate limiter.
Known contract splits at ingestion. bulk-delete {thresholdDate} cloud vs {orderIds} local (SR-20/OR-24); restock {id,amount} client+local vs {ingredientId,quantityAdded} cloud (SR-21/S2-02); category/dish form field splits (S2-06/S2-07).
Evidence links: SR-17/18/20/21/27/28 (Server audit §2); OR-21/22 (Orders audit §2.2); validators.ts (this pass D-01..D-18).
<a id="1-6"></a>
1.6 Chapter 3 — Persistence & Real-time Fan-out
Writes. Cloud order write functions/src/routes/orders.ts:388 (t.set(orders/{id})); local pushes into liveOrders then saveStateToDisk() (src/server/routes/orders.ts:268-286). Cloud settlement writes the checkouts ledger (:581-588,682-690); local does not (SR-60/OR-34).
Transaction isolation. Cloud create and checkout run in db.runTransaction (atomic). Local create is in-memory check-then-act with a non-atomic id-loop on LM-{1000+n} (src/server/routes/orders.ts:236-241, alias OR-38) and a process-local idempotency Map lost on restart (SR-17/OR-22).
onSnapshot fan-out. Client subscribes orders (useLiveOrders.ts:282, deferred unsubscribe :363-367), plus menu/categories/tables/ingredients listeners in RestaurantDataContext.tsx:438-464. Tables are wholesale-overwritten by the snapshot (:461, alias QA-20).
Multi-tab. Dual transport BroadcastChannel('sabay_orders_sync') + storage fallback (useLiveOrders.ts:203-205, alias OR-17, necessary).
KDS triggers. onOrderCreated (functions/src/index.ts:363-403) fires notification; KDS claim mutex/heartbeat is a 3-backend duplicate (src/server/routes/orders.ts:842-915, functions/src/routes/orders.ts:837-966, src/lib/kdsPresence.ts; alias SR-30/OR-23).
Cache eviction gap. cachedMenu/cachedCategories 60s read cache is set but never invalidated on write (functions/src/helpers.ts:16-24; alias SR-49).
Evidence links: SR-30/49/70/71/72 (Server audit §2); OR-15/16/17/18/39/40 (Orders audit §2.3); QA-02 target matrix.
<a id="1-7"></a>
1.7 Chapter 4 — Settlement & State Transitions
Checkout. Cloud single checkout functions/src/routes/orders.ts:538-595 runs a transaction but has no isPaid early-return — a replayed/concurrent checkout re-writes the order and, when checkoutRecord.id is omitted, generates a new TX-{Date.now()} ledger id and creates a duplicate checkouts doc. This is the double-pay defect OR-32 / QA-29. Local checkout DOES have the guard (src/server/routes/orders.ts:542-545) but trusts client money fields (:550-561, alias OR-33).
Reconciliation. Member-deduct compensating rollback posts /topup on checkout failure (CashierCheckoutPanel.tsx:259-278, alias OR-61/SR-45, necessary).
Table occupancy reset. On paid, cloud flips the table to cleaning with cleaningStartedAt (functions/src/routes/orders.ts:570-576); the 15-minute read-repair returns it to available or preserved against today's reservations (tables.ts:50-59). Caveat: an unpaid sibling on the same table can still flip it cleaning (QA-19).
Completion / archival. PUT /orders/:id/complete (functions/src/routes/orders.ts:710) and item-complete with OCC (:737). There is no archived status; history is purged by bulk-delete (QA-38).
Audit / anti-tamper. Paid edits require non-empty refundLogs (functions/src/routes/orders.ts:502-506, src/server/routes/orders.ts:935-946; alias SR-38/OR-41/OR-60, necessary).
Cache eviction on settlement. Menu mutations must invalidate cachedMenu (SR-49); settlement itself does not touch the menu cache.
Evidence links: OR-32/33/34/35/36 (Orders audit §2.4/§2.5); SR-60/63 (Server audit §2); QA-29/38/39 (QA matrix Part C).
<a id="part-2"></a>
Part 2 — Master Candidate Verification Matrix
One deduplicated table. Each physical defect appears once under its earliest/canonical ID; aliases are listed in the evidence cell. Raw ID -> master ID mapping is in 2.4. Risk is engineering impact, not just likelihood. "Over-Pruning Check" states why it is safe to remove/refactor (or, for retained guardrails, why it must stay — those live in 2.3).
Classification vocabulary: Dead (zero callers, unreachable, not a fallback) | Duplicate (active parallel implementation — consolidate, never delete) | Obsolete (superseded contract / shadowed state) | Needs Verification (cannot be proven dead nor safe).
<a id="2-1"></a>
2.1 Master matrix (grouped by lifecycle phase)
Phase 1 — Creation & Cart Mutation
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-A01
src/hooks/useCustomerCart.ts:142-173 activeCombosAndDiscounts
Duplicate
Re-implements calculatePromoComboDiscount inline; feeds promoComboDiscount->cartTotal in CustomerOrderView + CartDrawer. Aliases: OR-43.
Med
Safe to refactor to the shared function; it is a pure derivation with no independent side effect.
M-A02
src/hooks/useCustomerCart.ts:187-191 expressFee
Duplicate (divergent)
Hardcodes 10% on post-promo subtotal; SSOT calculateOrderPricing:78 uses pre-discount base. Aliases: OR-44.
Med
Refactor to source rate from settings + pre-discount base; no caller depends on the wrong base.
M-A03
src/hooks/useOrderSubmit.ts:63-67 optimistic pricing
Duplicate (divergent)
Calls calculateOrderPricing without promo discount; triggers order_price_reconciliation_warning. Aliases: OR-45, OR-12.
Med
Pass resolved promo discount through; the warning event has zero listeners anyway (OR-12).
M-A04
OrderDetailDrilldownModal.tsx:304,780 receipt line it.price*qty
Duplicate (wrong math)
Omits soupBase/spicy add-ons that computeOrderItemUnitPrice adds. Aliases: OR-46.
Med
Swap to computeOrderItemUnitPrice(it,menuItems)*qty; the adjacent :440 already does this correctly.
M-A05
src/components/**/*.tsx (13 files, 38 sites) takeout predicate
Duplicate
includes('外带有')|==='takeout'|takeoutInfo copy-pasted; no isTakeoutOrder(order) helper. Aliases: OR-51.
Low
Add a util and replace all 38 sites; behavior-preserving.
M-A06
KdsTicketCard.tsx:956-1046, CustomerHeader.tsx:633, CashierOrderCard.tsx:34, CustomerOrderTracker.tsx:110-168 status resolvers
Duplicate
Four+ bespoke status===... label/color maps; maps rebuilt per-order in render. Aliases: OR-50, OR-49.
Low
Hoist to one getStatusMeta(status); purely presentational.
M-A07
CashierOrderCard.tsx:37, ManagerEodTab.tsx:67-71 pricing
Duplicate (wasteful)
Unmemoized calculateOrderPricing in render body; EOD runs the pricing reduce 5x. Aliases: OR-58.
Low
Wrap in useMemo, cache per-order total; math unchanged.
M-A08
src/context/OrderDataContext.tsx:115,296 pushNotifications
Dead
Only useState([]) init + a filter; no producer ever pushes; CustomerHeader.tsx:602 render branch permanently false. Aliases: OR-06, S-16.
Low
Safe to delete state + dead branch; verify no producer appears in grep setPushNotifications.
M-A09
src/context/OrderDataContext.tsx:93,106 + App.tsx:806 currentPath prop
Dead
Declared/destructured/passed but never read in provider body. Aliases: OR-07.
Low
Drop from interface + JSX; no read site.
M-A10
src/hooks/useLiveOrders.ts:85,98-101 reservations param + reservationsRef
Dead
Assigned to ref but .current never read. Aliases: OR-08.
Low
Remove ref; table auto-sync consumes reservations directly in OrderDataContext.
M-A11
src/context/OrderDataContext.tsx:14,295 exposed setOrders
Obsolete
On context type + value map, but no consumer destructures it; only useOrderSubmit receives it as a param. Aliases: OR-09.
Low
Remove from type + value map; the orders array itself is still consumed.
M-A12
src/hooks/useOrderSubmit.ts:37-44 localOrderIds useState
Obsolete
State value discarded; setter only side-effects safeStorage. Aliases: OR-10.
Low
Replace with direct safeStorage.setItem; the storage key stays live.
M-A13
src/hooks/useLiveOrders.ts:652,718 skipRefresh param
Obsolete
Callers pass it but hook bodies never reference it. Aliases: OR-11.
Low
Delete from signatures, context type, and call sites.
M-A14
src/components/CustomerOrderView.tsx:287-288 + CustomerHeader.tsx:858-965 loyalty panel
Needs Verification
Hardcoded userPoints=0, no lineProfile passed, loyalty ? branch unreachable from this caller. Aliases: OR-56.
Low
Verify whether CustomerHeader mounts elsewhere with lineProfile before removing.
Phase 2 — Ingestion & Validation
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-B01
src/services/orderCalculationService.ts vs functions/src/services/orderCalculationService.ts
Duplicate
Four core fns byte-identical, parity-tested by tests/order_calculation_parity.test.ts. Aliases: SR-18, OR-21, S4-04.
Med
Extract shared pure package (both already share validators this way); do NOT delete either copy until the package is wired.
M-B02
local src/server/routes/orders.ts:29,137-156 vs cloud functions/src/routes/orders.ts:264-286 order idempotency
Duplicate (divergent)
Local process-local Map lost on restart + non-atomic scan; cloud atomic _idempotency_keys txn 24h TTL. Aliases: SR-17, OR-22.
Med
Consolidate on Firestore-backed idempotency (local already has firestoreDb injected); keep both guards until cutover.
M-B03
src/server/routes/orders.ts:445-464 vs functions/src/routes/orders.ts:981-1007 bulk-delete
Obsolete (contract split)
Local reads {orderIds} (:446), cloud reads {thresholdDate} (:982), client POSTs {thresholdDate} -> local always 400s. Aliases: SR-20, OR-24, S4-05, D-16.
High
Make local accept thresholdDate (or both); dev runtime currently broken on the live client path.
M-B04
functions/src/routes/inventory.ts:103 vs RestaurantDataContext.tsx:487 vs server.ts:3022 restock
Obsolete (broken contract)
Client {id,amount}, local matches, cloud reads {ingredientId,quantityAdded} -> Number(undefined)=NaN -> 400. Aliases: SR-21, S2-02, D-17.
High
Align all three on one schema + add a server validator; production restock is broken today.
M-B05
functions/src/routes/menu.ts:382-396 POST /menu
Needs Verification (over-post)
Spreads ...req.body verbatim; no field allowlist. Aliases: SR-51, S2-04.
Med
Add a projection; local already builds a strict MenuItem (server.ts:1892).
M-B06
functions/src/routes/menu.ts:197-200 upload mime
Needs Verification
Trusts client-declared mime without magic-byte sniff; local sniffs bytes (server.ts:1649). Aliases: SR-50, QA-31, QA-32.
Med
Align prod to magic-byte sniffing.
M-B07
no validateMenuPayload / validateCategoryPayload in functions/src/validators.ts
Obsolete (missing validator)
Menu/category/inventory cloud writes are raw-body. Aliases: S2-04, D-13.
Med
Add validators; do not change local strict-build behavior.
M-B08
server.ts:2584,2679 vs cloud table/reservation routes
Duplicate (divergent auth)
Local has no requireStaffAuth; prod gates all mutating table/reservation routes. Aliases: SR-27.
Med
Treat local as dev-only; gate [localhost](http://localhost) or delegate.
M-B09
server.ts:2880 vs functions/src/auth.ts:45 staff token verify
Duplicate (weaker local)
Local accepts literal token/no expiry; cloud checks stored token + expiry. Aliases: SR-28, S5-08.
Med
Gate local verify to [localhost](http://localhost).
M-B10
server.ts:477-529 local reservation conflict check
Needs Verification (non-atomic)
In-memory filter-then-push; concurrent POSTs can double-book. Aliases: SR-57.
Low
Cloud is atomic (tables.ts:170); add a lock if local is publicly reachable.
M-B11
server.ts:2687 local phone/guest validation
Needs Verification (parity gap)
Local truthy-checks phone; cloud enforces Taiwan regex + guestCount 1..100. Aliases: SR-58, D-12.
Low
Port validateReservationPayload to local.
M-B12
src/utils/reservationValidator.ts:72-125 rest-day/blackout filter
Needs Verification (client-only)
Client returns []; no server-side blackout enforcement. Aliases: SR-59.
Med
Enforce blackout server-side in both runtimes.
M-B13
functions/src/routes/staff.ts:53-85 POST /staff/pin/check-path
Dead + Needs Verification (bypass)
No caller; on wrong PIN returns {valid:false} and never increments failedAttempts. Aliases: SR-56, S5-06.
Med
Remove, or add the same lockout ledger before any re-wiring.
M-B14
server.ts:184, functions/src/routes/printer.ts:67 default PIN '000000'
Needs Verification (footgun)
process.env.DEFAULT_STAFF_PIN || '000000'; hardcoded '070718' at CashierCheckoutPanel.tsx:115. Aliases: SR-64, QA-30, S4-08.
Med
Fail closed; require env var; force first-run change.
M-B15
validators.ts:57,70-71 emits both qty and quantity on OrderItem
Obsolete (type drift)
OrderItem.qty (types.ts:60) only; validator injects quantity. Aliases: D-01.
Low
Standardize on one field in the shared schema package (Part 4 Phase 2).
M-B16
validators.ts:73 sanitizes top-level item.notes; skips customization
Obsolete (unvalidated)
Real notes live under customization.notes (types.ts:16); object customization passes through ...item. Aliases: D-02, D-03.
Low
Point sanitizer at customization.notes; sanitize the add-on array.
Phase 3 — Persistence & Real-time Fan-out
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-C01
src/server/routes/orders.ts:842-915 vs functions/src/routes/orders.ts:837-966 vs src/lib/kdsPresence.ts KDS mutex
Duplicate (3 backends)
In-mem session + Firestore settings/kds_session txn + RTDB presence; client writes RTDB AND REST. Aliases: SR-30, OR-23, S5-03.
Med
Collapse to one SSOT (Firestore lease = truth, RTDB presence = transport); do not remove the lease/heartbeat guardrail (M-R07).
M-C02
functions/src/helpers.ts:16-24 cachedMenu/cachedCategories 60s cache
Needs Verification (stale)
Set on read (menu.ts:310,369), never invalidated on write; invalidator only nulls cachedPublicBootstrap. Aliases: SR-49, S2-10.
Med
Add setCachedMenu(null); setCachedCategories(null) to the invalidator; keep the cache itself.
M-C03
functions/src/index.ts:200 vs functions/src/routes/menu.ts:430 orphan-image cleanup
Duplicate
PUT/DELETE clean inline AND the onMenuItemWritten trigger repeats the 4-variant cleanup -> double-delete race. Aliases: SR-14.
Low
Rely on trigger alone OR inline, not both.
M-C04
functions/src/index.ts:268 vs server.ts:3284 daily sold-out reconciler
Duplicate
Cloud onSchedule 1am vs local 15s setInterval doing the same reset. Aliases: SR-25, S2-01.
Low
Accept as dev/prod parity or document.
M-C05
RestaurantDataContext.tsx:459-461 tables onSnapshot wholesale setTables(tbls)
Obsolete (clobbers optimistic)
Whole-array overwrite drops local optimistic edits; cross-coupled with OrderDataContext's setTables. Aliases: QA-20, S-05.
Med
Merge field-level or reconcile with optimistic state; not a deletion.
M-C06
OrderDataContext.tsx:116 vs RestaurantDataContext.tsx:184 syncActive
Duplicate
Two independent useState(isFirebaseSyncEnabled()) + two firebase_sync_changed listeners. Aliases: S-04.
Low
Keep one source (RDC) and pass down; purely a dedup.
M-C07
OrderDataContext.tsx:181-275 15s derived table-status interval
Duplicate (triple derivation)
Client interval + client onSnapshot + server transitions all derive table status. Aliases: S-06, OR-18 (keep poll fallback).
Low
Keep the interval only when Firestore sync is off (as OR-18 already does for orders); derive from snapshot otherwise.
M-C08
functions/src/index.ts:83,107 cloud rateLimitStore per-instance
Needs Verification (under-count)
Per-instance Map; maxInstances:10 -> up to 10x effective limit, resets on cold start. Aliases: SR-70, OR-40.
Med
Move to a shared store (Firestore/RTDB) or document.
M-C09
server.ts:1178,1222 persisted_state.json plaintext
Needs Verification (exposure)
On-disk state incl. liveStaffPin (:1192) stored plaintext. Aliases: SR-71.
Med
Restrict perms / encrypt secrets / exclude from repo.
M-C10
server.ts:3264 fire-and-forget forEach(async) in interval
Needs Verification
15s reservation auto-check fires async writes without await/catch. Aliases: SR-72.
Low
Await the loop or add .catch.
M-C11
src/server/routes/orders.ts:89-98 local GET /orders unbounded
Needs Verification
Returns whole live array; cloud caps 200 + adds analytics/export. Aliases: OR-37.
Low
Document analytics/export as prod-only; bound local GET.
M-C12
src/hooks/useKdsMutexSession.ts:5-6 imports db/doc/onSnapshot
Dead
Imported but unused in the hook. Aliases: QA-16.
Low
Drop the unused imports.
M-C13
src/hooks/useLiveOrders.ts:87 handleDeleteReservation param
Dead
Passed but the body never uses it. Aliases: QA-17.
Low
Remove from signature.
Phase 4 — Settlement & State Transitions
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-D01
functions/src/routes/orders.ts:538-595 cloud single checkout
Needs Verification (double-pay race)
Tx reads order but never branches on isPaid; unconditionally writes isPaid:true and, when checkoutRecord.id is omitted, mints a new TX-{ts} ledger id -> duplicate checkouts doc. Local has the guard (:542-545). Aliases: OR-32, QA-29, SR-60.
High
Add if (orderData.isPaid) return resolvedStatus inside the txn; derive txId idempotently. No test covers concurrent checkout.
M-D02
src/server/routes/orders.ts:550-561 local checkout
Obsolete (trusts client money)
Writes total/serviceCharge/subtotal/discount straight from request body when defined; cloud checkout ignores these. Aliases: OR-33.
High
Recompute via orderCalculationService or strip the fields; closes a tamper surface.
M-D03
local src/server/routes/orders.ts:525,636 vs cloud :581-588,682-690 checkouts ledger
Obsolete (feature gap)
Local never writes a checkouts doc; cloud does. Aliases: SR-60, OR-34, S4-11.
Med
If local has a Firestore sink, persist checkout records; else document dev-only.
M-D04
functions/src/routes/orders.ts:581,684 checkouts collection
Needs Verification (write-only)
grep = two writers + comments; no reader. Aliases: OR-35.
Low
Confirm downstream BI consumer; else the ledger is pure write cost.
M-D05
functions/src/routes/orders.ts:538-706 checkout/bulk-checkout payloads
Needs Verification (unvalidated)
cashTendered/changeAmount/checkoutRecord accepted with no range check; no validateCheckoutPayload. Aliases: OR-36.
Med
Add validateCheckoutPayload (numeric >=0, sanitize checkoutRecord shape).
M-D06
functions/src/routes/orders.ts:598-706 bulk-checkout
Needs Verification
Cloud uses db.batch() (atomic) but local is an in-memory loop with no rollback. Aliases: OR-26, QA-39.
Med
Share batch-building; local should model all-or-nothing.
M-D07
functions/src/routes/orders.ts:489-536 cloud PUT /items
Needs Verification (missing OCC)
Destructures only {items, refundLogs}; no expectedVersion/version++/409. Local honors it (orders.ts:931-933). Aliases: SR-63, OR-31.
High
Add expectedVersion read + version check before two tablets silently clobber an open order.
M-D08
functions/src/routes/orders.ts:737-824 vs local :781-839 item-complete OCC + kitchen-master predicate
Duplicate
Same expectedVersion + conflict predicate duplicated; only 404 path tested. Aliases: SR-19, OR-27.
Low
Share the conflict predicate; extend tests to 409.
M-D09
functions/src/index.ts:181-188 member routes missing in prod
Needs Verification (elevated defect)
No /api/members* mounted; cashier raw-fetches with no Bearer (CashierCheckoutPanel.tsx:69). Aliases: SR-54, S5-07, SR-55.
High
Implement member routes with requireStaffAuth or degrade the UI.
M-D10
src/server/routes/orders.ts:936-946 vs functions/src/routes/orders.ts:502-506 refundLogs gate
Duplicate (necessary — kept)
Rejects paid/cancelled edits without non-empty refundLogs; tested by order_audit_fixes.test.ts. Aliases: SR-38, OR-41, OR-60.
Low
Consolidate when handlers merge; keep the gate (see M-R08).
M-D11
src/server/routes/printer.ts:111 vs functions/src/routes/printer.ts:254 printer ping
Duplicate (divergent)
Local fakes reachable:true on error; cloud returns false. Aliases: SR-22, S4-07.
Low
Unify verdict logic.
M-D12
src/server/routes/printer.ts:295 vs functions/src/routes/printer.ts:117 + drilldown/KDS ticket builders
Duplicate
5 kitchen + 3 customer receipt strings triplicated; print preview onConfirm=alert(...) dispatches nothing. Aliases: SR-23, OR-47, OR-48.
Low
Extract one buildKitchenTicket/buildCustomerReceipt; gate the alert-only preview behind a dev flag.
M-D13
hardware/pos_bridge.js:236 listen(PORT,'0.0.0.0')
Needs Verification (exposure)
Design intent loopback, but binds all interfaces, exposing ESC/POS + drawer to LAN. Aliases: SR-68, S4-12.
Med
Bind 127.0.0.1 only.
M-D14
functions/src/routes/printer.ts:41,106,172,214 + driver hard-coded IP 192.168.123.100
Needs Verification (config drift)
Repeated literal fallback. Aliases: SR-65.
Low
Centralize in one constants module.
M-D15
src/components/kds/KdsTicketCard.tsx:506 + drilldown print-preview
Needs Verification (dead UX)
"Print" only builds a preview string and alerts. Aliases: OR-48.
Low
Gate behind dev flag or remove.
M-D16
functions/src/routes/orders.ts:710 complete path
Needs Verification (no archived state)
No archived status; history purged by bulk-delete. Aliases: QA-38.
Low
Document; optional archival design.
Cross-cutting dead code (safe pruning cluster)
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-E01
src/components/manager/modals/CashierCheckoutConfirmModal.tsx
Dead
Zero non-test importers; live confirm is inline CashierCheckoutPanel.tsx:1127-1245. Aliases: SR-01, OR-52, S4-01.
Low
Delete file; verify rg CashierCheckoutConfirmModal src tests returns self only.
M-E02
functions/src/services/orderCalculationService.ts:139-154 getTaiwanLocalDateString/isOrderInTaiwanDate
Dead
Only defs + one self-reference; no route imports. Aliases: SR-02, OR-19, S4-02.
Low
Delete; inline Intl formatter where needed.
M-E03
src/services/memberService.ts:40 syncFromBackend()
Dead
Only the definition; on-error fallback uses local getMembers(). Aliases: SR-03, S5-05.
Low
Remove (prod /api/members 404s anyway).
M-E04
src/lib/idbStorage.ts:101 removeIdbItem
Dead
Zero callers; queue only overwrites keys. Aliases: SR-04, OR-05, S1-05.
Low
Delete export.
M-E05
src/stores/dashboard/createCashierSlice.ts:109 resetCashierState
Dead
Only type decl + implementation; no dispatch. Aliases: SR-05, S1-02.
Low
Remove action + type.
M-E06
server.ts:24 + src/data.ts:10,26 INGREDIENT_RECIPE_MAP
Dead
Imported, populated, zero consumers; no order/checkout decrements stock. Aliases: SR-06, S2-05.
Low
Either implement recipe-based stock deduction, or remove the map.
M-E07
server.ts:1725-1727 second magicByteChecker.on('error',()=>{})
Dead
Empty no-op closure after the functional listener. Aliases: SR-07.
Low
Delete the block.
M-E08
functions/src/routes/settings.ts:33 unused put wrapper
Dead
Only the definition; every write uses post(...). Aliases: SR-08.
Low
Remove wrapper.
M-E09
server.ts:2431 POST /api/members inner if (balance!==undefined && existingIdx===-1)
Dead
Sits inside if(existingIdx>=0) so condition is impossible. Aliases: SR-09.
Low
Delete branch.
M-E10
src/lib/offlineQueue.ts:137-142,219-221,223-225 removeRequestFromQueue/isOfflineQueuePaused/isOfflineQueueExecuting
Dead
Zero callers outside the queue module. Aliases: OR-01/02/03, S1-04.
Low
Delete the exports (internal queue still uses its own internals).
M-E11
src/lib/offlineQueue.ts:178-188 hasPendingOrderRequests
Dead (test-only)
Only offlineQueue.test.ts calls it. Aliases: OR-04.
Low
Wire to a queue-status UI, or delete + its describe block.
M-E12
src/components/KitchenDisplaySystem.tsx:693-698,700-702,781-789 stubs
Dead (stubbed)
checkReservationOrderHoldStatus always {isHold:false}, isCloseToClosing always false, predictionData hardcoded 98/94/91/88%. Aliases: OR-53, OR-54, OR-57, OR-55.
Low
Implement against real data or delete the dead UI branches.
M-E13
src/components/customer/CustomerOrderTracker.tsx:57 getSimulatedPastOrders
Dead
Always returns []. Aliases: OR-55.
Low
Delete stub + spread.
M-E14
src/App.tsx:44-45 unused lazy consts
Dead
Two resilientLazy consts never referenced. Aliases: QA-01.
Low
Delete the two consts.
M-E15
src/components/manager/cashier/CashierFloorPlan.tsx / useTableLayout vs store localTablePositions
Obsolete (shadowed)
Live value is useTableLayout.ts:11 useState; zustand createTableSlice.ts:25 shadowed. Aliases: S1-03, S-15.
Low
Remove the store field; keep the hook.
M-E16
createCashierSlice.ts:61 store cashierPanelWidth
Obsolete (shadowed)
Live value is local useState(450) at ManagerCashierTab.tsx:131; store field never read. Aliases: S1-01, S-13.
Low
Remove the store field/setter.
M-E17
src/utils/reservationValidator.ts validateCapacity / suggestedTimes / isSameDayReservation
Dead / test-only
validateCapacity never called; suggestedTimes always []; isSameDayReservation test-only. Aliases: S3-01, S3-02, S3-08.
Low
Remove or wire; confirm zero non-test callers first.
M-E18
TableStatus enum member 'reserved'
Dead state
No transition emits reserved. Aliases: S3-07.
Low
Remove from the union once no reader matches on it.
M-E19
server.ts:3143-3210 GET /api/analytics
Needs Verification (no caller)
No fetch('/api/analytics') in src; state zeroed on fresh clone. Aliases: SR-67, S1-06, S-12.
Low
Remove route or wire the frontend.
M-E20
functions/src/routes/bootstrap.ts:35-36, printer.ts:26-27 unused _ aliases
Dead (hygiene)
_storageBucket/_createRateLimiter destructured, never used. Aliases: SR-74.
Low
Drop unused ctx fields.
QA-lens hardening (Warning / Needs Verification — never high severity)
These fold the QA/E2E audit's 13 residual hardening rows plus the one missing OR row into the master. All are Warning/NV (a11y or resilience), never High.
ID
Candidate Location (File & Symbol)
Detected Issue
Call Trace / Invocations Found
Risk
Over-Pruning Check
M-F01
src/components/CustomerOrderView.tsx:29-35 7 inner customer modals plain lazy()
Needs Verification (hardening)
CustomerCustomizerModal etc. use plain lazy(), bypassing resilientLazy chunk-recovery; on stale-deploy chunk fail, ModalErrorBoundary only alerts + renders null (:40-47). Aliases: QA-03.
Low
Wrap in resilientLazy or have the boundary call attemptChunkRecovery; per-modal boundary already prevents white screen.
M-F02
src/components/CustomerOrderView.tsx:1319 tracker ModalErrorBoundary onClose={()=>{}}
Needs Verification (silent failure)
OrderTracker is persistent UI; on chunk error the no-op onClose renders null after an alert, order-history area silently vanishes until reload. Aliases: QA-04.
Low
Give the boundary a visible inline error/retry; do not collapse to null.
M-F03
CustomerReservationModal.tsx, CustomerCartDrawer.tsx, CustomerCustomizerModal.tsx
Needs Verification (a11y)
grep role="dialog"/aria-modal/focus-trap = 0 matches; no Escape-to-close. Aliases: QA-05.
Low
Add role/aria-labelledby, focus trap, focus restore, Escape.
M-F04
src/context/RestaurantDataContext.tsx:920 reservation POST
Needs Verification
No idempotency key on POST /api/reservations; mitigated by atomic conflict-409 server-side (functions/src/routes/tables.ts:136-263). Aliases: QA-06.
Low
Acceptable given conflict-409; optionally add a client request key for double-click safety.
M-F05
src/hooks/useLiveOrders.ts:319-322 orders snapshot unavailable early-return
Needs Verification
On error.code==='unavailable' it returns immediately; no fetchOrdersFromApi, no online listener; relies on Firestore SDK internal retry. Aliases: QA-18.
Low
Add an online listener or an armored poll while not cancelled; SDK retry partially masks it.
M-F06
src/hooks/useTableLayout.ts:76-77 document drag listeners
Needs Verification (leak)
mousemove/mouseup added on drag-start (:76-77), removed only inside handleMouseUp (:55-56); a mid-drag unmount leaves document listeners. Aliases: QA-21.
Low
Add an unmount cleanup that removes the in-flight drag listeners.
M-F07
src/components/manager/modals/* (all 12) modal shells
Needs Verification (a11y)
No role="dialog"/aria-modal/Esc-to-close; only ReservationSettingModal.tsx:253 has onKeyDown. Aliases: QA-33.
Low
Add a shared <ModalShell> with role/aria-modal + Escape listener.
M-F08
src/components/manager/modals/* focus management
Needs Verification (a11y)
No initial focus, no trap, no return-focus; ConfirmActionModal.tsx:21 backdrop has no onClick close. Aliases: QA-34.
Low
Focus first element on open, trap Tab, restore on close.
M-F09
DishFormModal.tsx:153-187 form modals
Needs Verification (hardening)
Reset-on-open handled, but no unsaved-changes/dirty-state guard on close. Aliases: QA-35.
Low
Track pristine vs edited; confirm before discarding.
M-F10
server.ts:3006 + functions/src/routes/settings.ts:429 clear-test PIN reset
Needs Verification (footgun)
Clear-test-data resets liveStaffPin='952788' locally and staffPinHash:hashPin('952788') in cloud. Aliases: QA-36.
Med
Do not reset to a known PIN; require first-run change or randomize.
M-F11
server.ts:2969 local clear-test-data
Needs Verification (auth divergence)
Local clear-test is PIN-only with no Bearer/requireStaffAuth; cloud gates staff auth. Aliases: QA-37.
Med
Treat as dev-only; align auth depth with cloud.
M-F12
src/components/StaffLoginGate.tsx:90-147 PIN pad
Needs Verification (a11y)
Pin-pad buttons have id but no aria-label; 6 dots are bare <div>. Aliases: QA-40.
Low
Add aria-label digits + role="status" for PIN length.
M-F13
src/App.tsx:166 + useAdminHotkey.ts:39 hotkey effect deps
Needs Verification (wasteful)
Inline onTrigger arrow put in effect deps -> keydown listener torn down/re-added every App render (cleanup is correct, no leak). Aliases: QA-41.
Low
Hoist onTrigger with useCallback.
M-F14
src/services/orderCalculationService.ts:134-140 calculateVipStatus/canRedeemReward
Needs Verification
Thin wrappers delegating to pointsHelper; no order route in src/server/routes/orders.ts calls them. Aliases: OR-20.
Low
Confirm whether member/customer-header UI still calls pointsHelper directly; if not, drop the wrappers.
<a id="2-2"></a>
2.2 Itemized cross-verification
Confirmed for removal / consolidation (precise refs + rationale)
Safe to delete now (zero non-test callers, unreachable, not a fallback):
M-E01 CashierCheckoutConfirmModal.tsx — live confirm is inline (SR-01/OR-52).
M-E02 functions Taiwan date helpers (SR-02/OR-19).
M-E03 memberService.syncFromBackend (SR-03).
M-E04 removeIdbItem (SR-04/OR-05).
M-E05 resetCashierState (SR-05).
M-E07 empty magic-byte error listener (SR-07).
M-E08 unused put wrapper (SR-08).
M-E09 unreachable members inner branch (SR-09).
M-E10 dead queue getters removeRequestFromQueue/isOfflineQueuePaused/isOfflineQueueExecuting (OR-01..03).
M-E11 hasPendingOrderRequests (test-only, OR-04).
M-E08-style hygiene: M-E20 unused _ aliases (SR-74), M-C12 dead imports (QA-16), M-C13 dead param (QA-17), M-E14 dead lazy consts (QA-01).
Safe to refactor / consolidate (duplicate, not delete):
M-B01 pricing engine -> shared package (SR-18/OR-21).
M-C01 KDS mutex -> one SSOT (SR-30/OR-23).
M-D12 receipt/test-ticket templates -> one builder (SR-23/OR-47).
M-A05/M-A06/M-A07 takeout classifier, status meta, memoized pricing.
M-C06/M-C07 syncActive single source + snapshot-derived table status.
Contract fixes (defects, not pruning):
M-B03 bulk-delete schema, M-B04 restock schema, M-D01 checkout double-pay, M-D07 cloud PUT items OCC, M-D09 member routes, M-D02 local checkout pricing trust, M-C02 cachedMenu invalidation.
<a id="2-3"></a>
2.3 Explicit Retained list — verified NOT to be false positives
These defensive/resilient mechanisms were each checked against the three-part dead-code test and fail it on purpose — they are fallbacks, guardrails, or necessary dual-layer validation. They must NOT be pruned.
Retained item
Code cite
Audit row
Why it stays (necessary duplication)
Offline triple-write queue (memory + safeStorage + idb) + FIFO replay
src/lib/offlineQueue.ts:73-87,21-37,235-401
SR-43, OR-15, S1-07
Anti-loss resilience path; BoundedSet(1000) anti-leak; tested by offlineQueue.test.ts.
Idempotent retries / clientOrderId
useOrderSubmit.ts:48-54, cloud txn orders.ts:264-286
OR-16, OR-39, SR-17
In-flight dup guard + atomic _idempotency_keys; rollback on SOLDOUT throw.
Validators guards
functions/src/validators.ts (all four)
S5/dual-layer
Sanitize strings, enforce ranges, block injection — the server authority layer.
Dual-layer pricing (client UX vs server authority)
client useCustomerCart vs server computeOrderItemUnitPrice
SR-18/OR-21, D-04
This duplication is necessary: the client needs instant optimistic pricing for UX, while the server re-derives price from the SSOT menu collection at create (functions/src/routes/orders.ts:335-343) and overwrites the client tally. They are kept parity-tested (tests/order_calculation_parity.test.ts). Consolidation = shared module, NOT deleting either caller.
KDS mutex / heartbeat / presence
useKdsMutexSession.ts, kdsPresence.ts, 45s lease
SR-39, OR-59, S5-03
Prevents double-kitchen assignment; tested by kds_mutex_concurrency.test.ts. Keep the guardrail even though the 3 backends duplicate (M-C01 consolidates them).
Optimistic order rollback-by-resync
useLiveOrders.ts:103-170,385-391
SR-44, OR-16, SR-37
Optimistic setOrders + queue on failure; convergence via next onSnapshot. No explicit rollback is a known gap, but the path itself is necessary.
Audit logs (refundLogs)
orders.ts:935-946, functions:502-506
SR-38, OR-41, OR-60, S4-13
Anti-tamper gate on paid edits; tested by order_audit_fixes.test.ts.
Error boundaries / chunk recovery
main.tsx:50, App.tsx:643,660,675, chunkRecovery.ts:5-47, resilientLazy
QA-11 target
White-screen prevention across 23 lazy chunks; ChunkErrorBoundary on ManagerDashboard.
Null / legacy order schema fallbacks
`order.version
0, order.items
Read caches (bootstrap ETag/TTL, auth token cache)
bootstrap.ts:22-31, auth.ts:18-40
SR-31, SR-33, S1-08
CDN/read-storm and per-request-Firestore mitigation; invalidated on write (except M-C02 menu cache).
Session / 5xx fallback
sessionAuth.ts:26-51
SR-41, OR-14, S5-09
Keeps session on transient 5xx, clears only on real 401/403.
Reservation atomic conflict guard
tables.ts:170-252
SR-36, SR-15, S3-04
runTransaction overlap/capacity/anti-monopoly (atomic in cloud).
Member-deduct compensating rollback
CashierCheckoutPanel.tsx:259-278
SR-45, OR-61
Posts /topup to refund after a checkout failure.
Poll fallback loops (orders / offline probe)
useLiveOrders.ts:354-356, useOfflineSync.ts:74-80
OR-18
15s poll runs ONLY when Firestore sync is off; auto-clears on live snapshot.
App Check (soft)
functions/src/index.ts:133-151
SR-47, OR-39
Advisory on POST /orders; enforce once keys ship.
<a id="2-4"></a>
2.4 Reconciliation table — every raw source ID explicitly mapped to a master row
Every one of the 216 raw labels is listed below as its own token (54 S + 74 SR + 62 OR + 26 QA). M-R* = a row in the Part 2.3 Retained list (necessary guardrail). (note) = non-actionable docs/scope drift, not a defect. No range tokens.
S — ManagerDashboard (54)
Source ID
Master row
Source ID
Master row
S1-01
M-E16
S3-01
M-E17
S1-02
M-E05
S3-02
M-E17
S1-03
M-E15
S3-03
M-E15
S1-04
M-E10
S3-04
M-R reservation guard
S1-05
M-E04
S3-05
M-R optimistic table
S1-06
M-E19
S3-06
note (parseTimeToMinutes dup)
S1-07
M-R offline queue
S3-07
M-E18
S1-08
M-R bootstrap ETag
S3-08
M-E17
S1-09
note (cross-runtime dup family)
S3-09
M-R cancelled filter
S1-10
M-R 401 backoff
S4-01
M-E01
S2-01
M-C04
S4-02
M-E02
S2-02
M-B04
S4-03
M-B02
S2-03
note (category doc-id divergence)
S4-04
M-B01
S2-04
M-B07
S4-05
M-B03
S2-05
M-E06
S4-06
M-D12
S2-06
D-14 (CategoryFormModal split)
S4-07
M-D11
S2-07
D-15 (DishFormModal split)
S4-08
M-B14
S2-08
note (stale comments)
S4-09
M-D07
S2-09
M-D03 (inventory ledger)
S4-10
note (pos_bridge docs drift)
S2-10
M-C02
S4-11
M-D03
S2-11
M-R offline/AppCheck
S4-12
M-D13
S2-12
M-R reorder OCC
S4-13
M-D10
S5-01
note (PIN lockout dup, M-B09)
S5-06
M-B13
S5-02
M-R token cache
S5-07
M-D09
S5-03
M-C01
S5-08
M-B09
S5-04
M-R idle timeout
S5-09
M-R session fallback
S5-05
M-E03
S5-10
M-R version mw
SR — Server Runtime (74)
Source ID
Master row
Source ID
Master row
SR-01
M-E01
SR-19
M-D08
SR-02
M-E02
SR-20
M-B03
SR-03
M-E03
SR-21
M-B04
SR-04
M-E04
SR-22
M-D11
SR-05
M-E05
SR-23
M-D12
SR-06
M-E06
SR-24
M-D03
SR-07
M-E07
SR-25
M-C04
SR-08
M-E08
SR-26
note (hardcoded POINTS_CONFIG)
SR-09
M-E09
SR-27
M-B08
SR-10
note (image serve dup, out-of-order)
SR-28
M-B09
SR-11
note (sharp pipeline dup)
SR-29
M-F11
SR-12
note (menu projection dup)
SR-30
M-C01
SR-13
note (bootstrap assembly dup)
SR-31
M-R bootstrap cache
SR-14
M-C03
SR-32
M-R image auth
SR-15
M-R reservation overlap validator
SR-33
M-R token cache
SR-16
note (parseTimeToMinutes dup)
SR-34
M-R public GET
SR-17
M-B02
SR-35
M-R member localStorage
SR-18
M-B01
SR-36
M-R reservation atomic
SR-37
M-R optimistic table
SR-56
M-B13
SR-38
M-D10
SR-57
M-B10
SR-39
M-R KDS mutex
SR-58
M-B11
SR-40
M-R idle timeout
SR-59
M-B12
SR-41
M-R session fallback
SR-60
M-D03
SR-42
M-R version mw
SR-61
note (DELETE clear-all)
SR-43
M-R offline queue
SR-62
note (rate auth divergence)
SR-44
M-R optimistic orders
SR-63
M-D07
SR-45
M-R member rollback
SR-64
M-B14
SR-46
M-R printer/bridge local
SR-65
M-D14
SR-47
M-R App Check
SR-66
note (printer ctx unused)
SR-48
M-R pin/value sentinel
SR-67
M-E19
SR-49
M-C02
SR-68
M-D13
SR-50
M-B06
SR-69
note (stale comment)
SR-51
M-B05
SR-70
M-C08
SR-52
note (promo response shape)
SR-71
M-C09
SR-53
note (promo read gap)
SR-72
M-C10
SR-54
M-D09
SR-73
note (emulator test, Part 5)
SR-55
M-D09
SR-74
M-E20
OR — Orders Domain (62)
Source ID
Master row
Source ID
Master row
OR-01
M-E10
OR-22
M-B02
OR-02
M-E10
OR-23
M-C01
OR-03
M-E10
OR-24
M-B03
OR-04
M-E11
OR-25
M-D01
OR-05
M-E04
OR-26
M-D06
OR-06
M-A08
OR-27
M-D08
OR-07
M-A09
OR-28
M-D08
OR-08
M-A10
OR-29
note (history-check VIP dup)
OR-09
M-A11
OR-30
note (rating handler dup)
OR-10
M-A12
OR-31
M-D07
OR-11
M-A13
OR-32
M-D01
OR-12
M-A03
OR-33
M-D02
OR-13
note (queue resume gap)
OR-34
M-D03
OR-14
M-R session fallback
OR-35
M-D04
OR-15
M-R offline queue
OR-36
M-D05
OR-16
M-R optimistic orders
OR-37
M-C11
OR-17
M-R dual cross-tab transport
OR-38
M-B02
OR-18
M-R poll loops
OR-39
M-R idempotency/trigger
OR-19
M-E02
OR-40
M-C08
OR-20
M-F14
OR-41
M-D10
OR-21
M-B01
OR-42
M-R KDS OCC/null fallback
OR-43
M-A01
OR-54
M-E12
OR-44
M-A02
OR-55
M-E13
OR-45
M-A03
OR-56
M-A14
OR-46
M-A04
OR-57
M-E12
OR-47
M-D12
OR-58
M-A07
OR-48
M-D15
OR-59
M-R KDS mutex
OR-49
M-A06
OR-60
M-D10
OR-50
M-A06
OR-61
M-R member rollback
OR-51
M-A05
OR-62
M-R defensive fallbacks
OR-52
M-E01
OR-53
M-E12
QA — E2E / system (26 real rows)
Source ID
Master row
Source ID
Master row
QA-01
M-E14
QA-19
note (table cleaning w/ unpaid siblings)
QA-02
note (GBP bare /order links)
QA-20
M-C05
QA-03
M-F01
QA-21
M-F06
QA-04
M-F02
QA-29
M-D01
QA-05
M-F03
QA-30
M-B14
QA-06
M-F04
QA-31
M-B06
QA-16
M-C12
QA-32
M-B06
QA-17
M-C13
QA-33
M-F07
QA-18
M-F05
QA-34
M-F08
QA-35
M-F09
QA-39
M-D06
QA-36
M-F10
QA-40
M-F12
QA-37
M-F11
QA-41
M-F13
QA-38
M-D16
QA-42
note (no split-bill/tender scope)
Every raw label resolves to exactly one master row, a Part 2.3 Retained guardrail, or an explicit non-actionable note. No range tokens remain. Label count: 54 S + 74 SR + 62 OR + 26 QA = 216.
<a id="part-3"></a>
Part 3 — Fresh Gap Cross-checks (this pass only)
These are the only new scans performed. Full detail and line-level evidence is in crosscheck_schema_state.md (delivered alongside). The already-known contract splits are reused and cited, not re-investigated.
<a id="3-1"></a>
3.1 Schema drift census
Compared src/types.ts interfaces against functions/src/validators.ts sanitizers and the payload fields actually destructured in both route runtimes.
#
Entity
Field
types.ts (line)
validator / route (line)
Drift type
D-01
OrderItem
qty vs quantity
qty:number :60
reads quantity||qty :57, writes both :70-71
type-mismatch / extra field
D-02
OrderItem
notes
none top-level; customization.notes :16
sanitizes item.notes :73
renamed / misplaced
D-03
OrderItem
customization
:61
not referenced (...item :68)
unvalidated
D-04
Order
subtotal/serviceCharge/total
:125-127
overwritten at create functions:370-373, local:231-233; local CHECKOUT trusts body :550-561
unvalidated at create; trusted at checkout
D-05
Order
discount
:138
recomputed at create; local checkout trusts body :559-561
unvalidated / divergent
D-06
Order
totalAmount
not declared
cloud writes it functions:374
present-in-route, missing-in-types
D-07
Order
pickupTime
nested :145 AND top-level :147
only nested validated :78-81
duplicated field / unvalidated
D-08
Order
guestCount
:136
not validated; defaulted to 2 local:257
unvalidated
D-09
Order
paymentMethod
:133
read functions:357, local:110; never whitelisted
unvalidated
D-10
Order
clientOrderId
:151
read functions:251; not surfaced by validator
unvalidated passthrough
D-11
Reservation
tableNumber
required :219
validator never reads it :158-169
required-in-types, unvalidated
D-12
Reservation
phone
:217
Taiwan regex enforced :119-124
format mismatch for foreign source
D-13
MenuItem/Category
whole entity
:22-51, :190-195
no validateMenuPayload exists
present-in-types, missing-in-validator
D-14
Category
showOnCustomerPage
:193
form submits showOnCustomer CategoryFormModal:74
renamed
D-15
MenuItem
name/description
:25,:31
form submits plural names/descriptions DishFormModal:203-204
renamed plural
D-16
Order route
bulk-delete payload
n/a
local {orderIds} orders.ts:446 vs cloud {thresholdDate} :982
contract split
D-17
Ingredient
restock payload
stock :179
client {id,amount} RDC:487, local server.ts:3022 vs cloud {ingredientId,quantityAdded} inventory.ts:103
contract split
D-18
Order/Reservation
source (GBP)
:155,:226
sanitized :96,:166; parsed CustomerOrderView:192-201
aligned (no drift)
18 rows. Net-new this pass: D-06 (totalAmount undocumented), D-07 (dual pickupTime shapes), D-02 (validator sanitizes the wrong notes key). D-14..D-18 are the already-known contract splits reused from prior shards.
<a id="3-2"></a>
3.2 Duplicate state census
Compared OrderDataContext, RestaurantDataContext, component-local state, and the zustand src/stores/dashboard/* slices.
#
State / data
OrderDataContext (line)
RestaurantDataContext (line)
local / zustand (line)
Canonical owner
Note
S-01
orders list
via useLiveOrders :149
not held
—
OrderDataContext
sole owner
S-02
offline queue status
via useOfflineSync :132-137
not held
offlineQueue.ts
OrderDataContext
necessary resilience
S-03
KDS session
via useKdsMutexSession :140
not held
kdsPresence.ts
OrderDataContext
necessary
S-04
syncActive flag
useState :116 + listener
useState :184 + listener
—
pick one (RDC)
DUPLICATE boolean, two subscribers
S-05
tables
receives props :94-95, mutates :195
owns :166, onSnapshot :459-461
useTableLayout:11
RDC owns data
cross-context write; wholesale overwrite clobbers optimistic
S-06
derived table status
15s interval :181-275
onSnapshot :459
server transitions
server authoritative
triple derivation
S-07
menuItems
prop :97,:110
owns :147 + onSnapshot :445
—
RDC
pass-through
S-08
reservations
prop :96,:109 (unused, OR-08)
owns :167
—
RDC
dead prop
S-09
ingredients
not held
owns :165 + onSnapshot :438
—
RDC
no dup
S-10
settings
not held
owns :168-175
—
RDC
no dup
S-11
members config
not held
owns :176-181
memberService localStorage
RDC (remote)
prod routes missing M-D09
S-12
analytics
not held
owns :203
—
effectively dead M-E19
no caller
S-13
cashier panel width
n/a
n/a
live useState ManagerCashierTab:131; dead store createCashierSlice:61
local useState
store field shadowed
S-14
cashier reset action
n/a
n/a
zustand resetCashierSlice:109
dead M-E05
zero callers
S-15
local table positions
n/a
n/a
live useTableLayout:11; shadow store createTableSlice:25
useTableLayout
store field shadowed
S-16
pushNotifications
useState :115
not held
—
dead M-A08
never populated
S-17
pricing recompute
n/a
menu enrichment :447
unmemoized cart + EOD 5x M-A07
shared calc module
redundant re-render
17 rows. Canonical ownership: OrderDataContext owns orders / offline-queue lifecycle / KDS session; RestaurantDataContext owns tables / menu / categories / ingredients / reservations / settings / members / analytics. True duplicates to resolve: syncActive (S-04), the cross-context setTables write (S-05), triple-derived table status (S-06), and the three shadowed/dead zustand fields (S-13/S-14/S-15).
<a id="part-4"></a>
Part 4 — Phased Refactoring Roadmap
Sequencing respects dependencies: test harness / parity gates first, then pruning, then logic consolidation, then state optimization. Each item carries its master ID and originating aliases.
Phase 0 — Harness & contract locks (do first, before any refactor)
Gate: green baseline must be captured and the new parity/contract tests must exist before logic moves.
Freeze the baseline: npm run lint exit 0, npm test 226/227 (the one failure is the
env-only emulator probe, Part 5). Record branch ai006027-12576367682858005278.
Ensure tests/order_calculation_parity.test.ts is green and runs in CI — this is the safety net
for M-B01 (shared pricing module). Aliases: SR-18, OR-21.
Add contract-shape tests for the two broken ingestion contracts before fixing them:
bulk-delete (M-B03), restock (M-B04). Aliases: SR-20, SR-21, S4-05, S2-02.
Add a concurrent-checkout regression test that reproduces M-D01 (double-pay) and asserts the
isPaid early-return. Aliases: OR-32, QA-29.
Phase 1 — Safe Pruning (verified orphans only)
Ordered low-risk first. Prerequisite gate for every row: a grep proving zero non-test callers on the target branch. Never prune a row that also appears in the Part 2.3 Retained list.
Order
Item
Master ID
Prerequisite gate
1
Delete CashierCheckoutConfirmModal.tsx
M-E01 / SR-01 / OR-52
rg CashierCheckoutConfirmModal src tests returns self only
2
Delete functions Taiwan date helpers
M-E02 / SR-02 / OR-19
grep shows only defs + self-reference
3
Delete removeIdbItem
M-E04 / SR-04 / OR-05
grep returns only export
4
Delete resetCashierState action + type
M-E05 / SR-05 / S1-02
grep returns only type + impl
5
Delete memberService.syncFromBackend
M-E03 / SR-03 / S5-05
grep returns only def
6
Delete empty magic-byte no-op error listener
M-E07 / SR-07
read server.ts:1725-1727 confirms empty body
7
Delete unused settings put wrapper
M-E08 / SR-08
confirm all writes use post(...)
8
Delete unreachable POST /members inner branch
M-E09 / SR-09
confirm guard sits inside existingIdx>=0
9
Delete dead queue getters removeRequestFromQueue/isOfflineQueuePaused/isOfflineQueueExecuting
M-E10 / OR-01..03
confirm internal pruning uses internal splice
10
Delete hasPendingOrderRequests + its describe block
M-E11 / OR-04
confirm test-only
11
Delete App.tsx:44-45 unused lazy consts
M-E14 / QA-01
confirm never referenced
12
Drop dead imports db/doc/onSnapshot in useKdsMutexSession
M-C12 / QA-16
confirm unused
13
Drop dead handleDeleteReservation param in useLiveOrders:87
M-C13 / QA-17
confirm body never reads it
14
Drop unused _ aliases
M-E20 / SR-74
grep confirms unreferenced
15
Remove shadowed store fields cashierPanelWidth + localTablePositions
M-E15/M-E16 / S1-01/S1-03
confirm live values are local useState / hook
16
Remove setOrders from context, localOrderIds useState, skipRefresh param
M-A11/M-A12/M-A13 / OR-09/10/11
confirm no consumer destructures them
17
Remove currentPath prop, reservationsRef, dead pushNotifications
M-A08/M-A09/M-A10 / OR-06/07/08
confirm no producer / no read
18
Remove stub KDS branches (reservation-hold, close-to-closing, simulated past orders, prediction data)
M-E12/M-E13 / OR-53/54/55/57
confirm stubs always return empty/false
19
Remove INGREDIENT_RECIPE_MAP if stock deduction is NOT adopted
M-E06 / SR-06 / S2-05
decision gate: recipe deduction vs delete
20
Remove dead reservation helpers / 'reserved' status
M-E17/M-E18 / S3-01/02/07/08
confirm zero non-test callers
Phase 2 — Logic Consolidation & SSOT
Sequenced after Phase 0 harness and Phase 1 pruning so consolidation touches live code only.
Shared calculation module. Extract computeOrderItemUnitPrice, computeOrderItemsSubtotal,
calculatePromoComboDiscount, calculateOrderPricing into a package imported by BOTH
src/services and functions/src/services. Guarded by tests/order_calculation_parity.test.ts.
M-B01 / SR-18 / OR-21.
Shared schema/types package between client + functions: resolve D-01 (qty/quantity), D-02
(correct notes key), D-03 (sanitize customization), D-06 (totalAmount), D-07 (single
pickupTime shape), D-11 (reservation tableNumber).
Checkout idempotency fix (highest priority). Add if (orderData.isPaid) return resolvedStatus
inside the cloud checkout transaction; derive checkoutRecord.id idempotently (idempotency key /
orderId-based) instead of TX-{Date.now()}. M-D01 / OR-32 / QA-29.
checkouts ledger parity. Decide: persist settlement records locally (it has getFirestoreDb
injected) or document dev-only. Add a validateCheckoutPayload. M-D03/M-D04/M-D05 / SR-60/OR-34/35/36.
Contract fixes. Make local bulk-delete accept {thresholdDate} (or both schemas) — M-B03;
align restock on one schema + validator — M-B04; fix category/dish form field names (D-14/D-15).
Image validation parity. Add magic-byte sniffing to the cloud upload path (it currently trusts
declared mime). M-B06 / SR-50 / QA-31/32.
cachedMenu invalidation. Call setCachedMenu(null); setCachedCategories(null) in the
bootstrap invalidator. M-C02 / SR-49.
Member routes. Implement /api/members* in cloud with requireStaffAuth, or degrade the
cashier UI gracefully. M-D09 / SR-54 / S5-07.
Cloud PUT items OCC. Add expectedVersion read + version check + increment on cloud
PUT /orders/:id/items. M-D07 / SR-63 / OR-31.
Local checkout pricing. Strip client total/serviceCharge/subtotal/discount and recompute via
the service. M-D02 / OR-33.
Consolidate duplicated render logic. isTakeoutOrder(order) util (M-A05), getStatusMeta
(M-A06), memoized pricing (M-A07), shared receipt/test-ticket builder (M-D12).
Phase 3 — State & Context Optimization
Canonical ownership split. OrderDataContext keeps orders / offline-queue / KDS session;
RestaurantDataContext owns tables / menu / categories / ingredients / reservations / settings /
members / analytics. Remove the dead reservations prop from OrderDataContext (S-08).
Listener de-duplication. Single syncActive source (S-04); tables onSnapshot should merge
with optimistic local state rather than wholesale-overwrite (S-05 / QA-20).
Re-render reduction. Derive table status from the Firestore snapshot instead of the 15s
interval when sync is live (S-06); memoize cart pricing (S-17 / M-A07).
Remove dead dashboard slices. cashierPanelWidth, localTablePositions, resetCashierState
(already pruned in Phase 1 — M-E05/M-E15/M-E16).
Fix the queue-resume wiring. Subscribe sabay_auth_expired to PIN re-auth and call
resumeOfflineQueue() on successful re-verify (OR-13 / S1-04 wiring gap).
Sequencing dependencies (must respect)
Phase 0 harness before Phase 1 pruning (parity tests must be green before touching calc).
Phase 1 pruning before Phase 2 consolidation (don't refactor code about to be deleted).
Phase 2 item 1 (shared calc) before any pricing math change.
Phase 2 item 3 (checkout idempotency) before item 4 (ledger parity) so ledger writes are idempotent.
Phase 3 after Phase 2 contract fixes land, so state ownership changes don't fight contract rewrites.
<a id="part-5"></a>
Part 5 — Verification & Regression Strategy
5.1 Real commands
# Install
npm install # first attempt may exit 1 on deprecation noise; retry succeeds (~490 pkgs)
cd functions && npm install && cd ..
# Type check / lint (tsc --noEmit)
npm run lint # expect exit 0
# Unit / integration suite (vitest run)
npm test # expect 226/227; the one failure is env-only (see 5.4)
# Cloud functions build
cd functions && npm run build # tsc emit to functions/lib; must succeed before deploy
# Root bundle build
npm run build # vite production bundle
5.2 Suites mapped to each phase
Phase
Suites that must stay green
Phase 0 harness
tests/order_calculation_parity.test.ts (exists), tests/kds_mutex_concurrency.test.ts, tests/order_audit_fixes.test.ts
Phase 1 pruning
full npm test; specifically confirm src/lib/__tests__/offlineQueue.test.ts still passes after queue-getter deletion (M-E10)
Phase 2 calc consolidation
tests/order_calculation_parity.test.ts, tests/orderCalculationService suite, tests/order_audit_fixes.test.ts, tests/e2e_order_simulation.test.ts
Phase 2 checkout / contracts
new concurrent-checkout test (M-D01), tests/order_audit_fixes.test.ts, restock + bulk-delete contract tests
Phase 2 image / cache
tests/image_upload_guardrail
Phase 2 refactor harness
tests/server_refactor_verification, tests/table_auto_selection_system_test
Phase 3 state
tests/e2e_order_simulation.test.ts, tests/kds_mutex_concurrency.test.ts
Suites referenced: order_calculation_parity, orderCalculationService, order_audit_fixes, kds_mutex_concurrency, e2e_order_simulation, image_upload_guardrail, server_refactor_verification, table_auto_selection_system_test, plus the existing offlineQueue.test.ts.
5.3 Manual checkpoints
KDS realtime sync. Open KDS on two tablets; one claims the kitchen, the other sees the
lease + heartbeat; force-preempt works; lease expiry releases after 45s. (M-C01 / OR-59.)
Table occupation toggle multi-tab. Place an order on a table in one tab; confirm the table
flips in_use in a second tab; pay it; confirm it flips cleaning and returns to available
after 15 min (or preserved if a reservation holds it). Watch for the wholesale-overwrite
clobber (M-C05 / QA-20).
Fast route switching / white screen. Rapidly switch customer/kitchen/admin tabs; force a
failed chunk load to confirm ChunkErrorBoundary recovery (QA target 11).
GBP source attribution. Open a ?source=google_business link, place an order, confirm the
badge appears on KDS and cashier cards; confirm no inbound webhook is expected (QA target 7).
Offline drain / replay. Kill network, place several orders, restore network; confirm the
queue drains FIFO with idempotent replay and does not double-submit (M-R queue / OR-15).
5.4 Observed baseline & the single failure
Baseline: npm run lint clean (exit 0); npm test = 23 files, 226/227 tests pass. The single failure is tests/kds_quantity_aggregation.test.ts ("KDS aggregates dish quantities correctly") — a Firestore-emulator smoke test. A sandbox proxy accepts TCP on 0.0.0.0:8080, so the TCP-only emulator detection at lines 13-37 falsely reports the emulator present; the subsequent Firestore writes then fail with RST_STREAM / UNAVAILABLE. This is environment-only, not a code regression. The test is also low-value (it re-implements aggregation inline) and its emulator probe is fragile (TCP connect is not an emulator proof). Correct validation: replace the TCP probe with a real emulator health check (e.g. a known-collection read that returns UNAVAILABLE only when truly absent), or delete the low-value test. Tracked as SR-73.
5.5 Rollback & contingency per phase
Branch + PR. Every phase lands on its own feature branch behind review; never commit directly
to ai006027-12576367682858005278.
Cloud Functions versioning. After each deploy (firebase deploy --only functions:api,hosting),
keep the previous Cloud Functions revision available for traffic-split rollback; Hosting keeps
prior releases for instant rollback.
No schema-break ordering. All contract fixes (M-B03, M-B04, D-01..D-18) ship additively
first: accept both old and new field shapes, deploy the tolerant reader, then switch the client,
then remove the old shape. The orders/checkouts/ingredients collections are never
destructively migrated in the same change as a writer.
Zero-downtime. Pruning (Phase 1) removes only unreachable code, so it carries no runtime
behavior change; bundle deploys are atomic on Hosting. State optimization (Phase 3) keeps the
old context exports as no-op aliases for one release before deletion.
Contingency. If a Phase 2 shared-module change flips order_calculation_parity, immediately
revert to the duplicated services rather than patching math mid-stream; the parity test is the
gate. If checkout idempotency (M-D01) regresses double-pay protection, roll back the Functions
revision and re-enable the local-style early-return guard first.
5.6 Acceptance gates to call a phase done
Lint exit 0; npm test green except the documented SR-73 env-only failure.
cd functions && npm run build succeeds; root npm run build succeeds.
Every master row touched in the phase is marked resolved in Part 2, with a green test or a manual
checkpoint sign-off against it.
No Retained-list item (Part 2.3) is deleted or weakened without an explicit noted justification.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-03T04:53:24+08:00.

The user's current state is as follows:
Active Document: c:\Works\QR-code-BBQ-Order\server.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 3298
Other open documents:
- c:\Works\QR-code-BBQ-Order\server.ts (LANGUAGE_TYPESCRIPT)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.8 Flash (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>