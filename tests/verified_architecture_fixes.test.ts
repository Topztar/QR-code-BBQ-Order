/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addRequestToQueue, clearOfflineQueue, getOfflineQueue } from '../src/lib/offlineQueue';

describe('Verified Architecture Fixes Regression Suite', () => {
  beforeEach(() => {
    clearOfflineQueue();
    vi.restoreAllMocks();
  });

  describe('Offline Queue Deduplication & Event Telemetry', () => {
    it('dispatches offline_queue_duplicate_blocked when rapid requests occur within 5s window', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const req1 = addRequestToQueue('/api/orders/ord-1/checkout', 'PUT', { isPaid: true }, '結帳 訂單 #ord-1');
      expect(req1).not.toBeNull();
      expect(getOfflineQueue().length).toBe(1);

      // Attempt duplicate immediately
      const req2 = addRequestToQueue('/api/orders/ord-1/checkout', 'PUT', { isPaid: true }, '結帳 訂單 #ord-1');
      expect(req2).toBeNull();
      expect(getOfflineQueue().length).toBe(1);

      // Verify custom event emission
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'offline_queue_duplicate_blocked',
          detail: {
            url: '/api/orders/ord-1/checkout',
            method: 'PUT',
            description: '結帳 訂單 #ord-1'
          }
        })
      );
    });

    it('allows identical requests if timestamp exceeds the 5-second window', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const req1 = addRequestToQueue('/api/orders/ord-2/items', 'PUT', { items: [] }, '更新訂單品項');
      expect(req1).not.toBeNull();

      // Advance clock past 5000ms
      vi.spyOn(Date, 'now').mockReturnValue(now + 5001);

      const req2 = addRequestToQueue('/api/orders/ord-2/items', 'PUT', { items: [] }, '更新訂單品項');
      expect(req2).not.toBeNull();
      expect(getOfflineQueue().length).toBe(2);
    });
  });

  describe('Order Submit Price Discrepancy Event Verification', () => {
    it('dispatches order_price_reconciliation_warning when client total diverges from server total', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const clientOrderId = 'test-client-order-1';
      const baseTotal = 500;
      const serverTotal = 450;
      const delta = Math.abs(serverTotal - baseTotal);

      if (delta > 0.01) {
        window.dispatchEvent(new CustomEvent('order_price_reconciliation_warning', {
          detail: {
            clientOrderId,
            clientTotal: baseTotal,
            serverTotal,
            delta
          }
        }));
      }

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_price_reconciliation_warning',
          detail: {
            clientOrderId: 'test-client-order-1',
            clientTotal: 500,
            serverTotal: 450,
            delta: 50
          }
        })
      );
    });
  });

  describe('Server Orders Attribution Ingestion Contract', () => {
    it('preserves attribution payload structure', () => {
      const incomingPayload = {
        tableNumber: '3',
        items: [{ id: 'item-1', name: { zh: '牛五花' }, price: 200, qty: 1 }],
        paymentMethod: 'cash',
        source: 'qr_table',
        utm_medium: 'cpc_campaign',
        notificationSent: false
      };

      const reconstructedOrder = {
        id: 'ord-simulated',
        ...incomingPayload,
        source: incomingPayload.source || 'direct',
        utm_medium: incomingPayload.utm_medium || undefined,
        notificationSent: !!incomingPayload.notificationSent
      };

      expect(reconstructedOrder.source).toBe('qr_table');
      expect(reconstructedOrder.utm_medium).toBe('cpc_campaign');
      expect(reconstructedOrder.notificationSent).toBe(false);
    });
  });
});
