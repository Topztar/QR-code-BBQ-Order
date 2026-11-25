import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { memberService } from '../../services/memberService';
import { getMaskedEmail } from '../../components/manager/ManagerDashboardUtils';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';

interface UseManagerPopularAndMembersParams {
  activeSubTab: string;
  popularItemIds: string[];
  setAdjustPointsModal: (modal: any) => void;
  setConfirmActionModal: (modal: any) => void;
}

export function useManagerPopularAndMembers({
  activeSubTab,
  popularItemIds,
  setAdjustPointsModal,
  setConfirmActionModal,
}: UseManagerPopularAndMembersParams) {
  const [takeoutStatus, setTakeoutStatus] = useState({ sequence: 0, lastResetDate: '' });
  const [localPopularIds, setLocalPopularIds] = useState<string[]>(popularItemIds);
  const [isSavingPopular, setIsSavingPopular] = useState(false);
  const [popularItemToRemoveId, setPopularItemToRemoveId] = useState<string | null>(null);
  const [showClearAllPopularConfirm, setShowClearAllPopularConfirm] = useState(false);
  const [popularSaveStatus, setPopularSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const popularItemIdsStr = JSON.stringify(popularItemIds);
  useEffect(() => {
    setLocalPopularIds(popularItemIds);
  }, [popularItemIdsStr]);

  useEffect(() => {
    if (activeSubTab !== 'stats') return;
    const fetchTakeoutStatus = async () => {
      try {
        const res = await apiFetch('/api/takeout/status');
        if (res.ok) {
          const d = await res.json();
          setTakeoutStatus(d);
        }
      } catch (e) {
        console.warn('[Takeout Polling Warning]:', e);
      }
    };
    fetchTakeoutStatus();
  }, [activeSubTab]);

  const [membersList, setMembersList] = useState<any[]>([]);

  const loadMembers = useCallback(() => {
    const list = memberService.getMembers();
    setMembersList(list);
  }, []);

  useEffect(() => {
    loadMembers();
    window.addEventListener('storage', loadMembers);
    window.addEventListener('local-points-updated', loadMembers);
    return () => {
      window.removeEventListener('storage', loadMembers);
      window.removeEventListener('local-points-updated', loadMembers);
    };
  }, [loadMembers]);

  const handleAdjustPoints = useCallback(
    (email: string) => {
      const member = membersList.find((m) => m.email === email);
      if (!member) return;
      setAdjustPointsModal({
        isOpen: true,
        email: member.email,
        name: member.name,
        currentPoints: member.points || 0,
      });
    },
    [membersList, setAdjustPointsModal]
  );

  const handleSavePointsAdjustment = useCallback(
    (amount: number) => {
      const currentAdjustModal = useDashboardStore.getState().adjustPointsModal;
      if (!currentAdjustModal) return { success: false, error: '未選擇會員！' };
      const res = memberService.updateMemberPoints(currentAdjustModal.email, amount);
      if (res.success) {
        setAdjustPointsModal(null);
        return { success: true };
      }
      return { success: false, error: res.error || '儲存點數時發生資料處理錯誤！' };
    },
    [setAdjustPointsModal]
  );

  const handleDeleteMember = useCallback(
    (email: string) => {
      const masked = getMaskedEmail(email);
      setConfirmActionModal({
        isOpen: true,
        title: '🚨 會員資料永久刪除確認',
        message: `您確定要永久刪除會員帳戶 [${masked}] 嗎？此操作將同時清空其全部點數與儲值紀錄，且無法復原。`,
        actionLabel: '確定刪除 Delete',
        onConfirm: () => {
          memberService.deleteMember(email);
        },
      });
    },
    [setConfirmActionModal]
  );

  return {
    takeoutStatus,
    localPopularIds,
    setLocalPopularIds,
    isSavingPopular,
    setIsSavingPopular,
    popularItemToRemoveId,
    setPopularItemToRemoveId,
    showClearAllPopularConfirm,
    setShowClearAllPopularConfirm,
    popularSaveStatus,
    setPopularSaveStatus,
    membersList,
    loadMembers,
    handleAdjustPoints,
    handleSavePointsAdjustment,
    handleDeleteMember,
  };
}
