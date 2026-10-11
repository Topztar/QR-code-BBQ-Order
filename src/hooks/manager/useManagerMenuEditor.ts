import { useState, useEffect, useRef } from 'react';
import { Category } from '../../types';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';
import { useShallow } from 'zustand/react/shallow';

interface UseManagerMenuEditorParams {
  categories: Category[];
  menuItems: any[];
  promoCombo?: any;
  onSavePromoCombo?: (newConfig: any) => Promise<{ success: boolean; error?: string }>;
  onAddMenuItem?: (item: any) => Promise<void>;
}

export function useManagerMenuEditor({
  categories,
  menuItems,
  promoCombo = { enabled: false, combos: [] },
  onSavePromoCombo,
  onAddMenuItem,
}: UseManagerMenuEditorParams) {
  const {
    stagingPromoCombos,
    setStagingPromoCombos,
    setLocalCategoryOrder,
    setLocalMenuItemOrder,
    hasUnsavedCategoryOrder,
    hasUnsavedMenuItemOrder,
  } = useDashboardStore(
    useShallow(state => ({
      stagingPromoCombos: state.stagingPromoCombos,
      setStagingPromoCombos: state.setStagingPromoCombos,
      setLocalCategoryOrder: state.setLocalCategoryOrder,
      setLocalMenuItemOrder: state.setLocalMenuItemOrder,
      hasUnsavedCategoryOrder: state.hasUnsavedCategoryOrder,
      hasUnsavedMenuItemOrder: state.hasUnsavedMenuItemOrder,
    }))
  );

  useEffect(() => {
    if (!hasUnsavedCategoryOrder) {
      setLocalCategoryOrder(categories);
    } else {
      const prev = useDashboardStore.getState().localCategoryOrder;
      const currentIds = new Set(categories.map(c => c.id));
      const prevIds = new Set(prev.map(c => c.id));
      
      const updatedPrev = prev
        .filter(c => currentIds.has(c.id))
        .map(c => categories.find(cat => cat.id === c.id) || c);
      const newItems = categories.filter(c => !prevIds.has(c.id));
      
      if (updatedPrev.length !== prev.length || newItems.length > 0) {
        setLocalCategoryOrder([...updatedPrev, ...newItems]);
      } else {
        const isDeepEqual = JSON.stringify(prev) === JSON.stringify(updatedPrev);
        if (!isDeepEqual) {
          setLocalCategoryOrder(updatedPrev);
        }
      }
    }
  }, [categories, hasUnsavedCategoryOrder, setLocalCategoryOrder]);

  useEffect(() => {
    if (!hasUnsavedMenuItemOrder) {
      setLocalMenuItemOrder(menuItems);
    } else {
      const prev = useDashboardStore.getState().localMenuItemOrder;
      const currentIds = new Set(menuItems.map(m => m.id));
      const prevIds = new Set(prev.map(m => m.id));
      
      const updatedPrev = prev
        .filter(m => currentIds.has(m.id))
        .map(m => menuItems.find(mi => mi.id === m.id) || m);
      const newItems = menuItems.filter(m => !prevIds.has(m.id));
      
      if (updatedPrev.length !== prev.length || newItems.length > 0) {
        setLocalMenuItemOrder([...updatedPrev, ...newItems]);
      } else {
        const isDeepEqual = JSON.stringify(prev) === JSON.stringify(updatedPrev);
        if (!isDeepEqual) {
          setLocalMenuItemOrder(updatedPrev);
        }
      }
    }
  }, [menuItems, hasUnsavedMenuItemOrder, setLocalMenuItemOrder]);

  // Promo combo staging states
  const [promoComboSaveError, setPromoComboSaveError] = useState<string | null>(null);
  const [promoComboSaveSuccess, setPromoComboSaveSuccess] = useState<string | null>(null);
  const prevPromoComboRef = useRef<string>(JSON.stringify(promoCombo));
  const [addComboToMenuId, setAddComboToMenuId] = useState<string | null>(null);
  const [addComboPrice, setAddComboPrice] = useState<number>(0);
  const [addComboCategory, setAddComboCategory] = useState<string>('');
  const [addComboDesc, setAddComboDesc] = useState<string>('');
  const [deleteConfirmComboId, setDeleteConfirmComboId] = useState<string | null>(null);

  useEffect(() => {
    const promoStr = JSON.stringify(promoCombo);
    if (promoStr !== prevPromoComboRef.current) {
      if (promoCombo) {
        setStagingPromoCombos(promoCombo.combos || []);
      }
      prevPromoComboRef.current = promoStr;
    }
  }, [promoCombo, setStagingPromoCombos]);

  const handleSavePromoCombo = async () => {
    setPromoComboSaveError(null);
    setPromoComboSaveSuccess(null);
    if (onSavePromoCombo) {
      const payload = {
        enabled: stagingPromoCombos.some(c => c.enabled),
        combos: stagingPromoCombos,
      };
      const res = await onSavePromoCombo(payload);
      if (res.success || (res as any).success !== false) {
        setPromoComboSaveSuccess('所有自動套餐組合折抵設定已成功儲存並生效！');
        prevPromoComboRef.current = JSON.stringify(payload);
      } else {
        setPromoComboSaveError(res.error || '儲存設定失敗');
      }
    }
  };

  const handleCreateComboMenuItem = async (combo: any, price: number, category: string, desc: string) => {
    if (!onAddMenuItem) {
      alert('系統尚未準備完成，請稍後再試！');
      return;
    }
    const payload = {
      name: { 
        zh: combo.name, 
        en: combo.name, 
        ko: combo.name, 
        ja: combo.name, 
        th: combo.name 
      },
      price: price,
      image: '',
      description: { 
        zh: desc || `超值自動套餐：選購達 ${combo.requiredQty} 件適用單品即可自動扣除 NT$ ${combo.discountAmount} 元！`, 
        en: `Automatic discount set`, 
        ko: `Automatic discount set`, 
        ja: `Automatic discount set`, 
        th: `Automatic discount set` 
      },
      category: category,
      available: true,
      hasNoodlesOption: false,
      isNotSpicy: true,
      customAddOns: [],
      recipe: []
    };
    try {
      await onAddMenuItem(payload);
      alert(`🎉 套餐組合【${combo.name}】已成功新增為【${category}】分類之餐點！金額為 NT$ ${price} 元。顧客在前台可以直接點選該品項，且累計後仍會自動進行金額折抵！`);
    } catch (err: any) {
      alert('新增餐點失敗: ' + (err.message || err));
    }
  };

  return {
    stagingPromoCombos,
    setStagingPromoCombos,
    promoComboSaveError,
    setPromoComboSaveError,
    promoComboSaveSuccess,
    setPromoComboSaveSuccess,
    addComboToMenuId,
    setAddComboToMenuId,
    addComboPrice,
    setAddComboPrice,
    addComboCategory,
    setAddComboCategory,
    addComboDesc,
    setAddComboDesc,
    deleteConfirmComboId,
    setDeleteConfirmComboId,
    handleSavePromoCombo,
    handleCreateComboMenuItem,
  };
}
