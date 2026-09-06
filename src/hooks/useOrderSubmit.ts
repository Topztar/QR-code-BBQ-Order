import { useRef } from 'react';
import { Order, OrderItem } from '../types';
import { apiFetch } from '../lib/api';
import { addRequestToQueue } from '../lib/offlineQueue';
import { safeStorage } from '../lib/safeStorage';
import { broadcastOrderEvent } from '../context/OrderDataContext';

export interface OrderDataPayload {
  tableNumber: string;
  items: OrderItem[];
  paymentMethod: 'cash' | 'credit' | 'member' | 'twqr';
  guestCount?: number;
  clientOrderId?: string;
  reservationNo?: string;
  reservationDate?: string;
  reservationTime?: string;
  customerName?: string;
  customerAvatar?: string;
  isMember?: boolean;
  customerPhone?: string;
  pickupTime?: string;
  takeoutInfo?: {
    customerName: string;
    phone: string;
    pickupTime: string;
  };
}

export function useOrderSubmit(
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setLocalOrderIds: React.Dispatch<React.SetStateAction<string[]>>,
  handleUpdateTableStatus: (id: string, updates: any) => Promise<{ success: boolean }>,
  onRefreshData?: () => Promise<void>
) {
  const activeOrderSubmissionsRef = useRef<Set<string>>(new Set());

  const handlePlaceOrder = async (orderData: OrderDataPayload) => {
    const clientOrderId = orderData.clientOrderId || `client_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    if (activeOrderSubmissionsRef.current.has(clientOrderId)) {
      console.log(`[Sabay App] Already submitting order with clientOrderId: ${clientOrderId}. Blocking duplicate call.`);
      return null;
    }
    activeOrderSubmissionsRef.current.add(clientOrderId);

    if (orderData.tableNumber && orderData.tableNumber !== '外帶' && orderData.tableNumber !== 'takeout') {
      handleUpdateTableStatus(orderData.tableNumber, { status: 'in_use', preservedFor: '', cleaningStartedAt: null });
    }

    const orderPayload = {
      ...orderData,
      clientOrderId,
    };
    const totalAmount = orderData.items.reduce((sum, item) => {
      let unitP = item.price;
      if (item.customization?.soupBase === 'coconut-milk') unitP += 50;
      if (item.customization?.selectedAddOns && Array.isArray(item.customization.selectedAddOns)) {
        unitP += item.customization.selectedAddOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
      }
      return sum + unitP * item.qty;
    }, 0);
    const tempId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const description = `桌號 🥢 ${orderData.tableNumber || '外帶'} • 點購 ${orderData.items.length} 份餐點 (金額: $${totalAmount})`;
    const offlineSvc = (orderData.paymentMethod === 'credit' || orderData.paymentMethod === 'twqr') ? Math.round(totalAmount * 0.1) : 0;

    const baseOrder: Order = {
      id: tempId,
      tableNumber: orderData.tableNumber,
      items: orderData.items,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      subtotal: totalAmount,
      serviceCharge: offlineSvc,
      total: totalAmount + offlineSvc,
      customerName: orderPayload.customerName || '',
      customerAvatar: orderPayload.customerAvatar || '',
      isMember: orderPayload.isMember || false,
      guestCount: orderPayload.guestCount,
      clientOrderId: clientOrderId,
      reservationNo: orderPayload.reservationNo,
      reservationDate: orderPayload.reservationDate,
      reservationTime: orderPayload.reservationTime,
      customerPhone: orderPayload.customerPhone,
      pickupTime: orderPayload.pickupTime,
      takeoutInfo: orderPayload.takeoutInfo,
      isOfflinePending: false,
    };

    // 🚀 本地跨分頁 0 成本廣播 (同設備 KDS / 收銀立即 0ms 更新)
    broadcastOrderEvent({ type: 'ORDER_CREATED', order: baseOrder });

    if (!navigator.onLine) {
      console.log('[Sabay Offline] Intercepting order submission offline...');
      addRequestToQueue('/api/orders', 'POST', orderPayload, description);
      
      const offlineOrder = { ...baseOrder, isOfflinePending: true };
      setOrders((prev) => [offlineOrder, ...prev]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, tempId];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return offlineOrder;
    }

    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `點餐提交失敗 (HTTP ${res.status})`);
      }

      let completedOrder = baseOrder;
      const serverData = await res.json();
      if (serverData && serverData.id) {
        completedOrder = { ...baseOrder, ...serverData };
      }

      setOrders((prev) => [completedOrder, ...prev.filter(o => o.id !== completedOrder.id && o.id !== baseOrder.id)]);
      setLocalOrderIds((prev) => {
        const updated = [...prev, completedOrder.id];
        safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
        return updated;
      });

      // 🧹 若伺服器指派了新的正式單號 (例如 LM-1001)，先廣播刪除臨時單以防止其他分頁 (KDS / 收銀) 重複顯示
      if (completedOrder.id !== baseOrder.id) {
        broadcastOrderEvent({ type: 'ORDER_DELETED', orderId: baseOrder.id });
      }

      // 再次廣播確認後的訂單物件
      broadcastOrderEvent({ type: 'ORDER_CREATED', order: completedOrder });

      if (onRefreshData) {
        await onRefreshData();
      }
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      return completedOrder;
    } catch (err: any) {
      console.error('[Sabay Ordering API Error]:', err);
      activeOrderSubmissionsRef.current.delete(clientOrderId);
      if (!navigator.onLine || err?.name === 'AbortError' || err?.message?.includes('Failed to fetch')) {
        addRequestToQueue('/api/orders', 'POST', orderPayload, description);
        setOrders((prev) => [baseOrder, ...prev.filter(o => o.id !== baseOrder.id)]);
        setLocalOrderIds((prev) => {
          const updated = [...prev, tempId];
          safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(updated));
          return updated;
        });
        return baseOrder;
      }
      throw err;
    }
  };

  return { handlePlaceOrder, activeOrderSubmissionsRef };
}
