const fs = require('fs');
const file = 'src/utils/receiptBuilder.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/currentLang: 'zh' \| 'en' \| 'kh' \| 'ko' = 'zh'/g, "currentLang: any = 'zh'");
c = c.replace(/currentLang: 'zh' \| 'en' \| 'ko' \| 'kh'/g, "currentLang: any");
fs.writeFileSync(file, c, 'utf8');

const modalFile = 'src/components/manager/modals/OrderDetailDrilldownModal.tsx';
let m = fs.readFileSync(modalFile, 'utf8');
m = m.replace(/buildKitchenReceipt\(selectedOrder, (.*?)\)/g, 'buildKitchenReceipt(selectedOrder, $1 as any)');
m = m.replace(/buildCustomerReceipt\(selectedOrder, (.*?)\)/g, 'buildCustomerReceipt(selectedOrder, $1 as any)');
fs.writeFileSync(modalFile, m, 'utf8');

