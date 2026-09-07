import { Order, Reservation } from '../../types';
import { orderCalculationService } from '../../services/orderCalculationService';

export const getMaskedEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  const emailLower = email.toLowerCase().trim();
  if (emailLower === 'topztar@gmail.com') {
    return 'VIP-001 (topz****@gmail.com)';
  }
  if (emailLower === 'thai_foodie@gmail.com') {
    return 'VIP-002 (thai_****@gmail.com)';
  }
  if (emailLower === 'vegan_sabay@gmail.com') {
    return 'VIP-003 (vega_****@gmail.com)';
  }
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

export const getLocalDateString = (d: Date = new Date()): string => {
  return orderCalculationService.getTaiwanLocalDateString(d);
};

export const isOrderOnLocalDate = (createdAt: string | undefined | null, targetDateStr: string): boolean => {
  return orderCalculationService.isOrderInTaiwanDate(createdAt, targetDateStr);
};

export const generateReservationNo = (dateStr: string, existingRes: Reservation[] = []): string => {
  const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const count = (existingRes || []).filter(r => r.date === dateStr).length;
  const seq = String(count + 1).padStart(3, '0');
  return `RES-${cleanDate}-${seq}`;
};
