import { useState } from 'react';
import { Maximize2, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../../stores/dashboard/useDashboardStore';
import { orderCalculationService } from '@sabay/shared';
import { getLocalizedText } from '../../../utils/i18n';
import { Language, TableConfig, Order } from '../../../types';

export interface CashierOrderDetailPanelProps {
  cashierPanelWidth: number;
  setCashierPanelWidth: (w: number) => void;
  getPanelWidthClass: (w?: number) => string;
  cashierSelectedOrder: Order;
  cashierCandidateOrders: {
    sameTableOrders: Order[];
    allConnectedOrders: Order[];
    hasMergedTables: boolean;
  };
  cashierMergedOrders: Order[];
  orders: Order[];
  menuItems: any[];
  tables: TableConfig[];
  currentLang: Language;
  minSpend: number;
  onUpdateOrderItems?: (orderId: string, items: any[]) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTableNumber?: (orderId: string, tableNumber: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTableStatus?: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean; error?: string }>;
  setConfirmActionModal?: (modal: any) => void;
}

export const CashierOrderDetailPanel: React.FC<CashierOrderDetailPanelProps> = ({
  cashierPanelWidth,
  setCashierPanelWidth,
  getPanelWidthClass,
  cashierSelectedOrder,
  cashierCandidateOrders,
  cashierMergedOrders,
  orders,
  menuItems,
  tables,
  currentLang,
  minSpend,
  onUpdateOrderItems,
  onDeleteOrder,
  onUpdateTableNumber,
  onUpdateTableStatus,
  setConfirmActionModal,
}) => {
  const {
    setSelectedCashierOrderId,
    selectedCashierOrderId,
    cashierCheckoutScope,
    setCashierCheckoutScope,
    cashierSelectedMergeOrderIds,
    setCashierSelectedMergeOrderIds,
    cashierDiscountType,
    setCashierDiscountType,
    cashierDiscountFlat,
    setCashierDiscountFlat,
    cashierDiscountRate,
    setCashierDiscountRate,
    cashierSurchargeType,
    setCashierSurchargeType,
    cashierSurchargeFlat,
    setCashierSurchargeFlat,
    cashierSurchargeRate,
    setCashierSurchargeRate,
    isCashierWidthAuto,
    setIsCashierWidthAuto,
    editingOrderTableId,
    setEditingOrderTableId,
    editingOrderTableValue,
    setEditingOrderTableValue,
    simulatedElapsedOrders,
  } = useDashboardStore();

  const [cashierNewItemInput, setCashierNewItemInput] = useState<string>('');

  const handleCashierAddMenuItem = async (menuItemId: string) => {
    if (!cashierSelectedOrder || !onUpdateOrderItems) return;
    const dish = menuItems.find((m: any) => m.id === menuItemId);
    if (!dish) return;

    const existing = cashierSelectedOrder.items.find((it: any) => it.menuItemId === menuItemId);
    let updatedItems;
    if (existing) {
      updatedItems = cashierSelectedOrder.items.map((it: any) => {
        if (it.menuItemId === menuItemId) {
          return { ...it, qty: it.qty + 1 };
        }
        return it;
      });
    } else {
      const newItem = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: dish.id,
        name: dish.name,
        price: dish.price,
        qty: 1,
        customization: {
          spiciness: 1,
          notes: '櫃檯收銀加點',
        }
      };
      updatedItems = [...cashierSelectedOrder.items, newItem];
    }

    await onUpdateOrderItems(cashierSelectedOrder.id, updatedItems);
    setCashierNewItemInput('');
  };

  const handleCombinedQtyChange = async (orderId: string, itemId: string, delta: number) => {
    if (!onUpdateOrderItems) return;
    const ordObj = orders.find(o => o.id === orderId);
    if (!ordObj) return;
    const updatedItems = ordObj.items.map((it: any) => {
      if (it.id === itemId) {
        return { ...it, qty: it.qty + delta };
      }
      return it;
    }).filter((it: any) => it.qty > 0);

    if (updatedItems.length === 0) {
      const confirmDeleteZeroItems = async () => {
        if (onDeleteOrder) {
          try {
            const res = await onDeleteOrder(orderId);
            if (res && res.success === false) {
              alert(`❌ 刪除訂單失敗：${res.error || '伺服器拒絕或網路異常'}`);
              return;
            }
          } catch (err: any) {
            console.error('[CashierOrderDetailPanel] Delete error:', err);
            alert(`❌ 刪除訂單失敗：${err?.message || '未知錯誤'}`);
            return;
          }
        }
        if (selectedCashierOrderId === orderId) {
          setSelectedCashierOrderId(null);
        }
      };

      if (setConfirmActionModal) {
        setConfirmActionModal({
          isOpen: true,
          title: '⚠️ 訂單已無菜品',
          message: `訂單 [${orderId}] 的菜品已被清空。是否直接刪除此訂單？`,
          actionLabel: '確定刪除 Delete',
          onConfirm: confirmDeleteZeroItems
        });
      } else if (window.confirm(`訂單 [${orderId}] 的菜品已被清空。是否直接刪除此訂單？`)) {
        await confirmDeleteZeroItems();
      }
      return;
    }

    await onUpdateOrderItems(orderId, updatedItems);
  };

  const handleCombinedRemoveItem = async (orderId: string, itemId: string) => {
    if (!onUpdateOrderItems) return;
    const ordObj = orders.find(o => o.id === orderId);
    if (!ordObj) return;
    const updatedItems = ordObj.items.filter((it: any) => it.id !== itemId);

    if (updatedItems.length === 0) {
      const confirmDeleteZeroItems = async () => {
        if (onDeleteOrder) {
          try {
            const res = await onDeleteOrder(orderId);
            if (res && res.success === false) {
              alert(`❌ 刪除訂單失敗：${res.error || '伺服器拒絕或網路異常'}`);
              return;
            }
          } catch (err: any) {
            console.error('[CashierOrderDetailPanel] Delete error:', err);
            alert(`❌ 刪除訂單失敗：${err?.message || '未知錯誤'}`);
            return;
          }
        }
        if (selectedCashierOrderId === orderId) {
          setSelectedCashierOrderId(null);
        }
      };

      if (setConfirmActionModal) {
        setConfirmActionModal({
          isOpen: true,
          title: '⚠️ 訂單已無菜品',
          message: `移除此品項後，訂單 [${orderId}] 將無任何菜品。是否直接刪除此訂單？`,
          actionLabel: '確定刪除 Delete',
          onConfirm: confirmDeleteZeroItems
        });
      } else if (window.confirm(`移除此品項後，訂單 [${orderId}] 將無任何菜品。是否直接刪除此訂單？`)) {
        await confirmDeleteZeroItems();
      }
      return;
    }

    await onUpdateOrderItems(orderId, updatedItems);
  };

  const { sameTableOrders, allConnectedOrders, hasMergedTables } = cashierCandidateOrders;
  const hasMultipleCandidates = allConnectedOrders.length > 1;
  const hasMultipleSameTable = sameTableOrders.length > 1;

  return (
    <div className={`bg-[#121212] border border-white/15 rounded-2xl p-6 w-full ${getPanelWidthClass(cashierPanelWidth)} max-h-[92vh] flex flex-col relative shadow-2xl animate-scaleUp overflow-y-auto min-w-0`} id="cashier-checkout-left-subpanel">
      {/* Top Close button icon */}
      <button
        type="button"
        onClick={() => setSelectedCashierOrderId(null)}
        className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2.5 hover:bg-white/5 rounded-full cursor-pointer z-10"
        title="關閉視窗 Close Dialog"
      >
        ✕
      </button>

      {/* Width Auto-Scaling Controls */}
      <div className="bg-[#181818] border border-white/10 rounded-xl p-4 mb-4 space-y-3 text-left" id="cashier-width-scaler-control">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5">
            <Maximize2 size={14} className="text-[#E5B453]" />
            <span>🖥️ 收銀視窗寬度自適應 / 縮放功能 Panel Width Customizer</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            當前寬度: {cashierPanelWidth}% {isCashierWidthAuto ? '(自動適應中)' : '(手動微調中)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Left: Auto Mode and Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCashierWidthAuto(!isCashierWidthAuto)}
              className={`text-[11px] px-3 py-1.5 rounded-lg border font-bold h-8 flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                isCashierWidthAuto
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-white/5 hover:bg-white/5'
              }`}
            >
              {isCashierWidthAuto ? '🟢 自動適應邊界 ON' : '⚪ 手動微調模式'}
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="35"
                max="100"
                step="1"
                disabled={isCashierWidthAuto}
                value={cashierPanelWidth}
                onChange={(e) => setCashierPanelWidth(Number(e.target.value))}
                className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E5B453] ${isCashierWidthAuto ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Right: Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 justify-end flex-wrap">
            <span className="text-[10px] text-zinc-500 shrink-0">快速比例:</span>
            {[
              { val: 40, label: '窄版' },
              { val: 48, label: '標準' },
              { val: 65, label: '寬版' },
              { val: 80, label: '極寬' },
              { val: 95, label: '全螢幕' }
            ].map((btn) => (
              <button
                key={btn.val}
                type="button"
                onClick={() => {
                  setIsCashierWidthAuto(false);
                  setCashierPanelWidth(btn.val);
                }}
                className={`text-[10px] px-2 py-1 rounded border transition active:scale-95 cursor-pointer ${
                  !isCashierWidthAuto && cashierPanelWidth === btn.val
                    ? 'bg-[#E5B453] text-zinc-950 font-black border-[#E5B453]'
                    : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                }`}
              >
                {btn.label} ({btn.val}%)
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0" id="cashier-active-register-area">
        {/* Upper content scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 text-left pr-2">
          {/* Active Order Header */}
          <div className="border-b border-white/5 pb-3.5 flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#E5B453] bg-[#E5B453]/10 border border-[#E5B453]/35 px-2 py-0.5 rounded font-black">
                  {cashierSelectedOrder.id}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {new Date(cashierSelectedOrder.createdAt).toLocaleTimeString()} · 下單時間
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <h4 className="font-extrabold text-base text-white flex items-center gap-1.5">
                  <ShoppingBag size={18} className="text-[#E5B453]" />
                  <span>櫃檯收銀中： 第 {cashierSelectedOrder.tableNumber || ''} {(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶')) ? '' : '桌'}</span>
                </h4>
                {editingOrderTableId === cashierSelectedOrder.id ? (
                  <div className="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-lg px-2 py-1" id="editing-order-table-section-cashier">
                    <select
                      value={editingOrderTableValue}
                      onChange={(e) => setEditingOrderTableValue(e.target.value)}
                      className="bg-[#1c1c1c] border border-white/20 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E5B453]"
                    >
                      <optgroup label="客席就座桌號">
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((num) => (
                          <option key={num} value={num}>
                            🪑 第 {num} 桌 (Dine-in)
                          </option>
                        ))}
                        {tables && tables
                          .filter((t) => !Array.from({ length: 12 }, (_, i) => String(i + 1)).includes(t.id))
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              🪑 第 {t.id} 桌
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="外帶自取佇列">
                        {Array.from({ length: 15 }, (_, i) => `外帶 #${i + 1}`).map((takeoutId) => (
                          <option key={takeoutId} value={takeoutId}>
                            🛍️ {takeoutId} (Takeout)
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <button
                      type="button"
                      onClick={async () => {
                        if (onUpdateTableNumber) {
                          const res = await onUpdateTableNumber(cashierSelectedOrder.id, editingOrderTableValue);
                          if (res.success) {
                            cashierSelectedOrder.tableNumber = editingOrderTableValue;
                            setEditingOrderTableId(null);
                          } else {
                            alert(res.error || '變更桌號失敗');
                          }
                        } else {
                          cashierSelectedOrder.tableNumber = editingOrderTableValue;
                          setEditingOrderTableId(null);
                        }
                      }}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                    >
                      儲存
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingOrderTableId(null)}
                      className="text-[10px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrderTableId(cashierSelectedOrder.id);
                      setEditingOrderTableValue(cashierSelectedOrder.tableNumber);
                    }}
                    className="text-[10px] text-[#E5B453] hover:text-amber-300 bg-white/5 border border-white/5 hover:border-[#E5B453]/20 px-2 py-1 rounded cursor-pointer transition font-bold"
                  >
                    ✎ 更改桌號/外帶
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 mr-8">
              {onDeleteOrder && (
                <button
                  type="button"
                  onClick={async () => {
                    const confirmDelete = async () => {
                      try {
                        const res = await onDeleteOrder(cashierSelectedOrder.id);
                        if (res && res.success === false) {
                          alert(`❌ 刪除訂單失敗：${res.error || '伺服器拒絕或網路異常'}`);
                          return;
                        }
                        setSelectedCashierOrderId(null);
                      } catch (err: any) {
                        console.error('[CashierOrderDetailPanel] Delete error:', err);
                        alert(`❌ 刪除訂單失敗：${err?.message || '未知錯誤'}`);
                      }
                    };

                    if (setConfirmActionModal) {
                      setConfirmActionModal({
                        isOpen: true,
                        title: '🚨 永久刪除此訂單',
                        message: `您確定要永久刪除訂單 [${cashierSelectedOrder.id}] 嗎？此操作將永久刪除此訂單，且無法復原。`,
                        actionLabel: '確定刪除 Delete',
                        onConfirm: confirmDelete
                      });
                    } else if (window.confirm(`您確定要永久刪除訂單 [${cashierSelectedOrder.id}] 嗎？此操作將永久刪除此訂單，且無法復原。`)) {
                      await confirmDelete();
                    }
                  }}
                  className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition active:scale-95 border border-rose-500/30 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
                >
                  🗑️ 刪除訂單 Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCashierOrderId(null)}
                className="text-zinc-400 hover:text-white transition active:scale-95 text-xs border border-white/10 px-3 py-1.5 rounded-lg bg-white/5 cursor-pointer font-bold"
              >
                關閉帳單 Exit
              </button>
            </div>
          </div>

          {/* Dine-In Minimum Spend Reminder Alert */}
          {(() => {
            const isDineIn = !(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶'));
            const orderGuests = cashierSelectedOrder.guestCount || 1;
            const selOrderCalcs = orderCalculationService.calculateOrderPricing(cashierSelectedOrder, menuItems);
            const selOrderDisplayTotal = selOrderCalcs.total;
            const avgAmt = selOrderDisplayTotal / orderGuests;
            const orderCreatedAtTime = new Date(cashierSelectedOrder.createdAt).getTime();
            const timeElapsedMs = Date.now() - orderCreatedAtTime;
            const isSimulated = simulatedElapsedOrders.includes(cashierSelectedOrder.id);
            
            const orderIsHourElapsed = (timeElapsedMs >= 3600000) || isSimulated;
            const orderBelowMinSpend = avgAmt < minSpend;
            const showDineInAlert = isDineIn && orderBelowMinSpend && orderIsHourElapsed;

            if (showDineInAlert) {
              return (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-300 p-4 rounded-xl text-center font-extrabold text-xs sm:text-sm animate-pulse tracking-wide font-sans leading-relaxed">
                  🚨 未達到低消，用餐時間結束
                  <div className="text-[11px] font-medium text-rose-400 mt-1">
                    每桌內用低消人數限制: {orderGuests} 人 · 應達最低總額: {orderGuests * minSpend} 元 (目前僅有 NT$ {selOrderDisplayTotal.toLocaleString()}，人均餐額 NT$ {Math.round(avgAmt)})
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* 📋 結帳規則：同桌獨立單筆結帳 / 合併結帳選擇 */}
          <div className="bg-[#151515] border border-amber-500/30 rounded-xl p-4 space-y-3 font-sans text-left shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#E5B453] flex items-center gap-1.5">
                  <span>🧾 結帳範圍與併桌規則 (Checkout Mode)</span>
                </span>
                {hasMultipleSameTable && (
                  <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    第 {cashierSelectedOrder.tableNumber} 桌有 {sameTableOrders.length} 筆未結單
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {cashierCheckoutScope === 'single' && '🔹 獨立單一訂單結帳 (不影響同桌他單)'}
                {cashierCheckoutScope === 'same_table' && `🔸 同桌合併結帳 (${cashierMergedOrders.length} 筆)`}
                {cashierCheckoutScope === 'all_merged' && `🔷 跨桌併桌全併 (${cashierMergedOrders.length} 筆)`}
                {cashierCheckoutScope === 'custom' && `⚙️ 自訂勾選結帳 (${cashierMergedOrders.length} 筆)`}
              </span>
            </div>

            {/* 同桌多單獨立 vs 合併結帳提示 */}
            {hasMultipleSameTable && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <div className="space-y-1">
                  <div className="font-extrabold text-amber-400">
                    同桌多單獨立結帳說明：第 {cashierSelectedOrder.tableNumber} 桌共有 {sameTableOrders.length} 筆未結訂單
                  </div>
                  <div className="text-[11px] text-zinc-300 leading-relaxed">
                    預設為<strong>【獨立單一訂單結帳】</strong>，僅結當前單號 <span className="font-mono text-amber-300">#{cashierSelectedOrder.id.slice(-6)}</span>，同桌其他訂單維持未結，讓顧客能<strong>分開獨立買單</strong>！若整桌要一次付清，請切換為<strong>【同桌合併結帳】</strong>或<strong>【自訂勾選合併】</strong>。
                  </div>
                </div>
              </div>
            )}

            {/* Mode Option Buttons */}
            <div className={`grid gap-2 ${hasMultipleCandidates ? (hasMergedTables && allConnectedOrders.length > sameTableOrders.length ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3') : 'grid-cols-1'}`}>
              {/* 1. 獨立單一訂單結帳 */}
              <button
                type="button"
                onClick={() => {
                  setCashierCheckoutScope('single');
                  setCashierSelectedMergeOrderIds([cashierSelectedOrder.id]);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                  cashierCheckoutScope === 'single'
                    ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                    : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-[#E5B453] flex items-center gap-1">
                    <span>🔹 獨立單一結帳</span>
                  </span>
                  <span className="text-[9px] font-mono bg-[#E5B453]/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">單筆 1 單 (預設)</span>
                </div>
                <div className="text-[10px] text-zinc-300 leading-tight">
                  僅結主單 <span className="font-mono text-[#E5B453]">#{cashierSelectedOrder.id.slice(-6)}</span>
                  {hasMultipleSameTable && <span className="text-zinc-400 block mt-0.5">· 同桌其餘 {sameTableOrders.length - 1} 單不結算</span>}
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-sans">本單金額:</span>
                  <span>NT$ {orderCalculationService.calculateOrderPricing(cashierSelectedOrder, menuItems).total.toLocaleString()}</span>
                </div>
              </button>

              {/* 2. 同桌全部合併 */}
              {hasMultipleCandidates && sameTableOrders.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCashierCheckoutScope('same_table');
                    setCashierSelectedMergeOrderIds(sameTableOrders.map(o => o.id));
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                    cashierCheckoutScope === 'same_table'
                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
                      <span>🔸 同桌合併結帳</span>
                    </span>
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">{sameTableOrders.length} 筆</span>
                  </div>
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    合併第 <span className="font-bold text-white">{cashierSelectedOrder.tableNumber}</span> 桌所有未結單一併結算
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-sans">同桌合計:</span>
                    <span>NT$ {sameTableOrders.reduce((sum, o) => sum + orderCalculationService.calculateOrderPricing(o, menuItems).total, 0).toLocaleString()}</span>
                  </div>
                </button>
              )}

              {/* 3. 跨桌併桌全併 */}
              {hasMultipleCandidates && hasMergedTables && allConnectedOrders.length > sameTableOrders.length && (
                <button
                  type="button"
                  onClick={() => {
                    setCashierCheckoutScope('all_merged');
                    setCashierSelectedMergeOrderIds(allConnectedOrders.map(o => o.id));
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                    cashierCheckoutScope === 'all_merged'
                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-sky-300 flex items-center gap-1">
                      <span>🔷 跨桌全併結帳</span>
                    </span>
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">{allConnectedOrders.length} 筆</span>
                  </div>
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    合併所有跨桌關聯之未結單
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-sans">跨桌合計:</span>
                    <span>NT$ {allConnectedOrders.reduce((sum, o) => sum + orderCalculationService.calculateOrderPricing(o, menuItems).total, 0).toLocaleString()}</span>
                  </div>
                </button>
              )}

              {/* 4. 自訂勾選合併 */}
              {hasMultipleCandidates && (
                <button
                  type="button"
                  onClick={() => {
                    setCashierCheckoutScope('custom');
                    if (!cashierSelectedMergeOrderIds.includes(cashierSelectedOrder.id)) {
                      setCashierSelectedMergeOrderIds([cashierSelectedOrder.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition active:scale-98 cursor-pointer ${
                    cashierCheckoutScope === 'custom'
                      ? 'bg-[#E5B453]/15 border-[#E5B453] text-white shadow-sm ring-1 ring-[#E5B453]/50'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-purple-300 flex items-center gap-1">
                      <span>⚙️ 自訂勾選合併</span>
                    </span>
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80">自選</span>
                  </div>
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    自選指定同桌或跨桌哪幾筆訂單一同結算
                  </div>
                  <div className="text-[11px] font-mono font-bold text-purple-400 mt-2 pt-1 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-sans">已選數量:</span>
                    <span>已勾選 {cashierMergedOrders.length} 筆</span>
                  </div>
                </button>
              )}
            </div>

            {/* Custom Selection Checkbox List */}
            {cashierCheckoutScope === 'custom' && hasMultipleCandidates && (
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2.5 mt-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-white/5">
                  <span className="font-bold text-zinc-200">請勾選本次要一併結算的訂單 (至少需勾選 1 筆)：</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCashierSelectedMergeOrderIds([cashierSelectedOrder.id])}
                      className="text-[10px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded transition"
                    >
                      僅選當前主單
                    </button>
                    {sameTableOrders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCashierSelectedMergeOrderIds(sameTableOrders.map(o => o.id))}
                        className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded transition font-bold"
                      >
                        選取同桌所有單 ({sameTableOrders.length})
                      </button>
                    )}
                    {hasMergedTables && allConnectedOrders.length > sameTableOrders.length && (
                      <button
                        type="button"
                        onClick={() => setCashierSelectedMergeOrderIds(allConnectedOrders.map(o => o.id))}
                        className="text-[10px] text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded transition font-bold"
                      >
                        全選所有關聯單 ({allConnectedOrders.length})
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {allConnectedOrders.map((candidate) => {
                    const isChecked = cashierSelectedMergeOrderIds.includes(candidate.id);
                    const isMainSelected = candidate.id === cashierSelectedOrder.id;
                    const candCalculated = orderCalculationService.calculateOrderPricing(candidate, menuItems);
                    const candSubtotal = candCalculated.total;
                    const isSameTable = candidate.tableNumber === cashierSelectedOrder.tableNumber;
                    
                    return (
                      <label
                        key={candidate.id}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-[#E5B453]/10 border-[#E5B453]/50 text-white shadow-xs'
                            : 'bg-[#181818] border-white/5 text-zinc-400 hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCashierSelectedMergeOrderIds(prev => Array.from(new Set([...prev, candidate.id])));
                            } else {
                              if (cashierSelectedMergeOrderIds.length > 1) {
                                setCashierSelectedMergeOrderIds(prev => prev.filter(id => id !== candidate.id));
                              } else {
                                alert('結帳至少需保留一筆選取的訂單！');
                              }
                            }
                          }}
                          className="mt-1 accent-[#E5B453] w-4 h-4 rounded cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#E5B453] text-[11px]">
                              #{candidate.id.slice(-6)}
                              {isMainSelected && (
                                <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans">當前主單</span>
                              )}
                              {!isSameTable && (
                                <span className="ml-1.5 text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded font-sans">跨桌併單</span>
                              )}
                            </span>
                            <span className="font-mono font-extrabold text-amber-400">NT$ {candSubtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                            <span>第 {candidate.tableNumber} 桌</span>
                            <span>·</span>
                            <span>{new Date(candidate.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>·</span>
                            <span>{candidate.items?.length || 0} 個品項</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-1">
                            {(candidate.items || []).map(it => {
                              const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                              return `${pName}x${it.qty || 0}`;
                            }).join(', ')}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Table Status & Merging Control panel */}
          {(() => {
            const isDineIn = !(cashierSelectedOrder.tableNumber && String(cashierSelectedOrder.tableNumber || '').includes('外帶'));
            if (!isDineIn) return null;
            
            const tbId = cashierSelectedOrder.tableNumber;
            const tbObj = tables.find(t => t.id === tbId);
            
            return (
              <div className="bg-[#161616] border border-white/10 rounded-xl p-4 space-y-4 font-sans text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5">
                    <span>🥢 第 {tbId} 桌客席及併桌管理 Table Management</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    狀態: {tbObj?.status === 'preserved' ? '🟣 預約預訂' : tbObj?.status === 'in_use' ? '🔵 已入座用餐' : tbObj?.status === 'pending_checkout' ? '🟡 已出單待結' : tbObj?.status === 'cleaning' ? '🔴 收拾清潔中' : '🟢 乾淨空桌'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Occupancy Status and Name */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] text-zinc-400 font-bold block">1. 更改客席狀態 Switch Status</label>
                    <select
                      value={tbObj?.status || 'available'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        let newPresName = tbObj?.preservedFor || '';
                        if (newStatus === 'preserved' && !newPresName) {
                          const ans = prompt('請輸入預約保留顧客姓名 (Preserved Name)：');
                          if (ans !== null && ans.trim()) {
                            newPresName = ans.trim();
                          }
                        }
                        if (onUpdateTableStatus) {
                          await onUpdateTableStatus(tbId, { 
                            status: newStatus as any, 
                            preservedFor: newStatus === 'preserved' ? newPresName : '' 
                          });
                        }
                      }}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl text-white text-xs h-9 px-3 cursor-pointer outline-none focus:border-amber-400"
                    >
                      <option value="available">🟢 空桌 Available (空閒可帶位)</option>
                      <option value="in_use">🔵 入座 Occupied (已帶位/用餐中)</option>
                      <option value="pending_checkout">🟡 待結帳 Pending (尚未付款)</option>
                      <option value="cleaning">🔴 清潔中 Cleaning (清潔收拾中)</option>
                      <option value="preserved">🟣 預約保留 Preserved (座席保留)</option>
                    </select>

                    {tbObj?.status === 'preserved' && (
                      <div className="space-y-1 bg-[#1c1c1c] p-2.5 border border-white/5 rounded-xl">
                        <span className="text-[10px] text-rose-400 font-bold block">保留姓名 / 持有者 Reservation Name:</span>
                        <input
                          type="text"
                          value={tbObj?.preservedFor || ''}
                          placeholder="請修改保留人姓名"
                          onChange={async (e) => {
                            if (onUpdateTableStatus) {
                              await onUpdateTableStatus(tbId, { preservedFor: e.target.value });
                            }
                          }}
                          className="bg-black/45 border border-white/10 focus:border-rose-400 rounded-lg text-white text-xs py-1 px-2.5 w-full font-sans"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: Merging Table Select */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] text-zinc-400 font-bold block">2. 合併併桌設定 Merge with Table</label>
                    <select
                      value={tbObj?.mergedWith || ''}
                      onChange={async (e) => {
                        const targetMerge = e.target.value;
                        if (onUpdateTableStatus) {
                          await onUpdateTableStatus(tbId, { mergedWith: targetMerge });
                        }
                      }}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl text-white text-xs h-9 px-3 cursor-pointer outline-none focus:border-amber-400"
                    >
                      <option value="">🔗 獨立（不與他桌合併）</option>
                      {tables.filter(other => other.id !== tbId).map(other => (
                        <option key={other.id} value={other.id}>
                          併帳至 ➔ 第 {other.id} 桌
                        </option>
                      ))}
                    </select>

                    {tbObj?.mergedWith && (
                      <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-2 rounded-xl text-[10px] leading-relaxed">
                        ℹ️ 本桌 (第 {tbId} 桌) 已設定併入 <strong>第 {tbObj.mergedWith} 桌</strong>。在 checkout 結帳時，兩桌的帳單會自動合併計算，店員僅需以此 lead 帳單進行款項清收。
                      </div>
                    )}

                    {tables.some(t => t.mergedWith === tbId) && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2 rounded-xl text-[10px] leading-relaxed">
                        ℹ️ 偵測到有其他客桌併入本桌：<strong>
                          {tables.filter(t => t.mergedWith === tbId).map(t => `${t.id}桌`).join(', ')}
                        </strong>
                        。系統已將該等客席之未結帳訂單內容動態合併，點餐明細已完成自動彙整。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Items Brief */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] text-zinc-400 block font-bold tracking-wider uppercase">
                🍽️ 點餐菜品明細 {cashierMergedOrders.length > 1 ? `(合併共 ${cashierMergedOrders.length} 筆訂單 · 計 ${cashierMergedOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} 項)` : `(本單共 ${cashierMergedOrders[0]?.items?.length || 0} 項)`}
              </span>
              {cashierMergedOrders.length > 1 && (
                <span className="text-[10px] text-[#E5B453] font-bold font-mono">
                  已合併 {Array.from(new Set(cashierMergedOrders.map(o => o.tableNumber))).join(' + ')} 桌
                </span>
              )}
            </div>
            <div className="space-y-4 divide-y divide-white/5 text-xs">
              {cashierMergedOrders.map((ord, oidx) => (
                <div key={ord.id} className={oidx > 0 ? "pt-3.5" : ""}>
                  {cashierMergedOrders.length > 1 && (
                    <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg mb-2 font-mono text-[10px] text-[#E5B453] font-bold">
                      <span>🥢 第 {ord.tableNumber} 桌之點單</span>
                      <span className="opacity-60">{ord.id.slice(-6).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {(ord.items || []).map((it) => {
                      const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                      const dish = menuItems.find((m: any) => m.id === it.menuItemId);
                      const baseUnitPrice = dish ? dish.price : (it.price || 0);
                      const effectiveUnitPrice = orderCalculationService.computeOrderItemUnitPrice(it, menuItems);
                      const itemRowTotal = effectiveUnitPrice * (it.qty || 0);

                      const spicinessName = ['不辣', '辣味'][it.customization?.spiciness || 0];
                      const noodleName = it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : null);
                      const soupBaseName = it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭 (+NT$ 50)' : null;
                      const addOns = it.customization?.selectedAddOns || [];
                      const notes = it.customization?.notes || '';

                      return (
                        <div key={it.id} className="pt-2.5 pb-2.5 border-b border-white/10 flex flex-col gap-2 text-zinc-300 font-sans">
                          {/* Top Row: Item Header, Base Unit Price, Qty, Subtotal & Action Controls */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="text-left space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-white text-sm">
                                  {pName}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                  主餐原價 NT$ {baseUnitPrice}
                                </span>
                                <span className="font-mono text-[#E5B453] font-black text-xs bg-[#E5B453]/10 border border-[#E5B453]/30 px-1.5 py-0.5 rounded">
                                  x{it.qty || 0}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              {/* Qty adjustments */}
                              <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => handleCombinedQtyChange(ord.id, it.id, -1)}
                                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="減少數量"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="px-1.5 text-xs font-black text-white min-w-[16px] text-center">{it.qty || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCombinedQtyChange(ord.id, it.id, 1)}
                                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="增加數量"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleCombinedRemoveItem(ord.id, it.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition cursor-pointer border border-red-500/20"
                                title="移除品項"
                              >
                                <Trash2 size={12} />
                              </button>
                              <div className="text-right min-w-[70px]">
                                <span className="font-mono text-amber-300 font-extrabold text-sm block">
                                  NT$ {itemRowTotal.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono block">
                                  (單價 NT$ {effectiveUnitPrice})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Customization & Add-on Detailed Breakdown */}
                          {it.customization && (
                            <div className="bg-[#181818] border border-white/10 rounded-lg p-2.5 space-y-2 text-left">
                              {/* Base Options */}
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-300">
                                {noodleName && (
                                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold">
                                    🍝 麵條: {noodleName}
                                  </span>
                                )}
                                {soupBaseName && (
                                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold">
                                    🥥 {soupBaseName}
                                  </span>
                                )}
                                <span className="bg-zinc-800 border border-white/10 text-zinc-300 px-2 py-0.5 rounded font-medium">
                                  🌶️ {spicinessName}
                                </span>
                              </div>

                              {/* Individual Add-ons Details and Amounts */}
                              {addOns.length > 0 && (
                                <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                                  <span className="text-[11px] font-extrabold text-[#E5B453] flex items-center gap-1">
                                    <span>➕ 加購/加點細項明細 Add-ons Detail:</span>
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {addOns.map((addOn: any, aidx: number) => {
                                      const addOnName = getLocalizedText(addOn.name, currentLang) || (typeof addOn.name === 'string' ? addOn.name : '加點項目');
                                      const addOnPrice = Number(addOn.price) || 0;
                                      return (
                                        <div key={addOn.id || `${it.id || 'item'}-addon-${aidx}`} className="flex justify-between items-center bg-black/50 border border-amber-500/20 rounded px-2.5 py-1 text-[11px]">
                                          <span className="text-zinc-200 font-bold">
                                            • {addOnName}
                                          </span>
                                          <span className="font-mono font-black text-amber-300">
                                            +NT$ {addOnPrice}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Special Notes */}
                              {notes && (
                                <div className="text-[11px] text-amber-200/90 font-medium bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded">
                                  📝 廚房特調備註: {notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Dropdown to add custom new item */}
            <div className="pt-2 border-t border-white/5 flex gap-2 items-center">
              <label className="text-[10px] text-zinc-400 shrink-0 font-bold">加點餐點：</label>
              <select
                value={cashierNewItemInput}
                onChange={(e) => {
                  if (e.target.value) {
                    handleCashierAddMenuItem(e.target.value);
                  }
                }}
                className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#E5B453]"
              >
                <option value="">-- 🔎 選擇加點品項 (Add Dish) --</option>
                {menuItems && menuItems.filter(item => item.available !== false).map((item) => (
                  <option key={item.id} value={item.id}>
                    {getLocalizedText(item.name, 'zh')} (+NT$ {item.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cashier Adjustments (Discount & Surcharge) Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Card */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-3">
              <h6 className="text-[11px] font-bold text-white/90 flex justify-between items-center">
                <span>🏷️ 手動折扣 (Discount Modifier)</span>
                <span className="text-[10px] text-[#E5B453] font-mono font-bold">
                  {cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : `折 NT$ ${cashierDiscountFlat}`}
                </span>
              </h6>

              {/* Percent vs Flat toggle */}
              <div className="grid grid-cols-2 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCashierDiscountType('percent')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    cashierDiscountType === 'percent'
                      ? 'bg-[#E5B453] text-zinc-950 font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  % 百分比例
                </button>
                <button
                  type="button"
                  onClick={() => setCashierDiscountType('flat')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    cashierDiscountType === 'flat'
                      ? 'bg-[#E5B453] text-zinc-950 font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  $ 固定折價
                </button>
              </div>

              {/* Quick Value Selectors */}
              {cashierDiscountType === 'percent' ? (
                <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold font-sans">
                  {[
                    { val: 0, lbl: '無' },
                    { val: 5, lbl: '95折' },
                    { val: 10, lbl: '9折' },
                    { val: 15, lbl: '85折' },
                    { val: 20, lbl: '8折' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setCashierDiscountRate(btn.val)}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        cashierDiscountRate === btn.val
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/40 font-black'
                          : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {btn.lbl}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold font-sans">
                  {[
                    { val: 0, lbl: '無' },
                    { val: 50, lbl: '$50' },
                    { val: 100, lbl: '$100' },
                    { val: 200, lbl: '$200' },
                    { val: 300, lbl: '$300' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setCashierDiscountFlat(btn.val)}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        cashierDiscountFlat === btn.val
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/40 font-black'
                          : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {btn.lbl}
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Input field */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">自訂調整數值</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={cashierDiscountType === 'percent' ? 100 : cashierSelectedOrder.subtotal}
                    value={cashierDiscountType === 'percent' ? cashierDiscountRate || '' : cashierDiscountFlat || ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      if (cashierDiscountType === 'percent') {
                        setCashierDiscountRate(Math.min(100, val));
                      } else {
                        setCashierDiscountFlat(Math.min(cashierSelectedOrder.subtotal, val));
                      }
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#E5B453]"
                  />
                  <span className="absolute right-2 top-1 text-[10px] font-bold text-zinc-500 font-mono">
                    {cashierDiscountType === 'percent' ? '%' : '元'}
                  </span>
                </div>
              </div>
            </div>

            {/* Surcharge Fee Card */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-3">
              <h6 className="text-[11px] font-bold text-white/90 flex justify-between items-center">
                <span>📈 手動加成 (Surcharge Modifier)</span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">
                  {cashierSurchargeType === 'percent' ? `+ ${cashierSurchargeRate}%` : `+ NT$ ${cashierSurchargeFlat}`}
                </span>
              </h6>

              {/* Percent vs Flat toggle */}
              <div className="grid grid-cols-2 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCashierSurchargeType('percent')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    cashierSurchargeType === 'percent'
                      ? 'bg-blue-500 text-white font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  % 百分比例
                </button>
                <button
                  type="button"
                  onClick={() => setCashierSurchargeType('flat')}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    cashierSurchargeType === 'flat'
                      ? 'bg-blue-500 text-white font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  $ 固定加成
                </button>
              </div>

              {/* Quick Value Selectors */}
              {cashierSurchargeType === 'percent' ? (
                <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold font-sans">
                  {[
                    { val: 0, lbl: '無' },
                    { val: 5, lbl: '5% 服務' },
                    { val: 10, lbl: '10% 標準' },
                    { val: 15, lbl: '15% 加值' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setCashierSurchargeRate(btn.val)}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        cashierSurchargeRate === btn.val
                          ? 'bg-blue-400/10 text-blue-400 border-blue-400/40 font-black'
                          : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {btn.lbl}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold font-sans">
                  {[
                    { val: 0, lbl: '無' },
                    { val: 30, lbl: '$30' },
                    { val: 50, lbl: '$50' },
                    { val: 100, lbl: '$100' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setCashierSurchargeFlat(btn.val)}
                      className={`py-1 rounded-md border text-center transition cursor-pointer ${
                        cashierSurchargeFlat === btn.val
                          ? 'bg-blue-400/10 text-blue-400 border-blue-400/40 font-black'
                          : 'bg-black/20 text-zinc-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {btn.lbl}
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Input field */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 block">自訂調整數值</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={cashierSurchargeType === 'percent' ? 100 : cashierSelectedOrder.subtotal}
                    value={cashierSurchargeType === 'percent' ? cashierSurchargeRate || '' : cashierSurchargeFlat || ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      if (cashierSurchargeType === 'percent') {
                        setCashierSurchargeRate(Math.min(100, val));
                      } else {
                        setCashierSurchargeFlat(Math.min(cashierSelectedOrder.subtotal, val));
                      }
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2 top-1 text-[10px] font-bold text-zinc-500 font-mono">
                    {cashierSurchargeType === 'percent' ? '%' : '元'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
