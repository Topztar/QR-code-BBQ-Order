import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { useDashboardStore } from '../../../stores/dashboard/useDashboardStore';
import { memberService } from '../../../services/memberService';
import { openCashDrawerViaBridge } from '../../../lib/posBridgeClient';
import { apiFetch } from '../../../lib/api';
import { Order } from '../../../types';
import { getMaskedEmail } from '../ManagerDashboardUtils';

export interface CashierCheckoutPanelProps {
  cashierPanelWidth: number;
  getPanelWidthClass: (w?: number) => string;
  orders: Order[];
  posBridgeUrl?: string;
  billPrinter?: any;
  staffPin?: string;
  cashierSelectedOrder: Order;
  cashierMergedOrders: Order[];
  cashierCalculatedTotals: { subtotal: number; discount: number; surcharge: number; total: number; };
  onPayOrder?: (orderId: string, paymentData: any, skipRefresh?: boolean) => Promise<void>;
  onBulkPayOrders?: (orderIds: string[], checkoutData: any, skipRefresh?: boolean) => Promise<{ success: boolean }>;
  onUpdateTableStatus?: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  setCheckoutSuccessData?: (data: any) => void;
}

export const CashierCheckoutPanel: React.FC<CashierCheckoutPanelProps> = ({
  cashierPanelWidth, getPanelWidthClass, orders, posBridgeUrl, billPrinter, staffPin,
  cashierSelectedOrder, cashierMergedOrders, cashierCalculatedTotals,
  onPayOrder, onBulkPayOrders, onUpdateTableStatus, setCheckoutSuccessData
}) => {
  const {
    cashierPaymentMethod, setCashierPaymentMethod,
    cashierCashReceived, setCashierCashReceived,
    cashierCashChannel, setCashierCashChannel,
    cashierCheckoutScope,
    cashierDiscountType, setCashierDiscountType, cashierDiscountRate, setCashierDiscountRate, cashierDiscountFlat, setCashierDiscountFlat,
    cashierSurchargeType, setCashierSurchargeType, cashierSurchargeRate, setCashierSurchargeRate, cashierSurchargeFlat, setCashierSurchargeFlat,
    isAdjustingSurcharge, setIsAdjustingSurcharge, isAdjustingDiscount, setIsAdjustingDiscount,
    setSelectedCashierOrderId,
    showCheckoutConfirm, setShowCheckoutConfirm
  } = useDashboardStore();

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  

  const handleCashierCheckoutSubmit = async () => {
    if (!cashierSelectedOrder || !onPayOrder) return;
    if (isCheckoutSubmitting) return;
    
    if (cashierPaymentMethod === 'cash' && cashierCashReceived < cashierCalculatedTotals.total) {
      alert(`⚠️ 實收現金金額不足！實收 (NT$ ${cashierCashReceived}) 需大於或等於應收總額 (NT$ ${cashierCalculatedTotals.total})。`);
      return;
    }

    let cashierDeductedEmail: string | null = null;
    let cashierDeductedAmount = 0;

    if (cashierPaymentMethod === 'member') {
      const member = cashierSelectedOrder?.customerName
        ? memberService.getMemberByName(cashierSelectedOrder.customerName)
        : null;
      const vipEmail = member?.email || '';

      if (!vipEmail) {
        alert('⚠️ 找不到匹配此結帳單的會員帳戶，無法使用會員餘額付款！');
        return;
      }

      try {
        const deductRes = await fetch(`/api/members/${encodeURIComponent(vipEmail)}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cashierCalculatedTotals.total, orderId: cashierSelectedOrder?.id }),
        });

        const deductData = await deductRes.json();
        if (!deductRes.ok || !deductData.member) {
          alert(`⚠️ 會員餘額扣抵失敗：${deductData.error || '餘額不足或系統異常'}！`);
          return;
        }

        cashierDeductedEmail = vipEmail;
        cashierDeductedAmount = cashierCalculatedTotals.total;

        memberService.updateMember(vipEmail, {
          balance: deductData.member.balance,
          points: deductData.member.points,
        });
      } catch (err) {
        alert(`⚠️ 連線伺服器失敗，無法完成會員餘額扣抵：${err}`);
        return;
      }
    }
    
    setIsCheckoutSubmitting(true);
    try {
      const change = cashierPaymentMethod === 'cash' ? (cashierCashReceived - cashierCalculatedTotals.total) : 0;
      
      const mergedTableIds = cashierMergedOrders.map(o => o.tableNumber);
      const mergedOrderIds = cashierMergedOrders.map(o => o.id);

      const checkoutRecord = {
        id: `TX-${Date.now()}`,
        orderId: cashierSelectedOrder.id,
        tableNumber: cashierSelectedOrder.tableNumber,
        mergedTableNumbers: mergedTableIds,
        mergedOrderIds: mergedOrderIds,
        subtotal: cashierCalculatedTotals.subtotal,
        discount: cashierCalculatedTotals.discount,
        serviceCharge: cashierCalculatedTotals.surcharge,
        total: cashierCalculatedTotals.total,
        amountPaid: cashierPaymentMethod === 'cash' ? cashierCashReceived : cashierCalculatedTotals.total,
        changeProvided: change,
        paymentMethod: cashierPaymentMethod,
        staffPin: staffPin || '070718',
        checkoutTime: new Date().toISOString()
      };

      // Create a filtered record for Cloud Firestore to comply with rigid security rules/schemas
      const dbPostRecord = {
        id: checkoutRecord.id,
        orderId: checkoutRecord.orderId,
        tableNumber: checkoutRecord.tableNumber,
        subtotal: checkoutRecord.subtotal,
        discount: checkoutRecord.discount,
        serviceCharge: checkoutRecord.serviceCharge,
        total: checkoutRecord.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: checkoutRecord.paymentMethod,
        staffPin: checkoutRecord.staffPin,
        checkoutTime: checkoutRecord.checkoutTime
      };

      // Make a static copy of the merged orders array to prevent recalculated useMemo states mid-loop
      const staticMergedOrders = [...cashierMergedOrders];

      if (onBulkPayOrders) {
        await onBulkPayOrders(staticMergedOrders.map(o => o.id), {
          paymentMethod: cashierPaymentMethod,
          subtotal: cashierCalculatedTotals.subtotal,
          serviceCharge: cashierCalculatedTotals.surcharge,
          discount: cashierCalculatedTotals.discount,
          total: cashierCalculatedTotals.total,
          cashTendered: cashierPaymentMethod === 'cash' ? cashierCashReceived : cashierCalculatedTotals.total,
          changeAmount: change,
          tableNumbers: mergedTableIds,
          checkoutRecord: dbPostRecord
        });
      } else {
        // Fallback: Update all merged orders as paid!
        for (let i = 0; i < staticMergedOrders.length; i++) {
          const ord = staticMergedOrders[i];
          const skipRefresh = i < staticMergedOrders.length - 1;

          if (ord.id === cashierSelectedOrder.id) {
            await onPayOrder(cashierSelectedOrder.id, {
              paymentMethod: cashierPaymentMethod,
              subtotal: cashierCalculatedTotals.subtotal,
              serviceCharge: cashierCalculatedTotals.surcharge,
              discount: cashierCalculatedTotals.discount,
              total: cashierCalculatedTotals.total,
              isPaid: true,
              checkoutRecord: dbPostRecord
            }, skipRefresh);
          } else {
            await onPayOrder(ord.id, {
              paymentMethod: cashierPaymentMethod,
              subtotal: 0,
              serviceCharge: 0,
              discount: 0,
              total: 0,
              isPaid: true
            }, skipRefresh);
          }
        }

        // Smart Table Status Release: Only release table to 'cleaning' if NO other unpaid non-cancelled orders remain for that table
        if (onUpdateTableStatus) {
          const uniqueTableIds: string[] = Array.from(new Set<string>(mergedTableIds));
          for (const tid of uniqueTableIds) {
            if (tid && !tid.includes('外帶')) {
              const remainingUnpaidForTable = orders.filter(
                o => String(o.tableNumber).trim() === String(tid).trim() &&
                !staticMergedOrders.some(m => m.id === o.id) &&
                !o.isPaid &&
                o.status !== 'cancelled'
              );
              if (remainingUnpaidForTable.length === 0) {
                await onUpdateTableStatus(tid, {
                  status: 'cleaning',
                  preservedFor: '',
                  mergedWith: '',
                  cleaningStartedAt: new Date().toISOString()
                });
              }
            }
          }
        }
      }
      
      setSelectedCashierOrderId(null);
      
      const distinctTableDisplay = Array.from(new Set(staticMergedOrders.map(o => o.tableNumber))).join(' + ');
      
      setCheckoutSuccessData({
        id: cashierSelectedOrder.id,
        tableNumber: distinctTableDisplay || cashierSelectedOrder.tableNumber,
        subtotal: checkoutRecord.subtotal,
        discount: checkoutRecord.discount,
        serviceCharge: checkoutRecord.serviceCharge,
        total: checkoutRecord.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: checkoutRecord.paymentMethod,
        isCashier: true,
        mergedCount: staticMergedOrders.length,
        checkoutScope: cashierCheckoutScope
      });

      // Cash drawer interlock linkage via LOCAL-PRINTER-POS-BRIDGE with Server API fallback
      if (billPrinter.cashDrawerEnabled) {
        // Direct local bridge dispatch (works on localhost, LAN, and Windows POS Bridge)
        const targetPort = billPrinter.usbPort?.includes(':') ? billPrinter.usbPort.toUpperCase() : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`;
        openCashDrawerViaBridge(targetPort, posBridgeUrl)
          .then(bRes => {
            if (bRes.success) {
              console.log('[Cash Drawer Bridge Success]', bRes.message);
            } else {
              // Server API fallback ONLY if local POS bridge failed
              console.warn('[Cash Drawer Bridge Warning] Local bridge failed, triggering server fallback...', bRes.message);
              apiFetch('/api/printer/open-drawer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: billPrinter })
              })
                .then(res => res.json())
                .then(data => console.log('[Cash Drawer Server Log]', data.log))
                .catch(e => console.error('[Cash Drawer Server Error]', e));
            }
          })
          .catch(e => {
            console.warn('[Cash Drawer Bridge Warning]', e);
            // Fallback trigger
            apiFetch('/api/printer/open-drawer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ settings: billPrinter })
            })
              .then(res => res.json())
              .then(data => console.log('[Cash Drawer Server Log]', data.log))
              .catch(err => console.error('[Cash Drawer Server Error]', err));
          });
      }

    } catch (err: any) {
      console.error('[Cashier Checkout processing error]', err);
      // Compensating Transaction (Rollback)
      if (cashierDeductedEmail && cashierDeductedAmount > 0) {
        try {
          const rbRes = await fetch(`/api/members/${encodeURIComponent(cashierDeductedEmail)}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: cashierDeductedAmount })
          });
          const rbData = await rbRes.json();
          if (rbRes.ok && rbData.member) {
            memberService.updateMember(cashierDeductedEmail, {
              balance: rbData.member.balance,
              points: rbData.member.points,
            });
            alert(`❌ 收銀失敗！已自動撤銷會員扣款，返還 NT$ ${cashierDeductedAmount}。\n錯誤原因: ${err?.message || String(err)}`);
            return;
          }
        } catch (rbErr) {
          console.error('[Critical] Cashier rollback failed:', rbErr);
        }
      }
      alert(`❌ 收銀失敗: ${err?.message || String(err)}`);
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };





  // ─── Tier B: Google Identity Protection ───────────────────────────────────
  const [cashierMemberData, setCashierMemberData] = React.useState<any>(null);
  const [cashierMemberLoading, setCashierMemberLoading] = React.useState(false);

  const fetchMemberData = React.useCallback(async (customerName: string) => {
    try {
      const cached = memberService.getMemberByName(customerName);
      if (cached?.email) {
        setCashierMemberLoading(true);
        try {
          const res = await fetch(`/api/members/${encodeURIComponent(cached.email)}`);
          if (res.ok) {
            const data = await res.json();
            setCashierMemberData(data);
            memberService.updateMember(cached.email, {
              balance: data.balance,
              points: data.points,
            });
            return;
          }
        } finally {
          setCashierMemberLoading(false);
        }
        setCashierMemberData(cached);
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cached.email, name: cached.name, avatar: cached.avatar,
            balance: cached.balance || 0, points: cached.points || 0 }),
        });
        return;
      }
    } catch (e) { console.error('[Members] fetchMemberData error:', e); }
    setCashierMemberData(null);
  }, []);

  const selectedOrderId = cashierSelectedOrder?.id;
  const selectedCustomerName = cashierSelectedOrder?.customerName;

  React.useEffect(() => {
    if (cashierPaymentMethod === 'member' && selectedCustomerName) {
      fetchMemberData(selectedCustomerName);
    } else {
      setCashierMemberData(null);
    }
  }, [cashierPaymentMethod, selectedOrderId, selectedCustomerName, fetchMemberData]);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
                {/* SELECTOR 2: RIGHT SUB-PANEL (Payment Gate, Touch Keyboard & Action Trigger) */}
                <div className={`bg-[#121212] border border-white/15 rounded-2xl p-6 w-full ${getPanelWidthClass(cashierPanelWidth)} max-h-[92vh] flex flex-col relative shadow-2xl animate-scaleUp overflow-y-auto min-w-0`} id="cashier-checkout-right-subpanel">
                  <div className="flex-1 flex flex-col justify-between min-h-0" id="cashier-active-payment-area">
                    <div className="flex-1 overflow-y-auto space-y-4 text-left pr-2">

                      {/* Payment Method Selector Grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase block">
                          💳 選擇收銀支付管道 (Payment Method Selector)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'cash', label: '💵 現金收銀', desc: '實收大鈔與選管道' },
                            { id: 'credit', label: '💳 信用卡結', desc: '預設 10% 服務加成' },
                            { id: 'member', label: '⭐️ 會員儲值', desc: '扣抵會員與儲值管理' },
                            { id: 'twqr', label: '📱 TWQR支付', desc: '預設 10% 服務加成' }
                          ].map((pay) => {
                            const isAct = cashierPaymentMethod === pay.id;
                            return (
                              <button
                                key={pay.id}
                                type="button"
                                onClick={() => {
                                  const method = pay.id as any;
                                  setCashierPaymentMethod(method);
                                  if (method === 'credit' || method === 'twqr') {
                                    setCashierSurchargeRate(10);
                                    setCashierSurchargeFlat(0);
                                    setCashierSurchargeType('percent');
                                  } else {
                                    setCashierSurchargeRate(0);
                                    setCashierSurchargeFlat(0);
                                    setCashierSurchargeType('percent');
                                  }
                                }}
                                className={`text-left rounded-xl p-2.5 border cursor-pointer flex flex-col justify-between transition-all active:scale-95 duration-100 ${
                                  isAct
                                    ? pay.id === 'member'
                                      ? 'bg-amber-400/10 border-amber-400 text-white shadow shadow-amber-400/10'
                                      : 'bg-[#E5B453]/10 border-[#E5B453] text-white shadow shadow-[#E5B453]/10'
                                    : 'bg-[#161616] border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                                }`}
                              >
                                <span className={`font-bold text-xs ${isAct ? 'text-[#E5B453]' : 'text-zinc-300'}`}>
                                  {pay.label}
                                </span>
                                <span className="text-[9px] opacity-60 mt-0.5 block leading-tight">
                                  {pay.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cash handling drawer if cash is chosen */}
                      {cashierPaymentMethod === 'cash' && (
                        <div className="bg-black/40 border border-white/12 p-3.5 rounded-xl flex flex-col lg:flex-row gap-4 font-sans mt-2 justify-between">
                          {/* Left Panel: Received Cash Calculations */}
                          <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-[#E5B453] font-bold block tracking-wider uppercase">💶 實收大鈔 (Cash Received Option)</span>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-2 font-bold font-mono text-[#E5B453] text-[13px]">NT$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    id="cashier-received-amt-input"
                                    value={cashierCashReceived === 0 ? '' : cashierCashReceived}
                                    onChange={(e) => setCashierCashReceived(parseFloat(e.target.value.replace(/\D/g, '')) || 0)}
                                    className="w-full bg-[#161616] border border-white/10 rounded-lg py-1.5 px-2.5 pl-10 text-white font-mono text-sm font-extrabold focus:outline-none focus:border-[#E5B453] transition"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCashierCashReceived(cashierCalculatedTotals.total)}
                                  className="px-2.5 py-2 text-xs font-sans bg-amber-500/10 border border-amber-500/30 text-[#E5B453] hover:bg-[#E5B453] hover:text-black rounded-lg transition font-black cursor-pointer whitespace-nowrap active:scale-95"
                                >
                                  剛好 Total: NT$ {cashierCalculatedTotals.total}
                                </button>
                              </div>
                            </div>

                            {/* 2. 現金收銀管道選擇 */}
                            <div className="space-y-1.5 bg-black/30 p-2 rounded-lg border border-white/5">
                              <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wide">📦 選擇現金收銀管道 (Cash Channel)</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { id: 'counter', title: '🏢 櫃檯現金', desc: 'Counter' },
                                  { id: 'kiosk', title: '🏪 自助收銀', desc: 'Self Kiosk' },
                                  { id: 'delivery', title: '🛵 外送代收', desc: 'Delivery' }
                                ].map((chan) => (
                                  <button
                                    key={`cash-chan-${chan.id}`}
                                    type="button"
                                    onClick={() => setCashierCashChannel(chan.id as any)}
                                    className={`py-1 px-1 rounded-lg border text-left cursor-pointer transition flex flex-col justify-center items-center ${
                                      cashierCashChannel === chan.id
                                        ? 'bg-[#E5B453]/20 border-[#E5B453] text-[#E5B453] font-black'
                                        : 'bg-[#121212]/90 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                                    }`}
                                  >
                                    <span className="text-[9px] font-extrabold block leading-none">{chan.title}</span>
                                    <span className="text-[8px] opacity-60 mt-0.5 block leading-none">{chan.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 1. 實收大鈔可選1000、500、100 */}
                            <div className="space-y-1">
                              <span className="text-[9px] text-zinc-500 block font-bold">單張面額付鈔 Set Denomination</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[1000, 500, 100].map((note) => (
                                  <button
                                    key={`note-set-${note}`}
                                    type="button"
                                    onClick={() => setCashierCashReceived(note)}
                                    className="py-1.5 text-xs font-mono font-black border border-white/10 hover:border-[#E5B453] hover:bg-[#E5B453]/10 bg-zinc-900 rounded-lg text-white transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95"
                                  >
                                    <span>NT$ {note}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-zinc-500 block font-bold">累加點鈔 Add Bill Notes</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[1000, 500, 100].map((note) => (
                                  <button
                                    key={`note-add-${note}`}
                                    type="button"
                                    onClick={() => setCashierCashReceived(prev => (prev || 0) + note)}
                                    className="py-1 text-xs font-mono font-bold border border-white/5 hover:border-[#E5B453]/40 hover:bg-[#E5B453]/10 bg-zinc-950 rounded-lg text-zinc-300 transition cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                                  >
                                    <span>＋{note}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 💳 現金結帳確認欄 (Cash Checkout Confirmation Summary Panel) */}
                            <div className="bg-amber-500/5 border border-amber-500/30 p-2.5 rounded-xl space-y-1.5 mt-1 text-[11px] font-sans">
                              <div className="flex items-center justify-between border-b border-white/5 pb-1 flex-wrap">
                                <span className="text-[#E5B453] font-black uppercase text-xs">📝 櫃檯現金付款確認 (Cashier Checkout Confirmation)</span>
                                <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">
                                  核收核對
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                <div className="space-y-0.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">應收總額 Total Due:</span>
                                    <span className="font-mono text-sm font-black text-white">NT$ {cashierCalculatedTotals.total}</span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">實收現鈔 Cash Paid:</span>
                                    <span className="font-mono text-sm font-black text-amber-400">NT$ {cashierCashReceived}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5 border-l border-white/5 pl-2.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">應找零錢 Change:</span>
                                    <span className="font-mono text-base font-black text-emerald-400 animate-pulse">
                                      NT$ {Math.max(0, cashierCashReceived - cashierCalculatedTotals.total)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-500">收銀管道 Channel:</span>
                                    <span className="font-bold text-blue-400">
                                      {cashierCashChannel === 'counter' ? '🏢 櫃檯現金' : cashierCashChannel === 'kiosk' ? '🏪 自助收銀' : '🛵 外送代收'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {cashierCashReceived < cashierCalculatedTotals.total ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-1 px-2 rounded text-[10px] text-center font-bold">
                                  ⚠️ 實收金額不足！尚差 NT$ {cashierCalculatedTotals.total - cashierCashReceived} 元
                                </div>
                              ) : (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 px-2 rounded text-[10px] text-center font-bold">
                                  ⚡ 現金經現場核對無誤，可安全核可付款並上傳 Firestore 資料庫
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Panel: Compact, touchscreen numeric keypad */}
                          <div className="w-full lg:w-48 bg-black/20 p-2 border border-white/5 rounded-xl flex flex-col gap-1.5 self-start">
                            <span className="text-[9px] text-zinc-500 font-extrabold block text-center uppercase tracking-wider">🎯 觸控快速鍵盤 Touch Keypad</span>
                            <div className="grid grid-cols-3 gap-1">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                <button
                                  key={`keypad-${num}`}
                                  type="button"
                                  onClick={() => {
                                    setCashierCashReceived(prev => {
                                      const s = String(prev);
                                      if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                        return parseFloat(num) || 0;
                                      } else {
                                        return parseFloat(s + num) || 0;
                                      }
                                    });
                                  }}
                                  className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-white hover:text-black bg-[#1c1c1c] hover:bg-[#E5B453] border border-white/5 hover:border-transparent rounded-lg transition active:scale-95 cursor-pointer"
                                >
                                  {num}
                                </button>
                              ))}
                              {/* Bottom row: Clear, 0, Backspace */}
                              <button
                                type="button"
                                onClick={() => setCashierCashReceived(0)}
                                className="w-full h-8 flex items-center justify-center font-bold text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition active:scale-95 cursor-pointer"
                                title="清除 Clear"
                              >
                                C
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '0') || 0;
                                    }
                                  });
                                }}
                                className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-white bg-[#1c1c1c] hover:bg-[#E5B453] hover:text-black border border-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                0
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (s.length <= 1) return 0;
                                    return parseFloat(s.slice(0, -1)) || 0;
                                  });
                                }}
                                className="w-full h-8 flex items-center justify-center font-mono text-xs font-bold text-zinc-400 hover:text-white bg-[#1a1a1a] hover:bg-zinc-800 border border-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                                title="倒退 Backspace"
                              >
                                ⌫
                              </button>
                            </div>
                            
                            {/* Extra touch helpers: +00 */}
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '00') || 0;
                                    }
                                  });
                                }}
                                className="py-1 flex items-center justify-center font-mono text-[10px] bg-[#1c1c1c] border border-white/5 hover:border-zinc-700 rounded-lg transition active:scale-95 cursor-pointer text-zinc-300 font-bold"
                              >
                                00
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCashierCashReceived(prev => {
                                    const s = String(prev);
                                    if (prev === 0 || prev === cashierCalculatedTotals.total) {
                                      return 0;
                                    } else {
                                      return parseFloat(s + '000') || 0;
                                    }
                                  });
                                }}
                                className="py-1 flex items-center justify-center font-mono text-[10px] bg-[#1c1c1c] border border-white/5 hover:border-zinc-700 rounded-lg transition active:scale-95 cursor-pointer text-zinc-300 font-bold"
                              >
                                000
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Member management drawer if member is chosen */}
                      {cashierPaymentMethod === 'member' && (
                        <div className="bg-[#121824]/80 border border-blue-500/20 p-3.5 rounded-xl flex flex-col gap-3 font-sans mt-2 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2">
                            <div className="space-y-0.5 bg-transparent">
                              <span className="text-[11px] text-blue-400 font-bold block tracking-wider uppercase">⭐️ 儲值卡結帳與快捷儲值 (Cashier Member Admin)</span>
                              <p className="text-zinc-400 text-[10px]">
                                {cashierSelectedOrder?.isMember 
                                  ? `結帳單已綁定會員：${cashierSelectedOrder.customerName}` 
                                  : '本結帳單尚未在點餐時綁定會員。'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Member Data Panel — Tier B: balance verified from backend */}
                          {(() => {
                            let matchedMember: any = cashierMemberData;
                            if (!matchedMember && cashierSelectedOrder?.customerName) {
                              matchedMember = memberService.getMemberByName(cashierSelectedOrder.customerName);
                            }

                            if (cashierMemberLoading) {
                              return (
                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-center text-zinc-500 text-xs py-6 animate-pulse">
                                  🔄 正在從後端驗證會員餘額...
                                </div>
                              );
                            }

                            if (!matchedMember) {
                              return (
                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-center text-zinc-500 text-xs py-6">
                                  ⚠️ 本點餐單尚未與任何 Google 會員帳戶綁定，無法使用儲值卡餘額付款。
                                </div>
                              );
                            }

                            const member = matchedMember;
                            const hasEnough = member.balance >= cashierCalculatedTotals.total;
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Left: Balance Details */}
                                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider">💳 餘額扣抵狀態</span>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-lg border border-white/5">
                                      <img referrerPolicy="no-referrer" src={member.avatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                                      <div>
                                        <p className="text-xs font-black text-white">{member.name}</p>
                                        <p className="text-[9px] text-zinc-500 font-mono leading-none mt-0.5">{getMaskedEmail(member.email)}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5 text-center">
                                      <div className="bg-zinc-900 px-1.5 py-1 rounded border border-white/5">
                                        <span className="text-[8px] text-zinc-500 block leading-none">當前帳存餘額</span>
                                        <span className="text-xs font-mono font-bold text-emerald-400">NT$ {member.balance || 0}</span>
                                      </div>
                                      <div className="bg-zinc-900 px-1.5 py-1 rounded border border-white/5">
                                        <span className="text-[8px] text-zinc-500 block leading-none">本次扣除金額</span>
                                        <span className="text-xs font-mono font-bold text-rose-400">NT$ {cashierCalculatedTotals.total}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="text-zinc-400">扣抵後剩餘：</span>
                                      <span className="font-mono font-bold text-zinc-200">
                                        NT$ {Math.max(0, (member.balance || 0) - cashierCalculatedTotals.total)}
                                      </span>
                                    </div>

                                    {!hasEnough && (
                                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded text-[9px] font-bold">
                                        ⚠️ 顧客儲值餘額不足！請先點擊右側進行【快捷現金增值】以補足差額扣抵。
                                      </div>
                                    )}
                                    {/* Tier B: server-verified badge */}
                                    {cashierMemberData && (
                                      <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-1.5 rounded text-[9px] font-bold">
                                        🔒 後端已驗證餘額 (Server-Verified)
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Top-up — calls backend API (Tier B) */}
                                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-zinc-300 font-extrabold block uppercase tracking-wider">💸 收銀台即時儲值 (Top-Up Engine)</span>
                                  <p className="text-[9px] text-zinc-400 leading-normal">
                                    顧客提供現場代收現金時，收銀員在此一鍵寫入儲值額：
                                  </p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                      { amt: 500, lbl: '＋儲值 $500' },
                                      { amt: 1000, lbl: '＋儲值 $1000' },
                                      { amt: 2000, lbl: '＋儲值 $2000' },
                                      { amt: 3000, lbl: '＋儲值 $3000' },
                                    ].map((choice) => (
                                      <button
                                        key={`cashier-top-${choice.amt}`}
                                        type="button"
                                        onClick={async () => {
                                          if (!member.email) { alert('⚠️ 找不到會員 Email，無法儲值。'); return; }
                                          try {
                                            const r = await fetch(`/api/members/${encodeURIComponent(member.email)}/topup`, {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ amount: choice.amt }),
                                            });
                                            const result = await r.json();
                                            if (r.ok && result.member) {
                                              setCashierMemberData(result.member);
                                              if (member.email) {
                                                memberService.updateMember(member.email, { balance: result.member.balance });
                                              }
                                              setCashierCashReceived(prev => prev + 1);
                                              setTimeout(() => setCashierCashReceived(prev => prev - 1), 50);
                                            } else {
                                              alert(`⚠️ 儲值失敗：${result.error || '未知錯誤'}`);
                                            }
                                          } catch (err) {
                                            alert(`⚠️ 網路錯誤，儲值未完成：${err}`);
                                          }
                                        }}
                                        className="py-1.5 text-[10px] font-sans font-black border border-[#E5B453]/20 hover:border-[#E5B453] hover:bg-[#E5B453]/10 bg-zinc-900 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                                      >
                                        {choice.lbl}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Bottom Area: Calculation & Submit */}
                    <div className="bg-[#161616] border-t border-white/10 p-4 rounded-xl space-y-3 font-sans mt-2.5">
                      {/* Detailed billing list */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-zinc-400">
                        <div className="text-left bg-black/20 p-2 border border-white/5 rounded-lg">
                          <span className="text-[9px] text-zinc-500 font-sans">原小計 Subtotal</span>
                          <p className="font-mono text-xs text-white font-bold mt-0.5">NT$ {cashierCalculatedTotals.subtotal}</p>
                        </div>
                        <div 
                          onClick={() => {
                            setIsAdjustingDiscount(!isAdjustingDiscount);
                            setIsAdjustingSurcharge(false);
                          }}
                          className={`text-left bg-black/20 p-2 border rounded-lg cursor-pointer transition active:scale-95 duration-100 group ${
                            isAdjustingDiscount ? 'border-[#E5B453] bg-zinc-900 shadow-lg' : 'border-white/5 hover:border-[#E5B453] hover:bg-zinc-900'
                          }`}
                          title="點擊此處可快速調整折扣 (Discount Modifier)"
                        >
                          <span className="text-[9px] text-[#E5B453]/80 group-hover:text-[#E5B453] font-bold flex items-center justify-between font-sans">
                            <span>割引折扣 Discount ⚙️</span>
                            <span className="text-[8px] opacity-65">{isAdjustingDiscount ? '調整中' : '點擊調整'}</span>
                          </span>
                          <p className="font-mono text-xs text-rose-400 font-bold mt-0.5">
                            {cashierCalculatedTotals.discount > 0 ? `- NT$ ${cashierCalculatedTotals.discount}` : 'NT$ 0'}
                          </p>
                        </div>
                        <div 
                          onClick={() => {
                            setIsAdjustingSurcharge(!isAdjustingSurcharge);
                            setIsAdjustingDiscount(false);
                          }}
                          className={`text-left bg-black/20 p-2 border rounded-lg cursor-pointer transition active:scale-95 duration-100 group ${
                            isAdjustingSurcharge ? 'border-blue-500 bg-zinc-900 shadow-lg' : 'border-white/5 hover:border-blue-500 hover:bg-zinc-900'
                          }`}
                          title="點擊此處可快速調整加成 (Surcharge Modifier)"
                        >
                          <span className="text-[9px] text-[#4b9eff]/80 group-hover:text-blue-400 font-bold flex items-center justify-between font-sans">
                            <span>服務成加 Surcharge ⚙️</span>
                            <span className="text-[8px] opacity-65">{isAdjustingSurcharge ? '調整中' : '點擊調整'}</span>
                          </span>
                          <p className="font-mono text-xs text-blue-400 font-bold mt-0.5">
                            {cashierCalculatedTotals.surcharge > 0 ? `+ NT$ ${cashierCalculatedTotals.surcharge}` : 'NT$ 0'}
                          </p>
                        </div>
                        <div className="text-left bg-[#1f1e1b] p-2 border border-amber-500/20 rounded-lg">
                          <span className="text-[9px] text-amber-500 font-bold">總實收 Pay Total</span>
                          <p className="font-mono text-sm text-[#E5B453] font-black mt-0.5">NT$ {cashierCalculatedTotals.total}</p>
                        </div>
                      </div>

                      {/* Interactive Drawer for Adjusting Discount or Surcharge */}
                      {(isAdjustingDiscount || isAdjustingSurcharge) && (
                        <div className="bg-zinc-950 border border-white/10 p-3.5 rounded-xl space-y-3.5 animate-fadeIn">
                          {isAdjustingDiscount && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#E5B453] flex items-center gap-1.5 font-sans">
                                  <span>🏷️ 調整折扣 Discount Modifier</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-[#E5B453]/25">
                                    {cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : `折抵 NT$ ${cashierDiscountFlat}`}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAdjustingDiscount(false)}
                                  className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 transition active:scale-95 cursor-pointer font-sans"
                                >
                                  確認帶入 Apply & Close
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex bg-black p-0.5 rounded-xl border border-white/10 text-[11px] font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setCashierDiscountType('percent')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierDiscountType === 'percent'
                                        ? 'bg-[#E5B453] text-zinc-950 font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    % 比例折扣
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashierDiscountType('flat')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierDiscountType === 'flat'
                                        ? 'bg-[#E5B453] text-zinc-950 font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    $ 固定金額
                                  </button>
                                </div>

                                <div className="flex-1 relative flex items-center">
                                  <span className="absolute left-3 font-mono font-bold text-zinc-500 text-xs">
                                    {cashierDiscountType === 'percent' ? '%' : 'NT$'}
                                  </span>
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
                                    className="w-full bg-[#121212] border border-white/10 focus:border-[#E5B453] rounded-xl py-1.5 px-3 pl-10 text-white font-mono text-sm font-black focus:outline-none transition"
                                    placeholder="輸入折扣 Enter value"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 font-sans">
                                {cashierDiscountType === 'percent' ? (
                                  [
                                    { val: 0, lbl: '免折 (0%)' },
                                    { val: 5, lbl: '95折 (5% OFF)' },
                                    { val: 10, lbl: '9折 (10% OFF)' },
                                    { val: 15, lbl: '85折 (15% OFF)' },
                                    { val: 20, lbl: '8折 (20% OFF)' },
                                    { val: 50, lbl: '半價 (50% OFF)' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-disc-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierDiscountRate(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierDiscountRate === btn.val
                                          ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/60 font-black scale-105 shadow-md shadow-amber-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                ) : (
                                  [
                                    { val: 0, lbl: '無 $0' },
                                    { val: 50, lbl: '折 $50' },
                                    { val: 100, lbl: '折 $100' },
                                    { val: 150, lbl: '折 $150' },
                                    { val: 200, lbl: '折 $200' },
                                    { val: 300, lbl: '折 $300' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-disc-flat-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierDiscountFlat(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierDiscountFlat === btn.val
                                          ? 'bg-[#E5B453]/20 text-[#E5B453] border-[#E5B453]/60 font-black scale-105 shadow-md shadow-amber-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {isAdjustingSurcharge && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-sans">
                                  <span>📈 調整加成 Surcharge Modifier</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/25">
                                    {cashierSurchargeType === 'percent' ? `+ ${cashierSurchargeRate}%` : `加 NT$ ${cashierSurchargeFlat}`}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsAdjustingSurcharge(false)}
                                  className="text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 transition active:scale-95 cursor-pointer font-sans"
                                >
                                  確認帶入 Apply & Close
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex bg-black p-0.5 rounded-xl border border-white/10 text-[11px] font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setCashierSurchargeType('percent')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierSurchargeType === 'percent'
                                        ? 'bg-blue-500 text-white font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    % 比例加成
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashierSurchargeType('flat')}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold transition duration-150 cursor-pointer ${
                                      cashierSurchargeType === 'flat'
                                        ? 'bg-blue-500 text-white font-black'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    $ 固定加成
                                  </button>
                                </div>

                                <div className="flex-1 relative flex items-center">
                                  <span className="absolute left-3 font-mono font-bold text-zinc-500 text-xs">
                                    {cashierSurchargeType === 'percent' ? '%' : 'NT$'}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cashierSurchargeType === 'percent' ? cashierSurchargeRate || '' : cashierSurchargeFlat || ''}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                                      if (cashierSurchargeType === 'percent') {
                                        setCashierSurchargeRate(val);
                                      } else {
                                        setCashierSurchargeFlat(val);
                                      }
                                    }}
                                    className="w-full bg-[#121212] border border-white/10 focus:border-blue-500 rounded-xl py-1.5 px-3 pl-10 text-white font-mono text-sm font-black focus:outline-none transition"
                                    placeholder="輸入加成數值 Surcharge amt"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 font-sans">
                                {cashierSurchargeType === 'percent' ? (
                                  [
                                    { val: 0, lbl: '無加成 (0%)' },
                                    { val: 5, lbl: '5% 服務費' },
                                    { val: 10, lbl: '10% 服務費' },
                                    { val: 15, lbl: '15% 服務費' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-sur-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierSurchargeRate(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierSurchargeRate === btn.val
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/60 font-black scale-105 shadow-md shadow-blue-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                ) : (
                                  [
                                    { val: 0, lbl: '無加值 $0' },
                                    { val: 10, lbl: '清潔費 $10' },
                                    { val: 30, lbl: '服務費 $30' },
                                    { val: 50, lbl: '包廂費 $50' },
                                    { val: 100, lbl: '特別加值 $100' }
                                  ].map((btn) => (
                                    <button
                                      key={`summary-sur-flat-${btn.val}`}
                                      type="button"
                                      onClick={() => setCashierSurchargeFlat(btn.val)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-bold ${
                                        cashierSurchargeFlat === btn.val
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/60 font-black scale-105 shadow-md shadow-blue-500/5'
                                          : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/25 hover:text-white'
                                      }`}
                                    >
                                      {btn.lbl}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Checkout Scope Summary Badge */}
                      <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400">結帳模式：</span>
                        <span className="font-bold font-mono text-[#E5B453]">
                          {cashierCheckoutScope === 'single' && '🔹 獨立單一結帳 (僅本單)'}
                          {cashierCheckoutScope === 'same_table' && `🔸 同桌合併結帳 (${cashierMergedOrders.length} 筆)`}
                          {cashierCheckoutScope === 'all_merged' && `🔷 跨桌全併結帳 (${cashierMergedOrders.length} 筆)`}
                          {cashierCheckoutScope === 'custom' && `⚙️ 自訂勾選結帳 (${cashierMergedOrders.length} 筆)`}
                        </span>
                      </div>

                      {/* Giant Checkout Action Button */}
                      <div className="flex items-center space-x-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCashierOrderId(null)}
                          className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-lg font-bold text-xs text-zinc-400 transition cursor-pointer active:scale-95"
                        >
                          放棄本單
                        </button>
                        <button
                          type="button"
                          id="cashier-submit-checkout-btn"
                          onClick={async () => {
                            if (!cashierSelectedOrder) return;
                            
                            // Perform validations before showing confirmation dialog
                            if (cashierPaymentMethod === 'cash' && cashierCashReceived < cashierCalculatedTotals.total) {
                              alert(`⚠️ 實收現金金額不足！實收 (NT$ ${cashierCashReceived}) 需大於或等於應收總額 (NT$ ${cashierCalculatedTotals.total})。`);
                              return;
                            }
                            
                            if (cashierPaymentMethod === 'member') {
                              // Tier B: real-time backend balance validation
                              const memberToValidate = cashierMemberData;
                              if (!memberToValidate?.email) {
                                alert('⚠️ 找不到會員帳號資料，無法使用儲值卡付款。請確認訂單綁定了 Google 會員。');
                                return;
                              }
                              try {
                                const vRes = await fetch(`/api/members/${encodeURIComponent(memberToValidate.email)}`);
                                if (!vRes.ok) {
                                  alert('⚠️ 無法從後端驗證會員餘額，請稍後再試。');
                                  return;
                                }
                                const freshMember = await vRes.json();
                                setCashierMemberData(freshMember);
                                if (freshMember.balance < cashierCalculatedTotals.total) {
                                  alert(`⚠️ 【後端驗證】會員餘額不足！\n後端核實餘額：NT$ ${freshMember.balance}\n應收總額：NT$ ${cashierCalculatedTotals.total}\n\n請先進行現場儲值增額再結帳。`);
                                  return;
                                }
                              } catch (err) {
                                alert(`⚠️ 後端驗證連線失敗，請確認伺服器正常運作後再試。\n${err}`);
                                return;
                              }
                            }

                            setShowCheckoutConfirm(true);
                          }}
                          className="flex-1 py-2 text-xs font-black text-slate-900 bg-[#E5B453] hover:bg-amber-400 active:scale-[0.98] transition shadow-md shadow-[#E5B453]/10 cursor-pointer rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <Coins size={14} />
                          <span>
                            {cashierCheckoutScope === 'single'
                              ? `🎯 確認本單獨立收銀 (NT$ ${cashierCalculatedTotals.total})`
                              : `🎯 確認合併收銀 (${cashierMergedOrders.length} 筆 · NT$ ${cashierCalculatedTotals.total})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
      {showCheckoutConfirm && cashierSelectedOrder && (
        <div id="checkout-confirm-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-sans animate-fadeIn">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-left transition-all duration-300">
            <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#E5B453] flex items-center gap-1.5">
                <Coins size={15} />
                <span>櫃檯收銀二次確認 Checkout Confirm</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutConfirm(false)}
                className="text-white/40 hover:text-white/80 transition text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>結帳桌號 Table(s)</span>
                  <span className="text-white font-mono font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                    {Array.from(new Set(cashierMergedOrders.map(o => o.tableNumber))).join(' + ')} 桌
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>結帳單數 Orders</span>
                  <span className="text-amber-300 font-mono font-bold">
                    {cashierMergedOrders.length} 筆訂單
                    {cashierCheckoutScope === 'single' && ' (單一獨立)'}
                    {cashierCheckoutScope === 'same_table' && ' (同桌合併)'}
                    {cashierCheckoutScope === 'all_merged' && ' (跨桌全併)'}
                    {cashierCheckoutScope === 'custom' && ' (自選合併)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>主單編號 Order ID</span>
                  <span className="text-white font-mono font-semibold">{cashierSelectedOrder.id.substring(0, 8)}...</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>付款方式 Payment</span>
                  <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">
                    {cashierPaymentMethod === 'cash' && '💵 現金支付 Cash'}
                    {cashierPaymentMethod === 'credit' && '💳 信用卡 Credit Card (+10%)'}
                    {cashierPaymentMethod === 'twqr' && '📱 TWQR行動支付 (+10%)'}
                    {cashierPaymentMethod === 'member' && '👤 會員餘額扣款 VIP Member'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/5">
                  <span>餐點小計 Subtotal</span>
                  <span className="text-white font-mono font-bold">NT$ {cashierCalculatedTotals?.subtotal.toLocaleString()}</span>
                </div>

                {cashierCalculatedTotals && cashierCalculatedTotals.discount > 0 && (
                  <div className="flex justify-between items-center text-rose-400">
                    <span>折扣折抵 Discount ({cashierDiscountType === 'percent' ? `${cashierDiscountRate}% OFF` : '固定折抵'})</span>
                    <span className="font-mono font-bold">- NT$ {cashierCalculatedTotals.discount.toLocaleString()}</span>
                  </div>
                )}

                {cashierCalculatedTotals && cashierCalculatedTotals.surcharge > 0 && (
                  <div className="flex justify-between items-center text-blue-400">
                    <span>服務費/加成 Surcharge ({cashierSurchargeType === 'percent' ? `${cashierSurchargeRate}%` : '固定加成'})</span>
                    <span className="font-mono font-bold">+ NT$ {cashierCalculatedTotals.surcharge.toLocaleString()}</span>
                  </div>
                )}

                {cashierPaymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>實收現金 Cash Received</span>
                      <span className="text-white font-mono font-bold text-sm">NT$ {cashierCashReceived}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>應找零錢 Change Provided</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">NT$ {Math.max(0, cashierCashReceived - (cashierCalculatedTotals?.total || 0))}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-white/10 pt-3 flex justify-between items-center text-zinc-300">
                  <span className="font-bold text-xs">應付總額 Final Total</span>
                  <span className="text-[#E5B453] font-mono text-xl font-black">
                    NT$ {cashierCalculatedTotals?.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                {cashierCheckoutScope === 'single'
                  ? 'ℹ️ 目前為【獨立單一訂單結帳】，僅結算此筆點單。同桌其他訂單不受影響，該桌席在所有訂單結清前將持續保留。'
                  : cashierMergedOrders.length > 1
                  ? `ℹ️ 目前為【合併結帳模式】，將一併結清已選取的 ${cashierMergedOrders.length} 筆訂單，確認無誤後請點擊下方結清。`
                  : 'ℹ️ 請確認款項點收無誤。點選下方「確認結清」後，系統將會儲存收銀紀錄並標記為已結清。'}
              </p>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-end space-x-3.5">
              <button
                type="button"
                disabled={isCheckoutSubmitting}
                onClick={() => setShowCheckoutConfirm(false)}
                className={`px-4 py-2 border border-white/10 rounded-lg font-bold transition text-white text-xs ${
                  isCheckoutSubmitting ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95 cursor-pointer'
                }`}
              >
                取消
              </button>
              <button
                type="button"
                disabled={isCheckoutSubmitting}
                onClick={async () => {
                  try {
                    await handleCashierCheckoutSubmit();
                    setShowCheckoutConfirm(false);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`flex-1 py-2 bg-[#E5B453] text-slate-900 font-extrabold rounded-lg transition text-xs text-center font-bold flex items-center justify-center space-x-1.5 ${
                  isCheckoutSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400 active:scale-95 cursor-pointer shadow-md'
                }`}
              >
                {isCheckoutSubmitting && (
                  <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>
                  {isCheckoutSubmitting
                    ? '處理中...'
                    : cashierCheckoutScope === 'single'
                    ? '🎯 確認此單獨立結清 (不影響同桌他單)'
                    : `🎯 確認結清已選 ${cashierMergedOrders.length} 筆訂單`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
