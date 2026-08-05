/**
 * POS Local HTTP Bridge Client (本機 POS 橋接服務客戶端)
 * ----------------------------------------------------
 * 與本機執行的 LOCAL-PRINTER-POS-BRIDGE (http://127.0.0.1:8060) 進行通訊，
 * 解決 Windows 瀏覽器端因安全沙盒限制無法直接存取 LPT1:、Serial COM、
 * 或 Windows 實體收銀抽屜 (Cash Drawer) 的問題。
 */

export interface POSBridgeResponse {
  success: boolean;
  message: string;
  bytesSent?: number;
  port?: string;
  drawerOpened?: boolean;
}

export interface POSPrintOptions {
  text?: string;
  hex?: string;
  base64?: string;
  action?: 'print' | 'open_drawer';
  port?: string;
  autoOpenDrawer?: boolean;
}

export const DEFAULT_POS_BRIDGE_URL = 'http://127.0.0.1:8060';

/**
 * 探測本機 POS 橋接服務 (LOCAL-PRINTER-POS-BRIDGE) 是否在線運行中
 * @param baseUrl 預設為 http://127.0.0.1:8060
 * @param timeoutMs 逾時毫秒數 (預設 1000ms)
 */
export async function checkPOSBridgeHealth(
  baseUrl: string = DEFAULT_POS_BRIDGE_URL,
  timeoutMs: number = 1000
): Promise<{ online: boolean; data?: any; error?: string }> {
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${cleanUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { online: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    return {
      online: data.status === 'online' || data.success === true,
      data
    };
  } catch (err: any) {
    return {
      online: false,
      error: err?.name === 'AbortError' ? '連線逾時' : (err?.message || '橋接服務未啟動')
    };
  }
}

/**
 * 透過本機 POS 橋接服務觸發實體收銀機錢箱 (Cash Drawer) 彈開
 * @param port 指定輸出埠 (預設 LPT1:)
 * @param baseUrl 預設為 http://127.0.0.1:8060
 */
export async function openCashDrawerViaBridge(
  port: string = 'LPT1:',
  baseUrl: string = DEFAULT_POS_BRIDGE_URL
): Promise<POSBridgeResponse> {
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${cleanUrl}/open-drawer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open_drawer',
        port: port || 'LPT1:'
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || '收銀抽屜脈衝已發送至本機硬體埠',
      bytesSent: data.bytesSent,
      port: data.port || port,
      drawerOpened: true
    };
  } catch (err: any) {
    console.warn('[POS Bridge Client] openCashDrawer error:', err);
    return {
      success: false,
      message: `無法連線至本機 POS 橋接器 (${baseUrl}): ${err?.message || err}`
    };
  }
}

/**
 * 透過本機 POS 橋接服務發送單據文字或 ESC/POS 指令至本機印表機 (LPT1:/COM/USB)
 * @param options 列印參數 (可包含 text, hex, base64, port, autoOpenDrawer)
 * @param baseUrl 預設為 http://127.0.0.1:8060
 */
export async function printViaBridge(
  options: POSPrintOptions,
  baseUrl: string = DEFAULT_POS_BRIDGE_URL
): Promise<POSBridgeResponse> {
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${cleanUrl}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: options.text,
        hex: options.hex,
        base64: options.base64,
        port: options.port || 'LPT1:',
        autoOpenDrawer: options.autoOpenDrawer ?? false
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || '列印指令已成功寫入本機印表機埠口',
      bytesSent: data.bytesSent,
      port: data.port || options.port,
      drawerOpened: data.drawerOpened
    };
  } catch (err: any) {
    console.warn('[POS Bridge Client] printViaBridge error:', err);
    return {
      success: false,
      message: `本機 POS 橋接器列印失敗 (${baseUrl}): ${err?.message || err}`
    };
  }
}
