const fs = require('fs');
const path = 'c:/Works/QR-code-BBQ-Order/src/components/manager/ManagerCashierTab.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add imports
const imports = `import { useCashierCalculations } from '../../hooks/useCashierCalculations';
import { CashierCheckoutConfirmModal } from './modals/CashierCheckoutConfirmModal';
`;
content = content.replace('import { CashierOrderCard } from \'./CashierOrderCard\';', imports + 'import { CashierOrderCard } from \'./CashierOrderCard\';');

// 2. Replace calculation logic
const calcStartMarker = '  // All candidate orders for the current table or merged tables';
const calcEndMarker = `    } finally {
      setIsCheckoutSubmitting(false);
    }
  };`;
const startIndex = content.indexOf(calcStartMarker);
const endIndex = content.indexOf(calcEndMarker, startIndex) + calcEndMarker.length;

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

content = content.substring(0, startIndex) + hookCall + content.substring(endIndex);

// Also remove the `const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);`
content = content.replace('  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);\n', '');
// And `const posBridgeUrl = "http://127.0.0.1:8060";`
content = content.replace('  const posBridgeUrl = "http://127.0.0.1:8060";\n', '');


// 3. Replace inline modal
const modalStartMarker = '{showCheckoutConfirm && cashierSelectedOrder && (';
// Find the exact block
const modalStartIndex = content.indexOf(modalStartMarker);
let openBrackets = 0;
let modalEndIndex = -1;

for (let i = modalStartIndex; i < content.length; i++) {
    if (content[i] === '(') openBrackets++;
    if (content[i] === ')') {
        openBrackets--;
        if (openBrackets === 0 && content.substring(i, i+2) === ')}') {
            modalEndIndex = i + 2;
            break;
        }
    }
}

if (modalStartIndex !== -1 && modalEndIndex !== -1) {
    const modalComponent = `<CashierCheckoutConfirmModal
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
    
    // We adjust by skipping the spaces before the modalStartMarker to align correctly
    content = content.substring(0, modalStartIndex - 6) + '      ' + modalComponent + content.substring(modalEndIndex);
}

fs.writeFileSync(path, content);
console.log('Successfully refactored ManagerCashierTab.tsx');
