import React from 'react';
import { Cpu, RefreshCw, Unlock, Printer, Download, Trash2 } from 'lucide-react';
import { safeStorage } from '../../lib/safeStorage';
import { apiFetch } from '../../lib/api';

const localStorage = safeStorage;

export interface PrinterConfig {
  connectionType: 'USB' | 'IP' | 'LPT';
  ip: string;
  usbPort: string;
  width: '58mm' | '80mm';
  fontSizeFactor: number;
  restaurantName: string;
  headerPrefix: string;
  footerSuffix: string;
  printAddress?: string;
  printTelephone?: string;
  printTimeEnabled?: boolean;
  cashDrawerEnabled?: boolean;
  cashDrawerDriver?: 'OPOS' | 'POS_NET' | 'ESC_POS_RAW';
  cashDrawerOposName?: string;
  cashDrawerEscPosCommand?: string;
}

interface ManagerPrinterTabProps {
  printerSaveSuccess: string | null;
  posBridgeStatus: { online: boolean; checking: boolean };
  checkBridgeStatus: () => void;
  posBridgeUrl: string;
  setPosBridgeUrl: (url: string) => void;
  billPrinter: PrinterConfig;
  setBillPrinter: React.Dispatch<React.SetStateAction<PrinterConfig>>;
  kitchenPrinter: PrinterConfig;
  setKitchenPrinter: React.Dispatch<React.SetStateAction<PrinterConfig>>;
  posBridgeTesting: boolean;
  handleTestBridgeOpenDrawer: () => void;
  handleTestBridgePrintLPT1: () => void;
  posBridgeTestResult: string | null;
  onPrintTestPage?: (target?: 'kitchen' | 'bill' | 'all', settings?: { kitchen?: any; bill?: any }) => Promise<{ success: boolean; error?: string; message?: string }>;
  setPrintConfirmData: (data: { title: string; ip: string; onConfirm: () => Promise<void> }) => void;
  handleManualOpenDrawer: () => void;
  handleSavePrinters: () => void;
  printLogs: any[];
  fetchPrintLogs: () => void;
  setConfirmActionModal: (data: any) => void;
}

export const ManagerPrinterTab: React.FC<ManagerPrinterTabProps> = ({
  printerSaveSuccess,
  posBridgeStatus,
  checkBridgeStatus,
  posBridgeUrl,
  setPosBridgeUrl,
  billPrinter,
  setBillPrinter,
  kitchenPrinter,
  setKitchenPrinter,
  posBridgeTesting,
  handleTestBridgeOpenDrawer,
  handleTestBridgePrintLPT1,
  posBridgeTestResult,
  onPrintTestPage,
  setPrintConfirmData,
  handleManualOpenDrawer,
  handleSavePrinters,
  printLogs,
  fetchPrintLogs,
  setConfirmActionModal,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-left font-sans" id="subtab-section-printer">
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
          <span className="text-xl">🖨️</span>
          <div>
            <h4 className="font-bold text-sm text-white">印表機與硬體規格管理器 (Printer Setup Center)</h4>
            <p className="text-white/40 text-xs">分離設置廚房KDS備餐印表機與前台帳單收銀印表機，不同模組各司其職，隨寬度自適應縮放字體大小。</p>
          </div>
        </div>

        {printerSaveSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl text-center text-xs">
            {printerSaveSuccess}
          </div>
        )}

        {/* 0. LOCAL-PRINTER-POS-BRIDGE (127.0.0.1:8060) Dedicated Hardware Bridge Card */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-cyan-500/30 rounded-xl p-4.5 space-y-3.5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cpu size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-400 tracking-wider">🖨️ 本機 Windows POS 橋接器服務 (LOCAL-PRINTER-POS-BRIDGE)</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    posBridgeStatus.online
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${posBridgeStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                    {posBridgeStatus.online ? '🟢 橋接服務連線正常' : '🔴 未偵測到橋接服務'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  提供 Windows 瀏覽器端穿透安全沙盒，直接控制 <span className="text-cyan-300 font-mono">LPT1:</span> / <span className="text-cyan-300 font-mono">COM</span> 實體印表機出單與開錢箱脈衝。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={checkBridgeStatus}
                disabled={posBridgeStatus.checking}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-white/10 text-zinc-300 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={posBridgeStatus.checking ? 'animate-spin text-cyan-400' : 'text-zinc-400'} />
                <span>{posBridgeStatus.checking ? '探測中...' : '重新偵測 (Probe)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">橋接服務位址 (Bridge URL)</label>
              <input
                type="text"
                value={posBridgeUrl}
                onChange={(e) => {
                  setPosBridgeUrl(e.target.value);
                  localStorage.setItem('pos-bridge-url', e.target.value);
                }}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-cyan-300 font-mono text-xs"
                placeholder="http://127.0.0.1:8060"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">預設實體硬體埠 (Target Hardware Port)</label>
              <input
                type="text"
                value={billPrinter.usbPort || 'LPT1:'}
                onChange={(e) => setBillPrinter({ ...billPrinter, usbPort: e.target.value })}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                placeholder="例如: LPT1: 或 COM1"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestBridgeOpenDrawer}
                  disabled={posBridgeTesting}
                  className="flex-1 py-2 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 border border-rose-500/30 text-rose-300 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Unlock size={12} className="text-rose-400" />
                  <span>⚡ 測試開錢箱</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestBridgePrintLPT1}
                  disabled={posBridgeTesting}
                  className="flex-1 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 active:scale-95 border border-cyan-500/30 text-cyan-300 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Printer size={12} className="text-cyan-400" />
                  <span>🖨️ 測試 LPT1 出單</span>
                </button>
              </div>
            </div>
          </div>

          {posBridgeTestResult && (
            <div className={`p-2.5 rounded-lg border text-xs font-mono transition animate-fadeIn ${
              posBridgeTestResult.startsWith('✓')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {posBridgeTestResult}
            </div>
          )}

          {!posBridgeStatus.online && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300/90 leading-relaxed">
              💡 <strong>小提示</strong>：若要在本機 Windows 點餐機控制 LPT1: 熱感應印表機與收銀抽屜，請至 <code className="text-white bg-black/60 px-1 py-0.5 rounded font-mono">LOCAL-PRINTER-POS-BRIDGE</code> 目錄下啟動 <code className="text-white bg-black/60 px-1 py-0.5 rounded font-mono">pos_bridge.exe</code>（或執行 <code className="text-white bg-black/60 px-1 py-0.5 rounded font-mono">python pos_bridge.py</code>），服務將自動常駐於 <code className="text-cyan-300 font-mono">127.0.0.1:8060</code>。
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. KDS Kitchen Printer config */}
          <div className="bg-black/40 border border-[#E5B453]/20 p-4 rounded-xl space-y-4">
            <span className="text-xs text-[#E5B453] font-extrabold block uppercase tracking-wider">🍳 廚房 KDS 工作票印表機</span>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">連接方式 Connection Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['USB', 'IP', 'LPT'].map(type => (
                    <button
                      key={`kit-conn-${type}`}
                      type="button"
                      onClick={() => setKitchenPrinter({ ...kitchenPrinter, connectionType: type as any })}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer text-xs ${
                        kitchenPrinter.connectionType === type
                          ? 'bg-[#E5B453]/20 border-[#E5B453] text-[#E5B453]'
                          : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      {type === 'USB' ? '🔌 USB' : type === 'IP' ? '🌐 網路 IP' : '🖨️ LPT 埠'}
                    </button>
                  ))}
                </div>
              </div>

              {kitchenPrinter.connectionType === 'IP' ? (
                <div>
                  <label className="text-zinc-400 block mb-1">印表機固定 IP 位址</label>
                  <input
                    type="text"
                    value={kitchenPrinter.ip}
                    onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, ip: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: 192.168.1.101"
                  />
                </div>
              ) : kitchenPrinter.connectionType === 'LPT' ? (
                <div>
                  <label className="text-zinc-400 block mb-1">Parallel LPT 埠位置 (LPT1, LPT2...)</label>
                  <input
                    type="text"
                    value={kitchenPrinter.usbPort}
                    onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, usbPort: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: LPT1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-zinc-400 block mb-1">USB 埠位置 USB Port (ComPath)</label>
                  <input
                    type="text"
                    value={kitchenPrinter.usbPort}
                    onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, usbPort: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: USB001, /dev/usb/lp0"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1">紙張出單寬度 Width Specs</label>
                <div className="grid grid-cols-2 gap-2">
                  {['58mm', '80mm'].map(w => (
                    <button
                      key={`kit-w-${w}`}
                      type="button"
                      onClick={() => setKitchenPrinter({ ...kitchenPrinter, width: w as any, fontSizeFactor: w === '58mm' ? 0.8 : 1.0 })}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                        kitchenPrinter.width === w
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      {w} {w === '58mm' ? '(縮放 0.8x)' : '(標準 1.0x)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">出單字體縮放比例 Font Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={kitchenPrinter.fontSizeFactor}
                  onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, fontSizeFactor: parseFloat(e.target.value) })}
                  className="w-full accent-[#E5B453]"
                />
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1">
                  <span>最小(0.5x)</span>
                  <span className="text-[#E5B453] font-bold">當前: {kitchenPrinter.fontSizeFactor}x</span>
                  <span>最大(2.0x)</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">自訂列印抬頭 (廚房名稱)</label>
                <input
                  type="text"
                  value={kitchenPrinter.restaurantName}
                  onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, restaurantName: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">表頭自訂引言 Pre-title Message</label>
                <input
                  type="text"
                  value={kitchenPrinter.headerPrefix}
                  onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, headerPrefix: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">表尾注意事項 Footer Warning</label>
                <input
                  type="text"
                  value={kitchenPrinter.footerSuffix}
                  onChange={(e) => setKitchenPrinter({ ...kitchenPrinter, footerSuffix: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintConfirmData({
                      title: `🍳 KDS 廚房印表機測試列印 (${kitchenPrinter.restaurantName})`,
                      ip: kitchenPrinter.ip || '192.168.123.100',
                      onConfirm: async () => {
                        if (onPrintTestPage) {
                          try {
                            const res = await onPrintTestPage('kitchen', { kitchen: kitchenPrinter, bill: billPrinter });
                            if (res.success) {
                              alert(`✓ 🍳 廚房測試列印請求已成功送出！\n${res.message || ''}`);
                            } else {
                              alert(`⚠️ 列印失敗:\n${res.error || '無法存取設備，請確認本機 POS 橋接器 (127.0.0.1:8060) 或印表機 IP 連線'}`);
                            }
                          } catch (_err) {
                            alert('⚠️ 列印失敗，連線異常');
                          }
                        } else {
                          alert('✓ 🍳 廚房測試列印頁已成功產生！');
                        }
                      }
                    });
                  }}
                  className="w-full py-2 bg-[#E5B453]/10 hover:bg-[#E5B453]/20 active:scale-95 border border-[#E5B453]/30 text-amber-300 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={12} className="text-amber-400 animate-pulse" />
                  <span>發送 KDS 測試頁 Test KDS Page</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Front Receipt/Bill Printer config */}
          <div className="bg-black/40 border border-blue-500/20 p-4 rounded-xl space-y-4">
            <span className="text-xs text-blue-400 font-extrabold block uppercase tracking-wider">🧾 前台帳單與收銀明細印表機</span>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">連接方式 Connection Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['USB', 'IP', 'LPT'].map(type => (
                    <button
                      key={`bill-conn-${type}`}
                      type="button"
                      onClick={() => setBillPrinter({ ...billPrinter, connectionType: type as any })}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer text-xs ${
                        billPrinter.connectionType === type
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                          : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      {type === 'USB' ? '🔌 USB' : type === 'IP' ? '🌐 網路 IP' : '🖨️ LPT 埠'}
                    </button>
                  ))}
                </div>
              </div>

              {billPrinter.connectionType === 'IP' ? (
                <div>
                  <label className="text-zinc-400 block mb-1">印表機固定 IP 位址</label>
                  <input
                    type="text"
                    value={billPrinter.ip}
                    onChange={(e) => setBillPrinter({ ...billPrinter, ip: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: 192.168.1.102"
                  />
                </div>
              ) : billPrinter.connectionType === 'LPT' ? (
                <div>
                  <label className="text-zinc-400 block mb-1">Parallel LPT 埠位置 (LPT1, LPT2...)</label>
                  <input
                    type="text"
                    value={billPrinter.usbPort}
                    onChange={(e) => setBillPrinter({ ...billPrinter, usbPort: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: LPT1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-zinc-400 block mb-1">USB 埠位置 USB Port (ComPath)</label>
                  <input
                    type="text"
                    value={billPrinter.usbPort}
                    onChange={(e) => setBillPrinter({ ...billPrinter, usbPort: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                    placeholder="例如: USB002, /dev/usb/lp1"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1">紙張出單寬度 Width Specs</label>
                <div className="grid grid-cols-2 gap-2">
                  {['58mm', '80mm'].map(w => (
                    <button
                      key={`bill-w-${w}`}
                      type="button"
                      onClick={() => setBillPrinter({ ...billPrinter, width: w as any, fontSizeFactor: w === '58mm' ? 0.8 : 1.0 })}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                        billPrinter.width === w
                          ? 'bg-blue-400/20 border-blue-400 text-blue-300'
                          : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      {w} {w === '58mm' ? '(縮放 0.8x)' : '(標準 1.0x)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">出單字體縮放比例 Font Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={billPrinter.fontSizeFactor}
                  onChange={(e) => setBillPrinter({ ...billPrinter, fontSizeFactor: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-1">
                  <span>最小(0.5x)</span>
                  <span className="text-blue-400 font-bold">當前: {billPrinter.fontSizeFactor}x</span>
                  <span>最大(2.0x)</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">抬頭餐廳名稱 Restaurant Name</label>
                <input
                  type="text"
                  value={billPrinter.restaurantName}
                  onChange={(e) => setBillPrinter({ ...billPrinter, restaurantName: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">電話 Tel</label>
                  <input
                    type="text"
                    value={billPrinter.printTelephone}
                    onChange={(e) => setBillPrinter({ ...billPrinter, printTelephone: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">開啟出單時間戳</label>
                  <div className="flex items-center h-9 pl-1">
                    <input
                      type="checkbox"
                      id="bill-checkbox-time"
                      checked={billPrinter.printTimeEnabled}
                      onChange={(e) => setBillPrinter({ ...billPrinter, printTimeEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-500 bg-[#161616] border-white/10 rounded focus:ring-0"
                    />
                    <label htmlFor="bill-checkbox-time" className="text-[11px] text-zinc-300 ml-2 cursor-pointer font-bold">列印時標記精確時間</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">列印餐廳地址 Address</label>
                <input
                  type="text"
                  value={billPrinter.printAddress}
                  onChange={(e) => setBillPrinter({ ...billPrinter, printAddress: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-sans text-[11px]"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">表頭促銷首語 Header Slogan</label>
                <input
                  type="text"
                  value={billPrinter.headerPrefix}
                  onChange={(e) => setBillPrinter({ ...billPrinter, headerPrefix: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">副聯結尾致謝辭 Thank You Message</label>
                <input
                  type="text"
                  value={billPrinter.footerSuffix}
                  onChange={(e) => setBillPrinter({ ...billPrinter, footerSuffix: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              {/* 現金收銀抽屜連動設定 Cash Drawer Interlock Setup */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400">🔓</span>
                    <span className="font-bold text-xs text-white">連動開啟現金收銀抽屜 Interlock Drawer</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billPrinter.cashDrawerEnabled}
                      onChange={(e) => setBillPrinter({ ...billPrinter, cashDrawerEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {billPrinter.cashDrawerEnabled && (
                  <div className="space-y-3 pt-2 border-t border-white/5 text-[11px] animate-fadeIn">
                    <div>
                      <label className="text-zinc-400 block mb-1">硬體驅動連動技術 Driver Layer</label>
                      <select
                        value={billPrinter.cashDrawerDriver}
                        onChange={(e) => setBillPrinter({ ...billPrinter, cashDrawerDriver: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-sans"
                      >
                        <option value="OPOS">UPOS / OPOS 控制驅動標準 (EPSON/Star 零售大廠標準)</option>
                        <option value="POS_NET">POS for .NET 類別庫 (Microsoft 點對點標準)</option>
                        <option value="ESC_POS_RAW">ESC/POS 直通 RAW 指令 (winspool.drv / 脈衝指令)</option>
                      </select>
                    </div>

                    {(billPrinter.cashDrawerDriver === 'OPOS' || billPrinter.cashDrawerDriver === 'POS_NET') && (
                      <div>
                        <label className="text-zinc-400 block mb-1">OPOS 宣告之設備編號 (Logical Device Name / ID)</label>
                        <input
                          type="text"
                          value={billPrinter.cashDrawerOposName}
                          onChange={(e) => setBillPrinter({ ...billPrinter, cashDrawerOposName: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                          placeholder="例如: CashDrawer1, Epson_Drawer_Pin2"
                        />
                      </div>
                    )}

                    {billPrinter.cashDrawerDriver === 'ESC_POS_RAW' && (
                      <div>
                        <label className="text-zinc-400 block mb-1">ESC/POS 脈衝開鎖指令 (HEX 16進制碼)</label>
                        <input
                          type="text"
                          value={billPrinter.cashDrawerEscPosCommand}
                          onChange={(e) => setBillPrinter({ ...billPrinter, cashDrawerEscPosCommand: e.target.value.toUpperCase().replace(/\s/g, '') })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white font-mono"
                          placeholder="例如: 1B700019FA"
                        />
                        <div className="flex gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() => setBillPrinter({ ...billPrinter, cashDrawerEscPosCommand: '1B700019FA' })}
                            className={`px-2 py-1 rounded text-[10px] border transition ${
                              billPrinter.cashDrawerEscPosCommand === '1B700019FA'
                                ? 'bg-rose-500/25 border-rose-500/50 text-rose-300'
                                : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            引腳 2 預設 (1B 70 00 19 FA)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillPrinter({ ...billPrinter, cashDrawerEscPosCommand: '1B700119FA' })}
                            className={`px-2 py-1 rounded text-[10px] border transition ${
                              billPrinter.cashDrawerEscPosCommand === '1B700119FA'
                                ? 'bg-rose-500/25 border-rose-500/50 text-rose-300'
                                : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            引腳 5 預設 (1B 70 01 19 FA)
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={handleManualOpenDrawer}
                        className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/30 text-rose-300 font-extrabold rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Unlock size={10} className="text-rose-400" />
                        <span>測試開啟現金抽屜 (Direct Open Test)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintConfirmData({
                      title: `🧾 前台收銀印表機測試列印 (${billPrinter.restaurantName})`,
                      ip: billPrinter.connectionType === 'IP' ? (billPrinter.ip || '192.168.1.102') : (billPrinter.usbPort || 'LPT1:'),
                      onConfirm: async () => {
                        if (onPrintTestPage) {
                          try {
                            const res = await onPrintTestPage('bill', { kitchen: kitchenPrinter, bill: billPrinter });
                            if (res.success) {
                              alert(`✓ 🧾 前台收銀測試列印請求已成功送出！\n${res.message || ''}`);
                            } else {
                              alert(`⚠️ 列印失敗:\n${res.error || '無法存取設備，請確認本機 POS 橋接器 (127.0.0.1:8060) 或 LPT 埠口連線'}`);
                            }
                          } catch (_err) {
                            alert('⚠️ 列印失敗，連線異常');
                          }
                        } else {
                          alert('✓ 🧾 前台收銀測試列印頁已成功產生！');
                        }
                      }
                    });
                  }}
                  className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 border border-blue-500/30 text-blue-300 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={12} className="text-blue-400 animate-pulse" />
                  <span>發送前台測試頁 Test Cashier Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex gap-2">
          <button
            type="button"
            onClick={handleSavePrinters}
            className="flex-1 py-3 bg-[#E5B453] hover:bg-amber-400 text-black font-black rounded-lg text-xs tracking-wider transition active:scale-95 cursor-pointer text-center"
          >
            💾 儲存並同步雙模組印表機設定 Store Printer Profiles
          </button>
        </div>
      </div>

      {/* Real-time Virtual Printer Buffer & History Logs */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/5 gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 text-base">📄</span>
            <div>
              <h5 className="font-bold text-sm text-white">虛擬熱感印表即時快取管線 (Live Virtual Receipt Spool & Buffer)</h5>
              <p className="text-zinc-500 text-[10px]">所有拋送至本機 9100 通訊埠的餐廳交代票與結帳收據，皆會同步寫入此高可靠即時緩衝區。</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!printLogs || printLogs.length === 0) {
                  alert('⚠️ 目前尚無任何虛擬出單記錄可供匯出！ There is no virtual print history to export.');
                  return;
                }
                
                // CSV Generation logic with headers or content lines
                const headers = ['Index', 'Type', 'Timestamp', 'Header/Table', 'Details Summary', 'Raw Ticket Text'];
                
                const rows = printLogs.map((log, index) => {
                  const rawContent = log.content || '';
                  const cleanContent = rawContent.replace(/"/g, '""');
                  const lines = rawContent.split('\n');
                  let tableMark = 'N/A';
                  let descriptionStr = '';
                  
                  lines.forEach((line: string) => {
                    if (line.includes('桌號/標記') || line.includes('Table')) {
                      const parts = line.split(':');
                      tableMark = parts[1] ? parts[1].trim() : '';
                    }
                  });
                  
                  // Summarize items for high level description
                  const itemsArr: string[] = [];
                  lines.forEach((line: string) => {
                    if (line.includes('[ ]') || line.trim().startsWith('•') || line.includes('x')) {
                      const trimmedLine = line.replace(/\[\s*\]/g, '').trim();
                      if (trimmedLine.length > 0 && !trimmedLine.includes('======') && !trimmedLine.includes('------')) {
                        itemsArr.push(trimmedLine);
                      }
                    }
                  });
                  descriptionStr = itemsArr.join(' | ');

                  return [
                    index + 1,
                    log.type === 'kitchen' ? 'KITCHEN_WORK_TICKET' : 'CUSTOMER_CHECKOUT_RECEIPT',
                    log.timestamp || '',
                    tableMark,
                    descriptionStr ? `"${descriptionStr.replace(/"/g, '""')}"` : 'N/A',
                    `"${cleanContent}"`
                  ];
                });

                const csvContent = [
                  headers.join(','),
                  ...rows.map(row => row.join(','))
                ].join('\n');

                // Force UTF-8 BOM so Excel opens Chinese text correctly
                const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `Sabay_Manager_Print_Export_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('🎉 包含中英雙語客製化字元之歷史熱感出單 CSV 已成功產生並下載！');
              }}
              className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[#E5B453] border border-[#E5B453]/20 hover:border-[#E5B453]/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="匯出歷史虛擬出單 CSV Excel 報表"
            >
              <Download size={13} className="text-[#E5B453]" />
              <span>匯出 CSV 報表 Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setConfirmActionModal({
                  isOpen: true,
                  title: '🗑️ 清空出單列印緩衝快取確定',
                  message: '您確定要永久清空實體 / 虛擬收發出單機所有的出單列印日誌與緩衝快取資料嗎？此操作將永久移除歷史單據紀錄，且無法復原。',
                  actionLabel: '確定清空 Clear Buffer',
                  onConfirm: async () => {
                    try {
                      const res = await apiFetch('/api/print-logs/clear', { method: 'POST' });
                      if (res.ok) {
                        fetchPrintLogs();
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  },
                });
              }}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
              title="清空緩衝區"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {printLogs.length === 0 ? (
          <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5 space-y-2">
            <Printer size={24} className="mx-auto text-zinc-600 animate-pulse" />
            <p className="text-xs text-zinc-500">緩衝通道閒置中，今日尚無列印交單 Spool empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto scrollbar-thin p-1">
            {printLogs.slice().reverse().map((log: any, idx: number) => (
              <div key={log.id || `${log.timestamp}-${log.type}-${idx}`} className="bg-black/45 border border-white/10 rounded-xl p-3.5 space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[8.5px] font-black tracking-widest px-1.5 py-0.5 rounded font-mono uppercase ${
                      log.type === 'kitchen' ? 'bg-amber-500/10 text-amber-300 border border-[#E5B453]/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    }`}>
                      {log.type === 'kitchen' ? 'KITCHEN' : 'BILL/BILLING'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">{log.timestamp}</span>
                  </div>
                  <pre className="text-[9px] font-mono leading-tight whitespace-pre-wrap text-zinc-300/90 max-h-[140px] overflow-y-auto select-text scrollbar-thin py-1 bg-black/25 px-2 rounded-lg border border-white/5">
                    {log.content}
                  </pre>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8.5px] text-zinc-500 font-sans">
                  <span>SABAY CORE_V1.2</span>
                  <span className="text-emerald-400 font-bold font-mono">🟢 OK (V_9100)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
