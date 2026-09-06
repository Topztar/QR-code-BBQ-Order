import React from 'react';
import { Minus, Plus, Coins } from 'lucide-react';
import { Order, OrderStatus, Language, TableConfig } from '../../../types';
import { getLocalizedText } from '../../../utils/i18n';
import { ConfirmActionModalConfig } from './ConfirmActionModal';
import { PaidModDetails } from './PaidOrderModificationModal';
import { getMaskedEmail, computeOrderItemUnitPrice, computeOrderItemsSubtotal } from '../ManagerDashboardUtils';

export interface OrderDetailDrilldownModalProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  orders: Order[];
  tables: TableConfig[];
  menuItems: any[];
  currentLang: Language;
  printerIp?: string;
  editingOrderTableId: string | null;
  setEditingOrderTableId: (id: string | null) => void;
  editingOrderTableValue: string;
  setEditingOrderTableValue: (val: string) => void;
  cashReceivedInput: number;
  setCashReceivedInput: (val: number) => void;
  setConfirmActionModal: (cfg: ConfirmActionModalConfig | null) => void;
  setPaidModDetails: (details: PaidModDetails | null) => void;
  setPrintConfirmData: (data: any) => void;
  onDeleteOrder?: (id: string) => Promise<any> | any;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => Promise<void> | void;
  onUpdateTableNumber?: (orderId: string, tableNumber: string) => Promise<{ success: boolean; error?: string }>;
  handleLocalQtyChange: (itemId: string, delta: number) => Promise<void> | void;
  handleAddLocalItem: (menuItemId: string) => Promise<void> | void;
  handleProcessCheckout: () => Promise<void> | void;
}

export const OrderDetailDrilldownModal: React.FC<OrderDetailDrilldownModalProps> = ({
  selectedOrder,
  setSelectedOrder,
  orders,
  tables,
  menuItems,
  currentLang,
  printerIp = '192.168.1.200',
  editingOrderTableId,
  setEditingOrderTableId,
  editingOrderTableValue,
  setEditingOrderTableValue,
  cashReceivedInput,
  setCashReceivedInput,
  setConfirmActionModal,
  setPaidModDetails,
  setPrintConfirmData,
  onDeleteOrder,
  onUpdateOrderStatus,
  onUpdateTableNumber,
  handleLocalQtyChange,
  handleAddLocalItem,
  handleProcessCheckout,
}) => {
  if (!selectedOrder) return null;

  return (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="order-detail-drilldown-modal" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="bg-[#E5B453] text-black font-extrabold px-2.5 py-1 rounded text-xs">單筆點單核數明細</span>
                <h3 className="font-bold text-base font-mono">{selectedOrder.id || ''}</h3>
                <span className="text-xs text-white/50">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {onDeleteOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmActionModal({
                        isOpen: true,
                        title: '🚨 永久刪除此訂單',
                        message: `您確定要永久刪除訂單 [${selectedOrder.id}] 嗎？此操作將永久刪除此訂單，且無法復原。`,
                        actionLabel: '確定刪除 Delete',
                        onConfirm: async () => {
                          await onDeleteOrder(selectedOrder.id);
                          setSelectedOrder(null);
                        }
                      });
                    }}
                    className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition active:scale-95 border border-rose-500/30 px-3 py-1.5 rounded-lg cursor-pointer font-bold animate-fadeIn"
                  >
                    🗑️ 刪除訂單 Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition text-xs cursor-pointer outline-none bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  關閉 ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customer & Status Controls */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">顧客與桌席定位</span>
                  <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                    <img src={selectedOrder.customerAvatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} defaultValue="" alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{selectedOrder.customerName}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">會員身份：{selectedOrder.isMember ? '⭐ Google Quick 會員' : '本桌一般餐客'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase">餐客桌位/服務類型</span>
                      {editingOrderTableId === selectedOrder.id ? (
                        <div className="mt-1 space-y-1.5" id="editing-order-table-section-drilldown">
                          <select
                            value={editingOrderTableValue}
                            onChange={(e) => setEditingOrderTableValue(e.target.value)}
                            className="w-full bg-[#1c1c1c] border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E5B453]"
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
                            <optgroup label="外帶自取佇列號碼">
                              {Array.from({ length: 15 }, (_, i) => `外帶 #${i + 1}`).map((takeoutId) => (
                                <option key={takeoutId} value={takeoutId}>
                                  🛍️ {takeoutId} (Takeout)
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (onUpdateTableNumber) {
                                  const res = await onUpdateTableNumber(selectedOrder.id, editingOrderTableValue);
                                  if (res.success) {
                                    selectedOrder.tableNumber = editingOrderTableValue;
                                    setEditingOrderTableId(null);
                                  } else {
                                    alert(res.error || '變更桌號失敗');
                                  }
                                } else {
                                  selectedOrder.tableNumber = editingOrderTableValue;
                                  setEditingOrderTableId(null);
                                }
                              }}
                              className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                            >
                              確改 OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingOrderTableId(null)}
                              className="text-[9px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 font-extrabold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1 mt-0.5">
                          <p className="font-extrabold text-sm text-white">{selectedOrder.tableNumber} {(selectedOrder.tableNumber && String(selectedOrder.tableNumber || '').includes('外帶')) ? '' : '桌'}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderTableId(selectedOrder.id);
                              setEditingOrderTableValue(selectedOrder.tableNumber);
                            }}
                            className="text-[9px] text-[#E5B453] hover:text-amber-300 bg-white/5 border border-white/5 hover:border-[#E5B453]/20 px-1.5 py-0.5 rounded cursor-pointer transition font-bold"
                          >
                            ✎ 更改桌號/外帶
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase">支付途徑管道</span>
                      <p className="font-bold text-sm text-white capitalize mt-0.5">
                        {selectedOrder.paymentMethod === 'twqr' ? 'TWQR支付' : (selectedOrder.paymentMethod === 'credit' ? '信用卡支付' : (selectedOrder.paymentMethod === 'member' ? '會員儲值支付' : '現場現金結算'))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status modifier triggers */}
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">出餐進度狀態變更</span>
                  <p className="text-[10px] text-white/40 leading-tight">切換此狀態將向 KDS 後台及客端即時同步。點選「已取消」將會自動算退釋原物料庫存！</p>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {[
                      { status: 'pending', label: '⏳ 待處理 Pending', color: 'hover:bg-amber-500/20 text-amber-400 border-amber-500/30' },
                      { status: 'preparing', label: '🍳 準備中 Preparing', color: 'hover:bg-blue-500/20 text-blue-400 border-blue-500/30' },
                      { status: 'paid', label: '💳 已結帳 Paid', color: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                      { status: 'completed', label: '✅ 已完成 Completed', color: 'hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                      { status: 'cancelled', label: '❌ 已取消 Cancelled', color: 'hover:bg-rose-500/20 text-rose-400 border-rose-500/30' }
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.status}
                        onClick={async () => {
                          if (btn.status === 'cancelled') {
                            setConfirmActionModal({
                              isOpen: true,
                              title: '⚠️ 訂單取消確定',
                              message: `您確定要取消此份點單 [${selectedOrder.id}] 嗎？切換為取消狀態後，系統將會釋出本單所消耗的原物料與配料库存！`,
                              actionLabel: '確定取消 Cancel Order',
                              onConfirm: async () => {
                                await onUpdateOrderStatus(selectedOrder.id, btn.status as any);
                                setSelectedOrder({ ...selectedOrder, status: btn.status as any });
                              },
                            });
                          } else {
                            await onUpdateOrderStatus(selectedOrder.id, btn.status as any);
                            setSelectedOrder({ ...selectedOrder, status: btn.status as any });
                          }
                        }}
                        className={`py-2 px-3 border rounded-lg text-[11px] font-bold transition active:scale-95 text-left flex items-center justify-between cursor-pointer ${btn.color} ${
                          selectedOrder.status === btn.status
                            ? 'bg-white/10 border-white/30 text-white font-black'
                            : 'bg-black/20'
                        }`}
                      >
                        <span>{btn.label}</span>
                        {selectedOrder.status === btn.status && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5B453]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Print simulator option */}
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                  <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                  <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const specLines = selectedOrder.items.map(it => {
                          const spec = [
                            it.customization?.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                            it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                            it.customization?.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                            it.customization?.notes ? `備註: ${it.customization.notes}` : ''
                          ].filter(Boolean).join('/');
                          const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                          return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
                        }).join('\n');
                        const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                        setPrintConfirmData({
                          title: '重印工作廚房票 Kitchen Ticket',
                          ip: printerIp,
                          receiptType: 'kitchen',
                          receiptBody: kitchenStr,
                          onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                        });
                      }}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                    >
                      🧾 再印工作廚房票
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const customerDetails = selectedOrder.items.map(it => {
                          const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                          return `  ${pName.padEnd(16)} x${it.qty || 0}  $${(it.price || 0) * (it.qty || 0)}`;
                        }).join('\n');
                        const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`} 桌
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal || 0}
服務費 Svc(10%): $${selectedOrder.serviceCharge || 0}
實付支付 Net:   $${selectedOrder.total || 0}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                        setPrintConfirmData({
                          title: '重印顧客結算收據 Customer Receipt',
                          ip: printerIp,
                          receiptType: 'customer',
                          receiptBody: customerStr,
                          onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                        });
                      }}
                      className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                    >
                      💵 再印顧客結算收據
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered dishes list and checkout status */}
              {!selectedOrder.isPaid ? (
                /* ----------------- UNPAID ORDER PANEL ----------------- */
                <div className="md:col-span-7 space-y-4 font-sans">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">餐點規格與特配耗用</span>
                      <h4 className="text-white text-xs mt-0.5">本單餐點品項與客製需求：</h4>
                    </div>
                    
                    <div className="divide-y divide-white/5 space-y-3">
                      {selectedOrder.items.map((it: any) => {
                        let addOnsStr = '';
                        if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
                          addOnsStr = it.customization.selectedAddOns.map((a: any) => `+${getLocalizedText(a.name, 'zh') || a.name}(+$${a.price})`).join(' ');
                        }
                        const spec = [
                          it.customization?.spiciness === 1 ? '辣味' : '不辣',
                          it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                          it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭(+50)' : '',
                          addOnsStr,
                          it.customization?.notes ? `客備：${it.customization?.notes}` : ''
                        ].filter(Boolean).join(' / ');

                        const effectiveUnitPrice = computeOrderItemUnitPrice(it, menuItems);
                        const itemRowTotal = effectiveUnitPrice * (it.qty || 0);

                        return (
                          <div key={it.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-sans">
                            <div className="space-y-1 pr-4">
                              <p className="font-bold text-white text-[13px]">{it.name?.zh || it.name}</p>
                              {spec && <p className="text-[10px] text-amber-400 font-sans">{spec}</p>}
                              <p className="text-[10px] text-zinc-500 font-mono">計費單價: NT$ {effectiveUnitPrice}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Quantity Editor Buttons */}
                              <div className="flex items-center border border-white/10 rounded-lg bg-black/40 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleLocalQtyChange(it.id, -1)}
                                  className="p-1 px-2 hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="減少數量"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="px-2 font-mono text-xs font-bold text-white select-none">{it.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleLocalQtyChange(it.id, 1)}
                                  className="p-1 px-2 hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                                  title="增加數量"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              <div className="text-right whitespace-nowrap min-w-[70px]">
                                <p className="font-mono text-white font-bold text-[13px]">NT$ {itemRowTotal.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add dish tool inline */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-white/40 font-bold block mb-1">➕ 後台手動新增餐點到此單：</span>
                      <div className="flex gap-2">
                        <select id="modal-append-item-select" className="bg-[#1e1e1e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 cursor-pointer outline-none">
                          {menuItems.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {getLocalizedText(item.name, 'zh') || item.name} (NT$ {item.price})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById('modal-append-item-select') as HTMLSelectElement;
                            if (selectEl && selectEl.value) {
                              handleAddLocalItem(selectEl.value);
                            }
                          }}
                          className="bg-[#E5B453] hover:bg-[#ebd594] text-black px-4 py-1.5 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95"
                        >
                          確認加點
                        </button>
                      </div>
                    </div>

                    {/* Summary math calculation */}
                    <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs font-sans">
                      <div className="flex justify-between text-zinc-400">
                        <span>餐點客用金額小計 Subtotal</span>
                        <span className="font-mono text-white">NT$ {computeOrderItemsSubtotal(selectedOrder.items || [], menuItems).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>刷卡等計10%客用服務費 Charge</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.serviceCharge || 0).toLocaleString()}</span>
                      </div>
                      {selectedOrder.isMember && (
                        <div className="flex justify-between text-emerald-400">
                          <span>⭐ Google Quick 會員累點優惠</span>
                          <span>0 元免點累存中</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/5 pt-3.5 text-sm font-extrabold text-white">
                        <span className="text-[#E5B453]">親享解算總金額 Total</span>
                        <span className="font-mono text-xl text-[#E5B453]">NT$ {(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Takeout Info Panel */}
                  {selectedOrder.takeoutInfo && (
                    <div className="mt-4 bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 font-sans space-y-2">
                      <div className="flex items-center gap-2 border-b border-blue-500/20 pb-2 mb-2">
                        <span className="text-lg">🥡</span>
                        <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">外帶表單資訊 Takeout Info</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] mb-0.5">顧客姓名 Name</span>
                          <span className="text-white font-bold">{selectedOrder.takeoutInfo.customerName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] mb-0.5">聯絡電話 Phone</span>
                          <span className="text-white font-bold font-mono">{selectedOrder.takeoutInfo.phone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-500 block text-[10px] mb-0.5">預訂取餐時間 Pickup Time</span>
                          <span className="text-amber-400 font-black font-mono text-sm">{selectedOrder.takeoutInfo.pickupTime}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkout screen block */}
                  <div className="mt-4 pt-1 font-sans">
                    <div className="bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-[#0a0a0a] border border-[#E5B453]/20 rounded-xl p-4.5 space-y-3.5">
                      <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                        <Coins className="text-[#E5B453]" size={16} />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">櫃檯現收收款結帳 Counter Checkout</h4>
                        <span className="bg-amber-500/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                          待結帳 Unpaid
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-3">
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>應收總計 Final Total:</span>
                          <span className="font-mono font-black text-[#E5B453] text-[15px]">
                            NT$ {(selectedOrder.total || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-400 block font-bold">自選結帳管道 Payment Method</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['cash', 'credit', 'member'].map((m) => (
                              <button
                                type="button"
                                key={m}
                                onClick={() => {
                                  setSelectedOrder({ ...selectedOrder, paymentMethod: m as any });
                                }}
                                className={`py-1.5 rounded-lg font-bold text-[10px] uppercase border transition cursor-pointer text-center ${
                                  selectedOrder.paymentMethod === m
                                    ? 'bg-[#E5B453]/20 border-[#E5B453] text-[#E5B453]'
                                    : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/10'
                                  }`}
                              >
                                {m === 'cash' ? '💵 現金' : m === 'credit' ? '💳 刷卡' : '⭐️ 會員儲值'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedOrder.paymentMethod === 'cash' && (
                          <div className="space-y-2 pt-1 font-sans border-t border-[#ffffff08]">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-zinc-400 block font-bold">顧客支付現鈔 Received Bill (NT$)</span>
                              <span className="text-[9px] text-zinc-500">(請點選下方快選或手動輸入)</span>
                            </div>
                            <div className="flex gap-1 justify-between">
                              {[selectedOrder.total, 500, 1000, 2000].map((amt) => (
                                <button
                                  type="button"
                                  key={amt}
                                  onClick={() => setCashReceivedInput(Math.max(selectedOrder.total, amt))}
                                  className="bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded text-[10px] text-white font-mono transition cursor-pointer flex-1 text-center"
                                >
                                  ${amt}
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              min={selectedOrder.total}
                              value={cashReceivedInput || ''}
                              onChange={(e) => setCashReceivedInput(parseInt(e.target.value, 10) || 0)}
                              className="w-full bg-[#1b1b1b] border border-white/10 rounded-lg p-2 text-white font-mono text-xs focus:border-[#E5B453]/40 outline-none leading-none"
                            />
                             {/* 💳 櫃檯現場付款結帳確認欄 (Single Order Cash Checkout Confirmation Panel) */}
                             <div className="bg-amber-500/5 border border-amber-500/30 p-2.5 rounded-xl space-y-2 mt-2 text-[10px] font-sans">
                               <div className="flex items-center justify-between border-b border-white/5 pb-1 flex-wrap">
                                 <span className="text-[#E5B453] font-black uppercase text-[10.5px]">📝 現場付訖核算確認 (Checkout Confirmation)</span>
                                 <span className="bg-amber-500/10 text-amber-500 text-[8px] px-1 py-0.5 rounded font-black font-mono">
                                   現金收款
                                 </span>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                 <div className="space-y-0.5">
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">應付金額 Final:</span>
                                     <span className="font-mono text-xs font-black text-white">NT$ {selectedOrder.total}</span>
                                   </div>
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">實收金額 Received:</span>
                                     <span className="font-mono text-xs font-black text-amber-400">NT$ {cashReceivedInput}</span>
                                   </div>
                                 </div>
                                 <div className="space-y-0.5 border-l border-white/5 pl-2">
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">找零金額 Change:</span>
                                     <span className="font-mono text-sm font-black text-emerald-400 animate-pulse">
                                       NT$ {Math.max(0, cashReceivedInput - selectedOrder.total)}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-baseline">
                                     <span className="text-zinc-500">狀態 Status:</span>
                                     <span className="font-bold text-zinc-300">款項確認中</span>
                                   </div>
                                 </div>
                               </div>
                              {cashReceivedInput < selectedOrder.total ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-1 px-2 rounded text-[9px] text-center font-bold">
                                  ⚠️ 實收金額不足！尚差 NT$ {selectedOrder.total - cashReceivedInput} 元
                                </div>
                              ) : (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 px-2 rounded text-[9px] text-center font-bold">
                                  ⚡ 現金經核算正確，可安全核可付款並上傳 Firestore 資料庫
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedOrder.paymentMethod === 'member' && (
                          <div className="bg-[#121824]/80 border border-blue-500/20 p-3 rounded-lg font-sans space-y-2.5 text-left">
                            <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider">👤 會員餘額扣扣狀態 (Member Status)</span>
                            {(() => {
                              const dbStr = localStorage.getItem('google-members-database');
                              if (dbStr) {
                                try {
                                  const db = JSON.parse(dbStr);
                                  let vipEmail = '';
                                  if (selectedOrder.customerName) {
                                    const matched = db.find((m: any) => m.name === selectedOrder.customerName);
                                    if (matched) {
                                      vipEmail = matched.email;
                                    }
                                  }
                                  const member = vipEmail ? db.find((m: any) => m.email === vipEmail) : null;
                                  if (member) {
                                    const hasEnough = member.balance >= selectedOrder.total;
                                    return (
                                      <div className="space-y-2 text-xs">
                                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded border border-white/5">
                                          <img referrerPolicy="no-referrer" src={member.avatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} className="w-6 h-6 rounded-full object-cover" alt="" />
                                          <div>
                                            <p className="text-[11px] font-bold text-white leading-none">{member.name}</p>
                                            <p className="text-[8px] text-zinc-500 font-mono leading-none mt-0.5">{getMaskedEmail(member.email)}</p>
                                          </div>
                                        </div>
                                        <div className="flex justify-between font-mono bg-zinc-950 p-1.5 rounded">
                                          <span className="text-zinc-500 text-[10px]">儲值餘額 Balance:</span>
                                          <span className="text-emerald-400 font-black">NT$ {member.balance || 0}</span>
                                        </div>
                                        {!hasEnough && (
                                          <p className="text-[9px] text-red-400">⚠️ 餘額不足，請先往收銀台為會員儲值再回到這裡或改為其他付費方式。</p>
                                        )}
                                      </div>
                                    );
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              return <p className="text-[10px] text-zinc-500">查無對應 Google 會員</p>;
                            })()}
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleProcessCheckout}
                            className="w-full bg-[#E5B453] hover:bg-[#e4cd91] text-black font-extrabold py-2.5 rounded-xl transition font-sans text-xs active:scale-95 cursor-pointer text-center"
                          >
                            🛒 確定現場付款收款，並將結帳紀錄上傳 Cloud Firestore 資料庫
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print simulator option */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                    <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                    <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const specLines = selectedOrder.items.map(it => {
                            const spec = [
                              it.customization?.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                              it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                              it.customization?.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                              it.customization?.notes ? `備註: ${it.customization.notes}` : ''
                            ].filter(Boolean).join('/');
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `[ ] ${pName} x ${it.qty || 0}份\n    【 ${spec} 】`;
                          }).join('\n');
                          const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印工作廚房票 Kitchen Ticket',
                            ip: printerIp,
                            receiptType: 'kitchen',
                            receiptBody: kitchenStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                      >
                        🧾 再印工作廚房票
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const customerDetails = selectedOrder.items.map(it => {
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `  ${pName.padEnd(16)} x${it.qty || 0}  $${(it.price || 0) * (it.qty || 0)}`;
                          }).join('\n');
                          const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber || 'N/A'}`} 桌
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal || 0}
服務費 Svc(10%): $${selectedOrder.serviceCharge || 0}
實付支付 Net:   $${selectedOrder.total || 0}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印顧客結算收據 Customer Receipt',
                            ip: printerIp,
                            receiptType: 'customer',
                            receiptBody: customerStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                      >
                        💵 再印顧客結算收據
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ----------------- PAID ORDER PANEL ----------------- */
                <div className="md:col-span-7 space-y-4 font-sans">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">餐點規格與特配耗用 (已結帳)</span>
                      <h4 className="text-white text-xs mt-0.5">本單餐點品項與客製需求（變更項目需配合退貨稽核簽核）：</h4>
                    </div>
                    
                    <div className="divide-y divide-white/5 space-y-3">
                      {selectedOrder.items.map((it: any) => {
                        const spec = [
                          it.customization?.spiciness === 1 ? '辣味' : '不辣',
                          it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                          it.customization?.soupBase === 'coconut-milk' ? '升級奶香冬蔭' : '',
                          it.customization?.notes ? `客備：${it.customization?.notes}` : ''
                        ].filter(Boolean).join(' / ');

                        return (
                          <div key={it.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-sans">
                            <div className="space-y-1 pr-4">
                              <p className="font-bold text-white text-[13px]">{it.name?.zh || it.name}</p>
                              {spec && <p className="text-[10px] text-amber-400 font-sans">{spec}</p>}
                              <p className="text-[10px] text-zinc-500 font-mono">定額單價: NT$ {it.price}</p>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Quantity Editor Buttons with Return Workflow */}
                              <div className="flex items-center border border-white/10 rounded-lg bg-black/40 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => setPaidModDetails({ item: it, delta: -1, isAddingNew: false })}
                                  className="p-1 px-2 hover:bg-white/5 text-rose-450 hover:text-rose-450 text-rose-400 transition cursor-pointer"
                                  title="欲進行已結帳退貨，請點擊以發起核銷簽核"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="px-2 font-mono text-xs font-bold text-white select-none">{it.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => setPaidModDetails({ item: it, delta: 1, isAddingNew: false })}
                                  className="p-1 px-2 hover:bg-white/5 text-emerald-450 hover:text-emerald-450 text-emerald-400 transition cursor-pointer"
                                  title="欲進行已結帳加點，請點擊以發起補收簽核"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              <div className="text-right whitespace-nowrap min-w-[70px]">
                                <p className="font-mono text-white font-bold text-[13px]">NT$ {((it.price || 0) * (it.qty || 0)).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Append item selection dropdown for paid orders */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-amber-500 font-extrabold block mb-1">➕ 連動退貨或追加異動（點擊下方以追加商品）：</span>
                      <div className="flex gap-2">
                        <select id="paid-modal-append-item-select" className="bg-[#1c1c1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 cursor-pointer outline-none">
                          {menuItems.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {getLocalizedText(item.name, 'zh') || item.name} (NT$ {item.price})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById('paid-modal-append-item-select') as HTMLSelectElement;
                            if (selectEl && selectEl.value) {
                              const dish = menuItems.find((m: any) => m.id === selectEl.value);
                              if (dish) {
                                setPaidModDetails({ menuItemId: dish.id, item: { name: dish.name, price: dish.price }, delta: 1, isAddingNew: true });
                              }
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 font-bold rounded-lg text-xs transition cursor-pointer active:scale-95 shadow-sm shadow-amber-500/10 whitespace-nowrap"
                        >
                          確認追加餐點
                        </button>
                      </div>
                    </div>

                    {/* Summary math calculation */}
                    <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs font-sans">
                      <div className="flex justify-between text-zinc-400">
                        <span>餐點實收金額小計 Subtotal</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>刷卡等計10%客用服務費 Charge</span>
                        <span className="font-mono text-white">NT$ {(selectedOrder.serviceCharge || 0).toLocaleString()}</span>
                      </div>
                      {selectedOrder.isMember && (
                        <div className="flex justify-between text-emerald-400">
                          <span>⭐ Google Quick 會員累點優惠</span>
                          <span>0 元免點累存中</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/5 pt-3.5 text-sm font-extrabold text-white">
                        <span className="text-[#E5B453]">已結帳核實總金額 Total</span>
                        <span className="font-mono text-xl text-[#E5B453]">NT$ {(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Ledger Audit Rail for modifications */}
                    {selectedOrder.refundLogs && selectedOrder.refundLogs.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-orange-500/20 bg-orange-500/5 p-3 rounded-lg space-y-2">
                        <span className="text-[10px] text-orange-400 font-extrabold block uppercase tracking-wider">📔 已簽核已結帳退貨與追加款稽核明細 ({selectedOrder.refundLogs.length} 筆)</span>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {selectedOrder.refundLogs.map((log: any) => (
                            <div key={log.id} className="text-[10.5px] border-b border-orange-500/10 pb-2 last:border-0 last:pb-0 font-sans">
                              <div className="flex justify-between font-bold text-white">
                                <span>{log.type === 'refund' ? '🏮 已核准退貨核銷' : '📈 已簽核追加補款'}</span>
                                <span className={log.totalDiff < 0 ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                                  {log.totalDiff < 0 ? `退核 NT$ ${Math.abs(log.totalDiff)}` : `補收 NT$ ${log.totalDiff}`}
                                </span>
                              </div>
                              <p className="text-zinc-300 mt-0.5">標的物: {log.itemName} (增減量: {log.qtyChange > 0 ? `+${log.qtyChange}` : log.qtyChange})</p>
                              <div className="flex justify-between text-zinc-400 text-[9.5px] mt-1 italic font-mono">
                                <span>原因: {log.reason} {log.notes && `(${log.notes})`}</span>
                                <span>經辦: {log.authorizedByPin}</span>
                              </div>
                              <span className="block text-zinc-500 text-[8.5px] text-right mt-0.5">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing complete banner */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-1">
                    <p className="text-emerald-400 font-extrabold text-xs">💸 此訂單已完成結帳</p>
                    <p className="text-[9.5px] text-zinc-500 font-sans">
                      本筆資金已被安全收付，且對應流水交易紀錄已在 Firebase 成功建檔。如因餐點規格異動已自動登錄對沖帳目。
                    </p>
                  </div>

                  {/* Print simulator option */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 text-xs">
                    <span className="text-[10px] font-black tracking-widest text-[#E5B453] uppercase block">店鋪出餐熱感存票模擬</span>
                    <p className="text-[10px] text-white/40">可將顧客結賬明細或廚房交代工作票重寄發送列印隊列備用明細單：</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const specLines = selectedOrder.items.map(it => {
                            const spec = [
                              it.customization?.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
                              it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
                              it.customization?.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
                              it.customization?.notes ? `備註: ${it.customization.notes}` : ''
                            ].filter(Boolean).join('/');
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
                          }).join('\n');
                          const kitchenStr = `
========================================
       沙貝燒烤 (廚房工作即時交代單-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`}
========================================
單號 ID: ${selectedOrder.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(selectedOrder.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印工作廚房票 Kitchen Ticket',
                            ip: printerIp,
                            receiptType: 'kitchen',
                            receiptBody: kitchenStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【防爆/防油熱感廚房交代票】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10.5px] border border-white/10 font-bold active:scale-95 transition cursor-pointer"
                      >
                        🧾 再印工作廚房票
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const customerDetails = selectedOrder.items.map(it => {
                            const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
                            return `  ${pName.padEnd(16)} x${it.qty}  $${it.price * it.qty}`;
                          }).join('\n');
                          const customerStr = `
========================================
       沙貝燒烤 (顧客結賬與消點收據-重印)
       ${selectedOrder.takeoutInfo || String(selectedOrder.tableNumber || '').includes('外帶') || selectedOrder.tableNumber === 'takeout' ? `單號/標記: #${selectedOrder.id}` : `桌號/標記: ${selectedOrder.tableNumber}`} 桌
========================================
單號 ID: ${selectedOrder.id}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${new Date(selectedOrder.createdAt).toLocaleTimeString()}
付款方式: ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${selectedOrder.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${selectedOrder.subtotal}
服務費 Svc(10%): $${selectedOrder.serviceCharge}
實付支付 Net:   $${selectedOrder.total}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();

                          setPrintConfirmData({
                            title: '重印顧客結算收據 Customer Receipt',
                            ip: printerIp,
                            receiptType: 'customer',
                            receiptBody: customerStr,
                            onConfirm: () => alert(`🖨️ 模擬重行印列【顧客結賬發票與消點收據】成功！`)
                          });
                        }}
                        className="flex-1 py-1.5 bg-[#E5B453]/15 hover:bg-[#E5B453]/25 text-[#E5B453] rounded-lg text-[10.5px] border border-[#E5B453]/25 font-bold active:scale-95 transition cursor-pointer"
                      >
                        💵 再印顧客結算收據
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 px-6 py-4.5 border-t border-white/10 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
  );
};
