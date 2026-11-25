import { useState, useEffect, useCallback } from 'react';
import { PrinterConfig } from '../../types';
import { apiFetch } from '../../lib/api';
import { safeStorage } from '../../lib/safeStorage';
import {
  checkPOSBridgeHealth,
  openCashDrawerViaBridge,
  printViaBridge,
  DEFAULT_POS_BRIDGE_URL,
} from '../../lib/posBridgeClient';

interface UseManagerPrinterAndBridgeParams {
  activeSubTab: string;
}

export function useManagerPrinterAndBridge({ activeSubTab }: UseManagerPrinterAndBridgeParams) {
  const [, setPrintConfirmData] = useState<any>(null);
  const [printLogs, setPrintLogs] = useState<any[]>([]);

  const fetchPrintLogs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/print-logs');
      if (res.ok) {
        const data = await res.json();
        setPrintLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [kitchenPrinter, setKitchenPrinter] = useState<PrinterConfig>({
    connectionType: 'IP',
    ip: '192.168.123.100',
    usbPort: 'USB001',
    width: '80mm',
    fontSizeFactor: 1.0,
    restaurantName: '沙貝燒烤 泰式廚房',
    printTelephone: '02-1234-5678',
    printAddress: '台北市信義區泰式一番街8號',
    printTimeEnabled: true,
    headerPrefix: '★★★ 廚房工作備餐單 ★★★',
    footerSuffix: '請主廚盡速配餐出餐！',
  });

  const [billPrinter, setBillPrinter] = useState<PrinterConfig>({
    connectionType: 'LPT',
    ip: '192.168.123.102',
    usbPort: 'LPT1:',
    width: '58mm',
    fontSizeFactor: 0.8,
    restaurantName: '沙貝燒烤 SABAY BBQ',
    printTelephone: '0966626408',
    printAddress: '桃園市大園區高鐵北路二段198號1樓',
    printTimeEnabled: true,
    headerPrefix: '★★★ 顧客結帳明細單 ★★★',
    footerSuffix: '謝謝光臨，歡迎再度光臨！',
    cashDrawerEnabled: true,
    cashDrawerDriver: 'ESC_POS_RAW',
    cashDrawerEscPosCommand: '1B700119FA',
  });

  const [printerSaveSuccess, setPrinterSaveSuccess] = useState<string | null>(null);

  const [posBridgeUrl, setPosBridgeUrl] = useState<string>(() => {
    return safeStorage.getItem('pos-bridge-url') || DEFAULT_POS_BRIDGE_URL;
  });
  const [posBridgeStatus, setPosBridgeStatus] = useState<{
    online: boolean;
    checking: boolean;
    lastChecked?: string;
    details?: any;
    error?: string;
  }>({ online: false, checking: false });
  const [posBridgeTesting, setPosBridgeTesting] = useState<boolean>(false);
  const [posBridgeTestResult, setPosBridgeTestResult] = useState<string | null>(null);

  const checkBridgeStatus = useCallback(async () => {
    setPosBridgeStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkPOSBridgeHealth(posBridgeUrl, 1200);
    setPosBridgeStatus({
      online: result.online,
      checking: false,
      lastChecked: new Date().toLocaleTimeString(),
      details: result.data,
      error: result.error,
    });
  }, [posBridgeUrl]);

  useEffect(() => {
    if (activeSubTab !== 'printer' && activeSubTab !== 'terminal') return;
    checkBridgeStatus();
    const interval = setInterval(checkBridgeStatus, 15000);
    return () => clearInterval(interval);
  }, [checkBridgeStatus, activeSubTab]);

  useEffect(() => {
    const fetchPrinterSettings = async () => {
      try {
        const res = await apiFetch('/api/printer/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.kitchen) setKitchenPrinter(data.kitchen);
          if (data.bill) setBillPrinter(data.bill);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrinterSettings();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'printer' || activeSubTab === 'stats') {
      fetchPrintLogs();
    }
  }, [activeSubTab, fetchPrintLogs]);

  const handleManualOpenDrawer = useCallback(async () => {
    try {
      const isLpt =
        billPrinter.connectionType === 'LPT' ||
        (billPrinter.usbPort && billPrinter.usbPort.toUpperCase().startsWith('LPT'));
      const port = isLpt
        ? billPrinter.usbPort?.includes(':')
          ? billPrinter.usbPort.toUpperCase()
          : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`
        : billPrinter.usbPort || 'USB002';

      const bridgeRes = await openCashDrawerViaBridge(port, posBridgeUrl);
      if (bridgeRes.success) {
        alert(
          `✓ 🔓 實體收銀箱抽屜已成功彈開！\n\n【本機橋接器通訊】: ${bridgeRes.message} (埠口: ${bridgeRes.port || port})`
        );
        return;
      }

      console.warn('[Cash Drawer] Local POS bridge failed, initiating server fallback pulse...');
      let serverData: any = null;
      try {
        const res = await apiFetch('/api/printer/open-drawer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { ...billPrinter, usbPort: port } }),
        });
        if (res.ok) {
          serverData = await res.json();
        }
      } catch (err) {
        console.warn('[Server Drawer Trigger Warning]', err);
      }

      if (serverData && serverData.success) {
        alert(
          `✓ 🔓 實體收銀箱抽屜已成功彈開！(伺服器驅動備援)\n\n【伺服器驅動日誌】:\n${serverData.log}`
        );
      } else {
        alert(
          `⚠️ 開啟收銀箱失敗:\n本機橋接: ${bridgeRes.message}\n伺服器備援: ${serverData?.error || '無法連線至印表機'}\n\n💡 提示: 請確認 LOCAL-PRINTER-POS-BRIDGE 正在 127.0.0.1:8060 運作或印表機 USB 連線正常。`
        );
      }
    } catch (e: any) {
      console.error('[Manual open cash drawer error]', e);
      alert(`❌ 連線或操作錯誤: ${e?.message || String(e)}`);
    }
  }, [billPrinter, posBridgeUrl]);

  const handleTestBridgeOpenDrawer = useCallback(async () => {
    setPosBridgeTesting(true);
    setPosBridgeTestResult(null);
    try {
      const port = billPrinter.usbPort || 'LPT1:';
      const res = await openCashDrawerViaBridge(port, posBridgeUrl);
      if (res.success) {
        setPosBridgeTestResult(`✓ 成功觸發實體開錢箱脈衝 (${res.port || port})！`);
      } else {
        setPosBridgeTestResult(`⚠️ 觸發失敗: ${res.message}`);
      }
    } catch (e: any) {
      setPosBridgeTestResult(`⚠️ 錯誤: ${e?.message || e}`);
    } finally {
      setPosBridgeTesting(false);
    }
  }, [billPrinter.usbPort, posBridgeUrl]);

  const handleTestBridgePrintLPT1 = useCallback(async () => {
    setPosBridgeTesting(true);
    setPosBridgeTestResult(null);
    try {
      const port = billPrinter.usbPort || 'LPT1:';
      const sampleText = `================================\n   SABAY BBQ 本機橋接測試單\n================================\n時間: ${new Date().toLocaleString()}\n連接埠: ${port}\n狀態: LOCAL-PRINTER-POS-BRIDGE 正常\n================================\n`;
      const res = await printViaBridge(
        {
          text: sampleText,
          port,
          autoOpenDrawer: false,
        },
        posBridgeUrl
      );

      if (res.success) {
        setPosBridgeTestResult(`✓ 成功發送測試列印指令至 ${res.port || port}！`);
      } else {
        setPosBridgeTestResult(`⚠️ 列印失敗: ${res.message}`);
      }
    } catch (e: any) {
      setPosBridgeTestResult(`⚠️ 錯誤: ${e?.message || e}`);
    } finally {
      setPosBridgeTesting(false);
    }
  }, [billPrinter.usbPort, posBridgeUrl]);

  const handleSavePrinters = useCallback(async () => {
    try {
      const res = await apiFetch('/api/printer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchen: kitchenPrinter, bill: billPrinter }),
      });
      if (res.ok) {
        setPrinterSaveSuccess('✅ 印表機與硬體設定儲存成功！');
        setTimeout(() => setPrinterSaveSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  }, [kitchenPrinter, billPrinter]);

  return {
    kitchenPrinter,
    setKitchenPrinter,
    billPrinter,
    setBillPrinter,
    printerSaveSuccess,
    printLogs,
    fetchPrintLogs,
    setPrintConfirmData,
    posBridgeUrl,
    setPosBridgeUrl,
    posBridgeStatus,
    posBridgeTesting,
    posBridgeTestResult,
    checkBridgeStatus,
    handleManualOpenDrawer,
    handleTestBridgeOpenDrawer,
    handleTestBridgePrintLPT1,
    handleSavePrinters,
  };
}
