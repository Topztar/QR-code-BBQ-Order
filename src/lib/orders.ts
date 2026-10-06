// src/lib/orders.ts
import { db } from './firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

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

  const orderRef = doc(db, 'orders', documentId);

  try {
    const snap = await getDoc(orderRef);
    if (!snap.exists()) {
      throw new Error(`Order document ${documentId} does not exist in Firestore.`);
    }

    if (options.hardDelete) {
      await deleteDoc(orderRef);
    } else {
      await updateDoc(orderRef, {
        status: 'cancelled',
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletionReason: options.reason || 'Cashier manual deletion',
        cancelledBy: options.operatorId || 'cashier_terminal'
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Rejection] Deletion rejected by server, causing frontend rollback:', err);
    throw err;
  }
};
