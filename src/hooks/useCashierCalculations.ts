import { useMemo, useState } from 'react';
import { Order, TableConfig } from '../types';
import { computeOrderItemsSubtotal } from '../components/manager/ManagerDashboardUtils';
import { openCashDrawerViaBridge } from '../lib/posBridgeClient';
import { apiFetch } from '../lib/api';

export interface UseCashierCalculationsProps {
  orders: Order[];
  tables: TableConfig[];
  menuItems: any[];
  cashierSelectedOrder: Order | null;
  cashierCheckoutScope: string;
  cashierSelectedMergeOrderIds: string[];
  cashierDiscountType: string;
  cashierDiscountRate: number;
  cashierDiscountFlat: number;
  cashierSurchargeType: string;
  cashierSurchargeRate: number;
  cashierSurchargeFlat: number;
  cashierPaymentMethod: string;
  cashierCashReceived: number;
  setCashierCashReceived: (val: number) => void;
  onPayOrder?: (orderId: string, checkoutData?: any, skipRefresh?: boolean) => Promise<void>;
  onBulkPayOrders?: (orderIds: string[], checkoutData: any, skipRefresh?: boolean) => Promise<{ success: boolean }>;
  onUpdateTableStatus?: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  setSelectedCashierOrderId: (id: string | null) => void;
  setCheckoutSuccessData?: (data: any) => void;
  staffPin?: string;
  billPrinter?: any;
}

export function useCashierCalculations({
  orders,
  tables,
  menuItems,
  cashierSelectedOrder,
  cashierCheckoutScope,
  cashierSelectedMergeOrderIds,
  cashierDiscountType,
  cashierDiscountRate,
  cashierDiscountFlat,
  cashierSurchargeType,
  cashierSurchargeRate,
  cashierSurchargeFlat,
  cashierPaymentMethod,
  cashierCashReceived,
  setCashierCashReceived,
  onPayOrder,
  onBulkPayOrders,
  onUpdateTableStatus,
  setSelectedCashierOrderId,
  setCheckoutSuccessData,
  staffPin,
  billPrinter = { cashDrawerEnabled: false, usbPort: "" }
}: UseCashierCalculationsProps) {
  
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const posBridgeUrl = "http://127.0.0.1:8060";

  // All candidate orders for the current table or merged tables
  const cashierCandidateOrders = useMemo(() => {
    if (!cashierSelectedOrder) {
      return { sameTableOrders: [] as Order[], allConnectedOrders: [] as Order[], hasMergedTables: false };
    }
    
    const curTableId = cashierSelectedOrder.tableNumber;
    if (!curTableId || String(curTableId || '').includes('外帶')) {
      return { 
        sameTableOrders: [cashierSelectedOrder], 
        allConnectedOrders: [cashierSelectedOrder], 
        hasMergedTables: false 
      };
    }
    
    // Unpaid orders on the same table
    const sameTable = orders.filter(
      o => !o.isPaid && o.status !== 'cancelled' && String(o.tableNumber).trim() === String(curTableId).trim()
    );

    // Connected tables (mergedWith)
    const curTableObj = tables.find(t => String(t.id).trim() === String(curTableId).trim());
    const leadTableId = curTableObj?.mergedWith || curTableId;
    
    const mergedTableIds = tables
      .filter(t => String(t.id).trim() === String(leadTableId).trim() || (t.mergedWith && String(t.mergedWith).trim() === String(leadTableId).trim()))
      .map(t => String(t.id).trim());
      
    const allConnected = orders.filter(
      o => !o.isPaid && o.status !== 'cancelled' && o.tableNumber && mergedTableIds.includes(String(o.tableNumber).trim())
    );

    const hasMerged = mergedTableIds.length > 1 || (curTableObj?.mergedWith !== undefined && curTableObj.mergedWith !== '');

    return {
      sameTableOrders: sameTable.length > 0 ? sameTable : [cashierSelectedOrder],
      allConnectedOrders: allConnected.length > 0 ? allConnected : [cashierSelectedOrder],
      hasMergedTables: hasMerged
    };
  }, [cashierSelectedOrder, orders, tables]);

  const cashierMergedOrders = useMemo(() => {
    if (!cashierSelectedOrder) return [];
    
    const curTableId = cashierSelectedOrder.tableNumber;
    if (!curTableId || String(curTableId || '').includes('外帶')) {
      return [cashierSelectedOrder];
    }
    
    if (cashierCheckoutScope === 'single') return [cashierSelectedOrder];
    if (cashierCheckoutScope === 'same_table') return cashierCandidateOrders.sameTableOrders;
    if (cashierCheckoutScope === 'all_merged') return cashierCandidateOrders.allConnectedOrders;
    if (cashierCheckoutScope === 'custom') {
      const selectedSet = new Set(cashierSelectedMergeOrderIds);
      if (!selectedSet.has(cashierSelectedOrder.id)) {
        selectedSet.add(cashierSelectedOrder.id);
      }
      const customList = cashierCandidateOrders.allConnectedOrders.filter(o => selectedSet.has(o.id));
      return customList.length > 0 ? customList : [cashierSelectedOrder];
    }
    return [cashierSelectedOrder];
  }, [cashierSelectedOrder, cashierCheckoutScope, cashierSelectedMergeOrderIds, cashierCandidateOrders]);

  const cashierCalculatedTotals = useMemo(() => {
    if (!cashierSelectedOrder) return { subtotal: 0, discount: 0, surcharge: 0, total: 0 };
    
    const sub = cashierMergedOrders.reduce((sum, o) => {
      const itemsSub = computeOrderItemsSubtotal(o.items || [], menuItems);
      return sum + (itemsSub > 0 ? itemsSub : (o.subtotal || 0));
    }, 0);
    
    let manualDiscount = 0;
    if (cashierDiscountType === 'percent') {
      manualDiscount = Math.round(sub * (cashierDiscountRate / 100));
    } else {
      manualDiscount = Math.round(cashierDiscountFlat);
    }
    
    let surcharge = 0;
    const isCreditOrTwqr = cashierPaymentMethod === 'credit' || cashierPaymentMethod === 'twqr';
    if (cashierSurchargeType === 'percent') {
      const effectiveRate = isCreditOrTwqr && cashierSurchargeRate === 0 && cashierSurchargeFlat === 0
        ? 10
        : cashierSurchargeRate;
      surcharge = Math.round(sub * (effectiveRate / 100));
    } else {
      surcharge = Math.round(cashierSurchargeFlat);
    }
    if (surcharge < 0) surcharge = 0;
    
    const autoDiscount = cashierMergedOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    let totalDiscount = manualDiscount + autoDiscount;
    if (totalDiscount > sub) totalDiscount = sub;
    if (totalDiscount < 0) totalDiscount = 0;
    
    const finalTotal = Math.max(0, sub - totalDiscount + surcharge);
    
    return {
      subtotal: sub,
      discount: totalDiscount,
      surcharge,
      total: finalTotal
    };
  }, [
    cashierSelectedOrder, 
    cashierMergedOrders, 
    cashierDiscountType, 
    cashierDiscountRate, 
    cashierDiscountFlat, 
    cashierSurchargeType, 
    cashierSurchargeRate, 
    cashierSurchargeFlat,
    cashierPaymentMethod,
    menuItems
  ]);

  const handleCashierCheckoutSubmit = async () => {
    if (!cashierSelectedOrder || !onPayOrder) return;
    if (isCheckoutSubmitting) return;
    
    if (cashierPaymentMethod === 'cash' && cashierCashReceived < cashierCalculatedTotals.total) {
      alert(`⚠️ 實收現金金額不足！實收 (NT$ ${cashierCashReceived}) 需大於或等於應收總額 (NT$ ${cashierCalculatedTotals.total})。`);
      return;
    }

    if (cashierPaymentMethod === 'member') {
      let vipEmail = '';
      const dbStr = localStorage.getItem('google-members-database');
      if (dbStr) {
        try {
          const db = JSON.parse(dbStr);
          if (cashierSelectedOrder?.customerName) {
            const matched = db.find((m: any) => m.name === cashierSelectedOrder.customerName);
            if (matched) vipEmail = matched.email;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!vipEmail) {
        alert('⚠️ 找不到匹配此結帳單的會員帳戶，無法使用會員餘額付款！');
        return;
      }

      try {
        const deductRes = await fetch(`/api/members/${encodeURIComponent(vipEmail)}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cashierCalculatedTotals.total }),
        });

        const deductData = await deductRes.json();
        if (!deductRes.ok || !deductData.member) {
          alert(`⚠️ 會員餘額扣抵失敗：${deductData.error || '餘額不足或系統異常'}！`);
          return;
        }

        if (dbStr) {
          try {
            const db = JSON.parse(dbStr);
            const userIndex = db.findIndex((m: any) => m.email === vipEmail);
            if (userIndex >= 0) {
              db[userIndex].balance = deductData.member.balance;
              db[userIndex].points = deductData.member.points;
              localStorage.setItem('google-members-database', JSON.stringify(db));
            }
          } catch (_ignore) {}
        }
        window.dispatchEvent(new Event('local-points-updated'));
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
      
      if (setCheckoutSuccessData) {
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
      }

      if (billPrinter.cashDrawerEnabled) {
        const targetPort = billPrinter.usbPort?.includes(':') ? billPrinter.usbPort.toUpperCase() : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`;
        openCashDrawerViaBridge(targetPort, posBridgeUrl)
          .then(bRes => {
            if (bRes.success) console.log('[Cash Drawer Bridge Success]', bRes.message);
          })
          .catch(e => console.warn('[Cash Drawer Bridge Warning]', e));

        apiFetch('/api/printer/open-drawer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: billPrinter })
        }).catch(e => console.error('[Cash Drawer Server Error]', e));
      }

    } catch (err: any) {
      console.error('[Cashier Checkout processing error]', err);
      alert(`❌ 收銀失敗: ${err?.message || String(err)}`);
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  return {
    cashierCandidateOrders,
    cashierMergedOrders,
    cashierCalculatedTotals,
    isCheckoutSubmitting,
    handleCashierCheckoutSubmit
  };
}
