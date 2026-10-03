import React, { Suspense } from 'react';
import { useRestaurantData } from '../context/RestaurantDataContext';
import { useOrderData } from '../context/OrderDataContext';
import { PrinterDataProvider, usePrinterData } from '../context/PrinterDataContext';
import { Language } from '../types';
import { resilientLazy } from '../App';
import { safeStorage } from '../lib/safeStorage';

const KitchenDisplaySystem = resilientLazy(() => import('./KitchenDisplaySystem').then(m => ({ default: m.KitchenDisplaySystem })));
const ManagerDashboard = resilientLazy(() => import('./ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div className="w-10 h-10 border-3 border-[#E5B453]/20 border-t-[#E5B453] rounded-full animate-spin" />
    <p className="text-xs text-[#E5B453]/80 font-mono tracking-widest uppercase animate-pulse">
      載入中 Loading System...
    </p>
  </div>
);

interface StaffPortalContainerProps {
  activeTab: 'kitchen' | 'admin' | 'cashier';
  lang: Language;
  adminSubTab: any;
  setAdminSubTab: (tab: any) => void;
  staffPin: string;
}

function StaffPortalInner({ activeTab, lang, adminSubTab, setAdminSubTab, staffPin }: StaffPortalContainerProps) {
  const handleSendPromoPush = async (notif: { title: string; message: string; badge?: string }) => {
    // NOTE: Implemented in future marketing module
    console.info('[Marketing Module Backlog] Promo push broadcast deferred to Phase 6+', notif);
  };
  const {
    menuItems,
    categories,
    tables,
    ingredients,
    reservations,
    minSpend,
    promoCombo,
    operatingHours,
    isOpen,
    restDays,
    customerNotice,
    servicePaused,
    popularItemIds,
    memberPointsRatio,
    memberVipThreshold,
    memberVipDiscountRate,
    memberEnablePointsDiscount,
    memberPointsRedeemRate,
    memberRewards,
    analytics,
    fetchData,
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
    handleToggleMenuItemAvailability,
    handleReorderMenuItems,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleReorderCategories,
    handleAddTable,
    handleEditTable,
    handleDeleteTable,
    handleUpdateTableStatus,
    handleAddReservation,
    handleUpdateReservation,
    handleDeleteReservation,
    handleRestock,
    handleAddIngredient,
    handleAdjustIngredientStock,
    handleToggleServicePause,
    handleSavePromoComboConfig,
    handleUpdateMinSpend,
    handleUpdateOperatingHours,
    handleUpdateCustomerNotice,
    handleUpdatePopularItemIds,
  } = useRestaurantData();

  const {
    orders,
    handlePlaceOrder,
    handleUpdateOrderStatus,
    handleToggleOrderItemComplete,
    handleUpdateTableNumber,
    handleUpdateQuickNotes,
    handleToggleOrderFlag,
    handleUpdateOrderItems,
    handlePayOrder,
    handleBulkPayOrders,
    handleDeleteOrder,
    
  } = useOrderData();

  const {
    printerIp,
    printLogs,
    handleUpdatePrinterIp,
    handleClearPrintLogs,
    handlePrintTestPage,
  } = usePrinterData();

  return (
    <Suspense fallback={<ViewLoadingFallback />}>
      {activeTab === 'kitchen' ? (
        <KitchenDisplaySystem
          currentLang={lang}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          printLogs={printLogs}
          onClearPrintLogs={handleClearPrintLogs}
          printerIp={printerIp}
          onUpdatePrinterIp={handleUpdatePrinterIp}
          onPrintTestPage={handlePrintTestPage}
          onUpdateTableNumber={handleUpdateTableNumber}
          onUpdateQuickNotes={handleUpdateQuickNotes}
          onToggleOrderFlag={handleToggleOrderFlag}
          tables={tables}
          menuItems={menuItems}
          categories={categories}
          onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
          ingredients={ingredients}
          onAdjustIngredientStock={handleAdjustIngredientStock}
          operatingHours={operatingHours}
          servicePaused={servicePaused}
          onToggleServicePause={handleToggleServicePause}
          onToggleOrderItemComplete={handleToggleOrderItemComplete}
          reservations={reservations}
        />
      ) : (
        <ManagerDashboard
          currentLang={lang}
          analytics={analytics}
          ingredients={ingredients}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onRestock={handleRestock}
          onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
          onSendPromoPush={handleSendPromoPush}
          menuItems={menuItems}
          onAddMenuItem={handleAddMenuItem}
          onEditMenuItem={handleEditMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          onReorderMenuItems={handleReorderMenuItems}
          tables={tables}
          onAddTable={handleAddTable}
          onEditTable={handleEditTable}
          onDeleteTable={handleDeleteTable}
          onUpdateTableStatus={handleUpdateTableStatus}
          reservations={reservations}
          onAddReservation={handleAddReservation}
          onEditReservation={handleUpdateReservation}
          onDeleteReservation={handleDeleteReservation}
          onPayOrder={handlePayOrder}
          onBulkPayOrders={handleBulkPayOrders}
          onPlaceOrder={handlePlaceOrder}
          onDeleteOrder={handleDeleteOrder}
          onUpdateTableNumber={handleUpdateTableNumber}
          onUpdateOrderItems={handleUpdateOrderItems}
          defaultSubTab={adminSubTab || (activeTab === 'cashier' ? 'cashier' : 'stats')}
          onSubTabChange={(subTab: any) => {
            setAdminSubTab(subTab);
            safeStorage.setItem('sabay-staff-subtab', subTab);
            safeStorage.setItem('sabay-staff-active-tab', 'admin');
            window.history.replaceState({}, '', `/admin?tab=${subTab}`);
          }}
          minSpend={minSpend}
          onUpdateMinSpend={handleUpdateMinSpend}
          promoCombo={promoCombo}
          onSavePromoCombo={handleSavePromoComboConfig}
          operatingHours={operatingHours}
          restDays={restDays}
          isOpen={isOpen}
          onUpdateOperatingHours={handleUpdateOperatingHours}
          customerNotice={customerNotice}
          onUpdateCustomerNotice={handleUpdateCustomerNotice}
          staffPin={staffPin}
          popularItemIds={popularItemIds}
          onUpdatePopularItemIds={handleUpdatePopularItemIds}
          printerIp={printerIp}
          onPrintTestPage={handlePrintTestPage}
          onAddIngredient={handleAddIngredient}
          servicePaused={servicePaused}
          onToggleServicePause={handleToggleServicePause}
          memberPointsRatio={memberPointsRatio}
          memberVipThreshold={memberVipThreshold}
          memberVipDiscountRate={memberVipDiscountRate}
          memberEnablePointsDiscount={memberEnablePointsDiscount}
          memberPointsRedeemRate={memberPointsRedeemRate}
          memberRewards={memberRewards}
          onUpdateMemberConfig={fetchData}
        />
      )}
    </Suspense>
  );
}

export default function StaffPortalContainer(props: StaffPortalContainerProps) {
  return (
    <PrinterDataProvider activeTab={props.activeTab}>
      <StaffPortalInner {...props} />
    </PrinterDataProvider>
  );
}
