// src/lib/menuService.ts
import { apiFetch } from './api';

export const saveMenuItem = async (itemId: string, payload: any) => {
  const sanitizedPayload: Record<string, any> = {
    ...payload,
    name: payload.name,
    price: Number(payload.price) || 0,
    category: payload.category,
    updatedAt: new Date().toISOString(),
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

  try {
    // 🛡️ Route administrative modifications through authenticated backend endpoint
    // to comply with Phase 1 Zero-Trust security rules and bust multi-tier server cache
    const response = await apiFetch(`/api/menu/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Menu save failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Menu Save Error] Failed to save menu item via secure API:', error);
    throw error;
  }
};

/**
 * Standardized dish mutation helper conforming to Phase 1 Zero-Trust admin API design
 */
export const updateDishData = async (dishId: string, payload: any) => {
  return saveMenuItem(dishId, payload);
};
