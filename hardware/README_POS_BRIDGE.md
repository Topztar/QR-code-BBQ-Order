# LOCAL-PRINTER-POS-BRIDGE (Windows POS 橋接器服務)

## 📌 簡介
本服務為專門解決 **Windows 8 / 10 / 11 簡體中文版 (CP936/GBK) 及繁體中文版** 環境下，瀏覽器（Firefox / Chrome / Edge）因安全沙盒無法直接存取本機實體印表機硬體埠（LPT1:、COM 埠、USB 虛擬埠）與實體收銀抽屜（Cash Drawer）而設計的本機 HTTP 橋接伺服器。

---

## ⚡ 核心功能與修正特性
1. **二進位安全模式 (`'wb'`)**：
   - 寫入 `LPT1:`、`COMx` 與設備檔時一律使用二進位模式，阻絕 Python 在 Windows 簡體中文環境下因 CP936 引發之 `UnicodeEncodeError` 崩潰，並防止 `\n` 自動被置換為 `\r\n` 破壞 ESC/POS 控制碼。
2. **多重編碼容錯管道**：
   - 自動將列印內容依序以 `Big5` (繁體標準) ➔ `GB18030 / GBK` (簡體相容) ➔ `UTF-8` 進行安全轉譯，同時自動濾除破壞雙位元組排版之 Emoji 特殊圖示。
3. **Firefox Private Network Access (PNA) 完整支援**：
   - 針對所有 Preflight (`OPTIONS`) 請求回傳 `Access-Control-Allow-Private-Network: true` 與完整 CORS 標頭，確保 Firefox 跨網域呼叫 `http://127.0.0.1:8060` 暢通無阻。
4. **雙通道硬體分流**：
   - **KDS 廚房印表機**：自動透過 TCP Socket 轉發至指定 IP (Port 9100)。
   - **前台帳單與收銀機**：以二進位模式寫入本機硬體埠口並觸發自動切刀與錢箱開箱脈衝。

---

## 🚀 啟動方式

### 方法一：Windows 一鍵啟動 (推薦)
直接雙擊執行 `start_pos_bridge.bat` 即可自動偵測 Python 或 Node.js 並啟動。

### 方法二：Python 手動啟動
```cmd
chcp 65001
python pos_bridge.py 8060
```

### 方法三：Node.js 手動啟動
```cmd
node pos_bridge.js
```

---

## 📡 API 端點規格

| 端點 | 方法 | 說明 |
| :--- | :---: | :--- |
| `/health` | `GET` | 橋接器在線狀態與系統編碼探測 |
| `/open-drawer` | `POST` | 發送 ESC/POS 開錢箱脈衝 (`1B 70 00 19 FA`) |
| `/print` | `POST` | 支援 `text` (純文字)、`base64`、`hex` 列印與 IP / LPT 轉發 |
| `/*` | `OPTIONS` | CORS Preflight 及 Firefox PNA 標頭回應 |
