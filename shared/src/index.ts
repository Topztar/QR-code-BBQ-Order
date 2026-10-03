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

const orderCalculationService = {
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

    if (dishBasePrice > 0) {
      if (baseP <= dishBasePrice) {
        return dishBasePrice + soupBaseAdd + spicyAdd + addOnsTotal;
      }
      const expectedWithAddons = dishBasePrice + soupBaseAdd + spicyAdd + addOnsTotal;
      if (baseP < expectedWithAddons) {
        return expectedWithAddons;
      }
      return baseP;
    }

    if (addOnsTotal > 0 || soupBaseAdd > 0 || spicyAdd > 0) {
      if (it.originalPrice && baseP <= it.originalPrice) {
        return it.originalPrice + soupBaseAdd + spicyAdd + addOnsTotal;
      }
      return baseP + soupBaseAdd + spicyAdd + addOnsTotal;
    }

    return baseP;
  },

  computeOrderItemsSubtotal: (items: any[], menuItemsList: any[] = []): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum: number, it: any) => {
      return sum + orderCalculationService.computeOrderItemUnitPrice(it, menuItemsList) * (Number(it.qty) || 1);
    }, 0);
  },

  calculateOrderPricing: (
    order: OrderPricingInput | any | null | undefined,
    menuItemsList: any[] = []
  ): { subtotal: number; serviceCharge: number; discount: number; total: number } => {
    if (!order) return { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
    const itemsSub = orderCalculationService.computeOrderItemsSubtotal(order.items || [], menuItemsList);
    
    const isPaid = order.isPaid === true || order.status === 'paid' || order.status === 'completed';
    const subtotal = (isPaid && order.subtotal !== undefined && order.subtotal !== null && order.subtotal > 0)
      ? Math.max(order.subtotal, itemsSub)
      : (itemsSub > 0 ? itemsSub : (order.subtotal || 0));

    const pm = order.paymentMethod;
    const defaultSvc = orderCalculationService.getServiceCharge(subtotal, pm);
    const serviceCharge = (typeof order.serviceCharge === 'number' && order.serviceCharge > 0) ? order.serviceCharge : defaultSvc;
    const discount = order.discount || 0;
    
    let total = Math.max(0, subtotal + serviceCharge - discount);
    if (isPaid && typeof order.total === 'number' && !isNaN(order.total) && order.total > 0) {
      const isCreditOrTwqr = pm === 'credit' || pm === 'twqr';
      if (isCreditOrTwqr && (order.serviceCharge === 0 || order.serviceCharge === undefined) && order.total === subtotal) {
        total = order.total + defaultSvc;
      } else {
        total = order.total;
      }
    }
    return { subtotal, serviceCharge, discount, total };
  },

  getServiceCharge: (subtotal: number, paymentMethod?: string): number => {
    const isCreditOrTwqr = paymentMethod === 'credit' || paymentMethod === 'twqr';
    return isCreditOrTwqr ? Math.round(subtotal * 0.1) : 0;
  },

  calculatePromoComboBreakdown: (
    items: any[],
    combos: any[] = [],
    menuItemsList: any[] = []
  ): { combo: any, eligibleCount: number, groups: number, discount: number }[] => {
    if (!Array.isArray(combos) || combos.length === 0 || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    return combos.map((combo: any) => {
      if (!combo || !combo.enabled || !combo.requiredQty || combo.requiredQty <= 0) {
        return { combo, eligibleCount: 0, groups: 0, discount: 0 };
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
          return count + (Number(item.qty) || 1);
        }
        return count;
      }, 0);
      let discount = 0;
      let groups = 0;
      if (eligibleCount >= combo.requiredQty) {
        groups = Math.floor(eligibleCount / combo.requiredQty);
        discount = groups * (Number(combo.discountAmount) || 0);
      }
      return { combo, eligibleCount, groups, discount };
    });
  },

  calculatePromoComboDiscount: (
    items: any[],
    combos: any[] = [],
    menuItemsList: any[] = []
  ): number => {
    const breakdowns = orderCalculationService.calculatePromoComboBreakdown(items, combos, menuItemsList);
    return breakdowns.reduce((sum, b) => sum + b.discount, 0);
  },
  
  calculateVipStatus(userPoints: number, vipThreshold: number = 300) {
    const isVip = userPoints >= vipThreshold;
    return {
      isVip,
      pointsToNext: isVip ? 0 : vipThreshold - userPoints
    };
  },

  canRedeemReward(userPoints: number, itemCost: number) {
    return userPoints >= itemCost;
  }
};
export { orderCalculationService };

export function checkItemCompleteConcurrency(
  expectedVersion: number | undefined | null,
  currentVersion: number,
  lastUpdatedByRole: string | undefined | null,
  modifierRole: string | undefined | null
): { hasConflict: boolean; errorMessage?: string } {
  if (typeof expectedVersion === 'number' && expectedVersion < currentVersion) {
    if (lastUpdatedByRole === 'kitchen' && modifierRole === 'staff') {
      return { hasConflict: true, errorMessage: '該餐點狀態已被廚房主畫面更新，已自動為您同步最新狀態！' };
    }
  }
  return { hasConflict: false };
}

export function checkRefundLogsGate(
  orderStatus: string | undefined | null,
  isPaid: boolean | undefined | null,
  refundLogs: any[] | undefined | null
): { isLocked: boolean; errorMessage?: string } {
  const isPaidOrCancelled = orderStatus === 'paid' || orderStatus === 'cancelled' || isPaid === true;
  if (isPaidOrCancelled) {
    if (!Array.isArray(refundLogs) || refundLogs.length === 0) {
      return { isLocked: true, errorMessage: '訂單已結帳或已取消，未附帶退換核銷紀錄不可修改餐點內容！' };
    }
  }
  return { isLocked: false };
}

export const PRINTER_CONSTANTS = {
  DEFAULT_IP: '192.168.123.100',
  DEFAULT_PORT: 9100,
  CONNECTION_TIMEOUT_MS: 3000
};

