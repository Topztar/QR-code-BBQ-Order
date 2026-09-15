"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCalculationService = void 0;
exports.orderCalculationService = {
    computeOrderItemUnitPrice: (it, menuItemsList = []) => {
        if (!it)
            return 0;
        const baseP = Number(it.price) || 0;
        let addOnsTotal = 0;
        if (it.customization?.selectedAddOns && Array.isArray(it.customization.selectedAddOns)) {
            addOnsTotal = it.customization.selectedAddOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
        }
        const soupBaseAdd = it.customization?.soupBase === 'coconut-milk' ? 50 : 0;
        const spicyAdd = it.customization?.spiciness === 3 ? 10 : 0;
        const dish = menuItemsList.find((m) => m.id === it.menuItemId);
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
    computeOrderItemsSubtotal: (items, menuItemsList = []) => {
        if (!items || !Array.isArray(items))
            return 0;
        return items.reduce((sum, it) => {
            return sum + exports.orderCalculationService.computeOrderItemUnitPrice(it, menuItemsList) * (Number(it.qty || it.quantity) || 1);
        }, 0);
    },
    calculatePromoComboDiscount: (items, combos = [], menuItemsList = []) => {
        if (!Array.isArray(combos) || combos.length === 0 || !Array.isArray(items) || items.length === 0) {
            return 0;
        }
        return combos.reduce((totalDiscount, combo) => {
            if (!combo || !combo.enabled || !combo.requiredQty || combo.requiredQty <= 0) {
                return totalDiscount;
            }
            const eligibleCount = items.reduce((count, item) => {
                const mItem = menuItemsList.find((m) => m.id === item.menuItemId);
                const cat = item.category || mItem?.category;
                const isBeverageOrTopup = (item.menuItemId && item.menuItemId.startsWith('item-topup-')) ||
                    (item.id && typeof item.id === 'string' && item.id.startsWith('topup-')) ||
                    cat === 'beverages' ||
                    cat === 'drinks';
                const isEligible = combo.eligibleItemIds && combo.eligibleItemIds.length > 0
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
    calculateOrderPricing: (order, menuItemsList = []) => {
        if (!order)
            return { subtotal: 0, serviceCharge: 0, discount: 0, total: 0 };
        const itemsSub = exports.orderCalculationService.computeOrderItemsSubtotal(order.items || [], menuItemsList);
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
            }
            else {
                total = order.total;
            }
        }
        return { subtotal, serviceCharge, discount, total };
    },
    getTaiwanLocalDateString: (d = new Date()) => {
        const dateObj = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(dateObj.getTime()))
            return '';
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(dateObj);
    },
    isOrderInTaiwanDate: (createdAt, targetDateStr) => {
        if (!createdAt)
            return false;
        const twDate = exports.orderCalculationService.getTaiwanLocalDateString(createdAt);
        return twDate === targetDateStr;
    }
};
//# sourceMappingURL=orderCalculationService.js.map