const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// We want to replace everything from `const [resNameInput` up to and including the closing of `isResTimeValid`

const startTag = `  const [resNameInput`;
const endTag = `  const [currentPinInput`;

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

let newContent = content.substring(0, startIndex) + content.substring(endIndex);

// Also update `triggerAddReservationMode` and `triggerEditReservationMode`
newContent = newContent.replace(/  const triggerAddReservationMode = \(\) => \{[\s\S]*?setIsResFormOpen\(true\);\n  \};/, 
`  const triggerAddReservationMode = () => {
    setEditingResObj(null);
    setIsResFormOpen(true);
  };`);

newContent = newContent.replace(/  const triggerEditReservationMode = \(res: Reservation\) => \{[\s\S]*?setIsResFormOpen\(true\);\n  \};/, 
`  const triggerEditReservationMode = (res: Reservation) => {
    setEditingResObj(res);
    setIsResFormOpen(true);
  };`);

// And remove `managerResAvailability`, `managerDesignatedCapacity`, `handleReservationSaveSubmit` and the `useEffect` auto-assign

const startTag2 = `  // 3-Hour Overlapping Window Capacity Calculation for Manager Reservation Form`;
const endTag2 = `  const handleToggleDishAvailable = async (dishId: string, currentStatus: boolean) => {`;

const startIndex2 = newContent.indexOf(startTag2);
const endIndex2 = newContent.indexOf(endTag2);

if (startIndex2 !== -1 && endIndex2 !== -1) {
  newContent = newContent.substring(0, startIndex2) + newContent.substring(endIndex2);
}

fs.writeFileSync(path, newContent);
console.log("Reservation states cleaned up successfully.");
