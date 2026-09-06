import { useState, useMemo } from 'react';
import { MenuItem, OrderItem, CustomAddOn } from '../types';

export interface UseCustomerCartProps {
  promoCombo?: any;
  paymentMethod?: 'cash' | 'credit' | 'member' | 'twqr';
  isStoreCurrentlyOpen?: boolean;
}

export function useCustomerCart({
  promoCombo,
  paymentMethod = 'cash',
  isStoreCurrentlyOpen = true,
}: UseCustomerCartProps = {}) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoverCartItem, setHoverCartItem] = useState<OrderItem | null>(null);
  const [isHoverCartOpen, setIsHoverCartOpen] = useState(false);

  const handleAddToCart = ({
    item,
    qty,
    spiciness,
    noodleType,
    soupBase,
    customNotes,
    selectedAddOns,
  }: {
    item: MenuItem;
    qty: number;
    spiciness: number;
    noodleType?: string;
    soupBase?: string;
    customNotes: string;
    selectedAddOns: CustomAddOn[];
  }) => {
    if (!isStoreCurrentlyOpen) return;

    const cartId = `cart-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const newOrderItem: OrderItem = {
      id: cartId,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      qty,
      customization: {
        spiciness,
        noodleType: item.hasNoodlesOption ? (noodleType as 'rice-noodle' | 'vermicelli' | 'none') : undefined,
        soupBase: item.hasCoconutsMilkOption ? (soupBase as 'plain' | 'coconut-milk') : undefined,
        notes: customNotes,
        selectedAddOns: [...selectedAddOns],
      },
    };

    setCart((prev) => [...prev, newOrderItem]);
    setHoverCartItem(newOrderItem);
    setIsHoverCartOpen(true);
    setIsCartOpen(false);
  };

  const handleQuickAddToCart = (item: MenuItem) => {
    if (!isStoreCurrentlyOpen) return;
    const isSpicyCategory = !item.isNotSpicy;

    const newOrderItem: OrderItem = {
      id: `cart-quick-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      customization: {
        spiciness: isSpicyCategory ? 1 : 0,
        noodleType: item.hasNoodlesOption ? 'rice-noodle' : undefined,
        soupBase: item.hasCoconutsMilkOption ? 'plain' : undefined,
        notes: '🏆 今日熱銷人氣精選 ✨',
      },
    };

    setCart((prev) => [...prev, newOrderItem]);
    setHoverCartItem(newOrderItem);
    setIsHoverCartOpen(true);
    setIsCartOpen(false);
  };

  const handleReorderItems = (orderItems: any[], displayedMenuItems: MenuItem[]) => {
    const newItemsToAdd = orderItems.map((oldItem: any) => {
      const cartId = `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const menuItem = displayedMenuItems.find((m) => m.id === oldItem.menuItemId);
      return {
        id: cartId,
        menuItemId: oldItem.menuItemId,
        name: menuItem ? menuItem.name : oldItem.name,
        price: menuItem ? menuItem.price : oldItem.price,
        qty: oldItem.qty,
        customization: {
          spiciness: 1,
          notes: '由歷史訂單一鍵加點 (Quick reordered from past orders)',
        },
      };
    });
    setCart((prev) => [...prev, ...newItemsToAdd]);
    if (newItemsToAdd.length > 0) {
      setHoverCartItem(newItemsToAdd[0]);
      setIsHoverCartOpen(true);
    }
    setIsCartOpen(false);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i)));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const activeCombosAndDiscounts = useMemo(() => {
    if (!promoCombo) return [];
    const combosList = Array.isArray(promoCombo.combos) ? promoCombo.combos : [];

    return combosList.map((combo: any) => {
      if (!combo.enabled) return { combo, eligibleCount: 0, discount: 0 };

      const eligibleCount = cart.reduce((count, item) => {
        const isBeverageOrTopup =
          (item.menuItemId && item.menuItemId.startsWith('item-topup-')) ||
          item.id.startsWith('topup-') ||
          (item as any).category === 'beverages' ||
          (item as any).category === 'drinks';
        const isEligible =
          combo.eligibleItemIds && combo.eligibleItemIds.length > 0
            ? combo.eligibleItemIds.includes(item.menuItemId || '')
            : !isBeverageOrTopup;
        if (isEligible) {
          return count + item.qty;
        }
        return count;
      }, 0);

      let discount = 0;
      if (eligibleCount >= combo.requiredQty && combo.requiredQty > 0) {
        const groups = Math.floor(eligibleCount / combo.requiredQty);
        discount = groups * combo.discountAmount;
      }

      return { combo, eligibleCount, discount };
    });
  }, [cart, promoCombo]);

  const promoComboDiscount = useMemo(() => {
    return activeCombosAndDiscounts.reduce((sum, item) => sum + item.discount, 0);
  }, [activeCombosAndDiscounts]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      let finalPrice = item.price;
      if (item.customization?.soupBase === 'coconut-milk') finalPrice += 50;
      const addOnPrice = item.customization?.selectedAddOns?.reduce((s, a) => s + a.price, 0) || 0;
      return sum + (finalPrice + addOnPrice) * item.qty;
    }, 0);
  }, [cart]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(0, cartSubtotal - promoComboDiscount);
  }, [cartSubtotal, promoComboDiscount]);

  const expressFee = useMemo(() => {
    return paymentMethod === 'credit' || paymentMethod === 'twqr'
      ? Math.round(discountedSubtotal * 0.1)
      : 0;
  }, [paymentMethod, discountedSubtotal]);

  const cartTotal = useMemo(() => {
    return discountedSubtotal + expressFee;
  }, [discountedSubtotal, expressFee]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((s, o) => s + o.qty, 0);
  }, [cart]);

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    hoverCartItem,
    setHoverCartItem,
    isHoverCartOpen,
    setIsHoverCartOpen,
    handleAddToCart,
    handleQuickAddToCart,
    handleReorderItems,
    handleRemoveFromCart,
    handleUpdateCartQty,
    clearCart,
    activeCombosAndDiscounts,
    promoComboDiscount,
    cartSubtotal,
    discountedSubtotal,
    expressFee,
    cartTotal,
    cartItemsCount,
  };
}
