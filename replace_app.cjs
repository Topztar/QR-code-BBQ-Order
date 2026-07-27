const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ["'沙貝泰式燒烤 經營管理中心'", "(lang === 'zh' ? '沙貝泰式燒烤 經營管理中心' : (TRANSLATIONS.app_text_1000?.[lang] || 'Sabay BBQ Management Center'))"],
  ["'沙貝燒烤 泰式烤肉'", "TRANSLATIONS.app_text_1001?.[lang] || 'Sabay Thai BBQ'"],
  ["'🛡️ 員工專屬隔離安全驗證終端 (Autonomous Admin Terminal)'", "(TRANSLATIONS.app_text_1002?.[lang] || '🛡️ Staff Only Terminal')"],
  ["'桃園市大園區高鐵北路二段198號1樓 · 電話: 0966626408'", "(TRANSLATIONS.app_text_1003?.[lang] || '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408')"],
  [">🛎️ 櫃檯收銀台 <", ">{TRANSLATIONS.app_text_1004?.[lang] || '🛎️ Cashier'} <"],
  [">🍳 廚房監控 (KDS) <", ">{TRANSLATIONS.app_text_1005?.[lang] || '🍳 Kitchen (KDS)'} <"],
  [">📊 經營分析與上架 <", ">{TRANSLATIONS.app_text_1006?.[lang] || '📊 Admin Dashboard'} <"],
  [">📱 返回顧客點餐 <", ">{TRANSLATIONS.app_text_1007?.[lang] || '📱 Customer Ordering'} <"],
  [">每日關帳結算 <", ">{TRANSLATIONS.app_text_1008?.[lang] || 'Daily Closing'} <"],
  [">現正收銀結帳 Terminal<", ">{TRANSLATIONS.app_text_1009?.[lang] || 'Checkout Terminal'}<"],
  [">員工登出<", ">{TRANSLATIONS.app_text_1010?.[lang] || 'Staff Logout'}<"],
  [">沙貝餐飲聯盟店鋪資訊 Branch & Contact<", ">{TRANSLATIONS.app_text_1011?.[lang] || 'Branch & Contact Info'}<"],
  [">桃園市大園區高鐵北路二段198號1樓<", ">{TRANSLATIONS.app_text_1003?.[lang]?.split(' · ')[0] || '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist.'}<"],
  ["•••• 聯絡細節與物理地址已安全隱蔽 ••••", "{TRANSLATIONS.app_text_1012?.[lang] || '•••• Contact details & address securely hidden ••••'}"],
  [">隱藏隱私 Hide Info<", ">{TRANSLATIONS.app_text_1013?.[lang] || 'Hide Info'}<"],
  [">點擊解鎖 Reveal Address<", ">{TRANSLATIONS.app_text_1014?.[lang] || 'Reveal Address'}<"],
  [">點餐終端<", ">{TRANSLATIONS.app_text_1015?.[lang] || 'Ordering'}<"],
  [">櫃檯收銀<", ">{TRANSLATIONS.app_text_1016?.[lang] || 'Cashier'}<"],
  [">廚房 KDS<", ">{TRANSLATIONS.app_text_1017?.[lang] || 'Kitchen KDS'}<"],
  [">數據庫存<", ">{TRANSLATIONS.app_text_1018?.[lang] || 'Data/Inventory'}<"],
  [">每日結帳<", ">{TRANSLATIONS.app_text_1019?.[lang] || 'Daily Close'}<"],
  [">顧客前台<", ">{TRANSLATIONS.app_text_1020?.[lang] || 'Customer View'}<"],
  [">登出員工<", ">{TRANSLATIONS.app_text_1021?.[lang] || 'Logout'}<"],
  ["'📡 網路連線已恢復 Online'", "(TRANSLATIONS.app_text_1022?.[lang] || '📡 Network Restored Online')"],
  ["'📡 離線排隊保護中 Offline Mode'", "(TRANSLATIONS.app_text_1023?.[lang] || '📡 Offline Mode (Queue Protection)')"],
  ["`已自動偵測在線 • 有 ${offlineQueue.length} 筆暫存待上傳`", "`\u0024{TRANSLATIONS.app_text_1024?.[lang]?.replace('${offlineQueue.length}', offlineQueue.length.toString()) || 'Online • ' + offlineQueue.length + ' pending uploads'}`"],
  ["`無網路狀態下點餐或狀態調整將自動入庫 • ${offlineQueue.length} 筆待同步作業`", "`\u0024{TRANSLATIONS.app_text_1025?.[lang]?.replace('${offlineQueue.length}', offlineQueue.length.toString()) || 'Offline changes queued • ' + offlineQueue.length + ' pending'}`"],
  [">待同步離線任務佇列 (FIFO Queue)<", ">{TRANSLATIONS.app_text_1026?.[lang] || 'Pending Offline Tasks (FIFO)'}<"],
  [">{offlineQueue.length} 項變更<", ">{TRANSLATIONS.app_text_1027?.[lang]?.replace('${offlineQueue.length}', offlineQueue.length.toString()) || offlineQueue.length + ' changes'}<"],
  ["'確定要清除所有未同步的離線操作與點餐快取嗎？這會清除此視窗目前的未送出變更。'", "(TRANSLATIONS.app_text_1028?.[lang] || 'Clear all pending offline tasks? This will discard unsynced changes.')"],
  ["清除暫存", "{TRANSLATIONS.app_text_1029?.[lang] || 'Clear Cache'}"],
  ["'同步中...'", "(TRANSLATIONS.app_text_1030?.[lang] || 'Syncing...')"],
  [">🔄 立即重試同步<", ">{TRANSLATIONS.app_text_1031?.[lang] || '🔄 Retry Sync Now'}<"],
  [">沙貝燒烤 雲端主機連線中...<", ">{TRANSLATIONS.app_text_1032?.[lang] || 'Connecting to Sabay BBQ Cloud...'}<"],
  [">沙貝管理後台獨立驗證門戶<", ">{TRANSLATIONS.app_text_1033?.[lang] || 'Sabay Admin Verification Portal'}<"],
  ["本頁面為管理階層專屬之獨立防護選單。已與顧客共用選單安全防禦硬化，防止任何未授權之側錄、入侵或探測。", "{TRANSLATIONS.app_text_1034?.[lang] || 'This page is a secure menu exclusively for management. It is hardened against unauthorized access, skimming, and probing.'}"],
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
