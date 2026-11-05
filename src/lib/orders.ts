// src/lib/orders.ts
// Zero-trust: all order mutations go through the backend API (Admin SDK + validators).
// The client must never write /orders directly; firestore.rules denies it.
import { apiFetch } from './api';

export interface DeleteOrderOptions {
  hardDelete?: boolean; // Default to safe soft delete
  reason?: string;
  operatorId?: string;
}

/**
 * Soft-deletes (or hard-deletes) an order via the backend API.
 * - Resolves `{ success: false, error }` when the server rejects the request (4xx/5xx).
 * - Throws on network failure so callers can enqueue an offline retry.
 */
export const removeOrCancelOrder = async (
  documentId: string,
  options: DeleteOrderOptions = {}
): Promise<{ success: boolean; error?: string }> => {
  if (!documentId || typeof documentId !== 'string') {
    console.error('[Order Delete Error] Invalid Document ID:', documentId);
    return { success: false, error: 'INVALID_DOCUMENT_ID' };
  }

  const res = await apiFetch(`/api/orders/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      hardDelete: options.hardDelete || false,
      reason: options.reason || 'Cashier manual deletion',
      operatorId: options.operatorId || 'cashier_terminal'
    })
  });

  if (res.ok) {
    return { success: true };
  }

  const errData = await res.json().catch(() => ({}));
  console.warn(`[removeOrCancelOrder] API returned status ${res.status}:`, errData);
  return { success: false, error: errData?.error || `HTTP_${res.status}` };
};
