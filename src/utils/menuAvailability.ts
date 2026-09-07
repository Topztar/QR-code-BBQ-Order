import { MenuItem, SoldOutType } from '../types';

/**
 * Returns the current date string in Asia/Taipei timezone (YYYY-MM-DD).
 */
export function getTaiwanDateString(d: Date | string = new Date()): string {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

/**
 * Evaluates the effective availability of a menu item based on dual-mode sold-out settings.
 */
export function evaluateDishAvailability(
  item: Partial<MenuItem>,
  todayStr: string = getTaiwanDateString()
): { isAvailable: boolean; effectiveSoldOutType: SoldOutType } {
  // 1. Explicit soldOutType overrides
  if (item.soldOutType === 'permanent') {
    return { isAvailable: false, effectiveSoldOutType: 'permanent' };
  }
  if (item.soldOutType === 'daily') {
    if (item.soldOutDate === todayStr) {
      return { isAvailable: false, effectiveSoldOutType: 'daily' };
    }
    // Date has passed midnight UTC+8! Auto-reset to available
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
