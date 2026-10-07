import { useState, useEffect } from 'react';
import { Order, PaidModDetails } from '../../types';
import { apiFetch } from '../../lib/api';
import { getLocalizedText } from '../../utils/i18n';
import { orderCalculationService } from '@sabay/shared';
import { memberService } from '../../services/memberService';

export interface CheckoutSuccessData {
  id: string;
  tableNumber: string;
  subtotal: number;
  discount: number;
  serviceCharge: number;
  total: number;
  amountPaid: number;
  changeProvided: number;
  paymentMethod: string;
  isCashier: boolean;
  mergedCount?: number;
  checkoutScope?: string;
}

interface UseManagerCheckoutParams {
  menuItems: any[];
  staffPin?: string;
  onPayOrder?: (
    orderId: string,
    checkoutData?: {
      paymentMethod?: string;
      subtotal?: number;
      serviceCharge?: number;
      total?: number;
      discount?: number;
      cashTendered?: number;
      changeAmount?: number;
      checkoutRecord?: any;
      isPaid?: boolean;
    }
  ) => Promise<void>;
  onUpdateOrderItems?: (orderId: string, items: any[], refundLogs?: any[]) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  setConfirmActionModal: (modal: any) => void;
  setShowBulkDeleteOrdersModal: (show: boolean) => void;
}

export function useManagerCheckout({
  menuItems,
  staffPin,
  onPayOrder,
  onUpdateOrderItems,
  onDeleteOrder,
  setConfirmActionModal,
  setShowBulkDeleteOrdersModal,
}: UseManagerCheckoutParams) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cashReceivedInput, setCashReceivedInput] = useState<number>(0);
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Synchronize cashReceivedInput with order total
  useEffect(() => {
    if (selectedOrder) {
      setCashReceivedInput(selectedOrder.total);
    }
  }, [selectedOrder]);

  // Paid Order Modifications (Return & Refund workflow)
  const [paidModDetails, setPaidModDetails] = useState<PaidModDetails | null>(null);
  const [modReason, setModReason] = useState('input_error');
  const [modNotes, setModNotes] = useState('');
  const [modPin, setModPin] = useState('');

  // Checkout success popup states
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<CheckoutSuccessData | null>(null);

  const resetPaidModState = () => {
    setPaidModDetails(null);
    setModReason('input_error');
    setModNotes('');
    setModPin('');
  };

  const handleSavePaidModification = async () => {
    if (!selectedOrder || !onUpdateOrderItems || !paidModDetails) return;

    // Validate PIN with backend
    try {
      const pinRes = await apiFetch('/api/staff/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: modPin.trim() })
      });
      if (!pinRes.ok) {
        const errData = await pinRes.json().catch(() => ({}));
        alert(`❌ 簽核失敗：${errData.error || '員工授權 PIN 碼不正確！請重新輸入。'}`);
        return;
      }
    } catch (_e) {
      alert('❌ 網路連線或伺服器驗證失敗，請稍後再試。');
      return;
    }

    let updatedItems = [...selectedOrder.items];
    const originalPrice = selectedOrder.total;
    const qtyChange = paidModDetails.delta;
    let itemName = '';
    let unitPrice = 0;

    if (paidModDetails.isAddingNew) {
      // Step 1: Manual item adding
      const dish = menuItems.find((m: any) => m.id === paidModDetails.menuItemId);
      if (!dish) {
        alert('❌ 找不到該餐點資料！');
        return;
      }
      itemName = getLocalizedText(dish.name, 'zh') || dish.name;
      unitPrice = dish.price;

      const existing = updatedItems.find((it: any) => it.menuItemId === dish.id);
      if (existing) {
        updatedItems = updatedItems.map((it: any) => {
          if (it.menuItemId === dish.id) {
            return { ...it, qty: it.qty + 1 };
          }
          return it;
        });
      } else {
        const newItem = {
          id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: dish.id,
          name: typeof dish.name === 'object' ? dish.name : { zh: dish.name, en: dish.name },
          price: dish.price,
          qty: 1,
          customization: {
            spiciness: 1,
            notes: '已結帳後台手動補加 / Post-payment added',
          }
        };
        updatedItems = [...updatedItems, newItem];
      }
    } else {
      // Step 2: Modifying existing quantity
      const targetItem = updatedItems.find((it: any) => it.id === paidModDetails.item.id);
      if (!targetItem) {
        alert('❌ 點單中查無此餐點！');
        return;
      }
      itemName = (typeof targetItem.name === 'string' ? targetItem.name : targetItem.name?.zh || '') || '';
      unitPrice = targetItem.price;

      updatedItems = updatedItems.map((it: any) => {
        if (it.id === paidModDetails.item.id) {
          return { ...it, qty: it.qty + qtyChange };
        }
        return it;
      }).filter((it: any) => it.qty > 0);
    }

    // Recompute total & diff
    const pricing = orderCalculationService.calculateOrderPricing({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);
    const subtotal = pricing.subtotal;
    const serviceCharge = pricing.serviceCharge;
    const total = pricing.total;
    const totalDiff = total - originalPrice;

    // Create unique log item
    const REASONS_MAP: Record<string, string> = {
      kitchen_prep_error: '🍳 廚房製餐瑕疵 / 食安事件',
      wrong_delivery: '🚶‍♂️ 員工送錯桌席 / 漏做重出',
      customer_cancel: '⏳ 餐期延誤 / 顧客臨時取消',
      input_error: '收銀點錯帳目更正 / 系統修正',
      sold_out: '🚫 食材告罄 / 沽清被迫退餐',
      vip_promo: '🎁 VIP 招待 / 自主促銷補償',
      customer_addon: '➕ 客人追加現場點餐',
    };

    const newLog = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: totalDiff < 0 ? 'refund' : 'addon',
      itemName: itemName,
      pricePerUnit: unitPrice,
      qtyChange: qtyChange,
      totalDiff: totalDiff,
      reason: REASONS_MAP[modReason] || modReason,
      notes: modNotes.trim() || '無特別備註',
      authorizedByPin: `Staff PIN: ****${modPin.slice(-2)}`,
    };

    if (selectedOrder.paymentMethod === 'cash') {
      if (totalDiff < 0) {
        alert(`💵 現金退款核銷通知：本更動完成後，請現場從收銀機退還顧客現金 NT$ ${Math.abs(totalDiff)} 元！`);
      } else if (totalDiff > 0) {
        alert(`💵 現金補款稽核通知：本更動完成後，請向顧客加收額外現金 NT$ ${totalDiff} 元，並確認投入收銀機中！`);
      }
    } else if (selectedOrder.paymentMethod !== 'member') {
      alert(`💳 電子款項金流調帳通知：此單採線上電子支付。差額 NT$ ${totalDiff} 元，已對應記為店家記帳退補核對項。`);
    }

    const logs = selectedOrder.refundLogs ? [...selectedOrder.refundLogs, newLog] : [newLog];

    try {
      await (onUpdateOrderItems as any)(selectedOrder.id, updatedItems, logs);
    } catch (err: any) {
      alert(`❌ 訂單資料庫更新失敗，交易異動取消：${err?.message || err}`);
      return;
    }

    // Sync membership balance ONLY after backend write succeeds
    if (selectedOrder.paymentMethod === 'member') {
      const member = selectedOrder.customerName ? memberService.getMemberByName(selectedOrder.customerName) : null;
      if (member) {
        const currentBal = member.balance || 0;
        const finalBal = currentBal - totalDiff;
        if (finalBal < 0) {
          alert(`⚠️ 警告：此會員儲值卡餘額不足（剩餘: NT$ ${currentBal}）！自動扣減使餘額透支，請現場向顧客索取差額 ${Math.abs(finalBal)} 元！`);
        }
        memberService.updateMemberBalance(member.email, -totalDiff);
        const updatedMember = memberService.getMemberByEmail(member.email);
        alert(`💳 因應本次退貨/加點核銷：會員額度已自動變更，原額: NT$ ${currentBal} ➔ 現額: NT$ ${updatedMember?.balance ?? Math.max(0, finalBal)}`);
      }
    }

    // Update selectedOrder modal state to sync UI
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal,
      serviceCharge,
      total,
      refundLogs: logs
    });

    resetPaidModState();
    alert('✅ 已結帳點單帳目異動稽查記錄，已與 Cloud Firestore 資料庫安全核算並同步更新！');
  };

  const handleLocalQtyChange = async (itemId: string, delta: number) => {
    if (!selectedOrder || !onUpdateOrderItems) return;
    const updatedItems = selectedOrder.items.map((it: any) => {
      if (it.id === itemId) {
        return { ...it, qty: it.qty + delta };
      }
      return it;
    }).filter((it: any) => it.qty > 0);

    if (updatedItems.length === 0) {
      const confirmDelete = async () => {
        if (onDeleteOrder) {
          try {
            const res = await onDeleteOrder(selectedOrder.id);
            if (res && res.success === false) {
              alert(`❌ 刪除訂單失敗：${res.error || '伺服器拒絕或網路異常'}`);
              return;
            }
          } catch (err: any) {
            console.error('[useManagerCheckout] Delete error:', err);
            alert(`❌ 刪除訂單失敗：${err?.message || '未知錯誤'}`);
            return;
          }
        }
        setSelectedOrder(null);
      };

      setConfirmActionModal({
        isOpen: true,
        title: '⚠️ 訂單已無菜品',
        message: `訂單 [${selectedOrder.id}] 的菜品已被清空。是否直接刪除此訂單？`,
        actionLabel: '確定刪除 Delete',
        onConfirm: confirmDelete
      });
      return;
    }

    await onUpdateOrderItems(selectedOrder.id, updatedItems);

    const pricing = orderCalculationService.calculateOrderPricing({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal: pricing.subtotal,
      serviceCharge: pricing.serviceCharge,
      total: pricing.total,
    });
  };

  const handleAddLocalItem = async (menuItemId: string) => {
    if (!selectedOrder || !onUpdateOrderItems) return;
    const dish = menuItems.find((m: any) => m.id === menuItemId);
    if (!dish) return;

    const existing = selectedOrder.items.find((it: any) => it.menuItemId === menuItemId);
    let updatedItems;
    if (existing) {
      updatedItems = selectedOrder.items.map((it: any) => {
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
          notes: '後台手動加點 / Added by admin',
        }
      };
      updatedItems = [...selectedOrder.items, newItem];
    }

    await onUpdateOrderItems(selectedOrder.id, updatedItems);

    const pricing = orderCalculationService.calculateOrderPricing({
      ...selectedOrder,
      items: updatedItems,
      discount: selectedOrder.discount || 0
    }, menuItems);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      subtotal: pricing.subtotal,
      serviceCharge: pricing.serviceCharge,
      total: pricing.total,
    });
  };

  const handleProcessCheckout = async () => {
    if (!selectedOrder || !onPayOrder) return;
    if (isCheckoutSubmitting) return;

    if (selectedOrder.paymentMethod === 'cash' && cashReceivedInput < selectedOrder.total) {
      alert(`⚠️ 實收金額不足！實收 (NT$ ${cashReceivedInput}) 需大於或等於總額 (NT$ ${selectedOrder.total})。`);
      return;
    }

    let memberDeductedEmail: string | null = null;
    let memberDeductedAmount = 0;

    if (selectedOrder.paymentMethod === 'member') {
      const member = selectedOrder.customerName ? memberService.getMemberByName(selectedOrder.customerName) : null;
      if (!member || !member.email) {
        alert('⚠️ 找不到匹配此結帳單的會員帳戶，無法使用會員餘額付款！');
        return;
      }

      try {
        const deductRes = await fetch(`/api/members/${encodeURIComponent(member.email)}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: selectedOrder.total, orderId: selectedOrder.id }),
        });
        const deductData = await deductRes.json();
        if (!deductRes.ok || !deductData.member) {
          alert(`⚠️ 會員餘額扣抵失敗：${deductData.error || '餘額不足或伺服器異常'}！`);
          return;
        }
        memberDeductedEmail = member.email;
        memberDeductedAmount = selectedOrder.total;
        memberService.updateMember(member.email, {
          balance: deductData.member.balance,
          points: deductData.member.points,
        });
      } catch (err: any) {
        alert(`⚠️ 連線伺服器失敗，無法完成會員餘額扣抵：${err?.message || err}`);
        return;
      }
    }

    setIsCheckoutSubmitting(true);
    try {
      const change = selectedOrder.paymentMethod === 'cash' ? (cashReceivedInput - selectedOrder.total) : 0;

      const checkoutRecord = {
        id: `TX-${selectedOrder.id}`,
        orderId: selectedOrder.id,
        tableNumber: selectedOrder.tableNumber,
        subtotal: selectedOrder.subtotal,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        amountPaid: selectedOrder.paymentMethod === 'cash' ? cashReceivedInput : selectedOrder.total,
        changeProvided: change,
        paymentMethod: selectedOrder.paymentMethod,
        staffPin: staffPin || '',
        checkoutTime: new Date().toISOString()
      };

      await onPayOrder(selectedOrder.id, {
        paymentMethod: selectedOrder.paymentMethod,
        subtotal: selectedOrder.subtotal,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        cashTendered: selectedOrder.paymentMethod === 'cash' ? cashReceivedInput : selectedOrder.total,
        changeAmount: change,
        isPaid: true,
        checkoutRecord
      });

      setSelectedOrder({
        ...selectedOrder,
        isPaid: true,
        status: selectedOrder.status
      });

      setCheckoutSuccessData({
        id: selectedOrder.id,
        tableNumber: selectedOrder.tableNumber,
        subtotal: selectedOrder.subtotal,
        discount: selectedOrder.discount || 0,
        serviceCharge: selectedOrder.serviceCharge,
        total: selectedOrder.total,
        amountPaid: checkoutRecord.amountPaid,
        changeProvided: checkoutRecord.changeProvided,
        paymentMethod: selectedOrder.paymentMethod,
        isCashier: false
      });

    } catch (error: any) {
      console.error('Failed to process checkout in database:', error);
      if (memberDeductedEmail && memberDeductedAmount > 0) {
        try {
          const refundRes = await fetch(`/api/members/${encodeURIComponent(memberDeductedEmail)}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: memberDeductedAmount }),
          });
          const refundData = await refundRes.json();
          if (refundRes.ok && refundData.member) {
            memberService.updateMember(memberDeductedEmail, {
              balance: refundData.member.balance,
              points: refundData.member.points,
            });
            alert(`⚠️ 資料庫寫入失敗！已自動回滾撤銷會員扣款 (已回補 NT$ ${memberDeductedAmount})。\n原因: ${error.message || error}`);
            return;
          }
        } catch (rollbackErr) {
          console.error('[Critical] Member rollback failed:', rollbackErr);
        }
      }
      alert(`⚠️ 資料庫寫入失敗！請確認 Firebase 設定。錯誤: ${error.message || error}`);
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  const handleBulkDeleteOrders = async (dateStr?: string) => {
    if (!dateStr) {
      alert('請選擇截止日期');
      return;
    }
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    setIsBulkDeleting(true);
    try {
      const res = await apiFetch('/api/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholdDate: targetDate.toISOString() })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`已成功刪除 ${data.deletedCount || 0} 筆歷史訂單！`);
        setShowBulkDeleteOrdersModal(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('刪除失敗: ' + (errData.error || '伺服器處理異常'));
      }
    } catch (error: any) {
      console.error('Error deleting orders:', error);
      alert('刪除失敗: ' + error.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return {
    selectedOrder,
    setSelectedOrder,
    cashReceivedInput,
    setCashReceivedInput,
    isCheckoutSubmitting,
    isBulkDeleting,
    paidModDetails,
    setPaidModDetails,
    modReason,
    setModReason,
    modNotes,
    setModNotes,
    modPin,
    setModPin,
    resetPaidModState,
    checkoutSuccessData,
    setCheckoutSuccessData,
    handleSavePaidModification,
    handleLocalQtyChange,
    handleAddLocalItem,
    handleProcessCheckout,
    handleBulkDeleteOrders,
  };
}
