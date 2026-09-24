import { Order } from '../types';

export interface OrderPricingInput {
  items?: any[];
  subtotal?: number;
  serviceCharge?: number;
  discount?: number;
  total?: number;
  isPaid?: boolean;
  status?: string;
  paymentMethod?: string;
}

export const orderCalculationService = {
  computeOrderItemUnitPrice: (it: any, menuItemsList: any[] = []): number => {
    if (!it) return 0;
    const baseP = Number(it.price) || 0;
    let addOnsTotal = 0;
    if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
      addOnsTotal = it.customization.selectedAddOns.reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);
    }
    const soupBaseAdd = it.customization?.soupBase === 'coconut-milk' ? 50 : 0;
    const spicyAdd = it.customization?.spiciness === 3 ? 10 : 0;

    const dish = menuItemsList.find((m: any) => m.id === it.menuItemId);
    const dishBasePrice = dish ? dish.price : (it.originalPrice || 0);

    // If we know the dish's base menu price, determine whether baseP already has extras included
    if (dishBasePrice > 0) {
      if (baseP <= dishBasePrice) {
        // baseP is the raw base price without customization fees
        return dishBasePrice + soupBaseAdd + spicyAdd + addOnsTotal;
      }
      // If baseP is larger than base dish price, check if add-ons are already embedded
      const expectedWithAddons = dishBasePrice + soupBaseAdd + spicyAdd + addOnsTotal;
      if (baseP < expectedWithAddons) {
        // baseP only included part of extras or only base price
        return expectedWithAddons;
      }
      return baseP;
    }

    // If dish definition isn't found in menuItemsList, use it.price as base and add add-ons if missing
    if (addOnsTotal > 0 || soupBaseAdd > 0 || spicyAdd > 0) {
      if (it.originalPrice && baseP <= it.originalPrice) {
        return it.originalPrice + soupBaseAdd + spicyAdd + addOnsTotal;
      }
      // Check if baseP is equal to raw dish originalPrice or if addOns are not yet factored in
      return baseP + soupBaseAdd + spicyAdd + addOnsTotal;
    }

    return baseP;
  },

  computeOrderItemsSubtotal: (items: any[], menuItemsList: any[] = []): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum: number, it: any) => {
      return sum + orderCalculationService.computeOrderItemUnitPrice(it, menuItemsList) * (Number(it.qty || it.quantity) || 1);
    }, 0);
  },

  calculateOrderPricing: (
    order: OrderPricingInput | Partial<Order> | null | undefined,
    menuItemsList: any[] = []
  ): { subtotal: number; serviceCharge: number; discount: number; total: number } => {
    if (!order) return { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
    const itemsSub = orderCalculationService.computeOrderItemsSubtotal(order.items || [], menuItemsList);
    
    // For unpaid orders or orders with live items, always ensure subtotal accurately factors in items with add-ons
    const isPaid = order.isPaid === true || order.status === 'paid' || order.status === 'completed';
    const subtotal = (isPaid && order.subtotal !== undefined && order.subtotal !== null && order.subtotal > 0)
      ? Math.max(order.subtotal, itemsSub)
      : (itemsSub > 0 ? itemsSub : (order.subtotal || 0));

    const pm = order.paymentMethod;
    const isCreditOrTwqr = pm === 'credit' || pm === 'twqr';
    const defaultSvc = isCreditOrTwqr ? Math.round(subtotal * 0.1) : 0;
    const serviceCharge = (typeof order.serviceCharge === 'number' && order.serviceCharge > 0) ? order.serviceCharge : defaultSvc;
    const discount = order.discount || 0;
    
    let total = Math.max(0, subtotal + serviceCharge - discount);
    if (isPaid && typeof order.total === 'number' && !isNaN(order.total) && order.total > 0) {
      if (isCreditOrTwqr && (order.serviceCharge === 0 || order.serviceCharge === undefined) && order.total === subtotal) {
        total = order.total + defaultSvc;
      } else {
        total = order.total;
      }
    }
    return { subtotal, serviceCharge, discount, total };
  },

  calculatePromoComboDiscount: (
    items: any[],
    combos: any[] = [],
    menuItemsList: any[] = []
  ): number => {
    if (!Array.isArray(combos) || combos.length === 0 || !Array.isArray(items) || items.length === 0) {
      return 0;
    }

    return combos.reduce((totalDiscount: number, combo: any) => {
      if (!combo || !combo.enabled || !combo.requiredQty || combo.requiredQty <= 0) {
        return totalDiscount;
      }

      const eligibleCount = items.reduce((count: number, item: any) => {
        const mItem = menuItemsList.find((m: any) => m.id === item.menuItemId);
        const cat = (item as any).category || mItem?.category;
        const isBeverageOrTopup =
          (item.menuItemId && item.menuItemId.startsWith('item-topup-')) ||
          (item.id && typeof item.id === 'string' && item.id.startsWith('topup-')) ||
          cat === 'beverages' ||
          cat === 'drinks';

        const isEligible =
          combo.eligibleItemIds && combo.eligibleItemIds.length > 0
            ? combo.eligibleItemIds.includes(item.menuItemId || '')
            : !isBeverageOrTopup;

        if (isEligible) {
          return count + (Number(item.qty || item.quantity) || 1);
        }
        return count;
      }, 0);

      if (eligibleCount >= combo.requiredQty) {
        const sets = Math.floor(eligibleCount / combo.requiredQty);
        return totalDiscount + sets * (Number(combo.discountAmount) || 0);
      }
      return totalDiscount;
    }, 0);
  },

  getTaiwanLocalDateString: (d: Date | string = new Date()): string => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    // Use 'en-CA' because it safely formats to YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  },

  isOrderInTaiwanDate: (createdAt: string | undefined | null, targetDateStr: string): boolean => {
    if (!createdAt) return false;
    const twDate = orderCalculationService.getTaiwanLocalDateString(createdAt);
    return twDate === targetDateStr;
  },

  calculateVipStatus: (userPoints: number | undefined, vipThreshold: number): { isVip: boolean; pointsToNext: number } => {
    const points = userPoints || 0;
    const isVip = points >= vipThreshold;
    const pointsToNext = Math.max(0, vipThreshold - points);
    return { isVip, pointsToNext };
  },

  canRedeemReward: (userPoints: number | undefined, rewardCost: number): boolean => {
    return (userPoints || 0) >= rewardCost;
  }
};
