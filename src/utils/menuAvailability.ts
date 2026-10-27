import { MenuItem, SoldOutType } from '../types';
import { getTaiwanDateString } from './dateUtils';

/**
 * Evaluates the effective availability of a menu item based on dual-mode sold-out settings.
 */
export function evaluateDishAvailability(
  item: Partial<MenuItem>,
  todayStr: string = getTaiwanDateString()
): { isAvailable: boolean; effectiveSoldOutType: SoldOutType } {
  // 0. Auto-Sold-Out Linkage: if inventory tracking is enabled and stock <= 0, automatically lock as sold out
  if (item.trackInventory && typeof item.inventoryCount === 'number' && item.inventoryCount <= 0) {
    return { isAvailable: false, effectiveSoldOutType: item.soldOutType === 'daily' ? 'daily' : 'permanent' };
  }

  // 1. Explicit soldOutType overrides
  if (item.soldOutType === 'permanent') {
    return { isAvailable: false, effectiveSoldOutType: 'permanent' };
  }
  if (item.soldOutType === 'daily') {
    if (item.soldOutDate === todayStr) {
      return { isAvailable: false, effectiveSoldOutType: 'daily' };
    }
    // Date has passed midnight UTC+8! Auto-reset to available (unless inventory is tracked and <= 0)
    if (item.trackInventory && typeof item.inventoryCount === 'number' && item.inventoryCount <= 0) {
      return { isAvailable: false, effectiveSoldOutType: 'daily' };
    }
    return { isAvailable: true, effectiveSoldOutType: 'none' };
  }
  if (item.soldOutType === 'none') {
    return { isAvailable: true, effectiveSoldOutType: 'none' };
  }

  // 2. Backward compatibility for legacy items without soldOutType
  if (item.available === false || (item as any).isSoldOut === true) {
    return { isAvailable: false, effectiveSoldOutType: 'permanent' };
  }

  return { isAvailable: true, effectiveSoldOutType: 'none' };
}
