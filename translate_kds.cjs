const fs = require('fs');

const translations = {
  '語音合成廣播已開啟，收到新訂單時將自動朗讀': { en: 'TTS broadcast enabled. New orders will be read aloud.', ko: '음성 합성 방송이 켜졌습니다. 새 주문 시 자동으로 읽어줍니다.', ja: '音声合成ブロードキャストが有効になりました。新しい注文は自動的に読み上げられます。', th: 'เปิดใช้งานการออกอากาศ TTS แล้ว คำสั่งซื้อใหม่จะถูกอ่านออกเสียง', vi: 'Đã bật phát âm thanh TTS. Đơn hàng mới sẽ được đọc to.' },
  '語音合成廣播已關閉': { en: 'TTS broadcast disabled.', ko: '음성 합성 방송이 꺼졌습니다.', ja: '音声合成ブロードキャストが無効になりました。', th: 'ปิดใช้งานการออกอากาศ TTS แล้ว', vi: 'Đã tắt phát âm thanh TTS.' },
  '收到新訂單，桌號 ': { en: 'New order received for table ', ko: '새 주문이 접수되었습니다. 테이블 ', ja: '新しい注文を受け付けました。テーブル ', th: 'ได้รับคำสั่งซื้อใหม่สำหรับโต๊ะ ', vi: 'Nhận được đơn hàng mới cho bàn ' },
  ' 時段運載': { en: ' Period Volume', ko: ' 시간대 볼륨', ja: ' 期間ボリューム', th: ' ปริมาณในแต่ละช่วงเวลา', vi: ' Khối lượng theo thời gian' },
  '🎯 今日實際單量:': { en: '🎯 Actual Today:', ko: '🎯 오늘 실제:', ja: '🎯 今日の実績:', th: '🎯 ยอดจริงวันนี้:', vi: '🎯 Thực tế hôm nay:' },
  ' 筆': { en: ' orders', ko: '건', ja: '件', th: ' รายการ', vi: ' đơn' },
  '📈 預期期望單量:': { en: '📈 Expected:', ko: '📈 예상:', ja: '📈 予想:', th: '📈 คาดการณ์:', vi: '📈 Dự kiến:' },
  '🗓️ 7日歷史均值:': { en: '🗓️ 7-Day Avg:', ko: '🗓️ 7일 평균:', ja: '🗓️ 7日間平均:', th: '🗓️ เฉลี่ย 7 วัน:', vi: '🗓️ TB 7 ngày:' },
  '預期波動區間:': { en: 'Expected Range:', ko: '예상 변동 범위:', ja: '予想変動範囲:', th: 'ช่วงที่คาดหวัง:', vi: 'Phạm vi dự kiến:' },
  '飲料': { en: 'Drinks', ko: '음료', ja: 'ドリンク', th: 'เครื่องดื่ม', vi: 'Đồ uống' },
  '烤肉': { en: 'BBQ', ko: '바베큐', ja: 'バーベキュー', th: 'บาร์บีคิว', vi: 'BBQ' },
  '炸物': { en: 'Fried', ko: '튀김', ja: '揚げ物', th: 'ของทอด', vi: 'Đồ chiên' },
  '特色主食': { en: 'Noodles/Mains', ko: '면/식사', ja: '麺/メイン', th: 'เมนูเส้น/อาหารจานหลัก', vi: 'Mì/Món chính' },
  '精選套餐': { en: 'Combos', ko: '세트', ja: 'セット', th: 'ชุดคอมโบ', vi: 'Combo' },
  '此瀏覽器或外掛環境暫不支援 Web Speech API。但您可在下方手動輸入快速備註。': { en: 'Web Speech API is not supported in this browser. You can manually type quick notes below.', ko: '이 브라우저에서는 Web Speech API를 지원하지 않습니다. 아래에 수동으로 빠른 메모를 입력할 수 있습니다.', ja: 'このブラウザはWeb Speech APIをサポートしていません。下部に手動でクイックメモを入力できます。', th: 'เบราว์เซอร์นี้ไม่รองรับ Web Speech API คุณสามารถพิมพ์หมายเหตุด่วนด้วยตนเองด้านล่าง', vi: 'Trình duyệt này không hỗ trợ Web Speech API. Bạn có thể nhập ghi chú nhanh bên dưới.' },
  '麥克風授權失敗，請確認已核准瀏覽器麥克風使用權限': { en: 'Microphone authorization failed. Please confirm microphone permissions.', ko: '마이크 권한 부여 실패. 마이크 권한을 확인해주세요.', ja: 'マイクの認証に失敗しました。マイクの権限を確認してください。', th: 'การให้สิทธิ์ไมโครโฟนล้มเหลว โปรดยืนยันสิทธิ์ไมโครโฟน', vi: 'Ủy quyền micrô thất bại. Vui lòng xác nhận quyền micrô.' },
  '備註內容不可為空白': { en: 'Note content cannot be empty', ko: '메모 내용은 비워둘 수 없습니다.', ja: 'メモの内容は空にできません。', th: 'เนื้อหาหมายเหตุไม่สามารถว่างเปล่าได้', vi: 'Nội dung ghi chú không được để trống' },
  '請輸入需要特別關注的具體原因 / Please enter a reason': { en: 'Please enter a reason for flagging', ko: '플래그 지정 이유를 입력해주세요', ja: 'フラグを設定する理由を入力してください', th: 'โปรดระบุเหตุผลในการติดธง', vi: 'Vui lòng nhập lý do gắn cờ' },
  '🔊 [逼逼！廚房票據機已列印全新工作單]': { en: '🔊 [BEEP! New kitchen ticket printed]', ko: '🔊 [삐! 새 주방 주문서 출력됨]', ja: '🔊 [ピ！新しいキッチンチケットが印刷されました]', th: '🔊 [บี๊บ! พิมพ์ใบสั่งครัวใหม่แล้ว]', vi: '🔊 [BÍP! Đã in phiếu bếp mới]' },
  '沙貝廚房備餐顯示屏 (KDS Monitor)': { en: 'Sabay Kitchen Display System (KDS)', ko: '사바이 주방 디스플레이 시스템 (KDS)', ja: 'サバイキッチンディスプレイシステム (KDS)', th: 'ระบบแสดงผลในครัว Sabay (KDS)', vi: 'Hệ thống hiển thị bếp Sabay (KDS)' },
  '即時同步桌席點單 · 最新 1 秒連線正常': { en: 'Real-time sync · Connected', ko: '실시간 동기화 · 연결됨', ja: 'リアルタイム同期 · 接続済み', th: 'ซิงค์แบบเรียลไทม์ · เชื่อมต่อแล้ว', vi: 'Đồng bộ thời gian thực · Đã kết nối' },
  '搜尋桌號或訂單編號...': { en: 'Search table or order number...', ko: '테이블 또는 주문 번호 검색...', ja: 'テーブルまたは注文番号を検索...', th: 'ค้นหาโต๊ะหรือหมายเลขคำสั่งซื้อ...', vi: 'Tìm kiếm bàn hoặc mã đơn hàng...' },
  '站點分類篩選 (Kitchen Prep Station Filter)': { en: 'Station Filter', ko: '스테이션 필터', ja: 'ステーションフィルター', th: 'ตัวกรองสถานี', vi: 'Lọc trạm' },
  '全部品項 (All Stations)': { en: 'All Stations', ko: '모든 스테이션', ja: 'すべてのステーション', th: 'ทุกสถานี', vi: 'Tất cả các trạm' },
  '找不到符合「': { en: 'No pending orders found matching "', ko: '"에 일치하는 대기 중인 주문이 없습니다.', ja: '「', th: 'ไม่พบคำสั่งซื้อที่รอดำเนินการที่ตรงกับ "', vi: 'Không tìm thấy đơn hàng chờ nào khớp với "' },
  '」的待備訂單 🔍': { en: '" 🔍', ko: '" 🔍', ja: '」に一致する保留中の注文は見つかりません 🔍', th: '" 🔍', vi: '" 🔍' },
  '目前沒有任何待備餐點，大家辛苦了！✨': { en: 'No pending orders at the moment. Good job everyone! ✨', ko: '현재 대기 중인 주문이 없습니다. 모두 수고하셨습니다! ✨', ja: '現在、保留中の注文はありません。皆様お疲れ様でした！✨', th: 'ขณะนี้ไม่มีคำสั่งซื้อที่รอดำเนินการ ทำได้ดีมากทุกคน! ✨', vi: 'Hiện không có đơn hàng chờ nào. Làm tốt lắm mọi người! ✨' }
};

function main() {
  const dataPath = 'src/data.ts';
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  const match = dataContent.match(/export const TRANSLATIONS:.*?\{([\s\S]*?)\n};\n/m);
  if (!match) return;
  
  const translationsBody = match[1];
  let newTranslationsBody = translationsBody;
  
  let idCounter = 2000;
  for (const [zh, trans] of Object.entries(translations)) {
    if (!newTranslationsBody.includes(`zh: '${zh.replace(/'/g, "\\'")}'`)) {
      const key = `app_text_${idCounter++}`;
      let line = `\n  ${key}: { zh: '${zh.replace(/'/g, "\\'")}', en: '${trans.en.replace(/'/g, "\\'")}', ko: '${trans.ko.replace(/'/g, "\\'")}', ja: '${trans.ja.replace(/'/g, "\\'")}', th: '${trans.th.replace(/'/g, "\\'")}', vi: '${trans.vi.replace(/'/g, "\\'")}' },`;
      newTranslationsBody += line;
    }
  }
  
  dataContent = dataContent.replace(translationsBody, newTranslationsBody);
  fs.writeFileSync(dataPath, dataContent);
  console.log('Added KDS translations to src/data.ts');
}
main();
