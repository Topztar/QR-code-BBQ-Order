# 沙貝燒烤 SABAY BBQ | 線上預約與 QR-Code 智慧點餐系統

<div align="center">
  <strong>生產級全端架構 • 零信任安全模型 • 超高速前端渲染 • 雲端成本極致優化</strong>
</div>

---

## 🌟 核心特色與架構總覽

本系統專為高翻桌率、高並發餐飲現場設計，涵蓋「顧客掃碼點餐 (CustomerOrderView)」、「廚房 KDS 出單系統 (KitchenDisplaySystem)」、「即時收銀台」與「管理後台 (ManagerDashboard)」。

### 1. 🛡️ 零信任安全與資料防護 (Phase 1)
- **嚴格安全規則 (`firestore.rules` & `storage.rules`)**：敏感集合 (`/secrets`, `/checkouts`) 全面禁止前端存取；菜單與設定前端唯讀；訂單與預約嚴格限定欄位型態並禁止前端刪改；Storage 禁止前端直寫。
- **後端 Payload 消毒 (`functions/src/validators.ts`)**：全面過濾 Null Byte、XSS 惡意標籤、負數金額/數量竄改及圖片路徑遍歷（Directory Traversal）。
- **員工 PIN 碼加鹽防護 (`functions/src/auth.ts`)**：採用 SHA-256 + Salt 雜湊驗證，具備連續 5 次錯誤 15 分鐘冷卻鎖定與 30 秒記憶體 Token 快取。
- **HTTP 安全標頭 (`firebase.json`)**：全域配置 `Content-Security-Policy`、`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY` 與 `Permissions-Policy`。

### 2. ⚡ 高效能與前端優化 (Phase 2)
- **模組化路由分割**：全站核心視圖（CustomerOrderView, ManagerDashboard, KDS）均採用 `React.lazy` 與 `Suspense` 進行程式碼分割。
- **極致輕量化 Chunk**：顧客點餐端主檔案僅 **141 KB**（Brotli 壓縮後 **30.25 KB**），首屏載入時間 (FCP) < 0.8 秒。
- **細粒度 Memoization**：`CustomerMenuGrid` 預先完成分類分組，單道菜品卡片封裝為 `React.memo(DishCard)`，購物車增減時 50+ 項菜品卡片 **0 重複渲染**。
- **無阻塞字型載入 (Zero Render-Blocking)**：Google Fonts 配置 `<link rel="preconnect">` 與 `display=swap`，消除樣式解析阻塞鏈。
- **版面穩定性 (Zero CLS)**：圖片固定長寬比，配置 `loading="lazy"`、`decoding="async"` 與 `onError` 優雅降級圖示。

### 3. 💰 雲端維運與成本防護 (< $20 USD / 月) (Phase 3)
- **Cloud Functions Gen 2 資源調優**：配置 `memory: 256MiB`（計算計費減半）、`minInstances: 0`（**$0 待機成本**）、`maxInstances: 10`（防惡意擴容帳單暴增）與 `concurrency: 80`。
- **Firestore 配額雙層保護**：
  - 客戶端：IndexedDB Multi-Tab `persistentLocalCache`（重複進站 0 Firestore 讀取費用）。
  - 服務端：高頻端點 (`/bootstrap`, `/menu`, `/settings`) 30~60s 記憶體 TTL 快取，100 位顧客同時進站僅計 1 次讀取。
- **月度總開銷預估**：穩定壓制在 **$0.00 ~ $1.50 USD / 月**（遠低於 $20 USD 預算上限）。

---

## 🛠️ 開發與本地運行

### 需求環境
- Node.js 20+

```bash
# 1. 安裝依賴
npm install

# 2. 本地開發伺服器 (Vite + Express Proxy)
npm run dev

# 3. 生產環境建置 (Vite Build + Dual Gzip/Brotli Compression)
npm run build

# 4. 本地啟動生產伺服器
npm run start
```

---

## 🧪 品質保證與自動化審計指令

專案內建全自動化審計測試套件，可在本地一鍵完成 4 階段品質把關：

```bash
# 執行所有單元與安全邏輯測試 (Vitest 34/34 Tests)
npm test

# 執行 Phase 1 安全與資料防護審計
npm run audit:security

# 執行 Phase 2 效能與 Bundle 體積審計
npm run audit:perf

# 執行 Phase 3 成本與雲端配額審計
npm run audit:cost

# 🚀 執行全端一鍵架構總檢門禁 (Master Quality Gate)
npm run audit:all
```

---

## 📁 專案架構目錄

```text
├── functions/              # Firebase Cloud Functions Gen 2 (Node.js 20)
│   ├── src/
│   │   ├── auth.ts         # 員工 PIN 碼加鹽雜湊、Token 記憶體快取與安全 Middleware
│   │   ├── validators.ts   # 訂單、預約、圖片 Payload 消毒與資料驗證
│   │   └── index.ts        # Express API 主路由 (256MiB, asia-east1, Gen 2)
│   └── package.json
├── src/                    # React 19 前端主程式
│   ├── components/
│   │   ├── customer/       # 顧客端高效能子元件 (Header, MenuGrid, Tabs, CartDrawer)
│   │   ├── manager/        # 管理後台模組 (菜單、桌位、統計、營運排程)
│   │   ├── kds/            # 廚房出單系統 (KDS) 模組
│   │   └── CustomerOrderView.tsx
│   ├── context/            # 模組化 Context Providers (RestaurantData, OrderData, PrinterData)
│   ├── lib/
│   │   ├── firebase.ts     # Firebase Client SDK 初始化 (包含 multi-tab persistentLocalCache)
│   │   └── offlineQueue.ts # 離線佇列與網路斷線自動重試機制
│   └── types.ts            # 全端 TypeScript 型別定義
├── scripts/                # 自動化審計與效能檢驗工具
│   ├── run_security_audit.cjs  # 安全審計腳本 (Phase 1)
│   ├── run_perf_audit.cjs      # 效能審計腳本 (Phase 2)
│   ├── run_cost_audit.cjs      # 成本審計腳本 (Phase 3)
│   └── run_all_checks.cjs      # 全端一鍵總檢腳本 (Phase 4)
├── tests/                  # Vitest 自動化測試套件 (涵蓋安全、促銷、排程、離線佇列)
├── firebase.json           # Firebase Hosting 快取標頭、CSP 與 Functions 轉發
├── firestore.rules         # 零信任 Firestore 安全規則
└── storage.rules           # Storage 安全規則
```
