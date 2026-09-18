import React, { useState } from 'react';
import { DishFormModal } from './modals/DishFormModal';
import { CategoryFormModal } from './modals/CategoryFormModal';
import { TableSettingModal } from './modals/TableSettingModal';
import { ReservationSettingModal } from './modals/ReservationSettingModal';
import { QuickRestockModal } from './modals/QuickRestockModal';
import { ConfirmActionModal } from './modals/ConfirmActionModal';
import { AdjustPointsModal } from './modals/AdjustPointsModal';
import { AddMemberModal } from './modals/AddMemberModal';
import { BulkDeleteOrdersModal } from './modals/BulkDeleteOrdersModal';
import { useDashboardStore } from '../../stores/dashboard/useDashboardStore';
import { Category, Ingredient, TableConfig, Reservation } from '../../types';

export interface ManagerModalContainerProps {
  globalRules: any[];
  categories: Category[];
  ingredients: Ingredient[];
  tables: TableConfig[];
  reservations: Reservation[];
  
  onAddMenuItem?: (item: any) => Promise<void>;
  onEditMenuItem?: (id: string, item: any) => Promise<void>;
  onAddCategory?: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  onEditCategory?: (id: string, name: any, showOnCustomerPage?: boolean) => Promise<{ success: boolean; error?: string }>;
  onAddTable: (id: string, qrCodeUrl?: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  onEditTable: (id: string, qrCodeUrl: string, maxCapacity?: number) => Promise<{ success: boolean; error?: string }>;
  onAddReservation?: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  onEditReservation?: (id: string, updates: Partial<Reservation>) => Promise<{ success: boolean; error?: string }>;
  
  onRestock: (id: string, amount: number) => Promise<void>;
  checkoutSuccessData: any;
  handleSavePointsAdjustment: (amount: number) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  loadMembers: () => void | Promise<void>;
  handleBulkDeleteOrders: (thresholdDate: string) => void | Promise<void>;
  handleExportOrdersReport: () => void;
  isBulkDeleting: boolean;
}

export const ManagerModalContainer: React.FC<ManagerModalContainerProps> = ({
  globalRules, categories, ingredients, tables, reservations,
  onAddMenuItem, onEditMenuItem, onAddCategory, onEditCategory,
  onAddTable, onEditTable, onAddReservation, onEditReservation,
  onRestock, checkoutSuccessData, handleSavePointsAdjustment, loadMembers,
  handleBulkDeleteOrders, handleExportOrdersReport, isBulkDeleting
}) => {
  const {
    isDishFormOpen, setIsDishFormOpen, editingItem, setEditingItem,
    isCatFormOpen, setIsCatFormOpen, editingCategory, setEditingCategory,
    isTableFormOpen, setIsTableFormOpen, editingTableObj, setEditingTableObj,
    isResFormOpen, setIsResFormOpen, editingResObj, setEditingResObj,
    quickRestockItem, setQuickRestockItem,
    confirmActionModal, setConfirmActionModal,
    adjustPointsModal, setAdjustPointsModal,
    addMemberModalOpen, setAddMemberModalOpen,
    showBulkDeleteOrdersModal, setShowBulkDeleteOrdersModal
  } = useDashboardStore();

  const [catError, setCatError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableSuccess, setTableSuccess] = useState<string | null>(null);

  const handleSaveItemSubmit = async (formData: any) => {
    if (editingItem && onEditMenuItem) {
      await onEditMenuItem(editingItem.id, formData);
    } else if (onAddMenuItem) {
      await onAddMenuItem(formData);
    }
    setIsDishFormOpen(false);
  };

  const handleSaveCatSubmit = async (formData: any) => {
    setCatError(null);
    if (editingCategory && onEditCategory) {
      const r = await onEditCategory(editingCategory.id, formData.names, formData.showOnCustomerPage);
      if (r.success) setIsCatFormOpen(false);
      else setCatError(r.error || 'Failed to update category');
    } else if (onAddCategory) {
      const r = await onAddCategory(formData.id, formData.names, formData.showOnCustomerPage);
      if (r.success) setIsCatFormOpen(false);
      else setCatError(r.error || 'Failed to add category');
    }
  };

  const handleTableSaveSubmit = async (formData: any) => {
    setTableError(null);
    setTableSuccess(null);
    const maxCapacity = formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined;
    
    if (editingTableObj) {
      const r = await onEditTable(editingTableObj.id, formData.qrCodeUrl, maxCapacity);
      if (r.success) {
        setTableSuccess('Success!');
        setTimeout(() => setIsTableFormOpen(false), 1200);
      } else {
        setTableError(r.error || 'Failed to update table');
      }
    } else {
      const r = await onAddTable(formData.id, formData.qrCodeUrl, maxCapacity);
      if (r.success) {
        setTableSuccess('Success!');
        setTimeout(() => setIsTableFormOpen(false), 1200);
      } else {
        setTableError(r.error || 'Failed to add table');
      }
    }
  };

  return (
    <>
      <DishFormModal
        isOpen={isDishFormOpen}
        onClose={() => setIsDishFormOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveItemSubmit}
        globalRules={globalRules}
        categories={categories}
        ingredients={ingredients}
      />

      <CategoryFormModal
        isOpen={isCatFormOpen}
        onClose={() => setIsCatFormOpen(false)}
        editingCategory={editingCategory}
        onSave={handleSaveCatSubmit}
        catError={catError}
      />

      <TableSettingModal
        isOpen={isTableFormOpen}
        onClose={() => setIsTableFormOpen(false)}
        editingTableObj={editingTableObj}
        onSave={handleTableSaveSubmit}
        tableError={tableError}
        tableSuccess={tableSuccess}
      />

      <ReservationSettingModal
        isOpen={isResFormOpen}
        onClose={() => setIsResFormOpen(false)}
        editingResObj={editingResObj}
        tables={tables}
        reservations={reservations}
        onAddReservation={onAddReservation}
        onEditReservation={onEditReservation}
      />

      <QuickRestockModal
        item={quickRestockItem}
        onClose={() => setQuickRestockItem(null)}
        onRestock={onRestock}
        checkoutSuccessData={checkoutSuccessData}
      />

      <ConfirmActionModal 
        config={confirmActionModal} 
        onClose={() => setConfirmActionModal(null)} 
      />
      
      <AdjustPointsModal
        config={adjustPointsModal}
        onClose={() => setAdjustPointsModal(null)}
        onConfirm={handleSavePointsAdjustment}
      />

      <AddMemberModal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSuccess={loadMembers}
      />

      <BulkDeleteOrdersModal
        isOpen={showBulkDeleteOrdersModal}
        onClose={() => setShowBulkDeleteOrdersModal(false)}
        onConfirmDelete={handleBulkDeleteOrders}
        onExportReport={handleExportOrdersReport}
        isBulkDeleting={isBulkDeleting}
      />
    </>
  );
};
