const fs = require('fs');
const path = 'c:/Works/QR-code-BBQ-Order/src/components/manager/ManagerCashierTab.tsx';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

// 1. Add imports at the top
const imports = `import { useCashierCalculations } from '../../hooks/useCashierCalculations';
import { CashierCheckoutConfirmModal } from './modals/CashierCheckoutConfirmModal';`;

let importIndex = lines.findIndex(l => l.includes("import { CashierOrderCard } from './CashierOrderCard';"));
if (importIndex !== -1) {
    lines.splice(importIndex, 0, imports);
}

// 2. Replace calculation logic (lines 259 to 671 approx)
// Find the exact line of `// All candidate orders for the current table or merged tables`
let calcStartIndex = lines.findIndex(l => l.includes('// All candidate orders for the current table or merged tables'));
// Find the exact line of `setIsCheckoutSubmitting(false);` `    }` `  };` after `calcStartIndex`
let calcEndIndex = -1;
for (let i = calcStartIndex; i < lines.length; i++) {
    if (lines[i].includes('setIsCheckoutSubmitting(false);') && 
        lines[i+1].includes('}') && 
        lines[i+2].includes('};')) {
        calcEndIndex = i + 2;
        break;
    }
}

if (calcStartIndex !== -1 && calcEndIndex !== -1) {
    const hookCall = `  const {
    cashierCandidateOrders,
    cashierMergedOrders,
    cashierCalculatedTotals,
    isCheckoutSubmitting,
    handleCashierCheckoutSubmit
  } = useCashierCalculations({
    orders,
    tables,
    menuItems,
    cashierSelectedOrder,
    cashierCheckoutScope,
    cashierSelectedMergeOrderIds,
    cashierDiscountType,
    cashierDiscountRate,
    cashierDiscountFlat,
    cashierSurchargeType,
    cashierSurchargeRate,
    cashierSurchargeFlat,
    cashierPaymentMethod,
    cashierCashReceived,
    setCashierCashReceived,
    onPayOrder,
    onBulkPayOrders,
    onUpdateTableStatus,
    setSelectedCashierOrderId,
    setCheckoutSuccessData,
    staffPin,
    billPrinter
  });`;
  
    lines.splice(calcStartIndex, calcEndIndex - calcStartIndex + 1, hookCall);
}

// Remove `const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);`
let isSubmittingIndex = lines.findIndex(l => l.includes('const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);'));
if (isSubmittingIndex !== -1) {
    lines.splice(isSubmittingIndex, 1);
}
let posBridgeIndex = lines.findIndex(l => l.includes('const posBridgeUrl = "http://127.0.0.1:8060";'));
if (posBridgeIndex !== -1) {
    lines.splice(posBridgeIndex, 1);
}

// 3. Replace inline modal (approx lines 4005 to 4151)
let modalStartIndex = lines.findIndex(l => l.includes('{showCheckoutConfirm && cashierSelectedOrder && ('));
let modalEndIndex = -1;
if (modalStartIndex !== -1) {
    let openParen = 0;
    for (let i = modalStartIndex; i < lines.length; i++) {
        const charArray = lines[i].split('');
        for (let j = 0; j < charArray.length; j++) {
            if (charArray[j] === '(') openParen++;
            if (charArray[j] === ')') openParen--;
        }
        if (openParen === 0 && lines[i].includes(')}')) {
            modalEndIndex = i;
            break;
        }
    }
}

if (modalStartIndex !== -1 && modalEndIndex !== -1) {
    const modalComponent = `      <CashierCheckoutConfirmModal
        isOpen={showCheckoutConfirm && cashierSelectedOrder !== null}
        onClose={() => setShowCheckoutConfirm(false)}
        order={cashierSelectedOrder}
        mergedOrders={cashierMergedOrders}
        checkoutScope={cashierCheckoutScope as any}
        paymentMethod={cashierPaymentMethod as any}
        calculatedTotals={cashierCalculatedTotals}
        discountType={cashierDiscountType as any}
        discountRate={cashierDiscountRate}
        surchargeType={cashierSurchargeType as any}
        surchargeRate={cashierSurchargeRate}
        cashReceived={cashierCashReceived}
        isSubmitting={isCheckoutSubmitting}
        onConfirm={handleCashierCheckoutSubmit}
      />`;
      
    lines.splice(modalStartIndex, modalEndIndex - modalStartIndex + 1, modalComponent);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Done refactoring!');
