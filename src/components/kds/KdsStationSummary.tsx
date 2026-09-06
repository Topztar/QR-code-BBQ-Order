import React, { useState } from 'react';
import { MenuItem, Category, Ingredient, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { InlineRetryMessage } from '../InlineRetryMessage';
import {
  Settings,
  X,
  AlertTriangle,
  Printer,
  Edit,
  RefreshCw,
  Download,
  Trash2,
  Wifi,
} from 'lucide-react';

export interface KdsStationSummaryProps {
  servicePaused: boolean;
  onToggleServicePause?: (paused: boolean) => Promise<void> | void;
  categories: Category[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  currentLang: Language;
  onToggleMenuItemAvailability?: (id: string) => Promise<void>;
  onAdjustIngredientStock?: (
    ingredientId: string,
    quantityChanged: number,
    note: string
  ) => Promise<void>;
  printerIp: string;
  onUpdatePrinterIp: (ip: string) => Promise<{ success: boolean; error?: string }>;
  pingState: { reachable: boolean; loading: boolean; error?: string | null; lastChecked?: string; skipped?: boolean };
  triggerPrinterPing: (ip: string) => Promise<void>;
  handleRetryPing: () => Promise<void>;
  handleSkipPing: () => void;
  printLogs: any[];
  onClearPrintLogs: () => void;
  onPrintTestPage: (type?: any, customSettings?: any) => Promise<any>;
  setPrintConfirmData: (data: any) => void;
}

export const KdsStationSummary: React.FC<KdsStationSummaryProps> = React.memo(({
  servicePaused,
  onToggleServicePause,
  categories,
  menuItems,
  ingredients,
  currentLang,
  onToggleMenuItemAvailability,
  onAdjustIngredientStock,
  printerIp,
  onUpdatePrinterIp,
  pingState,
  triggerPrinterPing,
  handleRetryPing,
  handleSkipPing,
  printLogs,
  onClearPrintLogs,
  onPrintTestPage,
  setPrintConfirmData,
}) => {
  const [kdsActiveTab, setKdsActiveTab] = useState<'menu' | 'ingredients'>('menu');
  const [kdsSelectedCategory, setKdsSelectedCategory] = useState('all');
  const [kdsMenuSearch, setKdsMenuSearch] = useState('');
  const [togglingMenuId, setTogglingMenuId] = useState<string | null>(null);
  const [adjustingIngredientId, setAdjustingIngredientId] = useState<string | null>(null);
  const [ingredientManualQty, setIngredientManualQty] = useState<Record<string, string>>({});

  const [isEditingIp, setIsEditingIp] = useState(false);
  const [ipInput, setIpInput] = useState(printerIp);
  const [printerError, setPrinterError] = useState<string | null>(null);
  const [printerSuccess, setPrinterSuccess] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  return (
    <div className="space-y-4 font-sans">
      {/* Emergency Control */}
      <div
        className="bg-[#161616] border border-orange-500/20 rounded-xl p-5 space-y-4 font-sans text-left"
        id="kds-emergency-control"
      >
        <div className="border-b border-orange-500/10 pb-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-orange-400 tracking-widest block uppercase font-sans">
              緊急狀態與客流量控制 Emergency Control
            </span>
            <h4 className="font-bold text-sm mt-0.5 text-white font-serif">
              廚房「暫停接單」機制 Service Pause Toggle
            </h4>
          </div>
          <div
            className={`p-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              servicePaused
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {servicePaused ? '🔴 暫停服務中 (Paused)' : '🟢 正常接單中 (Normal)'}
          </div>
        </div>

        <div className="space-y-3.5 text-xs font-sans">
          <p className="text-[11px] text-zinc-400 leading-normal">
            當店內排隊或現場單量過大、廚房人力飽和時，一鍵啟用暫停接單機制。啟用後：
          </p>
          <ul className="list-disc pl-4 text-[10.5px] text-zinc-400 space-y-1.5 leading-relaxed">
            <li>
              顧客點餐首頁將<strong>即時彈出橙紅色警示橫幅</strong>，通知廚房正在全力消化訂單中。
            </li>
            <li>
              <strong>鎖定「送出訂單」功能</strong>，但顧客仍可自由流覽餐點與加點歷史。
            </li>
            <li>
              系統會自動將狀態<strong>推播至前台通知欄</strong>。
            </li>
          </ul>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onToggleServicePause && onToggleServicePause(!servicePaused)}
              className={`w-full py-2.5 rounded-lg font-extrabold text-[12px] shadow-md tracking-wider transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                servicePaused
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/20'
                  : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-rose-950/20'
              }`}
            >
              <span>
                {servicePaused
                  ? '⚡ 恢復正常營運接單 (Resume Service)'
                  : '🛑 啟動廚房「暫停接單」 (Pause Service)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KDS Operations: Menu & Inventory Controller Card */}
      <div
        className="bg-[#161616] border border-white/10 text-white rounded-xl p-5 shadow-lg space-y-4"
        id="kds-quick-controller-card"
      >
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="text-[#E5B453] shrink-0 font-bold animate-spin-slow" size={18} />
            <div className="text-left font-sans">
              <span className="text-[10px] text-[#E5B453] font-bold block uppercase tracking-widest">
                KDS Operations
              </span>
              <span className="text-xs font-black text-white">即時營運及供應鏈控制</span>
            </div>
          </div>
          <div className="flex bg-black/45 p-0.5 rounded-lg border border-white/5 font-sans">
            <button
              type="button"
              onClick={() => setKdsActiveTab('menu')}
              className={`px-2 py-1 rounded text-[10px] font-black transition cursor-pointer select-none active:scale-95 ${
                kdsActiveTab === 'menu'
                  ? 'bg-[#E5B453] text-[#0F0F0F]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              品項沽清
            </button>
            <button
              type="button"
              onClick={() => setKdsActiveTab('ingredients')}
              className={`px-2 py-1 rounded text-[10px] font-black transition cursor-pointer select-none active:scale-95 ${
                kdsActiveTab === 'ingredients'
                  ? 'bg-[#E5B453] text-[#0F0F0F]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              即時庫存
            </button>
          </div>
        </div>

        {kdsActiveTab === 'menu' ? (
          <div className="space-y-3.5 font-sans">
            <div className="flex gap-1.5 flex-col">
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setKdsSelectedCategory('all')}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold transition border cursor-pointer select-none active:scale-95 ${
                    kdsSelectedCategory === 'all'
                      ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/40'
                      : 'bg-transparent text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  全部品項
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setKdsSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold transition border cursor-pointer select-none active:scale-95 ${
                      kdsSelectedCategory === cat.id
                        ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/40'
                        : 'bg-transparent text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {getLocalizedText(cat.name, currentLang) || cat.id}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={kdsMenuSearch}
                  onChange={(e) => setKdsMenuSearch(e.target.value)}
                  placeholder="搜尋大廚備料 / 菜名..."
                  className="w-full bg-black/45 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-[#E5B453]/60 pr-7"
                />
                {kdsMenuSearch && (
                  <button
                    type="button"
                    onClick={() => setKdsMenuSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {menuItems
                .filter((item) => {
                  const matchesCategory =
                    kdsSelectedCategory === 'all' || item.category === kdsSelectedCategory;
                  const matchesSearch =
                    !kdsMenuSearch ||
                    getLocalizedText(item.name, 'zh')
                      .toLowerCase()
                      .includes(kdsMenuSearch.toLowerCase()) ||
                    (getLocalizedText(item.name, 'en') &&
                      getLocalizedText(item.name, 'en')
                        .toLowerCase()
                        .includes(kdsMenuSearch.toLowerCase()));
                  return matchesCategory && matchesSearch;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-black/25 hover:bg-black/45 border border-white/5 flex items-center justify-between text-xs transition"
                  >
                    <div className="text-left flex-1 min-w-0 mr-2">
                      <p className="font-bold text-white truncate text-[11px]">
                        {getLocalizedText(item.name, 'zh')}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-mono truncate">ID: {item.id}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                          item.available
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.available ? '販售' : '沽清'}
                      </span>
                      {onToggleMenuItemAvailability && (
                        <button
                          type="button"
                          disabled={togglingMenuId === item.id}
                          onClick={async () => {
                            try {
                              setTogglingMenuId(item.id);
                              await onToggleMenuItemAvailability(item.id);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setTogglingMenuId(null);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-bold border transition select-none active:scale-95 disabled:opacity-50 cursor-pointer ${
                            item.available
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25'
                          }`}
                        >
                          {item.available ? '下架' : '上架'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 font-sans">
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {ingredients.map((ig) => {
                const isWarning = ig.stock <= ig.minThreshold;
                const manualVal = ingredientManualQty[ig.id] ?? '';
                return (
                  <div
                    key={ig.id}
                    className={`p-2 rounded-lg bg-black/25 border flex flex-col space-y-2 text-xs transition ${
                      isWarning ? 'border-rose-500/20 bg-rose-500/5' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left min-w-0">
                        <p className="font-bold text-white text-[11px] flex items-center gap-1">
                          <span>{getLocalizedText(ig.name, 'zh')}</span>
                          {isWarning && (
                            <span className="text-[9px] text-rose-400 font-extrabold flex items-center gap-0.5 shrink-0 bg-rose-500/10 px-1 rounded border border-rose-500/15">
                              <AlertTriangle size={9} />
                              告警
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-mono">
                          剩餘:{' '}
                          <b
                            className={`font-semibold ${
                              isWarning ? 'text-rose-400' : 'text-zinc-300'
                            }`}
                          >
                            {ig.stock}
                          </b>{' '}
                          {ig.unit} / 門檻: {ig.minThreshold}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 items-center justify-between">
                      <div className="flex items-center space-x-1 shrink-0 font-mono">
                        <button
                          type="button"
                          disabled={adjustingIngredientId === ig.id}
                          onClick={async () => {
                            if (onAdjustIngredientStock) {
                              setAdjustingIngredientId(ig.id);
                              await onAdjustIngredientStock(ig.id, -10, 'KDS螢幕快捷調減 -10');
                              setAdjustingIngredientId(null);
                            }
                          }}
                          className="bg-zinc-800 hover:bg-zinc-750 text-white/90 text-[10px] w-7 h-6 rounded flex items-center justify-center font-bold transition select-none active:scale-90 cursor-pointer disabled:opacity-40"
                        >
                          -10
                        </button>
                        <button
                          type="button"
                          disabled={adjustingIngredientId === ig.id}
                          onClick={async () => {
                            if (onAdjustIngredientStock) {
                              setAdjustingIngredientId(ig.id);
                              await onAdjustIngredientStock(ig.id, -1, 'KDS螢幕快捷調減 -1');
                              setAdjustingIngredientId(null);
                            }
                          }}
                          className="bg-zinc-800 hover:bg-zinc-750 text-white/90 text-[10px] w-6 h-6 rounded flex items-center justify-center font-bold transition select-none active:scale-90 cursor-pointer disabled:opacity-40"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          disabled={adjustingIngredientId === ig.id}
                          onClick={async () => {
                            if (onAdjustIngredientStock) {
                              setAdjustingIngredientId(ig.id);
                              await onAdjustIngredientStock(ig.id, 1, 'KDS螢幕快捷調增 +1');
                              setAdjustingIngredientId(null);
                            }
                          }}
                          className="bg-zinc-850 hover:bg-zinc-800 text-[#E5B453] text-[10px] w-6 h-6 rounded flex items-center justify-center font-bold transition select-none active:scale-90 cursor-pointer disabled:opacity-40"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          disabled={adjustingIngredientId === ig.id}
                          onClick={async () => {
                            if (onAdjustIngredientStock) {
                              setAdjustingIngredientId(ig.id);
                              await onAdjustIngredientStock(ig.id, 10, 'KDS螢幕快捷調增 +10');
                              setAdjustingIngredientId(null);
                            }
                          }}
                          className="bg-zinc-850 hover:bg-zinc-800 text-[#E5B453] text-[10px] w-7 h-6 rounded flex items-center justify-center font-bold transition select-none active:scale-90 cursor-pointer disabled:opacity-40"
                        >
                          +10
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 flex-1 max-w-[105px]">
                        <input
                          type="text"
                          value={manualVal}
                          onChange={(e) =>
                            setIngredientManualQty({
                              ...ingredientManualQty,
                              [ig.id]: e.target.value,
                            })
                          }
                          placeholder="自訂"
                          className="bg-black/65 border border-white/10 text-white font-mono text-[10px] rounded px-1.5 py-1 w-full text-center focus:outline-none focus:border-[#E5B453]"
                        />
                        <button
                          type="button"
                          disabled={adjustingIngredientId === ig.id || !manualVal}
                          onClick={async () => {
                            const parsed = parseFloat(manualVal);
                            if (isNaN(parsed)) return;
                            if (onAdjustIngredientStock) {
                              setAdjustingIngredientId(ig.id);
                              await onAdjustIngredientStock(
                                ig.id,
                                parsed,
                                `KDS螢幕自訂異動盤庫 (${parsed > 0 ? '+' : ''}${parsed})`
                              );
                              setIngredientManualQty({ ...ingredientManualQty, [ig.id]: '' });
                              setAdjustingIngredientId(null);
                            }
                          }}
                          className="bg-[#E5B453] hover:bg-amber-400 text-black font-black text-[9px] w-7 h-6 rounded flex items-center justify-center transition active:scale-[0.85] disabled:opacity-40 cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LAN Receipt Printer Simulator Terminal */}
      <div className="bg-[#161616] border border-white/10 text-white rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 flex-1 mr-2">
            <Printer className="text-[#E5B453] shrink-0 font-bold" size={18} />
            <div className="text-left w-full">
              <span className="text-[10px] text-white/40 block font-mono">LAN BILL PRINTER</span>
              {isEditingIp ? (
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <input
                    type="text"
                    className="bg-black border border-white/20 text-white font-mono text-[11px] font-bold rounded px-1.5 py-0.5 w-28 focus:outline-none focus:border-[#E5B453]"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                  />
                  <button
                    onClick={async () => {
                      setPrinterError(null);
                      setPrinterSuccess(null);
                      const res = await onUpdatePrinterIp(ipInput);
                      if (res.success) {
                        setPrinterSuccess('位址設定成功！');
                        setIsEditingIp(false);
                      } else {
                        setPrinterError(res.error || '儲存失敗');
                      }
                    }}
                    className="bg-[#E5B453] text-[#0F0F0F] hover:bg-amber-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition active:scale-95"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => {
                      setIpInput(printerIp);
                      setIsEditingIp(false);
                    }}
                    className="bg-white/15 h-5 text-white/75 hover:bg-white/25 text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition active:scale-95"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-xs font-bold font-mono text-zinc-300">{printerIp}</span>
                    <button
                      onClick={() => setIsEditingIp(true)}
                      className="text-white/40 hover:text-[#E5B453] transition rounded p-0.5 cursor-pointer active:scale-95"
                      title="修改印表機位址"
                    >
                      <Edit size={11} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-0.5">
                    {pingState.loading ? (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-white/5 text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded font-bold">
                        <RefreshCw size={8} className="animate-spin text-zinc-400" />
                        偵測中...
                      </span>
                    ) : pingState.reachable ? (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold"
                        title={
                          pingState.lastChecked
                            ? `連線狀態: 本機與實體印表機連線正常 (最後偵測: ${pingState.lastChecked})`
                            : ''
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        在線 🟢
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-extrabold"
                        title={
                          pingState.error
                            ? `連線錯誤原因: ${pingState.error}`
                            : '無法通訊，請檢查網路配置、實體印表機電源及區域網路插口'
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        離線 🔴
                      </span>
                    )}

                    <button
                      onClick={() => triggerPrinterPing(printerIp)}
                      disabled={pingState.loading}
                      className="text-[9px] text-[#E5B453] hover:text-white bg-white/5 border border-white/5 px-1 py-0.5 rounded flex items-center gap-0.5 cursor-pointer hover:bg-white/10 transition active:scale-95 disabled:opacity-45"
                      title="立即重新測試與印表機的實體網路通訊"
                    >
                      <RefreshCw size={8} />
                      <span>測通</span>
                    </button>
                  </div>
                  {pingState.error && !pingState.skipped && (
                    <div className="w-full mt-1">
                      <InlineRetryMessage
                        message={`印表機連線失敗 (${pingState.error})`}
                        onRetry={handleRetryPing}
                        onSkip={handleSkipPing}
                        isRetrying={pingState.loading}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              id="export-print-logs-csv-btn"
              onClick={() => {
                if (!printLogs || printLogs.length === 0) {
                  alert('⚠️ 目前尚無任何虛擬出單記錄可供匯出！');
                  return;
                }

                const headers = [
                  'Index',
                  'Type',
                  'Timestamp',
                  'Header/Table',
                  'Details Summary',
                  'Raw Ticket Text',
                ];

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

                  const itemsArr: string[] = [];
                  lines.forEach((line: string) => {
                    if (
                      line.includes('[ ]') ||
                      line.trim().startsWith('•') ||
                      line.includes('x')
                    ) {
                      const trimmedLine = line.replace(/\[\s*\]/g, '').trim();
                      if (
                        trimmedLine.length > 0 &&
                        !trimmedLine.includes('======') &&
                        !trimmedLine.includes('------')
                      ) {
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
                  ...rows.map((row) => row.join(','))
                ].join('\n');

                const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
                  type: 'text/csv;charset=utf-8;',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute(
                  'download',
                  `Sabay_Thermal_Print_History_${new Date()
                    .toISOString()
                    .slice(0, 10)}_${new Date()
                    .toTimeString()
                    .slice(0, 5)
                    .replace(':', '')}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-white/45 hover:text-[#E5B453] p-1 rounded hover:bg-white/5 transition flex items-center gap-1 text-[10px] select-none font-bold shrink-0 cursor-pointer"
              title="匯出近期虛擬熱感印表記錄為 CSV 檔案 (Export Print Logs to CSV)"
            >
              <Download size={13} />
              <span className="hidden xl:inline">匯出 CSV</span>
            </button>

            <button
              id="clear-print-logs-btn"
              onClick={onClearPrintLogs}
              className="text-white/45 hover:text-red-400 p-1 rounded hover:bg-white/5 transition shrink-0 cursor-pointer"
              title="清除虛擬管線日誌 Clear Virtual Buffer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Print Test Action Card */}
        <div className="bg-black/25 rounded-lg border border-white/5 p-2.5 flex flex-col space-y-2 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-[10px] text-white/50 font-sans flex items-center space-x-1.5">
              <Wifi
                size={10}
                className={pingState.reachable ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}
              />
              <span className="font-mono">
                {pingState.reachable
                  ? `端點 ${printerIp}:9100 在線`
                  : `端點 ${printerIp}:9100 離線`}
              </span>
            </span>
            <button
              id="kitchen-print-test-btn"
              disabled={testLoading}
              onClick={() => {
                setPrintConfirmData({
                  title: '列印測試頁 Test Page',
                  ip: printerIp,
                  onConfirm: async () => {
                    setTestLoading(true);
                    setPrinterSuccess(null);
                    setPrinterError(null);
                    const res = await onPrintTestPage('kitchen');
                    setTestLoading(false);
                    if (res.success) {
                      setPrinterSuccess('列印測試頁成功發送！');
                    } else {
                      setPrinterError(res.error || '列印失敗');
                    }
                  },
                });
              }}
              className={`active:scale-95 border text-xs py-1 px-2.5 rounded transition flex items-center space-x-1 cursor-pointer disabled:opacity-45 font-bold ${
                pingState.reachable
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:text-emerald-300'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 hover:text-orange-400'
              }`}
            >
              {testLoading ? (
                <RefreshCw size={11} className="animate-spin text-white" />
              ) : (
                <Printer size={11} />
              )}
              <span>測試紙 Test Page</span>
            </button>
          </div>

          {printerSuccess && (
            <p className="text-[9.5px] text-emerald-400 font-sans font-bold">
              ✓ {printerSuccess}
            </p>
          )}
          {printerError && (
            <p className="text-[9.5px] text-rose-400 font-sans font-bold">
              ⚠️ {printerError}
            </p>
          )}
        </div>

        <div className="bg-black/40 text-[11px] font-mono p-3.5 rounded-xl overflow-y-auto max-h-[450px] space-y-4 border border-white/5 text-left scrollbar-thin">
          {printLogs.length === 0 ? (
            <div className="text-white/20 text-center py-16 space-y-2">
              <Printer size={25} className="mx-auto text-white/10" />
              <p className="text-xs">列印管線管道閒置中</p>
              <p className="text-[9px] text-white/30 leading-relaxed font-sans max-w-[200px] mx-auto">
                當點擊加入購物車或完成付款時，系統將模擬 LAN 熱感印表機出單拋送至此。
              </p>
            </div>
          ) : (
            printLogs.map((log, index) => (
              <div
                key={log.id || `${log.timestamp}-${index}`}
                className="bg-[#1C1C1C] text-white p-3.5 rounded-lg border border-white/10 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#E5B453] text-[#0F0F0F] text-[8px] font-black px-1.5 py-0.5 rounded-bl uppercase tracking-wider">
                  {log.type === 'kitchen' ? 'KITCHEN_TKT' : 'CLIENT_BILL'}
                </div>
                <div className="text-white/40 text-[9px] mb-2 font-sans flex justify-between">
                  <span>時間: {log.timestamp}</span>
                </div>
                <pre className="whitespace-pre font-mono leading-relaxed overflow-x-auto text-[9px] text-white/90">
                  {log.content}
                </pre>
                <div className="mt-3 border-t border-dashed border-white/10 pt-1 flex justify-between text-[8px] text-white/30 font-sans">
                  <span>sabay_boca_v1.2</span>
                  <span className="text-[#00C300]">100% 傳送正常</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
