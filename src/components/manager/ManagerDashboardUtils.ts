import { Order, Reservation } from '../../types';
import { orderCalculationService } from '../../services/orderCalculationService';
import { getTaiwanDateString, isSameTaiwanDate } from '../../utils/dateUtils';

export const getMaskedEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  const emailLower = email.toLowerCase().trim();
  const parts = emailLower.split('@');
  const user = parts[0] || '';
  const domain = parts[1] || 'gmail.com';
  if (user.length <= 3) {
    return `VIP-USR (${user[0]}***@${domain})`;
  }
  return `VIP-USR (${user.slice(0, 3)}****@${domain})`;
};

export const computeOrderItemUnitPrice = (it: any, menuItemsList: any[] = []): number => {
  return orderCalculationService.computeOrderItemUnitPrice(it, menuItemsList);
};

export const computeOrderItemsSubtotal = (items: any[], menuItemsList: any[] = []): number => {
  return orderCalculationService.computeOrderItemsSubtotal(items, menuItemsList);
};

export const calculateOrderTotalWithPayment = (
  order: Partial<Order> | null | undefined,
  menuItemsList: any[] = []
): { subtotal: number; serviceCharge: number; discount: number; total: number } => {
  return orderCalculationService.calculateOrderPricing(order, menuItemsList);
};

export const getLocalDateString = (d: Date | string = new Date()): string => {
  return getTaiwanDateString(d);
};

export const isOrderOnLocalDate = (createdAt: string | undefined | null, targetDateStr: string): boolean => {
  if (!createdAt) return false;
  return isSameTaiwanDate(createdAt, targetDateStr);
};

export const generateReservationNo = (dateStr: string, existingRes: Reservation[] = []): string => {
  const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const count = (existingRes || []).filter(r => r.date === dateStr).length;
  const seq = String(count + 1).padStart(3, '0');
  return `RES-${cleanDate}-${seq}`;
};

// Helper utility to write out an Excel-friendly CSV with UTF-8 BOM
export const exportToCSV = (data: any[], headersMap: { [key: string]: string }, filename: string) => {
  if (!data || data.length === 0) {
    alert('❌ 無明細數據可供匯出！');
    return;
  }
  const rawKeys = Object.keys(data[0]);
  const headersLine = rawKeys.map(k => headersMap[k] || k).join(',');
  const rows = data.map(item => {
    return rawKeys.map(k => {
      const val = item[k];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val === undefined || val === null ? '' : val);
      const escaped = str.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return `"${escaped}"`;
    }).join(',');
  });
  const csvContent = "\uFEFF" + [headersLine, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
