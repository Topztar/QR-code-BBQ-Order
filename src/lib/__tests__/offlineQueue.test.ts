/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  hasPendingOrderRequests,
  addRequestToQueue,
  clearOfflineQueue,
  removeOrderRequestsFromQueue,
  getOfflineQueue,
  saveOfflineQueue,
  QueuedRequest
} from '../offlineQueue';
import { safeStorage } from '../safeStorage';

describe('offlineQueue - hasPendingOrderRequests', () => {
  beforeEach(() => {
    clearOfflineQueue();
    safeStorage.clear();
  });

  it('should return false for empty, null, or undefined orderId', () => {
    expect(hasPendingOrderRequests('')).toBe(false);
    expect(hasPendingOrderRequests(null as unknown as string)).toBe(false);
    expect(hasPendingOrderRequests(undefined as unknown as string)).toBe(false);
  });

  it('should return false when queue is empty', () => {
    expect(hasPendingOrderRequests('order-123')).toBe(false);
  });

  it('should return false when queue has requests for other orders', () => {
    addRequestToQueue('/api/orders/order-456', 'PUT', { status: 'preparing' }, 'Update order 456');
    expect(hasPendingOrderRequests('order-123')).toBe(false);
  });

  it('should return true when queue has a request matching orderId in plain URL', () => {
    addRequestToQueue('/api/orders/order-123', 'PUT', { status: 'preparing' }, 'Update order 123');
    expect(hasPendingOrderRequests('order-123')).toBe(true);
  });

  it('should return true when queue has a request matching orderId with special characters / encoded URL', () => {
    const specialOrderId = 'order#123/special';
    const encodedId = encodeURIComponent(specialOrderId);
    
    // Test matching via encoded URL
    const customItem: QueuedRequest = {
      id: 'req_test_encoded',
      url: `/api/orders/${encodedId}`,
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
      description: 'Update encoded order',
      timestamp: Date.now()
    };
    saveOfflineQueue([customItem]);

    expect(hasPendingOrderRequests(specialOrderId)).toBe(true);
  });

  it('should return true when orderId is contained in the request body as JSON string or plain text', () => {
    // Case 1: JSON payload with quoted orderId
    addRequestToQueue('/api/orders/bulk-sync', 'POST', { orderId: 'order-789' }, 'Bulk sync');
    expect(hasPendingOrderRequests('order-789')).toBe(true);

    // Case 2: Raw string body containing orderId
    const rawItem: QueuedRequest = {
      id: 'req_raw',
      url: '/api/batch',
      method: 'POST',
      body: 'target_order=order-999&action=pay',
      description: 'Raw payload',
      timestamp: Date.now()
    };
    saveOfflineQueue([...getOfflineQueue(), rawItem]);

    expect(hasPendingOrderRequests('order-999')).toBe(true);
  });

  it('should handle whitespace in orderId by trimming', () => {
    addRequestToQueue('/api/orders/order-trim-1', 'PUT', {}, 'Trim test');
    expect(hasPendingOrderRequests('  order-trim-1  ')).toBe(true);
  });

  it('should update correctly when queue items are removed', () => {
    addRequestToQueue('/api/orders/order-rem-1', 'PUT', { status: 'completed' }, 'Order to remove');
    expect(hasPendingOrderRequests('order-rem-1')).toBe(true);

    removeOrderRequestsFromQueue('order-rem-1');
    expect(hasPendingOrderRequests('order-rem-1')).toBe(false);
  });
});
