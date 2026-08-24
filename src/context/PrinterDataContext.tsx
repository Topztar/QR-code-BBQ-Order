import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { printViaBridge, normalizePort, DEFAULT_POS_BRIDGE_URL } from '../lib/posBridgeClient';

export interface PrinterDataContextType {
  printerIp: string;
  setPrinterIp: React.Dispatch<React.SetStateAction<string>>;
  printLogs: any[];
  setPrintLogs: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdatePrinterIp: (ip: string) => Promise<{ success: boolean; error?: string }>;
  handleClearPrintLogs: () => Promise<void>;
  handlePrintTestPage: (
    target?: 'kitchen' | 'bill' | 'all',
    customSettings?: { kitchen?: any; bill?: any }
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const PrinterDataContext = createContext<PrinterDataContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  activeTab: 'customer' | 'kitchen' | 'admin' | 'cashier';
}

export function PrinterDataProvider({ children, activeTab }: ProviderProps) {
  const [printerIp, setPrinterIp] = useState<string>('192.168.123.100');
  const [printLogs, setPrintLogs] = useState<any[]>([]);

  // Fetch printer config & logs on mount / when activeTab changes
  useEffect(() => {
    if (activeTab === 'customer') return;

    const fetchPrinterData = async () => {
      try {
        const [configRes, logsRes] = await Promise.all([
          apiFetch('/api/printer/config'),
          apiFetch('/api/print-logs')
        ]);
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData && configData.ip) {
            setPrinterIp(configData.ip);
          }
        }
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (Array.isArray(logsData)) {
            setPrintLogs(logsData);
          }
        }
      } catch (err) {
        console.warn('[Printer Data Fetch Warning]', err);
      }
    };

    fetchPrinterData();
  }, [activeTab]);

  const handleUpdatePrinterIp = async (ip: string) => {
    try {
      const res = await apiFetch('/api/printer/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      if (res.ok) {
        const d = await res.json();
        setPrinterIp(d.ip);
        return { success: true };
      } else {
        const d = await res.json();
        return { success: false, error: d.error || '無法更新印表機 IP' };
      }
    } catch (err: any) {
      console.error('[Update printer IP error]', err);
      return { success: false, error: err.message || '連線錯誤' };
    }
  };

  const handleClearPrintLogs = async () => {
    try {
      await apiFetch('/api/print-logs/clear', { method: 'POST' });
      setPrintLogs([]);
    } catch (err) {
      console.error('[Sabay Printer Clear error]', err);
    }
  };

  const handlePrintTestPage = async (
    target?: 'kitchen' | 'bill' | 'all',
    customSettings?: { kitchen?: any; bill?: any }
  ) => {
    try {
      const targetVal = typeof target === 'string' ? target : 'all';
      const isKitchen = targetVal === 'kitchen' || targetVal === 'all';
      const isBill = targetVal === 'bill' || targetVal === 'all';

      const kitchenConfig = customSettings?.kitchen || {};
      const billConfig = customSettings?.bill || {};

      const kitchenIp = kitchenConfig.ip || printerIp || '192.168.123.100';
      const kitchenPort = kitchenConfig.usbPort || 'USB001';
      const kitchenConn = kitchenConfig.connectionType || 'IP';

      const billPort = normalizePort(billConfig.usbPort || 'LPT1:');
      const billIp = billConfig.ip || '192.168.1.102';
      const billConn = billConfig.connectionType || 'LPT';

      const bridgeSuccesses: string[] = [];
      const bridgeWarnings: string[] = [];

      // Step 1: Direct Local Check-in POS Bridge Print (http://127.0.0.1:8060)
      if (typeof window !== 'undefined') {
        const activeBridgeUrl = localStorage.getItem('pos-bridge-url') || DEFAULT_POS_BRIDGE_URL;

        if (isKitchen) {
          try {
            const kSampleText = [
              '================================',
              '    SABAY BBQ KDS 測試頁',
              '================================',
              `類別: 廚房工作票 (${kitchenConn === 'IP' ? `IP ${kitchenIp}` : `Port ${kitchenPort}`})`,
              `時間: ${new Date().toLocaleString()}`,
              '品項: 1. 泰式烤豬肉串 x 2 (小辣)',
              '      2. 泰式冬蔭功海鮮湯 x 1',
              '================================',
              '狀態: POS 橋接器通訊正常',
              '================================\n\n'
            ].join('\n');

            const kRes = await printViaBridge({
              text: kSampleText,
              ip: kitchenConn === 'IP' ? kitchenIp : undefined,
              port: kitchenConn === 'IP' ? undefined : kitchenPort,
              connectionType: kitchenConn,
              target: 'kitchen',
              autoOpenDrawer: false
            }, activeBridgeUrl);

            if (kRes.success) {
              bridgeSuccesses.push(`🍳 廚房測試頁已成功送出 (${kitchenConn === 'IP' ? kitchenIp : kitchenPort})`);
            } else {
              bridgeWarnings.push(`🍳 廚房橋接: ${kRes.message}`);
            }
          } catch (e: any) {
            bridgeWarnings.push(`🍳 廚房連線: ${e?.message || e}`);
          }
        }

        if (isBill) {
          try {
            const bSampleText = [
              '================================',
              '    SABAY BBQ 前台收銀測試頁',
              '================================',
              `類別: 前台帳單與收銀明細`,
              `埠口: ${billConn === 'IP' ? `IP ${billIp}` : billPort}`,
              `時間: ${new Date().toLocaleString()}`,
              `型態: ${billConn} (硬體連動)`,
              '================================',
              '狀態: POS 橋接器與錢箱驅動就緒',
              '================================\n\n'
            ].join('\n');

            const bRes = await printViaBridge({
              text: bSampleText,
              ip: billConn === 'IP' ? billIp : undefined,
              port: billConn === 'IP' ? undefined : billPort,
              connectionType: billConn,
              target: 'bill',
              autoOpenDrawer: true
            }, activeBridgeUrl);

            if (bRes.success) {
              bridgeSuccesses.push(`🧾 前台測試頁已成功送出 (${billConn === 'IP' ? billIp : billPort})`);
            } else {
              bridgeWarnings.push(`🧾 前台橋接: ${bRes.message}`);
            }
          } catch (e: any) {
            bridgeWarnings.push(`🧾 前台連線: ${e?.message || e}`);
          }
        }
      }

      if (bridgeSuccesses.length > 0) {
        apiFetch('/api/printer/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: targetVal,
            settings: { kitchen: kitchenConfig, bill: billConfig },
            bridgeSuccess: true
          }),
        }).catch(() => {});

        return {
          success: true,
          message: bridgeSuccesses.join('\n')
        };
      }

      // Step 2: Fallback to Server API dispatch
      let data: any = null;
      let res: Response | null = null;
      try {
        res = await apiFetch('/api/printer/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: targetVal,
            settings: { kitchen: kitchenConfig, bill: billConfig }
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (err: any) {
        console.warn('[Server API test page warning]:', err);
      }

      if (data && data.success) {
        return {
          success: true,
          message: data.message || '測試頁指令已成功送出！'
        };
      }

      const serverErr = data?.error || (res ? `HTTP ${res.status}` : null);
      const combinedErrMsg = [
        ...bridgeWarnings,
        serverErr ? `伺服器回應: ${serverErr}` : '本機 Check-in 橋接器未啟動 (請確認 http://127.0.0.1:8060)'
      ].filter(Boolean).join('\n');

      return {
        success: false,
        error: combinedErrMsg || '列印測試頁失敗，請確認印表機與本機 POS 橋接器狀態'
      };
    } catch (err: any) {
      console.error('[Print test page error]', err);
      return { success: false, error: err?.message || '連線錯誤' };
    }
  };

  const value = useMemo<PrinterDataContextType>(() => ({
    printerIp,
    setPrinterIp,
    printLogs,
    setPrintLogs,
    handleUpdatePrinterIp,
    handleClearPrintLogs,
    handlePrintTestPage,
  }), [printerIp, printLogs]);

  return (
    <PrinterDataContext.Provider value={value}>
      {children}
    </PrinterDataContext.Provider>
  );
}

export function usePrinterData(): PrinterDataContextType {
  const context = useContext(PrinterDataContext);
  if (!context) {
    throw new Error('usePrinterData must be used within a PrinterDataProvider');
  }
  return context;
}
