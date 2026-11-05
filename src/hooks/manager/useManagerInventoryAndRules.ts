import React, { useState, useEffect, useCallback } from 'react';
import { Ingredient } from '../../types';
import { apiFetch } from '../../lib/api';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';
import { useShallow } from 'zustand/react/shallow';

interface UseManagerInventoryAndRulesParams {
  activeSubTab: string;
  ingredients: Ingredient[];
  onRestock: (id: string, amount: number) => Promise<void>;
  onAddIngredient?: (
    id: string,
    name: { zh: string; en?: string },
    stock: number,
    minThreshold: number,
    unit: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function useManagerInventoryAndRules({
  activeSubTab,
  ingredients,
  onRestock,
  onAddIngredient,
}: UseManagerInventoryAndRulesParams) {
  const {
    dbInventoryLogs, setDbInventoryLogs,
    manualAdjustId,
    manualAdjustQty, setManualAdjustQty,
    manualAdjustNote, setManualAdjustNote,
    restockAmount, setRestockAmount,
    newIngId, setNewIngId,
    newIngNameZh, setNewIngNameZh,
    newIngNameEn, setNewIngNameEn,
    newIngStock, setNewIngStock,
    newIngMinThreshold, setNewIngMinThreshold,
    newIngUnit, setNewIngUnit
  } = useDashboardStore(
    useShallow(state => ({
      dbInventoryLogs: state.dbInventoryLogs,
      setDbInventoryLogs: state.setDbInventoryLogs,
      manualAdjustId: state.manualAdjustId,
      manualAdjustQty: state.manualAdjustQty,
      setManualAdjustQty: state.setManualAdjustQty,
      manualAdjustNote: state.manualAdjustNote,
      setManualAdjustNote: state.setManualAdjustNote,
      restockAmount: state.restockAmount,
      setRestockAmount: state.setRestockAmount,
      newIngId: state.newIngId,
      setNewIngId: state.setNewIngId,
      newIngNameZh: state.newIngNameZh,
      setNewIngNameZh: state.setNewIngNameZh,
      newIngNameEn: state.newIngNameEn,
      setNewIngNameEn: state.setNewIngNameEn,
      newIngStock: state.newIngStock,
      setNewIngStock: state.setNewIngStock,
      newIngMinThreshold: state.newIngMinThreshold,
      setNewIngMinThreshold: state.setNewIngMinThreshold,
      newIngUnit: state.newIngUnit,
      setNewIngUnit: state.setNewIngUnit,
    }))
  );

  // Option Rules States
  const [globalRules, setGlobalRules] = useState<any[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('加配料');
  const [newRulePrice, setNewRulePrice] = useState<number | ''>(20);

  const fetchGlobalRules = useCallback(async () => {
    try {
      const res = await apiFetch('/api/option-rules');
      if (res.ok) {
        const data = await res.json();
        setGlobalRules(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchInventoryLogs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/inventory/logs');
      if (res.ok) {
        const data = await res.json();
        setDbInventoryLogs(data);
      }
    } catch (e) {
      console.warn('[Inventory logs load error]:', e);
    }
  }, [setDbInventoryLogs]);

  // Only fetch inventory logs when viewing the inventory or EOD tabs
  useEffect(() => {
    if (activeSubTab === 'inventory' || activeSubTab === 'eod') {
      fetchInventoryLogs();
    }
  }, [activeSubTab, fetchInventoryLogs]);

  const handleAddGlobalRule = async () => {
    if (!newRuleName.trim()) {
      alert('請輸入客製選項名稱！');
      return;
    }
    try {
      const parsedPrice = typeof newRulePrice === 'number' ? newRulePrice : parseInt(newRulePrice, 10);
      const finalPrice = isNaN(parsedPrice) ? 0 : parsedPrice;

      const res = await apiFetch('/api/option-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName.trim(),
          category: newRuleCategory,
          price: finalPrice
        })
      });
      if (res.ok) {
        setNewRuleName('');
        setNewRulePrice(0);
        await fetchGlobalRules();
        alert('✅ 新增客製附加選項規則成功！');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`❌ 新增失敗：${errData.error || '伺服器錯誤'}`);
      }
    } catch (e) {
      console.error(e);
      alert('❌ 發生連線錯誤，請稍後再試！');
    }
  };

  const handleDeleteGlobalRule = async (id: string) => {
    try {
      const res = await apiFetch(`/api/option-rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGlobalRules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestockClick = async (id: string) => {
    const qty = restockAmount[id] || 20;
    await onRestock(id, qty);
    setRestockAmount({ ...restockAmount, [id]: 0 });
    alert('🎉 材料進貨完成！原料總水位已更新。');
  };

  const handleManualAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAdjustId || !manualAdjustQty) {
      alert('❌ 請選擇原料並輸入異動數量！');
      return;
    }
    const qty = Number(manualAdjustQty);
    if (isNaN(qty) || qty === 0) {
      alert('❌ 數量必須為非零有效實數！');
      return;
    }
    try {
      const res = await apiFetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: manualAdjustId,
          quantityChanged: qty,
          note: manualAdjustNote.trim() || '大後台管理員手動盤存調整'
        })
      });
      if (res.ok) {
        alert('🎉 耗損調整登記登入成功！進銷存日記帳已重算。');
        setManualAdjustQty('');
        setManualAdjustNote('');
        await fetchInventoryLogs();
        await onRestock(manualAdjustId, 0); // Sync parent
      } else {
        const d = await res.json();
        alert(`❌ 手動調整失敗：${d.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngId || !newIngNameZh) {
      alert('❌ 請填寫原料識別碼與中文名稱！');
      return;
    }
    const idPattern = /^[a-zA-Z0-9_.-]+$/;
    if (!idPattern.test(newIngId)) {
      alert('❌ 原料識別碼只能包含英文字母、數字、底線、連字號或句點！');
      return;
    }
    if (ingredients.some(ig => ig.id.toLowerCase() === newIngId.trim().toLowerCase())) {
      alert('❌ 此原料識別碼已存在，請使用其它的庫存識別代號！');
      return;
    }

    try {
      if (onAddIngredient) {
        const res = await onAddIngredient(
          newIngId.trim(),
          { zh: newIngNameZh.trim(), en: newIngNameEn.trim() || undefined },
          Number(newIngStock) || 0,
          Number(newIngMinThreshold) || 0,
          newIngUnit.trim() || 'kg'
        );
        if (res.success) {
          alert('🎉 成功新增原料項目！');
          setNewIngId('');
          setNewIngNameZh('');
          setNewIngNameEn('');
          setNewIngStock('');
          setNewIngMinThreshold('');
          setNewIngUnit('kg');
        } else {
          alert(`❌ 新增原料失敗: ${res.error}`);
        }
      } else {
        alert('❌ 系統尚未配置新增原料的功能介面！');
      }
    } catch (err: any) {
      alert(`❌ 發生異常錯誤: ${err.message || err}`);
    }
  };

  return {
    dbInventoryLogs,
    fetchInventoryLogs,
    handleRestockClick,
    handleManualAdjustStock,
    handleAddNewIngredient,
    globalRules,
    newRuleName,
    setNewRuleName,
    newRuleCategory,
    setNewRuleCategory,
    newRulePrice,
    setNewRulePrice,
    fetchGlobalRules,
    handleAddGlobalRule,
    handleDeleteGlobalRule,
  };
}

