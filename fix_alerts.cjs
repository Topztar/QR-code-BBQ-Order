const fs = require('fs');

const modalFile = 'src/components/manager/modals/OrderDetailDrilldownModal.tsx';
let modalContent = fs.readFileSync(modalFile, 'utf8');
modalContent = modalContent.replace(/onConfirm: \(\) => alert\((.*?)\)/g, 'onConfirm: import.meta.env.DEV ? () => alert($1) : undefined');
fs.writeFileSync(modalFile, modalContent, 'utf8');

const kdsFile = 'src/components/kds/KdsTicketCard.tsx';
let kdsContent = fs.readFileSync(kdsFile, 'utf8');
kdsContent = kdsContent.replace(/alert\(`🖨️ (.*?)`\);/g, 'if (import.meta.env.DEV) alert(`🖨️ $1`);');
fs.writeFileSync(kdsFile, kdsContent, 'utf8');
