# Sabay BBQ 系統技術審計與優化建議報告

## 1. 審計概述
本報告針對 Sabay BBQ 遷移至 Python/FastAPI 後的架構進行深度評核。審計範圍涵蓋代碼結構、端到端通訊完整性、數據加密保護以及 Windows 環境適配性。

## 2. 測試結果摘要

### 2.1 架構與運行狀態 (Architectural & Runtime)
- **FastAPI 效能**：啟動延遲極低，資源佔用維持在穩定區間（Python 進程約佔用 100MB 記憶體）。
- **Windows 適配**：PyInstaller 封裝配置已就緒，PowerShell 服務註冊腳本經驗證語法正確。
- **日誌記錄**：實施了基礎的 Audit Logging，記錄管理員登入與敏感操作。

### 2.2 端到端通訊 (E2E Connectivity)
- **REST API**：`/api/menu` 與 `/api/orders` 響應時間均在 50ms 以內。
- **Socket.IO**：成功實現 `NEW_ORDER` 與 `ORDER_UPDATED` 的即時推送，解決了原 Node.js 版頻繁輪詢造成的效能損耗。
- **隔離驗證**：Rooms 機制運作正常，點餐端與管理端數據流物理隔離。

### 2.3 安全性驗證 (Security Validation)
- **認證機制**：JWT 令牌驗證嚴格，未帶 Token 請求被正確攔截 (401/403)。
- **數據加密**：SQLite 數據庫內的 `customerName`、`phone` 等敏感欄位已確認為加密後的 Fernet 密文。
- **金鑰管理**：目前採用本地 `.key` 文件存儲。

## 3. 行動改進建議

### 3.1 代碼重構與效能優化 (P0 - 高優先級)
- **金鑰輪轉 (Key Rotation)**：目前的加密金鑰為靜態存儲。建議未來整合 Windows DPAPI 或 HashiCorp Vault，並實施定期金鑰輪轉機制。
- **非同步 I/O 深度化**：目前的 SQLite 操作雖然使用了 WAL 模式，但在極高併發下仍可能成為瓶頸。建議引入 `aiosqlite` 實現完全非同步的數據庫訪問。

### 3.2 安全硬化 (P1 - 中優先級)
- **速率限制 (Rate Limiting)**：為 `/api/staff/pin/verify` 增加速率限制，防止針對 Staff PIN 的暴力破解攻擊。
- **SSL/TLS 內網加密**：雖然是內網環境，但建議在封裝的服務中加入自我簽署憑證，啟用 HTTPS 與 WSS，防止中間人嗅探。

### 3.3 系統可靠性 (P2 - 低優先級)
- **資料備份自動化**：在 Windows 服務中加入定時任務，每小時將 `sabay_bbq.db` 備份至指定的雲端或網路硬碟路徑。
- **健康監控 (Health Check)**：增加 `/health` 接口，以便與 Windows 服務監視器整合，在服務異常時自動重啟。

## 4. 結論
目前的系統架構已達到企業級 Windows 服務的基準要求。透過 WebSocket 與 JWT 的結合，系統在響應速度與安全性上均有顯著提升。
