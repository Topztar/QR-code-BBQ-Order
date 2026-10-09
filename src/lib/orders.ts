// src/lib/orders.ts
import { db } from './firebase';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { apiFetch } from './api';

export interface DeleteOrderOptions {
  hardDelete?: boolean; // Default to safe soft delete
  reason?: string;
  operatorId?: string;
}

export const removeOrCancelOrder = async (
  documentId: string, 
  options: DeleteOrderOptions = {}
): Promise<{ success: boolean; error?: string }> => {
  if (!documentId || typeof documentId !== 'string') {
    console.error('[Order Delete Error] Invalid Document ID:', documentId);
    return { success: false, error: 'INVALID_DOCUMENT_ID' };
  }

  // 1. First attempt deletion via backend API (works across local dev, cloud functions, and tests)
  try {
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
      // Backend deletion succeeded!
      // Also sync local Firestore cache if available, but don't fail if offline
      try {
        const orderRef = doc(db, 'orders', documentId);
        if (options.hardDelete) {
          await deleteDoc(orderRef).catch(() => {});
        } else {
          await setDoc(orderRef, {
            status: 'cancelled',
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            deletionReason: options.reason || 'Cashier manual deletion',
            cancelledBy: options.operatorId || 'cashier_terminal'
          }, { merge: true }).catch(() => {});
        }
      } catch (_) {}

      return { success: true };
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn(`[removeOrCancelOrder] API returned status ${res.status}:`, errData);
    }
  } catch (apiErr: any) {
    console.warn('[removeOrCancelOrder] API delete fetch failed, trying Firestore fallback:', apiErr?.message);
  }

  // 2. Direct Firestore fallback (e.g. if API is offline or pure Firestore setup)
  try {
    const orderRef = doc(db, 'orders', documentId);
    if (options.hardDelete) {
      await deleteDoc(orderRef);
    } else {
      await setDoc(orderRef, {
        status: 'cancelled',
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletionReason: options.reason || 'Cashier manual deletion',
        cancelledBy: options.operatorId || 'cashier_terminal'
      }, { merge: true });
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Rejection] Deletion rejected by server, causing frontend rollback:', err);
    throw err;
  }
};
