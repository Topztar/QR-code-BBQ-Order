const fs = require('fs');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// ============================================================
// 策略：只做最小修改
// 1. 在 import 區加入 ManagerCashierTab import
// 2. 替換 cashier JSX 區塊（行 3381-6880，0-indexed）為 <ManagerCashierTab ... />
// 不動任何 state 定義、不動任何 handler
// ============================================================

// 找到 import { ManagerTerminalTab } 那行（0-indexed）
const importInsertAfterIdx = lines.findIndex(l => l.includes("import { ManagerTerminalTab }"));
console.log('ManagerTerminalTab import 在行', importInsertAfterIdx + 1);

// cashier 區塊範圍（0-indexed）
const cashierStartIdx = 3381; // {activeSubTab === 'cashier' && (
const cashierEndIdx = 6880;   // )}  (inclusive，這行也要被替換)

console.log('cashier 區塊：行', cashierStartIdx + 1, '到行', cashierEndIdx + 1);
console.log('確認起始行:', lines[cashierStartIdx].trim());
console.log('確認結束行:', lines[cashierEndIdx - 1].trim());

// 建立替換的 JSX（<ManagerCashierTab ... />）
const cashierJsxReplacement = `      {/* ==================== TAB: CASHIER REGISTRY SYSTEM ==================== */}
      {activeSubTab === 'cashier' && (
        <ManagerCashierTab
          currentLang={currentLang}
          orders={orders}
          menuItems={menuItems}
          tables={tables}
          categories={categories}
          reservations={reservations}
          minSpend={minSpend}
          isOpen={isOpen}
          handleManualOpenDrawer={handleManualOpenDrawer}
          handleCashierAddMenuItem={handleCashierAddMenuItem}
          handleCombinedQtyChange={handleCombinedQtyChange}
          handleCombinedRemoveItem={handleCombinedRemoveItem}
          handleTableMouseDown={handleTableMouseDown}
          handleTableTouchStart={handleTableTouchStart}
          handleFineTunePosition={handleFineTunePosition}
          triggerEditTableMode={triggerEditTableMode}
          triggerAddReservationMode={triggerAddReservationMode}
          triggerEditReservationMode={triggerEditReservationMode}
          filteredCashierOrders={filteredCashierOrders}
          activeTakeoutOrders={activeTakeoutOrders}
          cashierSelectedOrder={cashierSelectedOrder}
          cashierCandidateOrders={cashierCandidateOrders}
          cashierMergedOrders={cashierMergedOrders}
          cashierCalculatedTotals={cashierCalculatedTotals}
          getPanelWidthClass={getPanelWidthClass}
          localTablePositions={localTablePositions}
          selectedCashierOrderId={selectedCashierOrderId}
          cashierListFilter={cashierListFilter}
          cashierCheckoutScope={cashierCheckoutScope}
          cashierDiscountType={cashierDiscountType}
          cashierDiscountFlat={cashierDiscountFlat}
          cashierDiscountRate={cashierDiscountRate}
          cashierSurchargeType={cashierSurchargeType}
          cashierSurchargeFlat={cashierSurchargeFlat}
          cashierSurchargeRate={cashierSurchargeRate}
          cashierPaymentMethod={cashierPaymentMethod}
          cashierCashReceived={cashierCashReceived}
          cashierCashChannel={cashierCashChannel}
          cashierSelectedMergeOrderIds={cashierSelectedMergeOrderIds}
          cashierPanelWidth={cashierPanelWidth}
          isCashierWidthAuto={isCashierWidthAuto}
          isAdjustingDiscount={isAdjustingDiscount}
          isAdjustingSurcharge={isAdjustingSurcharge}
          cashierNewItemInput={cashierNewItemInput}
          takeoutDetailModalOrder={takeoutDetailModalOrder}
          simulatedElapsedOrders={simulatedElapsedOrders}
          copiedTakeoutPhone={copiedTakeoutPhone}
          copiedGoogleLinkNotice={copiedGoogleLinkNotice}
          batchSuccessMessage={batchSuccessMessage}
          isBatchProcessing={isBatchProcessing}
          selectedResIds={selectedResIds}
          selectedCalendarStatusFilter={selectedCalendarStatusFilter}
          selectedFineTuneTableId={selectedFineTuneTableId}
          showCheckoutConfirm={showCheckoutConfirm}
          tableLayoutMode={tableLayoutMode}
          gridSize={gridSize}
          snapToGrid={snapToGrid}
          isTableLayoutLocked={isTableLayoutLocked}
          isTableFormOpen={isTableFormOpen}
          editingTableObj={editingTableObj}
          tableIdInput={tableIdInput}
          tableQrUrlInput={tableQrUrlInput}
          tableMaxCapacityInput={tableMaxCapacityInput}
          tableError={tableError}
          tableSuccess={tableSuccess}
          tableToDeleteId={tableToDeleteId}
          reservationToDeleteId={reservationToDeleteId}
          editingOrderTableId={editingOrderTableId}
          editingOrderTableValue={editingOrderTableValue}
          setSelectedCashierOrderId={setSelectedCashierOrderId}
          setCashierListFilter={setCashierListFilter}
          setCashierCheckoutScope={setCashierCheckoutScope}
          setCashierDiscountType={setCashierDiscountType}
          setCashierDiscountFlat={setCashierDiscountFlat}
          setCashierDiscountRate={setCashierDiscountRate}
          setCashierSurchargeType={setCashierSurchargeType}
          setCashierSurchargeFlat={setCashierSurchargeFlat}
          setCashierSurchargeRate={setCashierSurchargeRate}
          setCashierPaymentMethod={setCashierPaymentMethod}
          setCashierCashReceived={setCashierCashReceived}
          setCashierCashChannel={setCashierCashChannel}
          setCashierSelectedMergeOrderIds={setCashierSelectedMergeOrderIds}
          setCashierPanelWidth={setCashierPanelWidth}
          setIsCashierWidthAuto={setIsCashierWidthAuto}
          setIsAdjustingDiscount={setIsAdjustingDiscount}
          setIsAdjustingSurcharge={setIsAdjustingSurcharge}
          setTakeoutDetailModalOrder={setTakeoutDetailModalOrder}
          setSimulatedElapsedOrders={setSimulatedElapsedOrders}
          setCopiedTakeoutPhone={setCopiedTakeoutPhone}
          setCopiedGoogleLinkNotice={setCopiedGoogleLinkNotice}
          setBatchSuccessMessage={setBatchSuccessMessage}
          setIsBatchProcessing={setIsBatchProcessing}
          setSelectedResIds={setSelectedResIds}
          setSelectedCalendarStatusFilter={setSelectedCalendarStatusFilter}
          setConfirmActionModal={setConfirmActionModal}
          setSelectedFineTuneTableId={setSelectedFineTuneTableId}
          setShowCheckoutConfirm={setShowCheckoutConfirm}
          setTableLayoutMode={setTableLayoutMode}
          setGridSize={setGridSize}
          setSnapToGrid={setSnapToGrid}
          setIsTableLayoutLocked={setIsTableLayoutLocked}
          setIsTableFormOpen={setIsTableFormOpen}
          setEditingTableObj={setEditingTableObj}
          setTableIdInput={setTableIdInput}
          setTableQrUrlInput={setTableQrUrlInput}
          setTableMaxCapacityInput={setTableMaxCapacityInput}
          setTableError={setTableError}
          setTableSuccess={setTableSuccess}
          setTableToDeleteId={setTableToDeleteId}
          setReservationToDeleteId={setReservationToDeleteId}
          setEditingOrderTableId={setEditingOrderTableId}
          setEditingOrderTableValue={setEditingOrderTableValue}
          setItem={setItem}
        />
      )}`;

// 建立新的行陣列
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  // 在 ManagerTerminalTab import 後插入 ManagerCashierTab import
  if (i === importInsertAfterIdx) {
    newLines.push(lines[i]);
    newLines.push("import { ManagerCashierTab } from './manager/ManagerCashierTab';");
    continue;
  }

  // 遇到 cashier 區塊起始行，插入替換內容並跳過整個區塊
  if (i === cashierStartIdx) {
    newLines.push(cashierJsxReplacement);
    // 跳過到 cashierEndIdx（0-indexed）
    i = cashierEndIdx - 1; // 迴圈 i++ 後到 cashierEndIdx
    continue;
  }

  newLines.push(lines[i]);
}

const newContent = newLines.join('\n');
fs.writeFileSync('src/components/ManagerDashboard.tsx', newContent, 'utf8');

const stat = fs.statSync('src/components/ManagerDashboard.tsx');
const newLineCount = newContent.split('\n').length;
console.log('\n✅ ManagerDashboard.tsx 更新完成');
console.log('   新大小:', Math.round(stat.size / 1024), 'KB（原 571 KB）');
console.log('   新行數:', newLineCount, '行（原 9897 行）');
console.log('   縮減:', 9897 - newLineCount, '行');
