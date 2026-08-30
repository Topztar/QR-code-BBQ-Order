import { Order, Reservation } from '../../types';

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
  if (!it) return 0;
  let baseP = Number(it.price) || 0;
  let addOnsTotal = 0;
  if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
    addOnsTotal = it.customization.selectedAddOns.reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);
  }
  let soupBaseAdd = it.customization?.soupBase === 'coconut-milk' ? 50 : 0;

  const dish = menuItemsList.find((m: any) => m.id === it.menuItemId);
  if (dish && baseP === dish.price) {
    return dish.price + soupBaseAdd + addOnsTotal;
  }
  if (addOnsTotal > 0 && dish && baseP < dish.price + addOnsTotal) {
    return baseP + addOnsTotal;
  }
  if (addOnsTotal > 0 && !dish && baseP <= (it.originalPrice || baseP)) {
    return baseP + addOnsTotal;
  }
  return baseP;
};

export const computeOrderItemsSubtotal = (items: any[], menuItemsList: any[] = []): number => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum: number, it: any) => {
    return sum + computeOrderItemUnitPrice(it, menuItemsList) * (Number(it.qty) || 1);
  }, 0);
};

export const calculateOrderTotalWithPayment = (
  order: Partial<Order> | null | undefined,
  menuItemsList: any[] = []
): { subtotal: number; serviceCharge: number; discount: number; total: number } => {
  if (!order) return { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
  const itemsSub = computeOrderItemsSubtotal(order.items || [], menuItemsList);
  const subtotal = (order.subtotal !== undefined && order.subtotal !== null && order.subtotal > 0) ? order.subtotal : itemsSub;
  const pm = order.paymentMethod;
  const isCreditOrTwqr = pm === 'credit' || pm === 'twqr';
  const defaultSvc = isCreditOrTwqr ? Math.round(subtotal * 0.1) : 0;
  const serviceCharge = (typeof order.serviceCharge === 'number' && order.serviceCharge > 0) ? order.serviceCharge : defaultSvc;
  const discount = order.discount || 0;
  
  let total = Math.max(0, subtotal + serviceCharge - discount);
  if (typeof order.total === 'number' && !isNaN(order.total) && order.total > 0) {
    if (isCreditOrTwqr && (order.serviceCharge === 0 || order.serviceCharge === undefined) && order.total === subtotal) {
      total = order.total + defaultSvc;
    } else {
      total = order.total;
    }
  }
  return { subtotal, serviceCharge, discount, total };
};

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isOrderOnLocalDate = (createdAt: string | undefined | null, targetDateStr: string): boolean => {
  if (!createdAt) return false;
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return false;
  return getLocalDateString(d) === targetDateStr;
};

export const generateReservationNo = (dateStr: string, existingRes: Reservation[] = []): string => {
  const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const count = (existingRes || []).filter(r => r.date === dateStr).length;
  const seq = String(count + 1).padStart(3, '0');
  return `RES-${cleanDate}-${seq}`;
};
