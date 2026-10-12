# System Architecture & Engineering Directives

**SABAY BBQ | QR-Code Order & Table Management System**  
**Architecture Decision Records (ADRs) & Engineering Governance**

---

## 1. ADR-001: Dual Development Mode Strategy (Coexistence with Defined Roles)

### Context & Problem Statement
The codebase contains two distinct local execution environments:
1. `npm run dev` (`tsx server.ts` + Vite HMR proxy).
2. `npm run dev:emulators` (Vite in emulator mode + Firebase Local Emulator Suite with Firestore, Functions Gen 2, Auth, Storage).

An architectural audit evaluated whether one should be deprecated in favor of a single standardized runner. Investigation revealed that forcing single-runner standardization introduces substantial trade-offs:
- **Emulator-only** imposes Java 21 runtime prerequisites, 15–20s boot times, and heavy memory footprints (~1.2 GB RSS), hindering rapid UI styling and frontend component iteration.
- **Mock-only** lacks Cloud Functions Gen 2 trigger simulation, App Check verification, and Firestore Security Rules enforcement.

### Decision: Complementary Coexistence with Defined Boundaries
Both development modes are **formally retained**, each with non-overlapping responsibilities:

| Mode | Command | Primary Runtime | Best Used For | Boot Time & Footprint |
| :--- | :--- | :--- | :--- | :--- |
| **Lightweight Dev** | `npm run dev` | `server.ts` (Express) + Vite HMR | Frontend UI/UX, styling, Tailwind/CSS tweaks, quick menu adjustments, offline work. | $< 1.5\text{s}$ boot<br>$\approx 150\text{MB}$ RAM |
| **High-Fidelity Dev** | `npm run dev:emulators` | Firebase Emulators (Hosting, Functions, Firestore, Auth, Storage) | Security rules audit, Firestore transactions, Cloud Functions triggers, App Check tokens, pre-deploy verification. | $15\text{s} - 25\text{s}$ boot<br>$\approx 1.2\text{GB}$ RAM (Java) |

### Engineering Safeguards & Zero-Pruning Guarantees
1. **Runtime Production Guard:**  
   [`server.ts:14-17`](file:///c:/Works/QR-code-BBQ-Order/server.ts#L14-L17) enforces an explicit runtime barrier:
   ```typescript
   if (process.env.NODE_ENV === 'production' && !process.env.SERVE_STATIC && !process.env.CI) {
     console.error("FATAL: server.ts is the local mock dev server and MUST NOT be run in production. Use Firebase Cloud Functions.");
     process.exit(1);
   }
   ```
2. **State Hygiene:**  
   `persisted_state.json` serves exclusively as the local offline state cache for `server.ts`. It is explicitly ignored in [`.gitignore:7`](file:///c:/Works/QR-code-BBQ-Order/.gitignore#L7) and protected by [`scripts/post_test_hygiene.cjs`](file:///c:/Works/QR-code-BBQ-Order/scripts/post_test_hygiene.cjs#L59) to prevent git noise or test cross-contamination.
3. **Integration Test Protection:**  
   [`src/server/routes/orders.ts`](file:///c:/Works/QR-code-BBQ-Order/src/server/routes/orders.ts) is strictly protected as the Vitest integration adapter, guaranteeing continuous 100% pass rates across all 32 test suites (284 tests).

---

## 2. ADR-002: Long-Term Order Archival Strategy (M-D16)

### Context & Problem Statement
Active dining room operations (table turnover tracking via `deriveTableStatuses`, same-day cashier shift audits in `ManagerEodTab`, and post-checkout item adjustments in `PaidOrderModificationModal`) require recent settled orders to remain in the `orders` collection during the operating business day. Reactive immediate migration on `status: 'paid'` introduces optimistic concurrency race conditions and table state glitches.

### Decision: Scheduled Nightly Batch Archival with Grace Period
- **Trigger:** Cloud Scheduler trigger `archiveSettledOrdersNightly` running daily at 04:00 AM Asia/Taipei (`0 4 * * *`).
- **Retention Grace Period:** Orders remain in `orders` for 24 hours. Only orders with terminal status (`completed`, `paid`, `cancelled`) older than the cutoff timestamp are migrated.
- **Atomic Migration:** Chunks of $\le 400$ documents migrated atomically via `db.batch()` into `archived_orders` with server timestamp audit fields (`archivedAt`, `archivedReason`, `archivedBy`).
- **Query Routing:** [`GET /api/orders/export`](file:///c:/Works/QR-code-BBQ-Order/functions/src/routes/orders.ts#L270-L310) queries both `orders` and `archived_orders`, deduplicating records by document ID.
- **Security Rules:** Client writes to `archived_orders` are completely denied (`allow write: if false;`), while authenticated staff are granted read access (`allow read: if isStaffOrAdmin();`).

---

## 3. ADR-003: Server Monolith Modularization & Route Delegation

### Context & Problem Statement
`server.ts` previously exceeded 3,250 lines with mixed responsibilities (Express router setup, hardware printer socket drivers, menu CRUD, inventory calculations, image compression, staff authentication).

### Decision: Domain-Driven Route Delegation
`server.ts` was refactored down to 1,688 lines by delegating endpoints to specialized route modules under `src/server/routes/`:
- `images.ts`: WebP/AVIF upload and Sharp image transformation.
- `menu.ts`: Menu items, categories, and inventory stock tracking.
- `tables.ts`: Table layout configurations and real-time floor statuses.
- `staff.ts`: PIN verification and staff session management.
- `inventory.ts`: Stock levels and ingredient depletion logs.
- `members.ts`: VIP points, loyalty tiers, and customer reward redemption.
- `settings.ts`: Store operating hours, printer IPs, and notification settings.

All route modules export declarative registration handlers (`registerXRoutes(app, context)`), preserving exact API contracts, middleware chains, and Vitest test harnesses.

---

## 4. Verification & Quality Gates

The system enforces six strict quality gates (`node scripts/run_all_checks.cjs`):
1. **Stage 1 — Security Audit:** Zero-trust security rules and payload sanitization (23 checks).
2. **Stage 2 — Performance Audit:** Bundle budgets, zero CLS, and lazy code-splitting (24 checks).
3. **Stage 3 — Cost Guard Audit:** Cloud Functions Gen 2 instance ceilings and cache TTLs (21 checks).
4. **Stage 4 — Strict Typecheck:** `npx tsc -b` with 0 type errors.
5. **Stage 5 — Automated Tests:** Vitest full suite (32 test files, 284/284 tests passed).
6. **Stage 6 — Production Build:** Dual Gzip + Brotli pre-compression (Brotli size $\le 60\text{ KB}$).
