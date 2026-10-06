// src/lib/menuService.ts
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const saveMenuItem = async (itemId: string, payload: any) => {
  const sanitizedPayload = {
    name: payload.name,
    price: Number(payload.price) || 0,
    category: payload.category,
    isAvailable: Boolean(payload.isAvailable),
    stock: Number(payload.stock) ?? 999,
    updatedAt: serverTimestamp(),
  };

  const menuRef = doc(db, 'menu', itemId);
  try {
    await setDoc(menuRef, sanitizedPayload, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('[Menu Save Error] Failed to save inventory/menu item:', error);
    throw error;
  }
};
