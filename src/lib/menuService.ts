// src/lib/menuService.ts
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const saveMenuItem = async (itemId: string, payload: any) => {
  const sanitizedPayload: Record<string, any> = {
    ...payload,
    name: payload.name,
    price: Number(payload.price) || 0,
    category: payload.category,
    updatedAt: serverTimestamp(),
  };

  if (payload.available !== undefined) {
    sanitizedPayload.available = Boolean(payload.available);
  }
  if (payload.isAvailable !== undefined) {
    sanitizedPayload.available = Boolean(payload.isAvailable);
  }
  if (payload.trackInventory !== undefined) {
    sanitizedPayload.trackInventory = Boolean(payload.trackInventory);
  }
  if (payload.inventoryCount !== undefined) {
    sanitizedPayload.inventoryCount = Number(payload.inventoryCount);
  }

  const menuRef = doc(db, 'menu', itemId);
  try {
    await setDoc(menuRef, sanitizedPayload, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('[Menu Save Error] Failed to save inventory/menu item:', error);
    throw error;
  }
};
