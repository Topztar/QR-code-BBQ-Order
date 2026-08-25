const fs = require('fs');

const content = fs.readFileSync('src/components/ManagerDashboard.tsx', 'utf8');
const lines = content.split('\n');

// ===== 找出 cashier 區塊相關的 state 在 ManagerDashboard 中的定義位置 =====
// 需要移除這些 state（因為已移入 ManagerCashierTab）
// 同時替換 cashier JSX 為 <ManagerCashierTab ... />

// 1. 找出 cashier 區塊：行 3381-6880 (0-indexed)（含外層條件 wrapper）
//    {activeSubTab === 'cashier' && (   ← 行 3381
//    ...3501 行...
//    )}                                  ← 行 6880
const cashierBlockStart = 3381; // 0-indexed
const cashierBlockEnd = 6880;   // 0-indexed, exclusive

// 確認邊界
console.log('行', cashierBlockStart + 1, ':', lines[cashierBlockStart].trim());
console.log('行', cashierBlockEnd, ':', lines[cashierBlockEnd - 1].trim());

// 2. 找出現在主元件中這些 state 的定義行範圍
//    這些 state 應從主元件移除（它們現在在 ManagerCashierTab 內部管理）
const stateToRemovePatterns = [
  /const \[selectedCashierOrderId,\s*setSelectedCashierOrderId\]/,
  /const \[cashierListFilter,\s*setCashierListFilter\]/,
  /const \[cashierCheckoutScope,\s*setCashierCheckoutScope\]/,
  /const \[cashierDiscountType,\s*setCashierDiscountType\]/,
  /const \[cashierDiscountFlat,\s*setCashierDiscountFlat\]/,
  /const \[cashierDiscountRate,\s*setCashierDiscountRate\]/,
  /const \[cashierSurchargeType,\s*setCashierSurchargeType\]/,
  /const \[cashierSurchargeFlat,\s*setCashierSurchargeFlat\]/,
  /const \[cashierSurchargeRate,\s*setCashierSurchargeRate\]/,
  /const \[cashierPaymentMethod,\s*setCashierPaymentMethod\]/,
  /const \[cashierCashReceived,\s*setCashierCashReceived\]/,
  /const \[cashierCashChannel,\s*setCashierCashChannel\]/,
  /const \[cashierSelectedMergeOrderIds,\s*setCashierSelectedMergeOrderIds\]/,
  /const \[cashierPanelWidth,\s*setCashierPanelWidth\]/,
  /const \[isCashierWidthAuto,\s*setIsCashierWidthAuto\]/,
  /const \[isAdjustingDiscount,\s*setIsAdjustingDiscount\]/,
  /const \[isAdjustingSurcharge,\s*setIsAdjustingSurcharge\]/,
  /const \[cashierNewItemInput,\s*setCashierNewItemInput\]/,
  /const \[takeoutDetailModalOrder,\s*setTakeoutDetailModalOrder\]/,
  /const \[simulatedElapsedOrders,\s*setSimulatedElapsedOrders\]/,
  /const \[copiedTakeoutPhone,\s*setCopiedTakeoutPhone\]/,
  /const \[copiedGoogleLinkNotice,\s*setCopiedGoogleLinkNotice\]/,
  /const \[confirmActionModal,\s*setConfirmActionModal\]/,
  /const \[selectedFineTuneTableId,\s*setSelectedFineTuneTableId\]/,
  /const \[tableLayoutMode,\s*setTableLayoutMode\]/,
  /const \[gridSize,\s*setGridSize\]/,
  /const \[snapToGrid,\s*setSnapToGrid\]/,
  /const \[isTableLayoutLocked,\s*setIsTableLayoutLocked\]/,
  /const \[editingOrderTableId,\s*setEditingOrderTableId\]/,
  /const \[editingOrderTableValue,\s*setEditingOrderTableValue\]/,
  /const \[triggerAddReservationMode,\s*setTriggerAddReservationMode\]/,
];

// 找出要移除的行（只移除 useState 聲明行，不動其他邏輯）
const linesToRemove = new Set();
lines.forEach((line, idx) => {
  if (idx >= cashierBlockStart) return; // 只掃描主元件前置段落
  stateToRemovePatterns.forEach(pattern => {
    if (pattern.test(line)) {
      linesToRemove.add(idx);
    }
  });
});

console.log('\n找到可移除的 state 定義行數:', linesToRemove.size);
[...linesToRemove].sort((a,b) => a-b).forEach(idx => {
  console.log('  行', idx + 1, ':', lines[idx].trim());
});

// 3. 建立替換後的新 ManagerDashboard.tsx
//    - 移除已識別的 cashier state 定義行
//    - 在 import 區加入 ManagerCashierTab
//    - 替換 cashier JSX 區塊為 <ManagerCashierTab ... />

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
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateTableStatus={handleUpdateTableStatus}
          onRefetchOrders={fetchAllData}
        />
      )}`;

// 建立新的行數組
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  // 插入 ManagerCashierTab import（在現有 ManagerTerminalTab import 後）
  if (lines[i].includes("import { ManagerTerminalTab } from './manager/ManagerTerminalTab'")) {
    newLines.push(lines[i]);
    newLines.push("import { ManagerCashierTab } from './manager/ManagerCashierTab';");
    continue;
  }

  // 跳過被移除的 state 定義行
  if (linesToRemove.has(i)) {
    console.log('移除行', i + 1);
    continue;
  }

  // 替換 cashier 區塊（行 3381-6880）
  if (i === cashierBlockStart) {
    // 插入替換的 JSX
    newLines.push(cashierJsxReplacement);
    // 跳過原始 cashier 區塊（直到結束）
    i = cashierBlockEnd - 1; // 下次循環 i++ 後就到 cashierBlockEnd
    continue;
  }

  newLines.push(lines[i]);
}

const newContent = newLines.join('\n');
fs.writeFileSync('src/components/ManagerDashboard.tsx', newContent, 'utf8');

const stat = fs.statSync('src/components/ManagerDashboard.tsx');
console.log('\nManagerDashboard.tsx 更新完成，新大小:', Math.round(stat.size / 1024), 'KB');
console.log('新行數:', newContent.split('\n').length);
console.log('（原本 9897 行，移除 cashier 區塊後應約 6400-6500 行）');
