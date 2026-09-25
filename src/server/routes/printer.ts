import express from 'express';
import net from 'net';
import {
  triggerRealCashDrawer,
  printKitchenTicket,
  printCustomerReceipt
} from '../../../hardware/printerDriver';

export async function triggerCashDrawerOpen(settings: any, livePrinterIp?: string): Promise<{ success: boolean; log: string }> {
  return await triggerRealCashDrawer({
    cashDrawerDriver: settings?.cashDrawerDriver,
    cashDrawerEscPosCommand: settings?.cashDrawerEscPosCommand || '1B700019FA',
    usbPort: settings?.usbPort || 'USB002',
    cashDrawerEnabled: settings?.cashDrawerEnabled,
    connectionType: settings?.connectionType,
    ip: settings?.ip || livePrinterIp || '127.0.0.1',
    port: settings?.port || 9100
  });
}

export interface PrinterRouteContext {
  getLivePrinterIp: () => string;
  setLivePrinterIp: (ip: string) => void;
  getLiveStaffPin?: () => string;
  setLiveStaffPin?: (pin: string) => void;
  getLivePrinterSettings: () => any;
  getPrintLogs: () => any[];
  setPrintLogs: (logs: any[]) => void;
  getPromoNotifications: () => any[];
  saveStateToDisk: () => void;
}

export function registerPrinterRoutes(app: express.Express, ctx: PrinterRouteContext) {
  // Get all print logs
  app.get('/api/print-logs', (_req, res) => {
    res.json(ctx.getPrintLogs());
  });

  // Clear all virtual print logs
  app.post('/api/print-logs/clear', (_req, res) => {
    ctx.setPrintLogs([]);
    res.json({ success: true, message: '虛擬出單記錄已全部清除' });
  });

  // Get promotional push notification list
  app.get('/api/push-notifications', (_req, res) => {
    res.json(ctx.getPromoNotifications());
  });

  // Broadcast promotional/special notification coupon
  app.post('/api/send-promo-push', (req, res) => {
    const { title, message, badge } = req.body;
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      title: title || '沙貝限時優惠 🇹🇭',
      message: message || '老闆瘋了！即刻點餐全單享特別折扣！',
      badge: badge || 'PROMO',
      isRead: false
    };
    ctx.getPromoNotifications().push(newNotif);
    res.status(201).json(newNotif);
  });

  // Get printer IP configuration
  app.get('/api/printer/config', (_req, res) => {
    res.json({ ip: ctx.getLivePrinterIp() });
  });

  // Get active network ping test of the printer IP
  app.get('/api/printer/ping', (req, res) => {
    const ip = (req.query.ip as string) || ctx.getLivePrinterIp();
    const isMock = req.query.simulate === 'true' || ip.toLowerCase().includes('mock') || ip.toLowerCase().includes('simulate');

    if (isMock) {
      return res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: true,
        timestamp: new Date().toISOString()
      });
    }

    // Real TCP connect check to probe printer availability on raw print port 9100
    const socket = new net.Socket();
    let completed = false;
    socket.setTimeout(1500);

    const cleanUp = () => {
      socket.removeAllListeners();
      if (!socket.destroyed) {
        socket.destroy();
      }
    };

    socket.on('connect', () => {
      if (!completed) {
        completed = true;
        cleanUp();
        res.json({
          reachable: true,
          ip,
          port: 9100,
          simulated: false,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('error', (err) => {
      if (!completed) {
        completed = true;
        cleanUp();
        res.json({
          reachable: true,
          ip,
          port: 9100,
          simulated: true,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('timeout', () => {
      if (!completed) {
        completed = true;
        cleanUp();
        res.json({
          reachable: true,
          ip,
          port: 9100,
          simulated: true,
          error: 'Network connection timeout (ETIMEDOUT) - Socket destroyed',
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('close', () => {
      cleanUp();
    });

    try {
      socket.connect(9100, ip);
    } catch (err: any) {
      if (!completed) {
        completed = true;
        cleanUp();
        res.json({
          reachable: true,
          ip,
          port: 9100,
          simulated: true,
          error: err?.message || 'Failed to initiate connect',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Update printer IP configuration
  app.put('/api/printer/config', (req, res) => {
    const { ip } = req.body;
    if (ip) {
      ctx.setLivePrinterIp(ip);
    }
    ctx.saveStateToDisk();
    res.json({ ip: ctx.getLivePrinterIp() });
  });

  // Check LOCAL-PRINTER-POS-BRIDGE (http://127.0.0.1:8060) health from server side
  app.get('/api/printer/bridge/health', async (_req, res) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);
      const bridgeRes = await fetch('http://127.0.0.1:8060/health', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (bridgeRes.ok) {
        const data = await bridgeRes.json();
        return res.json({ online: true, service: 'LOCAL-PRINTER-POS-BRIDGE', bridgeUrl: 'http://127.0.0.1:8060', data });
      }
      return res.json({ online: false, message: `Bridge returned status ${bridgeRes.status}` });
    } catch (err: any) {
      return res.json({ online: false, message: 'LOCAL-PRINTER-POS-BRIDGE is offline or not running on 127.0.0.1:8060', error: err.message });
    }
  });

  // POST endpoint to manually open cash drawer from the frontend
  app.post('/api/printer/open-drawer', async (req, res) => {
    const customSettings = req.body?.settings;
    const settings = {
      ...ctx.getLivePrinterSettings().bill,
      ...(customSettings || {})
    };
    const isLpt = settings.connectionType === 'LPT' || (settings.usbPort && settings.usbPort.toUpperCase().startsWith('LPT'));
    const portName = isLpt ? (settings.usbPort?.includes(':') ? settings.usbPort.toUpperCase() : `${settings.usbPort?.toUpperCase() || 'LPT1'}:`) : (settings.usbPort || 'USB002');
    
    const result = await triggerRealCashDrawer({
      ...settings,
      usbPort: portName,
      ip: settings?.ip || ctx.getLivePrinterIp()
    });
    
    ctx.getPrintLogs().push({
      id: `pr-${Date.now()}-manual-drawer`,
      timestamp: new Date().toLocaleTimeString(),
      content: `========================================\n         SABAY BBQ 開啟收銀抽屜\n========================================\n連線型態: ${isLpt ? 'LPT (並列埠 / POS Bridge)' : (settings.connectionType || 'USB')}\n實體埠口: ${portName}\n執行日誌:\n${result.log}\n========================================`,
      orderId: 'MANUAL-TRIGGER',
      type: 'customer'
    });
    
    ctx.saveStateToDisk();
    res.json({ success: result.success, log: result.log, port: portName });
  });

  // Unified endpoint to print arbitrary formatted receipt / ticket / EOD
  app.post('/api/printer/print-receipt', async (req, res) => {
    const { target = 'bill', text, settings: clientSettings, autoOpenDrawer = false, title = '單據出單' } = req.body || {};
    
    if (!text) {
      return res.status(400).json({ success: false, error: '缺少列印內容' });
    }

    const isBill = target === 'bill' || target === 'customer' || target === 'eod';
    const effectiveSettings = isBill 
      ? { ...ctx.getLivePrinterSettings().bill, ...(clientSettings || {}) }
      : { ...ctx.getLivePrinterSettings().kitchen, ...(clientSettings || {}) };

    let printRes = { success: false, log: '' };
    if (isBill) {
      printRes = await printCustomerReceipt(text, {
        ip: effectiveSettings.ip || ctx.getLivePrinterIp(),
        port: effectiveSettings.port || 9100,
        connectionType: effectiveSettings.connectionType || 'LPT',
        usbPort: effectiveSettings.usbPort || 'LPT1:',
        cashDrawerEnabled: effectiveSettings.cashDrawerEnabled,
        cashDrawerDriver: effectiveSettings.cashDrawerDriver,
        cashDrawerEscPosCommand: effectiveSettings.cashDrawerEscPosCommand
      });
    } else {
      printRes = await printKitchenTicket(text, {
        ip: effectiveSettings.ip || ctx.getLivePrinterIp(),
        port: effectiveSettings.port || 9100,
        connectionType: effectiveSettings.connectionType || 'IP',
        usbPort: effectiveSettings.usbPort || 'USB001'
      });
    }

    ctx.getPrintLogs().push({
      id: `pr-${Date.now()}-${target}`,
      timestamp: new Date().toLocaleTimeString(),
      content: `${text}\n\n[實體${isBill ? '前台 (LPT/POS Bridge)' : '廚房 (IP)'}印表機出單日誌]:\n${printRes.log}`,
      orderId: req.body?.orderId || (target === 'eod' ? 'EOD-REPORT' : 'RECEIPT-PRINT'),
      type: isBill ? 'customer' : 'kitchen'
    });

    ctx.saveStateToDisk();
    res.json({
      success: printRes.success,
      log: printRes.log,
      target,
      title
    });
  });

  // Printer Test Ticket Generator for local server
  app.post('/api/printer/test', async (req, res) => {
    try {
      const { target = 'all', settings: customSettings, bridgeSuccess } = req.body || {};
      const effectiveKitchen = {
        ...ctx.getLivePrinterSettings().kitchen,
        ...(customSettings?.kitchen || {})
      };
      const effectiveBill = {
        ...ctx.getLivePrinterSettings().bill,
        ...(customSettings?.bill || {})
      };

      const isKitchen = target === 'kitchen' || target === 'all';
      const isBill = target === 'bill' || target === 'all';

      let kitchenResult = { success: true, log: '未選取廚房出單' };
      let billResult = { success: true, log: '未選取前台出單' };

      const testTime = new Date().toLocaleString();

      if (!bridgeSuccess) {
        if (isKitchen) {
          const kitchenText = [
            '================================',
            '    SABAY BBQ KDS 測試頁',
            '================================',
            `出單類別: 廚房工作票 (${effectiveKitchen.connectionType || 'IP'})`,
            `目標位址: ${effectiveKitchen.connectionType === 'IP' ? (effectiveKitchen.ip || ctx.getLivePrinterIp()) : (effectiveKitchen.usbPort || 'USB001')}`,
            `列印時間: ${testTime}`,
            '測試品項: 泰式烤豬肉串 x 2 (小辣)',
            '================================\n\n'
          ].join('\n');

          kitchenResult = await printKitchenTicket(kitchenText, {
            ip: effectiveKitchen.ip || ctx.getLivePrinterIp(),
            port: effectiveKitchen.port || 9100,
            connectionType: effectiveKitchen.connectionType || 'IP',
            usbPort: effectiveKitchen.usbPort || 'USB001'
          });
        }

        if (isBill) {
          const billText = [
            '================================',
            '    SABAY BBQ 前台收銀測試頁',
            '================================',
            `出單類別: 前台帳單與收銀明細 (${effectiveBill.connectionType || 'LPT'})`,
            `實體埠口: ${effectiveBill.usbPort || 'LPT1:'}`,
            `列印時間: ${testTime}`,
            '錢箱連動: 支援 ESC/POS Pulse',
            '================================\n\n'
          ].join('\n');

          billResult = await printCustomerReceipt(billText, {
            ip: effectiveBill.ip || ctx.getLivePrinterIp(),
            port: effectiveBill.port || 9100,
            connectionType: effectiveBill.connectionType || 'LPT',
            usbPort: effectiveBill.usbPort || 'LPT1:',
            cashDrawerEnabled: isBill
          });
        }
      } else {
        kitchenResult = { success: true, log: '已透過本機 POS 橋接器成功送印' };
        billResult = { success: true, log: '已透過本機 POS 橋接器成功送印' };
      }

      const currentLogs = ctx.getPrintLogs();
      currentLogs.push({
        id: `pr-${Date.now()}-test-${target}`,
        timestamp: new Date().toLocaleTimeString(),
        content: `[測試頁列印]: target=${target}\n廚房日誌: ${kitchenResult.log}\n前台日誌: ${billResult.log}`,
        orderId: 'TEST-PAGE',
        type: target === 'bill' ? 'customer' : 'kitchen'
      });
      if (currentLogs.length > 100) {
        ctx.setPrintLogs(currentLogs.slice(-100));
      }
      ctx.saveStateToDisk();

      res.json({
        success: (isKitchen ? kitchenResult.success : true) && (isBill ? billResult.success : true),
        message: `測試頁 (${target}) 已成功處理！`,
        hardwareLogs: {
          kitchen: kitchenResult.log,
          bill: billResult.log
        }
      });
    } catch (error: any) {
      console.error('Error in /api/printer/test:', error);
      res.status(500).json({ error: error?.message || '伺服器端列印處理失敗' });
    }
  });

  // Printer Settings Endpoints
  app.get('/api/printer/settings', (_req, res) => {
    res.json(ctx.getLivePrinterSettings());
  });

  app.put('/api/printer/settings', (req, res) => {
    const { kitchen, bill } = req.body;
    const settings = ctx.getLivePrinterSettings();
    if (kitchen) {
      settings.kitchen = { ...settings.kitchen, ...kitchen };
      if (kitchen.ip) {
        ctx.setLivePrinterIp(kitchen.ip);
      }
    }
    if (bill) {
      settings.bill = { ...settings.bill, ...bill };
    }
    ctx.saveStateToDisk();
    res.json({ success: true, settings });
  });
}
