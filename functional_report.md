# Sabay BBQ 系統架構分析與功能報告 (v3.0 - 企業級 Windows 服務版)

## 1. 系統概述
本報告詳述 Sabay BBQ 系統從 Node.js/Express 到 Python/FastAPI 的企業級遷移方案。重點在於實現 Windows 7+ 環境下的高性能、高安全性以及實時數據同步，並確保系統能作為獨立後台服務穩定運行。

## 2. 核心架構組件

### 2.1 後端：FastAPI 異步服務 (Headless Windows Service)
- **高性能引擎**：採用 FastAPI 作為核心框架，支援高併發處理與異步通訊。
- **認證授權機制 (PIN-to-JWT)**：
    - **Bootstrap**：前端首次啟動需提交 Staff PIN。
    - **授權**：後端驗證 PIN 後簽發 JWT Token。
    - **防護**：後續所有敏感 API 請求均需帶有 JWT Bearer Token。
- **數據安全性 (At-Rest Encryption)**：
    - 採用 `cryptography` 庫實現應用層數據加密。
    - 敏感數據（如營業數據、顧客資訊）在寫入 SQLite 前進行對稱加密。

### 2.2 通訊層：WebSocket 數據隔離 (Socket.IO Rooms)
- **實時同步**：全面取代 HTTP 輪詢，實現毫秒級狀態推送。
- **交通隔離 (Isolation)**：
    - **Order Room**：僅廣播實時訂單與狀態更新，供 KDS 與顧客端使用。
    - **Admin Room**：僅對持有高權限憑證的管理端廣播營收分析與審計數據。
- **優勢**：大幅降低網路載荷，防止敏感數據在非授權設備上暴露。

### 2.3 存儲層：硬化 SQLite 持久化
- **本地庫**：SQLite 確保全功能離線運作。
- **自動化初始化**：啟動時自動解析 `src/data.ts` 以恢復初始菜單與原料庫存。

## 3. Windows 部署與服務化
- **封裝**：使用 PyInstaller 封裝為單一 `.exe`。
- **服務化 (Service Daemon)**：提供 PowerShell 腳本將其註冊為 Windows 服務，支援：
    - **開機自啟動**：無需用戶登入即可在後台運行。
    - **靜默執行**：無控制台窗口，降低被意外關閉的風險。

## 4. 前端重構規範
- **認證對接**：整合 PIN 驗證流程以取得 JWT。
- **通訊重構**：移除所有 `setInterval` 輪詢，改為訂閱指定的 Socket.IO Rooms。
- **安全認證**：全局攔截 fetch 請求，自動注入 JWT 標頭。

## 5. 驗證與驗收標準
- **安全性**：SQLite 文件內容應無法被直接讀取明文敏感資訊。
- **效能**：WebSocket 延遲應低於 50ms。
- **穩定性**：Windows 服務重啟後應能自動恢復數據庫狀態。
