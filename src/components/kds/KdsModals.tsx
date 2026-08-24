import React from 'react';
import { Order, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import {
  AlertTriangle,
  Clock,
  Timer,
  ChefHat,
  Check,
  Printer,
  X,
} from 'lucide-react';

export interface KdsQuickViewModalProps {
  quickViewOrder: Order | null;
  setQuickViewOrder: (order: Order | null) => void;
  currentLang: Language;
  t: (key: string) => string;
  getElapsedTime: (dateStr: string) => { mins: number; text: string; style: string };
  isCloseToClosing: (dateStr: string, operatingHours: any[]) => boolean;
  operatingHours?: any[];
  getTableOccupancyElapsedTime: (tableNumber: string) => any;
  orders: Order[];
  printerIp: string;
  setPrintConfirmData: (data: any) => void;
  handleItemStatusToggle: (
    orderId: string,
    itemId: string,
    isCompleted: boolean,
    isPrepared: boolean
  ) => void;
}

export const KdsQuickViewModal: React.FC<KdsQuickViewModalProps> = ({
  quickViewOrder,
  setQuickViewOrder,
  currentLang,
  t,
  getElapsedTime,
  isCloseToClosing,
  operatingHours = [],
  getTableOccupancyElapsedTime,
  orders,
  printerIp,
  setPrintConfirmData,
  handleItemStatusToggle,
}) => {
  if (!quickViewOrder) return null;

  const qvOcc = getTableOccupancyElapsedTime(quickViewOrder.tableNumber);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      id="kds-quick-view-modal"
    >
      <div className="w-full max-w-2xl bg-[#121212] border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left">
        {/* Modal Header */}
        <div
          className={`p-5 border-b border-white/10 flex items-center justify-between ${
            quickViewOrder.isFlagged ? 'bg-red-950/40' : 'bg-black/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="bg-[#E5B453] text-black font-mono font-black text-sm px-3 py-1 rounded-md">
              #{quickViewOrder.id}
            </span>
            <h3 className="text-lg font-bold text-white font-sans">
              {quickViewOrder.takeoutInfo ||
              quickViewOrder.tableNumber.includes('外帶') ||
              quickViewOrder.tableNumber === 'takeout'
                ? `單號: #${quickViewOrder.id}`
                : `${quickViewOrder.tableNumber} 桌`}{' '}
              餐點明細 (KDS Quick View)
            </h3>
            {quickViewOrder.isFlagged && (
              <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded animate-pulse select-none flex items-center gap-1">
                <AlertTriangle size={10} />
                <span>特別關注</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setQuickViewOrder(null)}
            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left scrollbar-thin">
          {/* Order Metadata Box */}
          <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs font-mono">
            <div>
              <p className="text-white/40">下單時間 Order Time</p>
              <p className="text-white font-bold text-sm mt-0.5">
                {new Date(quickViewOrder.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-white/40 font-bold">等候時間 Elapsed Time</p>
              <p
                className={`font-black text-sm mt-0.5 inline-flex items-center gap-1 ${
                  Math.floor(
                    (Date.now() - new Date(quickViewOrder.createdAt).getTime()) / 60000
                  ) > 30
                    ? 'text-red-500 font-extrabold animate-pulse'
                    : Math.floor(
                          (Date.now() - new Date(quickViewOrder.createdAt).getTime()) / 60000
                        ) > 15
                      ? 'text-yellow-400 font-bold animate-pulse'
                      : 'text-white'
                }`}
              >
                <Clock size={12} />
                {getElapsedTime(quickViewOrder.createdAt).text}
              </p>
            </div>
            {isCloseToClosing(quickViewOrder.createdAt, operatingHours) && (
              <div className="col-span-2 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-left text-xs font-sans animate-pulse">
                <p className="text-red-400 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-0.5" />
                  ⚠️ 即將關店，加速出餐 (Store closing soon)
                </p>
                <p className="text-red-400/80 font-medium text-[10px] mt-1">
                  此訂單於每日結業關閉前 30
                  分鐘內進入，請廚房人員縮短備餐流程，儘速完成出餐！
                </p>
              </div>
            )}
            {qvOcc && (
              <div className="col-span-2 bg-sky-500/5 border border-sky-500/15 p-3 rounded-lg text-left text-xs font-mono">
                <p className="text-sky-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Timer size={12} className="text-sky-450" />
                  {quickViewOrder.tableNumber.includes('外帶')
                    ? '顧客滯留總時間 Guest Wait Session'
                    : '桌況佔用總時間 Table Occupancy'}
                </p>
                <p className="text-white font-bold text-xs mt-1 flex flex-wrap items-center gap-1.5 leading-relaxed">
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-black font-mono ${qvOcc.style}`}
                  >
                    {qvOcc.text}
                  </span>
                  <span className="text-zinc-400 font-sans">
                    (自首筆點單於{' '}
                    {new Date(
                      orders.find((o) => o.id === qvOcc.oldestOrderId)?.createdAt || ''
                    ).toLocaleTimeString()}{' '}
                    送出起算，該桌目前共 {qvOcc.orderCount} 筆未完成點單)
                  </span>
                </p>
              </div>
            )}
            {quickViewOrder.quickNotes && (
              <div className="col-span-2 bg-[#E5B453]/5 border border-[#E5B453]/25 p-3 rounded-lg text-left">
                <p className="text-[#E5B453] font-bold text-[10px] uppercase tracking-wider">
                  KDS 快速備註 Quick Note
                </p>
                <p className="text-white font-black text-sm mt-1">
                  📝 {quickViewOrder.quickNotes}
                </p>
              </div>
            )}
            {quickViewOrder.isFlagged && quickViewOrder.flagReason && (
              <div className="col-span-2 bg-red-500/10 border-2 border-red-500/20 p-3 rounded-lg text-left animate-pulse">
                <p className="text-red-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={12} />
                  特別關注 Attention Required
                </p>
                <p className="text-white font-bold text-sm mt-1">
                  ⚠️ {quickViewOrder.flagReason}
                </p>
              </div>
            )}
          </div>

          {/* Items Breakdown list */}
          <div className="space-y-4">
            <h4 className="text-xs text-white/50 font-bold uppercase tracking-wider">
              餐點清單 Item Breakdown ({quickViewOrder.items.length})
            </h4>

            <div className="space-y-3">
              {quickViewOrder.items.map((it, idx) => {
                const spicinessText =
                  it.customization.spiciness === 1 ? t('spicy') : t('notSpicy');

                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4 space-y-3 transition ${
                      it.isCompleted
                        ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/30'
                        : 'bg-black/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className={it.isCompleted ? 'opacity-40 line-through' : ''}>
                        <span className="font-extrabold text-lg text-white block">
                          {getLocalizedText(it.name, currentLang)}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium block mt-0.5 font-mono">
                          {getLocalizedText(it.name, currentLang === 'zh' ? 'en' : 'zh')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-[#E5B453] text-[#0F0F0F] rounded-lg px-4 py-1.5 text-lg font-black font-mono">
                          x {it.qty} {t('qtyPortion')}
                        </span>

                        {!it.isCompleted && !it.isPrepared && (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemStatusToggle(quickViewOrder.id, it.id, false, true);
                            }}
                            className="h-10 px-3 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/10"
                            title="標示為已備餐 (Mark as Prepared)"
                          >
                            <ChefHat size={14} />
                            <span>{t('itemPreparedBtn')}</span>
                          </button>
                        )}

                        {!it.isCompleted && it.isPrepared && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleItemStatusToggle(quickViewOrder.id, it.id, false, false);
                              }}
                              className="h-10 px-2 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1 border cursor-pointer bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              title="點擊可取消已備餐狀態"
                            >
                              <ChefHat size={12} />
                              <span>{t('itemPreparedBtn')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleItemStatusToggle(quickViewOrder.id, it.id, true, true);
                              }}
                              className="h-10 px-3.5 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-[#1e1e1e] hover:bg-[#252525] text-emerald-400 hover:text-emerald-300 border-emerald-500/35 hover:border-emerald-500 shadow-black/20"
                              title="標示為製作完成 (Mark as Completed)"
                            >
                              <span>{t('itemMakeCompleteBtn')}</span>
                            </button>
                          </>
                        )}

                        {it.isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemStatusToggle(quickViewOrder.id, it.id, false, false);
                            }}
                            className="h-10 px-4 rounded-xl text-xs font-black transition-all duration-200 shadow-sm flex items-center justify-center gap-1 border cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-[#0F0F0F] border-emerald-400 shadow-emerald-500/10"
                            title="標示為未完成 (Mark as Pending)"
                          >
                            <Check size={14} className="stroke-[3]" />
                            <span>{t('itemCompletedBtn')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <div
                        className={`p-2.5 rounded-lg border text-xs ${
                          it.customization.spiciness === 0
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            : it.customization.spiciness >= 2
                              ? 'bg-red-500/10 border-red-500/30 text-red-400 font-black'
                              : 'bg-amber-500/10 border-amber-500/25 text-amber-400 font-bold'
                        }`}
                      >
                        <span className="text-[10px] text-zinc-500 font-bold block uppercase mb-1">
                          {t('spiciness')} Spiciness
                        </span>
                        <span className="text-xs">{spicinessText}</span>
                      </div>

                      {it.customization.noodleType && (
                        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                          <span className="text-[10px] text-zinc-500 font-bold block uppercase mb-1">
                            {t('noodleOption')} Noodle Type
                          </span>
                          <span className="font-extrabold">
                            {it.customization.noodleType === 'rice-noodle'
                              ? `🍜 ${t('riceNoodle')} (Rice Noodle)`
                              : it.customization.noodleType === 'vermicelli'
                                ? `🍜 ${t('vermicelli')} (Vermicelli)`
                                : t('noNoodle')}
                          </span>
                        </div>
                      )}

                      {it.customization.soupBase && (
                        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                          <span className="text-[10px] text-zinc-500 font-bold block uppercase mb-1">
                            {t('soupBaseLabel')} Soup Base
                          </span>
                          <span className="font-extrabold">
                            {it.customization.soupBase === 'coconut-milk'
                              ? `🥥 ${t('coconutMilkAdd')}`
                              : '冬蔭功 Tom Yum'}
                          </span>
                        </div>
                      )}

                      {it.customization.selectedAddOns &&
                        it.customization.selectedAddOns.length > 0 && (
                          <div className="col-span-1 sm:col-span-2 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg text-xs text-amber-300">
                            <span className="text-[10px] text-amber-500/70 font-bold block uppercase mb-1">
                              {t('addOnsLabel')} Add-ons
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {it.customization.selectedAddOns.map((addOn) => (
                                <span
                                  key={addOn.id}
                                  className="bg-amber-500/15 text-amber-250 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-xs"
                                >
                                  ＋ {getLocalizedText(addOn.name, 'zh')}
                                  {currentLang !== 'zh'
                                    ? ` / ${getLocalizedText(addOn.name, currentLang)}`
                                    : ''}{' '}
                                  x{addOn.qty || 1}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {it.customization.notes && (
                        <div className="col-span-1 sm:col-span-2 p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-red-400">
                          <span className="text-[10px] text-red-500/60 font-bold block uppercase mb-1">
                            📌 該品項特殊客製備註 Item Notes
                          </span>
                          <p className="font-extrabold text-sm">{it.customization.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-black/40 flex justify-between items-center gap-4">
          <span className="text-[10px] text-white/30 font-mono hidden sm:inline">
            Sabay Thai BBQ Kitchen System
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const specLines = quickViewOrder.items
                  .map((it) => {
                    const spec = [
                      it.customization.spiciness === 1 ? t('spicy') : t('notSpicy'),
                      it.customization.noodleType === 'rice-noodle'
                        ? t('riceNoodle')
                        : it.customization.noodleType === 'vermicelli'
                          ? t('vermicelli')
                          : '',
                      it.customization.soupBase === 'coconut-milk' ? t('coconutMilkAdd') : '',
                      it.customization.notes ? `${t('notesLabel')}: ${it.customization.notes}` : '',
                    ]
                      .filter(Boolean)
                      .join('/');
                    const itName = getLocalizedText(it.name, currentLang);
                    return `[ ] ${itName} x ${it.qty} ${t('qtyPortion')}\n    【 ${spec} 】`;
                  })
                  .join('\n');
                const ticketStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單)
       ${
         quickViewOrder.takeoutInfo ||
         quickViewOrder.tableNumber.includes('外帶') ||
         quickViewOrder.tableNumber === 'takeout'
           ? `單號/標記: #${quickViewOrder.id}`
           : `桌號/標記: ${quickViewOrder.tableNumber}`
       }
========================================
單號 ID: ${quickViewOrder.id}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${new Date(quickViewOrder.createdAt).toLocaleTimeString()}
狀態 STATE: ${quickViewOrder.status.toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* KDS TICKET PRINT PREVIEW GENERATED OK *
* 感謝廚房人員辛勞，請於出餐完畢時完成確認 *
========================================`.trim();
                setPrintConfirmData({
                  title: `驗證列印廚房交代票 #${quickViewOrder.id}`,
                  ip: printerIp,
                  receiptType: 'kitchen',
                  receiptBody: ticketStr,
                  onConfirm: () => {
                    alert(`🖨️ 虛擬網卡列印指令傳送正常！(單號: ${quickViewOrder.id})`);
                  },
                });
              }}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-[#E5B453]/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Printer size={13} className="text-[#E5B453]" />
              <span>列印廚房單 Print Ticket</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickViewOrder(null)}
              className="bg-zinc-800 hover:bg-zinc-750 text-white/85 border border-zinc-700 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              關閉 Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface KdsPrintConfirmModalProps {
  printConfirmData: any;
  setPrintConfirmData: (data: any) => void;
}

export const KdsPrintConfirmModal: React.FC<KdsPrintConfirmModalProps> = ({
  printConfirmData,
  setPrintConfirmData,
}) => {
  if (!printConfirmData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      id="print-confirmation-dialog-kds"
      onClick={() => setPrintConfirmData(null)}
    >
      <div
        className={`bg-[#121212] border border-white/10 rounded-2xl w-full ${
          printConfirmData.receiptBody ? 'max-w-2xl' : 'max-w-sm'
        } overflow-hidden shadow-2xl text-left transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
            <Printer size={14} className="text-amber-400" />
            <span>
              {printConfirmData.receiptBody ? '🖨️ 熱感出單預覽 Print Preview' : '確認執行列印任務？'}
            </span>
          </h3>
          <button
            type="button"
            onClick={() => setPrintConfirmData(null)}
            className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div
          className={`p-5 ${
            printConfirmData.receiptBody
              ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
              : 'space-y-4'
          }`}
        >
          <div className="space-y-4">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-zinc-500 text-[10px]">
                <span>任務名稱 Task</span>
                <span className="text-white/70 font-bold">{printConfirmData.title}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[10px]">
                <span>印表機 IP Address</span>
                <span className="text-amber-400 font-mono font-bold tracking-wider">
                  {printConfirmData.ip}
                </span>
              </div>
            </div>
            <p className="text-white/60 text-[11px] leading-relaxed">
              請確認您已與本機熱熱感印硬體連線至同一區域網路內（WiFi），並確認印表機開機且狀態正常。
            </p>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-[10px] space-y-1.5 font-mono text-amber-400/80">
              <span className="text-[9px] font-black tracking-widest text-[#E5B453] uppercase block">
                🟢 virtual queue live
              </span>
              <p>
                ✔ 出單格式:{' '}
                {printConfirmData.receiptType === 'kitchen'
                  ? '餐廳工作交代票 (Kitchen Ticket)'
                  : '前台客戶收據 (Billing Receipt)'}
              </p>
              <p>✔ 支援本機熱感寬度 80mm / 58mm</p>
            </div>
          </div>

          {printConfirmData.receiptBody && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block uppercase">
                📄 虛擬熱感列印預覽 Thermal Receipt Preview:
              </span>
              <div className="relative bg-[#FAF9F5] text-zinc-900 p-5 font-mono border-t-[8px] border-b-[8px] border-dashed border-zinc-300 shadow-inner rounded max-h-[280px] overflow-y-auto text-[9.5px] leading-normal select-text scrollbar-thin">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-zinc-200"></div>
                <pre className="whitespace-pre-wrap font-mono uppercase text-zinc-800 tracking-tight font-medium">
                  {printConfirmData.receiptBody}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 p-5 border-t border-white/5 bg-zinc-900/40 text-xs">
          <button
            type="button"
            onClick={() => setPrintConfirmData(null)}
            className="px-4 py-1.5 hover:bg-white/5 border border-white/10 rounded font-bold transition active:scale-95 cursor-pointer text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              printConfirmData.onConfirm();
              setPrintConfirmData(null);
            }}
            className="px-4 py-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 font-extrabold rounded transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
          >
            <Printer size={12} />
            <span>確定執行列印</span>
          </button>
        </div>
      </div>
    </div>
  );
};
