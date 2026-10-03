import { Order } from '../types';
import { isTakeoutTable } from './tableUtils';

/**
 * 檢查訂單是否為外帶單 (M-A05)
 */
export function isTakeoutOrder(order: Partial<Order> | null | undefined): boolean {
  if (!order) return false;
  return !!(order.takeoutInfo || isTakeoutTable(order.tableNumber));
}

/**
 * 取得訂單狀態的元資料與顯示文字 (M-A06)
 */
export function getStatusMeta(status: string | undefined): { label: string; colorClass: string } {
  switch (status) {
    case 'completed': return { label: '已出餐完成', colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    case 'confirmed': return { label: '已確認接單', colorClass: 'text-blue-400 bg-blue-950/40 border-blue-500/30' };
    case 'delivering': return { label: '出餐上桌中', colorClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
    case 'pending': return { label: '未處置待理', colorClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30' };
    case 'preparing': return { label: '配餐準備中', colorClass: 'text-purple-400 bg-purple-950/40 border-purple-500/30' };
    case 'paid': return { label: '已結帳', colorClass: 'text-gray-400 bg-gray-800/40 border-gray-600/30' };
    case 'cancelled': return { label: '已取消復歸', colorClass: 'text-red-600 bg-red-950/20 border-red-800/30' };
    default: return { label: status || '未知狀態', colorClass: 'text-gray-400 bg-gray-800/40 border-gray-600/30' };
  }
}
