import { Order } from '../types';
import { getLocalizedText } from './i18n';
import { isTakeoutOrder } from './orderUtils';

export function buildKitchenReceipt(order: Order, currentLang: any = 'zh', printerIp: string = '192.168.1.100', isReprint = false): string {
  const specLines = order.items.map((it: any) => {
    const spec = [
      it.customization?.spiciness === 1 ? '辣味 (Spicy)' : '不辣 (Non-Spicy)',
      it.customization?.noodleType === 'rice-noodle' ? '河粉' : (it.customization?.noodleType === 'vermicelli' ? '米線' : ''),
      it.customization?.soupBase === 'coconut-milk' ? '加椰奶(+50)' : '',
      it.customization?.notes ? `備註: ${it.customization.notes}` : ''
    ].filter(Boolean).join('/');
    const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
    return `[ ] ${pName} x ${it.qty}份\n    【 ${spec} 】`;
  }).join('\n');

  const titleSuffix = isReprint ? '-重印' : '';
  const headerPrefix = isTakeoutOrder(order) ? `單號/標記: #${order.id}` : `桌號/標記: ${order.tableNumber}`;

  return `
========================================
       沙貝燒烤 (廚房工作即時交代單${titleSuffix})
       ${headerPrefix}
========================================
單號 ID: ${order.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
狀態 STATE: ${(order.status || '').toUpperCase()}
----------------------------------------
餐點項目與客製需求 Kitchen Item(s):
${specLines}
----------------------------------------
* REPRINT KITCHEN TICKET PRINT PREVIEW *
* 感謝廚房人員辛勞，請依序完成出餐確認 *
========================================`.trim();
}

export function buildCustomerReceipt(order: Order, currentLang: any = 'zh', printerIp: string = '192.168.1.100', isReprint = false): string {
  const customerDetails = order.items.map((it: any) => {
    const pName = it.name ? (typeof it.name === 'object' ? ((getLocalizedText(it.name, currentLang) || '未命名')) : it.name) : '未命名';
    return `  ${pName.padEnd(16)} x${it.qty || 0}  $${(it.price || 0) * (it.qty || 0)}`;
  }).join('\n');

  const titleSuffix = isReprint ? '-重印' : '';
  const headerPrefix = isTakeoutOrder(order) ? `單號/標記: #${order.id}` : `桌號/標記: ${order.tableNumber || 'N/A'} 桌`;

  return `
========================================
       沙貝燒烤 (顧客結賬與消點收據${titleSuffix})
       ${headerPrefix}
========================================
單號 ID: ${order.id || 'N/A'}
出單 IP : ${printerIp} (VIRTUAL LAN_9100)
時間 TIME: ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
付款方式: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
累積儲值會員: ${order.isMember ? '是 (小計累積點數中)' : '否'}
----------------------------------------
消費明細 Billing details:
${customerDetails}
----------------------------------------
小計 Total Sub: $${order.subtotal || 0}
服務費 Svc(10%): $${order.serviceCharge || 0}
實付支付 Net:   $${order.total || 0}
========================================
* 感謝您的光臨，美味慢享，期待再次相遇 *
* 憑本熱感收據於當月前台消費享回客點心一份 *
========================================`.trim();
}
