const fs = require('fs');

const kdsTranslations = {
  '下架': { en: 'Unlist', ko: '판매중지', ja: '非公開', th: 'เลิกขาย', vi: 'Ngừng bán' },
  '上架': { en: 'List', ko: '판매시작', ja: '公開', th: 'เปิดขาย', vi: 'Đăng bán' },
  '告警': { en: 'Alert', ko: '경고', ja: '警告', th: 'เตือน', vi: 'Cảnh báo' },
  '剩餘: ': { en: 'Left: ', ko: '남음: ', ja: '残り: ', th: 'เหลือ: ', vi: 'Còn lại: ' },
  ' / 門檻: ': { en: ' / Threshold: ', ko: ' / 임계값: ', ja: ' / 閾値: ', th: ' / เกณฑ์: ', vi: ' / Ngưỡng: ' },
  '自訂': { en: 'Custom', ko: '사용자지정', ja: 'カスタム', th: 'กำหนดเอง', vi: 'Tùy chỉnh' },
  '位址設定成功！': { en: 'Address configured!', ko: '주소 설정 완료!', ja: 'アドレス設定完了！', th: 'ตั้งค่าที่อยู่สำเร็จ!', vi: 'Cấu hình địa chỉ thành công!' },
  '儲存失敗': { en: 'Save failed', ko: '저장 실패', ja: '保存失敗', th: 'บันทึกไม่สำเร็จ', vi: 'Lưu thất bại' },
  '儲存': { en: 'Save', ko: '저장', ja: '保存', th: 'บันทึก', vi: 'Lưu' },
  '取消': { en: 'Cancel', ko: '취소', ja: 'キャンセル', th: 'ยกเลิก', vi: 'Hủy' },
  '修改印表機位址': { en: 'Change Printer IP', ko: '프린터 IP 변경', ja: 'プリンタIP変更', th: 'เปลี่ยน IP เครื่องพิมพ์', vi: 'Đổi IP Máy in' },
  '偵測中...': { en: 'Detecting...', ko: '감지 중...', ja: '検出中...', th: 'กำลังตรวจจับ...', vi: 'Đang dò...' },
  '在線 🟢': { en: 'Online 🟢', ko: '온라인 🟢', ja: 'オンライン 🟢', th: 'ออนไลน์ 🟢', vi: 'Trực tuyến 🟢' },
  '離線 🔴': { en: 'Offline 🔴', ko: '오프라인 🔴', ja: 'オフライン 🔴', th: 'ออฟไลน์ 🔴', vi: 'Ngoại tuyến 🔴' },
  '測通': { en: 'Ping', ko: '핑(Ping)', ja: 'Ping', th: 'Ping', vi: 'Ping' },
  '模擬': { en: 'Simulate', ko: '시뮬레이션', ja: 'シミュレート', th: 'จำลอง', vi: 'Mô phỏng' },
  '⚠️ 目前尚無任何虛擬出單記錄可供匯出！ There is no virtual print history to export.': { en: '⚠️ No virtual print history to export.', ko: '⚠️ 내보낼 가상 인쇄 기록이 없습니다.', ja: '⚠️ エクスポートする仮想印刷履歴がありません。', th: '⚠️ ไม่มีประวัติการพิมพ์เสมือนให้ส่งออก', vi: '⚠️ Không có lịch sử in ảo để xuất.' },
  '匯出 CSV': { en: 'Export CSV', ko: 'CSV 내보내기', ja: 'CSVエクスポート', th: 'ส่งออก CSV', vi: 'Xuất CSV' },
  '列印測試頁 Test Page': { en: 'Print Test Page', ko: '테스트 페이지 인쇄', ja: 'テストページ印刷', th: 'พิมพ์หน้าทดสอบ', vi: 'In trang thử nghiệm' },
  '列印測試頁成功發送！': { en: 'Test page sent successfully!', ko: '테스트 페이지가 성공적으로 전송되었습니다!', ja: 'テストページが正常に送信されました！', th: 'ส่งหน้าทดสอบสำเร็จ!', vi: 'Gửi trang thử nghiệm thành công!' },
  '列印失敗': { en: 'Print failed', ko: '인쇄 실패', ja: '印刷失敗', th: 'พิมพ์ไม่สำเร็จ', vi: 'In thất bại' },
  '測試紙 Test Page': { en: 'Test Page', ko: '테스트 페이지', ja: 'テストページ', th: 'หน้าทดสอบ', vi: 'Trang thử nghiệm' },
  '列印管線管道閒置中': { en: 'Print pipeline idle', ko: '인쇄 파이프라인 유휴 상태', ja: '印刷パイプライン アイドル状態', th: 'ไปป์ไลน์การพิมพ์ไม่ได้ใช้งาน', vi: 'Đường ống in đang rảnh' },
  '當點擊加入購物車或完成付款時，系統將模擬 LAN 熱感印表機出單拋送至此。': { en: 'Orders and payments will simulate LAN thermal prints here.', ko: '주문 및 결제는 여기에 LAN 열전사 인쇄를 시뮬레이션합니다.', ja: '注文と支払いは、ここでLAN感熱紙印刷をシミュレートします。', th: 'คำสั่งซื้อและการชำระเงินจะจำลองการพิมพ์ผ่าน LAN ที่นี่', vi: 'Đơn hàng và thanh toán sẽ mô phỏng bản in nhiệt LAN tại đây.' },
  '時間: ': { en: 'Time: ', ko: '시간: ', ja: '時間: ', th: 'เวลา: ', vi: 'Thời gian: ' },
  '100% 傳送正常': { en: '100% Transmitted OK', ko: '100% 전송 정상', ja: '100% 送信正常', th: 'ส่งสำเร็จ 100%', vi: '100% Truyền thành công' },
  ' 餐點明細 (KDS Quick View)': { en: ' Order Details (KDS)', ko: ' 주문 상세 (KDS)', ja: ' 注文詳細 (KDS)', th: ' รายละเอียดคำสั่งซื้อ (KDS)', vi: ' Chi tiết đơn hàng (KDS)' },
  '特別關注': { en: 'Attention', ko: '주의', ja: '要注意', th: 'โปรดระวัง', vi: 'Chú ý' },
  '下單時間 Order Time': { en: 'Order Time', ko: '주문 시간', ja: '注文時間', th: 'เวลาสั่ง', vi: 'Thời gian đặt' },
  '等候時間 Elapsed Time': { en: 'Elapsed Time', ko: '경과 시간', ja: '経過時間', th: 'เวลาที่ผ่านไป', vi: 'Thời gian đã qua' },
  '⚠️ 即將關店，加速出餐 (Store closing soon)': { en: '⚠️ Store closing soon, expedite order', ko: '⚠️ 영업 종료 임박, 조리 서두르기', ja: '⚠️ まもなく閉店、お急ぎください', th: '⚠️ ร้านใกล้ปิดแล้ว รีบทำด่วน', vi: '⚠️ Sắp đóng cửa, đẩy nhanh tiến độ' },
  '此訂單於每日結業關閉前 30 分鐘內進入，請廚房人員縮短備餐流程，儘速完成出餐！': { en: 'Order placed within 30 mins of closing. Please expedite!', ko: '영업 종료 30분 이내에 들어온 주문입니다. 신속하게 준비해주세요!', ja: '閉店30分前に入った注文です。調理を急いでください！', th: 'สั่งอาหารในช่วง 30 นาทีก่อนปิดร้าน โปรดเร่งมือ!', vi: 'Đơn hàng đặt trong vòng 30 phút trước khi đóng cửa. Vui lòng làm nhanh!' },
  '顧客滯留總時間 Guest Wait Session': { en: 'Guest Wait Session', ko: '고객 대기 세션', ja: 'ゲスト待機セッション', th: 'เวลารอของลูกค้า', vi: 'Thời gian chờ của khách' },
  '桌況佔用總時間 Table Occupancy': { en: 'Table Occupancy', ko: '테이블 점유율', ja: 'テーブル占有率', th: 'การใช้โต๊ะ', vi: 'Thời gian ngồi bàn' },
  'KDS 快速備註 Quick Note': { en: 'KDS Quick Note', ko: 'KDS 빠른 메모', ja: 'KDS クイックメモ', th: 'หมายเหตุด่วน KDS', vi: 'Ghi chú nhanh KDS' },
  '特別關注 Attention Required': { en: 'Attention Required', ko: '주의 요망', ja: '要注意', th: 'ต้องการความสนใจพิเศษ', vi: 'Cần chú ý' },
  '餐點清單 Item Breakdown': { en: 'Item Breakdown', ko: '품목 내역', ja: 'アイテム内訳', th: 'รายละเอียดรายการ', vi: 'Chi tiết món' },
  '已完成': { en: 'Completed', ko: '완료됨', ja: '完了', th: 'เสร็จสิ้น', vi: 'Đã xong' },
  '製作完成': { en: 'Done', ko: '조리완료', ja: '調理完了', th: 'ทำเสร็จแล้ว', vi: 'Chế biến xong' },
  '📌 該品項特殊客製備註 Item Notes': { en: '📌 Item Notes', ko: '📌 품목 메모', ja: '📌 アイテムメモ', th: '📌 หมายเหตุรายการ', vi: '📌 Ghi chú món' },
  '🖨️ 虛擬網卡列印指令傳送正常！(單號: ': { en: '🖨️ Virtual print command sent OK! (ID: ', ko: '🖨️ 가상 인쇄 명령 전송 정상! (ID: ', ja: '🖨️ 仮想印刷コマンド送信正常！(ID: ', th: '🖨️ ส่งคำสั่งพิมพ์เสมือนสำเร็จ! (ID: ', vi: '🖨️ Đã gửi lệnh in ảo thành công! (ID: ' },
  '列印廚房單 Print Ticket': { en: 'Print Ticket', ko: '주문서 인쇄', ja: 'チケット印刷', th: 'พิมพ์ใบสั่ง', vi: 'In phiếu bếp' },
  '關閉 Close': { en: 'Close', ko: '닫기', ja: '閉じる', th: 'ปิด', vi: 'Đóng' },
  '🖨️ 熱感出單預覽 Print Preview': { en: '🖨️ Print Preview', ko: '🖨️ 인쇄 미리보기', ja: '🖨️ 印刷プレビュー', th: '🖨️ ดูตัวอย่างก่อนพิมพ์', vi: '🖨️ Xem trước bản in' },
  '確認執行列印任務？': { en: 'Confirm print task?', ko: '인쇄 작업을 확인하시겠습니까?', ja: '印刷タスクを確認しますか？', th: 'ยืนยันงานพิมพ์หรือไม่?', vi: 'Xác nhận in?' },
  '任務名稱 Task': { en: 'Task Name', ko: '작업 이름', ja: 'タスク名', th: 'ชื่องาน', vi: 'Tên nhiệm vụ' },
  '印表機 IP Address': { en: 'Printer IP', ko: '프린터 IP', ja: 'プリンタIP', th: 'IP เครื่องพิมพ์', vi: 'IP Máy in' },
  '請確認您已與本機熱熱感印硬體連線至同一區域網路內（WiFi），並確認印表機開機且狀態正常。': { en: 'Please ensure you are on the same Wi-Fi as the printer, and it is powered on.', ko: '프린터와 동일한 Wi-Fi에 연결되어 있고 전원이 켜져 있는지 확인하세요.', ja: 'プリンタと同じWi-Fiに接続し、電源が入っていることを確認してください。', th: 'โปรดตรวจสอบให้แน่ใจว่าคุณอยู่ใน Wi-Fi เดียวกับเครื่องพิมพ์ และเปิดเครื่องแล้ว', vi: 'Vui lòng đảm bảo bạn đang ở cùng mạng Wi-Fi với máy in và máy in đã được bật.' },
  '✔ 出單格式: ': { en: '✔ Format: ', ko: '✔ 형식: ', ja: '✔ フォーマット: ', th: '✔ รูปแบบ: ', vi: '✔ Định dạng: ' },
  '餐廳工作交代票 (Kitchen Ticket)': { en: 'Kitchen Ticket', ko: '주방 주문서', ja: 'キッチンチケット', th: 'ใบสั่งครัว', vi: 'Phiếu bếp' },
  '前台客戶收據 (Billing Receipt)': { en: 'Billing Receipt', ko: '고객 영수증', ja: '顧客レシート', th: 'ใบเสร็จรับเงิน', vi: 'Biên lai thanh toán' },
  '✔ 支援本機熱感寬度 80mm / 58mm': { en: '✔ Supports 80mm/58mm thermal paper', ko: '✔ 80mm/58mm 열전사 용지 지원', ja: '✔ 80mm/58mm感熱紙対応', th: '✔ รองรับกระดาษความร้อน 80 มม. / 58 มม.', vi: '✔ Hỗ trợ giấy in nhiệt 80mm / 58mm' },
  '📄 虛擬熱感列印預覽 Thermal Receipt Preview:': { en: '📄 Thermal Receipt Preview:', ko: '📄 열전사 영수증 미리보기:', ja: '📄 感熱紙レシートプレビュー:', th: '📄 ดูตัวอย่างใบเสร็จแบบใช้ความร้อน:', vi: '📄 Xem trước hóa đơn in nhiệt:' },
  '確定執行列印': { en: 'Execute Print', ko: '인쇄 실행', ja: '印刷実行', th: 'สั่งพิมพ์', vi: 'Thực hiện in' },
  '清除虛擬管線日誌 Clear Virtual Buffer': { en: 'Clear Virtual Buffer', ko: '가상 버퍼 지우기', ja: '仮想バッファをクリア', th: 'ล้างบัฟเฟอร์เสมือน', vi: 'Xóa bộ đệm ảo' },
  '合併相同品項與計量進行批次製作': { en: 'Merge identical items for batch prep', ko: '일괄 조리를 위해 동일한 품목 병합', ja: 'バッチ調理用に同じアイテムをマージ', th: 'รวมรายการที่เหมือนกันสำหรับการเตรียมเป็นชุด', vi: 'Hợp nhất các món giống nhau để chế biến hàng loạt' },
  '手動立即滾置頂部 (Manual scroll back to top)': { en: 'Manual scroll to top', ko: '맨 위로 수동 스크롤', ja: '手動でトップにスクロール', th: 'เลื่อนขึ้นบนสุดด้วยตนเอง', vi: 'Cuộn tay lên đầu trang' }
};

function main() {
  const dataPath = 'src/data.ts';
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  const match = dataContent.match(/export const TRANSLATIONS:.*?\{([\s\S]*?)\n};\n/m);
  if (!match) return;
  
  const translationsBody = match[1];
  let newTranslationsBody = translationsBody;
  
  let idCounter = 3000;
  for (const [zh, trans] of Object.entries(kdsTranslations)) {
    if (!newTranslationsBody.includes(`zh: '${zh.replace(/'/g, "\\'")}'`)) {
      const key = `app_text_${idCounter++}`;
      let line = `\n  ${key}: { zh: '${zh.replace(/'/g, "\\'")}', en: '${trans.en.replace(/'/g, "\\'")}', ko: '${trans.ko.replace(/'/g, "\\'")}', ja: '${trans.ja.replace(/'/g, "\\'")}', th: '${trans.th.replace(/'/g, "\\'")}', vi: '${trans.vi.replace(/'/g, "\\'")}' },`;
      newTranslationsBody += line;
    }
  }
  
  dataContent = dataContent.replace(translationsBody, newTranslationsBody);
  fs.writeFileSync(dataPath, dataContent);
  console.log('Added more KDS translations to src/data.ts');
}
main();
