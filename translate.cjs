const fs = require('fs');

const translations = {
  '沙貝泰式燒烤 經營管理中心': { en: 'Sabay BBQ Management Center', ko: '사바이 BBQ 관리 센터', ja: 'サバイBBQ 管理センター', th: 'ศูนย์การจัดการ Sabay BBQ', vi: 'Trung tâm quản lý Sabay BBQ' },
  '沙貝燒烤 泰式烤肉': { en: 'Sabay Thai BBQ', ko: '사바이 타이 BBQ', ja: 'サバイ タイBBQ', th: 'Sabay BBQ', vi: 'Sabay Thái BBQ' },
  '🛡️ 員工專屬隔離安全驗證終端 (Autonomous Admin Terminal)': { en: '🛡️ Staff Only Terminal', ko: '🛡️ 직원 전용 보안 터미널', ja: '🛡️ スタッフ専用セキュリティ端末', th: '🛡️ เฉพาะพนักงานเท่านั้น', vi: '🛡️ Thiết bị bảo mật cho nhân viên' },
  '桃園市大園區高鐵北路二段198號1樓 · 電話: 0966626408': { en: '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408', ko: '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408', ja: '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408', th: '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408', vi: '1F., No.198, Sec. 2, Gaotie N. Rd., Dayuan Dist. · Tel: 0966626408' },
  '🛎️ 櫃檯收銀台': { en: '🛎️ Cashier', ko: '🛎️ 카운터', ja: '🛎️ レジ', th: '🛎️ แคชเชียร์', vi: '🛎️ Thu ngân' },
  '🍳 廚房監控 (KDS)': { en: '🍳 Kitchen (KDS)', ko: '🍳 주방 (KDS)', ja: '🍳 キッチン (KDS)', th: '🍳 ครัว (KDS)', vi: '🍳 Bếp (KDS)' },
  '📊 經營分析與上架': { en: '📊 Admin Dashboard', ko: '📊 관리자 대시보드', ja: '📊 管理ダッシュボード', th: '📊 แดชบอร์ดผู้ดูแลระบบ', vi: '📊 Bảng điều khiển Admin' },
  '📱 返回顧客點餐': { en: '📱 Customer Ordering', ko: '📱 고객 주문', ja: '📱 顧客注文', th: '📱 สั่งอาหารสำหรับลูกค้า', vi: '📱 Khách hàng đặt món' },
  '每日關帳結算': { en: 'Daily Closing', ko: '일일 마감', ja: '日次締め', th: 'ปิดยอดรายวัน', vi: 'Chốt ca hàng ngày' },
  '現正收銀結帳 Terminal': { en: 'Checkout Terminal', ko: '결제 터미널', ja: '決済端末', th: 'เครื่องคิดเงิน', vi: 'Quầy thu ngân' },
  '員工登出': { en: 'Staff Logout', ko: '직원 로그아웃', ja: 'スタッフ ログアウト', th: 'พนักงานออกจากระบบ', vi: 'Nhân viên Đăng xuất' },
  '沙貝餐飲聯盟店鋪資訊 Branch & Contact': { en: 'Branch & Contact Info', ko: '지점 및 연락처 정보', ja: '店舗と連絡先', th: 'ข้อมูลสาขาและการติดต่อ', vi: 'Thông tin chi nhánh & Liên hệ' },
  '•••• 聯絡細節與物理地址已安全隱蔽 ••••': { en: '•••• Contact details & address securely hidden ••••', ko: '•••• 연락처 및 주소가 안전하게 숨겨졌습니다 ••••', ja: '•••• 連絡先と住所は安全に隠されています ••••', th: '•••• ข้อมูลติดต่อถูกซ่อนอย่างปลอดภัย ••••', vi: '•••• Thông tin liên hệ đã được ẩn bảo mật ••••' },
  '隱藏隱私 Hide Info': { en: 'Hide Info', ko: '정보 숨기기', ja: '情報を隠す', th: 'ซ่อนข้อมูล', vi: 'Ẩn thông tin' },
  '點擊解鎖 Reveal Address': { en: 'Reveal Address', ko: '주소 표시', ja: '住所を表示', th: 'แสดงที่อยู่', vi: 'Hiện địa chỉ' },
  '點餐終端': { en: 'Ordering', ko: '주문', ja: '注文端末', th: 'สั่งอาหาร', vi: 'Đặt món' },
  '櫃檯收銀': { en: 'Cashier', ko: '계산대', ja: 'レジ', th: 'แคชเชียร์', vi: 'Thu ngân' },
  '廚房 KDS': { en: 'Kitchen KDS', ko: '주방 KDS', ja: 'キッチンKDS', th: 'ครัว KDS', vi: 'Bếp KDS' },
  '數據庫存': { en: 'Data/Inventory', ko: '데이터/재고', ja: 'データ・在庫', th: 'ข้อมูล/คลังสินค้า', vi: 'Dữ liệu/Tồn kho' },
  '每日結帳': { en: 'Daily Close', ko: '일일 정산', ja: '日次清算', th: 'ปิดยอดประจำวัน', vi: 'Chốt ngày' },
  '顧客前台': { en: 'Customer View', ko: '고객 화면', ja: '顧客画面', th: 'หน้าจอลูกค้า', vi: 'Màn hình khách' },
  '登出員工': { en: 'Logout', ko: '로그아웃', ja: 'ログアウト', th: 'ออกจากระบบ', vi: 'Đăng xuất' },
  '📡 網路連線已恢復 Online': { en: '📡 Network Restored Online', ko: '📡 네트워크 연결됨', ja: '📡 ネットワーク復旧', th: '📡 ออนไลน์แล้ว', vi: '📡 Đã kết nối mạng' },
  '📡 離線排隊保護中 Offline Mode': { en: '📡 Offline Mode (Queue Protection)', ko: '📡 오프라인 모드', ja: '📡 オフラインモード', th: '📡 โหมดออฟไลน์', vi: '📡 Chế độ ngoại tuyến' },
  '已自動偵測在線 • 有 ${offlineQueue.length} 筆暫存待上傳': { en: 'Online • ${offlineQueue.length} pending uploads', ko: '온라인 • ${offlineQueue.length}개 업로드 대기 중', ja: 'オンライン • ${offlineQueue.length}件の未送信データ', th: 'ออนไลน์ • รออัปโหลด ${offlineQueue.length} รายการ', vi: 'Trực tuyến • ${offlineQueue.length} mục chờ tải lên' },
  '無網路狀態下點餐或狀態調整將自動入庫 • ${offlineQueue.length} 筆待同步作業': { en: 'Offline changes queued • ${offlineQueue.length} pending', ko: '오프라인 변경 저장됨 • ${offlineQueue.length}개 대기 중', ja: 'オフライン変更保存中 • ${offlineQueue.length}件の未送信', th: 'รายการออฟไลน์รอดำเนินการ • ${offlineQueue.length} รายการ', vi: 'Đã lưu thay đổi ngoại tuyến • ${offlineQueue.length} mục chờ' },
  '待同步離線任務佇列 (FIFO Queue)': { en: 'Pending Offline Tasks (FIFO)', ko: '대기 중인 오프라인 작업', ja: '未送信タスク', th: 'งานออฟไลน์รอดำเนินการ', vi: 'Nhiệm vụ ngoại tuyến đang chờ' },
  '${offlineQueue.length} 項變更': { en: '${offlineQueue.length} changes', ko: '${offlineQueue.length}개의 변경사항', ja: '${offlineQueue.length}件の変更', th: '${offlineQueue.length} การเปลี่ยนแปลง', vi: '${offlineQueue.length} thay đổi' },
  '確定要清除所有未同步的離線操作與點餐快取嗎？這會清除此視窗目前的未送出變更。': { en: 'Clear all pending offline tasks? This will discard unsynced changes.', ko: '대기 중인 모든 오프라인 작업을 지우시겠습니까? 동기화되지 않은 변경사항이 취소됩니다.', ja: '未送信のタスクをすべてクリアしますか？送信されていない変更は破棄されます。', th: 'ล้างงานออฟไลน์ที่รอดำเนินการทั้งหมดหรือไม่ ระบบจะทิ้งการเปลี่ยนแปลงที่ยังไม่ได้ซิงค์', vi: 'Xóa tất cả các tác vụ ngoại tuyến chưa đồng bộ? Thao tác này sẽ hủy các thay đổi chưa được gửi.' },
  '清除暫存': { en: 'Clear Cache', ko: '캐시 지우기', ja: 'キャッシュをクリア', th: 'ล้างแคช', vi: 'Xóa bộ nhớ tạm' },
  '同步中...': { en: 'Syncing...', ko: '동기화 중...', ja: '同期中...', th: 'กำลังซิงค์...', vi: 'Đang đồng bộ...' },
  '🔄 立即重試同步': { en: '🔄 Retry Sync Now', ko: '🔄 지금 동기화 재시도', ja: '🔄 今すぐ同期を再試行', th: '🔄 ลองซิงค์อีกครั้งเดี๋ยวนี้', vi: '🔄 Thử đồng bộ lại ngay' },
  '沙貝燒烤 雲端主機連線中...': { en: 'Connecting to Sabay BBQ Cloud...', ko: '사바이 BBQ 클라우드에 연결 중...', ja: 'サバイBBQクラウドに接続中...', th: 'กำลังเชื่อมต่อกับคลาวด์ Sabay BBQ...', vi: 'Đang kết nối đến Sabay BBQ Cloud...' },
  '沙貝管理後台獨立驗證門戶': { en: 'Sabay Admin Verification Portal', ko: '사바이 관리자 인증 포털', ja: 'サバイ管理者認証ポータル', th: 'พอร์ทัลยืนยันตัวตนผู้ดูแลระบบ Sabay', vi: 'Cổng xác thực quản trị viên Sabay' },
  '本頁面為管理階層專屬之獨立防護選單。已與顧客共用選單安全防禦硬化，防止任何未授權之側錄、入侵或探測。': { en: 'This page is a secure menu exclusively for management. It is hardened against unauthorized access, skimming, and probing.', ko: '이 페이지는 관리자 전용 보안 메뉴입니다. 무단 접근을 방지하기 위해 보안이 강화되었습니다.', ja: 'このページは管理者専用の安全なメニューです。不正アクセスを防ぐためにセキュリティが強化されています。', th: 'หน้านี้เป็นเมนูความปลอดภัยสำหรับฝ่ายบริหารเท่านั้น ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต', vi: 'Trang này là menu bảo mật dành riêng cho quản lý. Nó được bảo vệ chống truy cập trái phép.' },
};

function main() {
  const dataPath = 'src/data.ts';
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  // Find export const TRANSLATIONS
  const match = dataContent.match(/export const TRANSLATIONS:.*?\{([\s\S]*?)\n};\n/m);
  if (!match) {
    console.error("Could not find TRANSLATIONS in src/data.ts");
    return;
  }
  
  const translationsBody = match[1];
  let newTranslationsBody = translationsBody;
  
  let idCounter = 1000;
  for (const [zh, trans] of Object.entries(translations)) {
    // Only add if not exists
    if (!newTranslationsBody.includes(`zh: '${zh.replace(/'/g, "\\'")}'`)) {
      const key = `app_text_${idCounter++}`;
      let line = `\n  ${key}: { zh: '${zh.replace(/'/g, "\\'")}', en: '${trans.en.replace(/'/g, "\\'")}', ko: '${trans.ko.replace(/'/g, "\\'")}', ja: '${trans.ja.replace(/'/g, "\\'")}', th: '${trans.th.replace(/'/g, "\\'")}', vi: '${trans.vi.replace(/'/g, "\\'")}' },`;
      newTranslationsBody += line;
    }
  }
  
  dataContent = dataContent.replace(translationsBody, newTranslationsBody);
  fs.writeFileSync(dataPath, dataContent);
  console.log('Added new translations to src/data.ts');
}

main();
