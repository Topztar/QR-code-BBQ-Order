import { safeStorage } from './safeStorage';

export interface QueuedRequest {
  id: string;          // Unique request uuid/timestamp
  url: string;         // API path
  method: 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body: string;        // Stringified request payload
  description: string; // User-facing descriptive title (e.g. "送出 3 桌 5 份餐點" or "變更 2 號訂單為製作中")
  timestamp: number;   // Creation time
  retryCount?: number; // Attempt tracker for retry limits — persisted across page reloads
}

const STORAGE_KEY = 'sabay_offline_sync_queue_v1';

// ─── Phase A: Exponential Backoff Helper ─────────────────────────────────────
// Delays retry attempts using capped exponential backoff to prevent
// Thundering Herd when the server or network is temporarily unavailable.
// Formula: min(1000ms × 2^(retryCount-1), MAX_BACKOFF_MS)
// retryCount=1 → 1s | 2 → 2s | 3 → 4s | 4 → 8s | 5+ → capped at 30s
const MAX_BACKOFF_MS = 30_000;
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
const calcBackoffMs = (retryCount: number): number =>
  Math.min(1000 * 2 ** (retryCount - 1), MAX_BACKOFF_MS);
// ─────────────────────────────────────────────────────────────────────────────

// Get current request queue from safeStorage
export function getOfflineQueue(): QueuedRequest[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('[OfflineQueue] Failed to parse queue from storage:', error);
    return [];
  }
}

// Persist request queue to safeStorage
export function saveOfflineQueue(queue: QueuedRequest[]) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[OfflineQueue] Failed to write queue to storage:', error);
  }
}


// Add a new request to the queue
export function addRequestToQueue(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body: any,
  description: string,
  headers?: Record<string, string>
): QueuedRequest {
  const queue = getOfflineQueue();
  const newItem: QueuedRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    url,
    method,
    headers: headers || { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    description,
    timestamp: Date.now()
  };
  queue.push(newItem);
  saveOfflineQueue(queue);

  // Trigger a custom event so components can listen to changes dynamically
  window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: queue }));
  return newItem;
}

// Remove specific request from queue by ID
export function removeRequestFromQueue(id: string) {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  saveOfflineQueue(filtered);
  window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: filtered }));
}

// Clear entire queue
export function clearOfflineQueue() {
  saveOfflineQueue([]);
  window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: [] }));
}

// Remove all queued requests related to a specific order ID or list of order IDs
export function removeOrderRequestsFromQueue(orderIdOrIds: string | string[]) {
  if (!orderIdOrIds) return;
  const targetIds = Array.isArray(orderIdOrIds) ? orderIdOrIds.filter(Boolean) : [orderIdOrIds];
  if (targetIds.length === 0) return;

  const queue = getOfflineQueue();
  const filtered = queue.filter(item => {
    const isTarget = targetIds.some(id => {
      const plainId = String(id).trim();
      const encodedId = encodeURIComponent(plainId);
      return (
        item.url.includes(`/api/orders/${plainId}`) ||
        item.url.includes(`/api/orders/${encodedId}`) ||
        (item.body && (item.body.includes(`"${plainId}"`) || item.body.includes(plainId)))
      );
    });
    return !isTarget;
  });

  if (filtered.length !== queue.length) {
    console.log(`[OfflineQueue] Cleared ${queue.length - filtered.length} offline queued requests for order(s):`, targetIds);
    saveOfflineQueue(filtered);
    window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: filtered }));
  }
}

// Check if there are any queued requests for a specific order
export function hasPendingOrderRequests(orderId: string): boolean {
  if (!orderId) return false;
  const plainId = String(orderId).trim();
  const encodedId = encodeURIComponent(plainId);
  const queue = getOfflineQueue();
  return queue.some(item => 
    item.url.includes(`/api/orders/${plainId}`) ||
    item.url.includes(`/api/orders/${encodedId}`) ||
    (item.body && (item.body.includes(`"${plainId}"`) || item.body.includes(plainId)))
  );
}

// Execute a queued request
async function executeRequest(item: QueuedRequest): Promise<Response> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('sabay_jwt_token') : null;
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
  return fetch(item.url, {
    method: item.method,
    headers: {
      ...item.headers,
      ...authHeaders
    },
    body: item.body
  });
}

// Process all outstanding items in the queue in chronological order (FIFO)
// Phase A: Implements exponential backoff so a 5xx or network failure no longer
// halts the entire batch — subsequent items continue after a back-off delay.
export async function processOfflineQueue(onProgress?: (msg: string) => void): Promise<{ successCount: number; failureCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;
  const remaining: QueuedRequest[] = [...queue];

  console.log(`[OfflineQueue] Starting sync for ${queue.length} queued offset transactions...`);

  const PROCESSED_QUEUE_KEY = 'sabay_offline_sync_processed_v1';
  let processedIds: string[] = [];
  try {
    const raw = safeStorage.getItem(PROCESSED_QUEUE_KEY);
    if (raw) processedIds = JSON.parse(raw);
  } catch (e) {}

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];

    if (processedIds.includes(item.id)) {
      const idx = remaining.findIndex(r => r.id === item.id);
      if (idx > -1) remaining.splice(idx, 1);
      saveOfflineQueue([...remaining]);
      continue;
    }

    // Increment and PERSIST retryCount so it survives page reloads (fixes G-5)
    item.retryCount = (item.retryCount || 0) + 1;
    const remIdx = remaining.findIndex(r => r.id === item.id);
    if (remIdx > -1) remaining[remIdx] = { ...remaining[remIdx], retryCount: item.retryCount };
    saveOfflineQueue([...remaining]);

    if (onProgress) {
      onProgress(`正在同步 [${i + 1}/${queue.length}]: ${item.description}...`);
    }

    try {
      const response = await executeRequest(item);

      if (response.ok) {
        successCount++;

        processedIds.push(item.id);
        if (processedIds.length > 500) processedIds = processedIds.slice(-500);
        try { safeStorage.setItem(PROCESSED_QUEUE_KEY, JSON.stringify(processedIds)); } catch(e) {}

        // Remove from remaining list
        const idx = remaining.findIndex(r => r.id === item.id);
        if (idx > -1) remaining.splice(idx, 1);
        saveOfflineQueue([...remaining]);
        window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: [...remaining] }));

        // If this was an order submission, inject the server-assigned order ID into local tracker
        if (item.url === '/api/orders' && item.method === 'POST') {
          try {
            const completedOrder = await response.json();
            if (completedOrder && completedOrder.id) {
              const currentOrdersRaw = safeStorage.getItem('sabay-my-submitted-order-ids') || '[]';
              const currentOrders = JSON.parse(currentOrdersRaw);
              if (!currentOrders.includes(completedOrder.id)) {
                currentOrders.push(completedOrder.id);
                safeStorage.setItem('sabay-my-submitted-order-ids', JSON.stringify(currentOrders));
              }
            }
          } catch (err) {
            console.warn('[OfflineQueue] Failed to parse offline order response ID injection:', err);
          }
        }

      } else {
        // Server rejected the request (4xx client error or 5xx server error)
        console.error(`[OfflineQueue] Server rejected request for ${item.url}:`, response.status);
        failureCount++;

        if ((response.status >= 400 && response.status < 500) || item.retryCount >= 3) {
          // Terminal client error (400–499) or retry cap reached — discard to prevent deadlock
          console.warn(`[OfflineQueue] Discarding request (${item.id}) status: ${response.status}, retries: ${item.retryCount}`);
          const idx = remaining.findIndex(r => r.id === item.id);
          if (idx > -1) remaining.splice(idx, 1);
          saveOfflineQueue([...remaining]);
          window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: [...remaining] }));
          continue; // Proceed to next item
        }

        // Phase A — 5xx server error: apply exponential back-off then CONTINUE
        // (previously was `break` which stopped the entire batch)
        const backoffMs = calcBackoffMs(item.retryCount);
        console.warn(
          `[OfflineQueue] 5xx error on "${item.description}". ` +
          `Retry ${item.retryCount}/3 — backing off ${backoffMs}ms before continuing batch.`
        );
        if (onProgress) onProgress(`⏳ 伺服器暫時錯誤，退避 ${backoffMs / 1000}s 後繼續...`);
        await sleep(backoffMs);
        // continue to the next item — do NOT break the whole batch
        continue;
      }

    } catch (error) {
      // Network loss / CORS / AbortError — apply backoff then CONTINUE
      // (previously was `break` which stopped the entire batch)
      console.warn(`[OfflineQueue] Network request failed for "${item.description}":`, error);
      failureCount++;

      if (item.retryCount >= 3) {
        // Retry cap reached — discard this item
        console.warn(`[OfflineQueue] Discarding request (${item.id}) after ${item.retryCount} network failures.`);
        const idx = remaining.findIndex(r => r.id === item.id);
        if (idx > -1) remaining.splice(idx, 1);
        saveOfflineQueue([...remaining]);
        window.dispatchEvent(new CustomEvent('offline_queue_changed', { detail: [...remaining] }));
        continue;
      }

      const backoffMs = calcBackoffMs(item.retryCount);
      console.warn(
        `[OfflineQueue] Network failure on "${item.description}". ` +
        `Retry ${item.retryCount}/3 — backing off ${backoffMs}ms before continuing batch.`
      );
      if (onProgress) onProgress(`📡 網路中斷，退避 ${backoffMs / 1000}s 後繼續...`);
      saveOfflineQueue([...remaining]);
      await sleep(backoffMs);
      // continue to the next item — do NOT break the whole batch
      continue;
    }
  }

  return { successCount, failureCount };
}
