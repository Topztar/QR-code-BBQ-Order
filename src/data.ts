import { Language } from './types';

export const TRANSLATIONS: { [key: string]: { [lang in Language]: string } } = {
  welcome: { zh: '泰式炭火燒烤桌邊點餐系統', en: 'Thai Charcoal BBQ Ordering System', ko: '태국식 숯불 바베큐 테이블 주문 시스템', ja: 'タイ風炭火焼肉テーブル注文システム', th: 'ระบบสั่งอาหารปิ้งย่างถ่านไทย', vi: 'Hệ thống gọi món nướng than Thái' },
  home: { zh: '首頁', en: 'Home', ko: '홈', ja: 'ホーム', th: 'หน้าแรก', vi: 'Trang chủ' },
  menu: { zh: '精選菜單', en: 'Menu', ko: '메뉴', ja: 'メニュー', th: 'เมนู', vi: 'Thực đơn' },
  cart: { zh: '購物車', en: 'Cart', ko: '장바구니', ja: 'カート', th: 'ตะกร้าสินค้า', vi: 'Giỏ hàng' },
  orderStatus: { zh: '訂單狀態', en: 'Order Status', ko: '주문 상태', ja: '注文ステータス', th: 'สถานะออเดอร์', vi: 'Trạng thái đơn hàng' },
  language: { zh: '選擇語言 Language', en: 'Language', ko: '언어 선택', ja: '言語選択', th: 'เลือกภาษา', vi: 'Chọn ngôn ngữ' },
  table: { zh: '桌號 Table', en: 'Table', ko: '테이블 번호', ja: 'テーブル番号', th: 'หมายเลขโต๊ะ', vi: 'Số bàn' },
  orderHistory: { zh: '歷史訂單', en: 'Order History', ko: '주문 내역', ja: '注文履歴', th: 'ประวัติการสั่งซื้อ', vi: 'Lịch sử đơn hàng' },
  price: { zh: '價格', en: 'Price', ko: '가격', ja: '価格', th: 'ราคา', vi: 'Giá' },
  quantity: { zh: '數量', en: 'Quantity', ko: '수량', ja: '数量', th: 'จำนวน', vi: 'Số lượng' },
  total: { zh: '總計', en: 'Total', ko: '총합계', ja: '合計', th: 'รวมทั้งหมด', vi: 'Tổng cộng' },
  addCart: { zh: '加入購物車', en: 'Add to Cart', ko: '장바구니에 담기', ja: 'カートに入れる', th: 'ใส่ตะกร้า', vi: 'Thêm vào giỏ hàng' },
  placeOrder: { zh: '確認送出訂單', en: 'Place Order', ko: '주문하기', ja: '注文を確定する', th: 'ยืนยันการสั่งซื้อ', vi: 'Xác nhận đặt hàng' },
  emptyCart: { zh: '購物車是空的', en: 'Your cart is empty', ko: '장바구니가 비어 있습니다', ja: 'カートは空です', th: 'ตะกร้าสินค้าว่างเปล่า', vi: 'Giỏ hàng trống' },
  spicy: { zh: '辣度選項 Spicy Level', en: 'Spicy Level', ko: '매운맛 옵션', ja: '辛さレベル', th: 'ระดับความเผ็ด', vi: 'Mức độ cay' },
  spicyNone: { zh: '不辣 Non-Spicy', en: 'Non-Spicy', ko: '안 맵게', ja: '辛くない', th: 'ไม่เผ็ด', vi: 'Không cay' },
  spicyMild: { zh: '微辣 Mild', en: 'Mild', ko: '약간 매운맛', ja: 'ピリ辛', th: 'เผ็ดน้อย', vi: 'Cay ít' },
  spicyMedium: { zh: '中辣 Medium', en: 'Medium', ko: '보통 매운맛', ja: '中辛', th: 'เผ็ดกลาง', vi: 'Cay vừa' },
  spicyHot: { zh: '大辣 Hot', en: 'Hot', ko: '아주 매운맛', ja: '大辛', th: 'เผ็ดมาก', vi: 'Cay nhiều' },
  options: { zh: '客製化調整 Custom Options', en: 'Customizations', ko: '커스텀 조절', ja: 'カスタム調整', th: 'ตัวเลือกเพิ่มเติม', vi: 'Tùy chỉnh cá nhân' },
  addSoup: { zh: '加湯 Free Soup Refill', en: 'Free Soup Refill', ko: '육수 리필', ja: 'スープ追加', th: 'เติมซุปฟรี', vi: 'Thêm súp miễn phí' },
  noCoriander: { zh: '去香菜 No Coriander', en: 'No Coriander', ko: '고수 빼기', ja: 'コリアンダー抜き', th: 'ไม่ใส่ผักชี', vi: 'Không ngò' },
  lessIce: { zh: '少冰 Less Ice', en: 'Less Ice', ko: '얼음 적게', ja: '氷少なめ', th: 'น้ำแข็งน้อย', vi: 'Ít đá' },
  moreIce: { zh: '多冰 Extra Ice', en: 'Extra Ice', ko: '얼음 많이', ja: '氷多め', th: 'น้ำแข็งเยอะ', vi: 'Nhiều đá' },
  noIce: { zh: '去冰 No Ice', en: 'No Ice', ko: '얼음 빼기', ja: '氷なし', th: 'ไม่ใส่น้ำแข็ง', vi: 'Không đá' },
  sweetNormal: { zh: '正常甜 Normal Sweet', en: 'Normal Sweet', ko: '보통 단맛', ja: '普通の甘さ', th: 'หวานปกติ', vi: 'Ngọt bình thường' },
  sweetLess: { zh: '少甜 Less Sweet', en: 'Less Sweet', ko: '덜 단맛', ja: '甘さ控えめ', th: 'หวานน้อย', vi: 'Ít ngọt' },
  sweetNone: { zh: '無糖 Unsweetened', en: 'Unsweetened', ko: '단맛 없음', ja: '無糖', th: 'ไม่หวาน', vi: 'Không đường' },
  itemsCount: { zh: '個品項', en: 'items', ko: '개의 품목', ja: '個のアイテム', th: 'รายการ', vi: 'món' },
  orderSuccess: { zh: '🎉 訂單已成功送出！請等待廚房製作。', en: '🎉 Order placed successfully! Preparing your food.', ko: '🎉 주문이 성공적으로 접수되었습니다! 주방에서 조리 중입니다.', ja: '🎉 注文が正常に送信されました！調理をお待ちください。', th: '🎉 ส่งออเดอร์สำเร็จแล้ว! กรุณารอห้องครัวจัดเตรียม', vi: '🎉 Đặt hàng thành công! Vui lòng chờ nhà bếp chuẩn bị.' },
  orderPending: { zh: '待處理 Pending', en: 'Pending', ko: '대기 중', ja: '保留中', th: 'รอการตอบรับ', vi: 'Chờ xử lý' },
  orderPreparing: { zh: '製作中 Preparing', en: 'Preparing', ko: '조리 중', ja: '調理中', th: 'กำลังจัดเตรียม', vi: 'Đang chuẩn bị' },
  orderCompleted: { zh: '已送達 Completed', en: 'Completed', ko: '배달 완료', ja: '提供済み', th: 'เสร็จสิ้น', vi: 'Đã hoàn thành' },
  orderCancelled: { zh: '已取消 Cancelled', en: 'Cancelled', ko: '주문 취소', ja: 'キャンセル済み', th: 'ยกเลิกแล้ว', vi: 'Đã hủy' },
  quickAdd: { zh: '加點', en: 'Add', ko: '추가', ja: '追加', th: 'เพิ่ม', vi: 'Thêm' },
  checkoutBtn: { zh: '呼叫結帳 Checkout', en: 'Call Bill', ko: '결제 요청', ja: 'お会計を呼ぶ', th: 'เรียกเช็คบิล', vi: 'Gọi thanh toán' },
  checkoutRequested: { zh: '🔔 已送出結帳呼叫，服務員即將前來辦理！', en: '🔔 Bill requested. Staff will assist you shortly!', ko: '🔔 결제 요청이 전송되었습니다. 곧 직원이 안내해 드리겠습니다!', ja: '🔔 お会計の呼び出しを送信しました。スタッフが伺います。', th: '🔔 เรียกเช็คบิลสำเร็จแล้ว พนักงานกำลังไปดูแลท่าน!', vi: '🔔 Đã gửi yêu cầu thanh toán, nhân viên sẽ đến hỗ trợ ngay!' },
  minSpendAlert: { zh: '⚠️ 尚未達到本店最低消費金額！', en: '⚠️ Minimum spend not met!', ko: '⚠️ 최소 소비 금액에 도달하지 못했습니다!', ja: '⚠️ 当店の最低消費額に達していません！', th: '⚠️ ยอดสั่งซื้อยังไม่ถึงขั้นต่ำของร้าน!', vi: '⚠️ Chưa đạt số tiền tối thiểu quy định!' },
  currency: { zh: '元', en: 'NT$', ko: '원', ja: '円', th: 'บาท', vi: 'đ' },
  bestsellers: { zh: '🔥 熱銷推薦 Bestsellers', en: '🔥 Bestsellers', ko: '🔥 베스트 셀러', ja: '🔥 ベストセラー', th: '🔥 เมนูแนะนำ', vi: '🔥 Gợi ý hàng đầu' },
  backToMenu: { zh: '返回菜單 Back', en: 'Back to Menu', ko: '메뉴로 돌아가기', ja: 'メニューに戻る', th: 'กลับไปที่เมนู', vi: 'Quay lại thực đơn' },
  selectOptionsTitle: { zh: '選擇餐點客製化調整 options', en: 'Customize options', ko: '옵션 선택 조절', ja: 'カスタム調整を選択', th: 'เลือกตัวเลือกเพิ่มเติม', vi: 'Chọn tùy chỉnh món' },
  specialInstructions: { zh: '備註/特殊要求 Notes', en: 'Special Notes', ko: '특별 요청 사항', ja: '特別リクエスト', th: 'บันทึกพิเศษ', vi: 'Ghi chú đặc biệt' },
  placeholderNotes: { zh: '例如: 醬汁多一點、去蔥、外帶不要餐具...', en: 'e.g., extra sauce, no onions...', ko: '예: 소스 많이, 파 빼기, 포장 시 일회용품 제외...', ja: '例：ソース多め、ネギ抜き、お持ち帰り箸不要...', th: 'เช่น ซอสเยอะๆ, ไม่ใส่ต้นหอม, ไม่รับช้อนส้อม...', vi: 'Ví dụ: nhiều sốt, không hành, mang về không lấy đũa...' },
  cancel: { zh: '取消', en: 'Cancel', ko: '취소', ja: 'キャンセル', th: 'ยกเลิก', vi: 'Hủy' },
  confirm: { zh: '確定', en: 'Confirm', ko: '확인', ja: '確定', th: 'ตกลง', vi: 'Xác nhận' },
  takeout: { zh: '外帶 Takeout', en: 'Takeout', ko: '포장', ja: 'テイクアウト', th: 'กลับบ้าน', vi: 'Mang đi' },
  dineIn: { zh: '內用 Dine-in', en: 'Dine-In', ko: '매장 식사', ja: '店内飲食', th: 'ทานที่ร้าน', vi: 'Ăn tại chỗ' },
  tableSelectPrompt: { zh: '請選擇您的桌號', en: 'Select Your Table', ko: '테이블 번호를 선택해 주세요', ja: 'テーブル番号を選択してください', th: 'กรุณาเลือกหมายเลขโต๊ะของคุณ', vi: 'Vui lòng chọn số bàn của bạn' },
  cartTitle: { zh: '購物車內容 My Cart', en: 'Your Cart', ko: '장바구니 내역', ja: 'カートの内容', th: 'รายละเอียดในตะกร้า', vi: 'Chi tiết giỏ hàng' },
  emptyCartPrompt: { zh: '您的購物車目前是空的，快去挑選美味的沙貝燒烤吧！', en: 'Your cart is empty! Time to explore our delicious Thai BBQ.', ko: '장바구니가 비어 있습니다. 맛있는 사바이 바베큐를 골라보세요!', ja: 'カートは空です。美味しいサバイ焼肉を早速選びましょう！', th: 'ตะกร้าของคุณยังว่างอยู่ เลือกเมนูปิ้งย่างแสนอร่อยของ Sabay เลย!', vi: 'Giỏ hàng đang trống, hãy chọn ngay những món nướng Sabay thơm ngon!' },
  minSpendInfo: { zh: '本桌低消為 NT$', en: 'Table Min Spend: NT$', ko: '이 테이블의 최소 주문 금액은 NT$', ja: 'このテーブルの最低消費額は NT$', th: 'ขั้นต่ำของโต๊ะนี้คือ NT$', vi: 'Mức chi tiêu tối thiểu của bàn này là NT$' },
  currentCartTotal: { zh: '目前小計:', en: 'Current Subtotal:', ko: '현재 소계:', ja: '現在の中計:', th: 'ยอดรวมปัจจุบัน:', vi: 'Tổng tạm tính:' },
  checkoutSelectType: { zh: '選擇用餐方式用餐 Select Service Type', en: 'Select Dining Option', ko: '식사 방식 선택', ja: 'お食事タイプを選択', th: 'เลือกวิธีการรับประทาน', vi: 'Chọn hình thức dùng bữa' },
  orderNotesLabel: { zh: '全單特別備註 Order Notes', en: 'Order General Notes', ko: '전체 주문 요청 사항', ja: '注文全体の特別メモ', th: 'บันทึกพิเศษสำหรับออเดอร์นี้', vi: 'Ghi chú chung cho toàn đơn' },
  submitOrderBtn: { zh: '確認送出訂單 Place Order', en: 'Place Order', ko: '주문 확인 전송', ja: '注文を確定して送信', th: 'ยืนยันสั่งซื้อและส่งออเดอร์', vi: 'Xác nhận và đặt hàng' },
  checkoutCallTitle: { zh: '🔔 結帳服務', en: '🔔 Bill Service', ko: '🔔 결제 서비스', ja: '🔔 お会計サービス', th: '🔔 บริการเช็คบิล', vi: '🔔 Yêu cầu thanh toán' },
  checkoutCallExplain: { zh: '送出呼叫後，服務人員將攜帶帳單至您的桌邊為您服務辦理。如有統編或載具需求請先於備註填寫。', en: 'After submitting, staff will bring the bill to your table. Enter invoice/tax details in notes if needed.', ko: '요청하시면 직원이 테이블로 빌지를 가지고 방문합니다. 현금영수증 등의 요청은 비고에 적어주세요.', ja: '送信後、スタッフが伝票を持ってテーブルに伺います。領収書などのご要望はメモにご記入ください。', th: 'หลังจากส่งเรียก พนักงานจะนำใบแจ้งหนี้มาบริการที่โต๊ะ หากต้องการใบกำกับภาษีหรือบริการอื่นๆ กรุณาระบุในช่องบันทึก', vi: 'Sau khi gửi yêu cầu, nhân viên sẽ mang hóa đơn đến tận bàn phục vụ. Vui lòng ghi chú nếu cần xuất hóa đơn.' },
  checkoutCallNotesPlaceholder: { zh: '例如: 需要統編 12345678 / 需要刷卡 / 載具...', en: 'e.g., Company Tax ID / Credit Card / Mobile barcode...', ko: '예: 회사 자금 영수증 번호 / 카드 결제 / 휴대폰 바코드...', ja: '例：会社登録番号 / カード決済希望 / スマホ決済バーコード...', th: 'เช่น เลขประจำตัวผู้เสียภาษี / จ่ายด้วยบัตรเครดิต / สแกนจ่าย...', vi: 'Ví dụ: Mã số thuế công ty / Thanh toán thẻ / Ví điện tử...' },
  submitCheckoutCallBtn: { zh: '送出結帳呼叫 Request Bill', en: 'Request Bill', ko: '결제 요청 전송', ja: 'お会計呼び出しを送信', th: 'ส่งเรียกเช็คบิล', vi: 'Gửi yêu cầu thanh toán' },
  orderNumLabel: { zh: '訂單序號', en: 'Order ID', ko: '주문 일련번호', ja: '注文シリアル番号', th: 'หมายเลขออเดอร์', vi: 'Mã đơn hàng' },
  orderTimeLabel: { zh: '下單時間', en: 'Time', ko: '주문 시간', ja: '注文時間', th: 'เวลาสั่งซื้อ', vi: 'Thời gian đặt' },
  orderTypeLabel: { zh: '類型', en: 'Type', ko: '구분', ja: 'タイプ', th: 'ประเภท', vi: 'Loại' },
  orderStatusLabel: { zh: '狀態', en: 'Status', ko: '상태', ja: 'ステータス', th: 'สถานะ', vi: 'Trạng thái' },
  orderItemsLabel: { zh: '明細', en: 'Items', ko: '상세 내역', ja: '明細', th: 'รายละเอียด', vi: 'Chi tiết' },
  actionLabel: { zh: '操作', en: 'Action', ko: '조작', ja: '操作', th: 'การดำเนินการ', vi: 'Thao tác' },
  noActiveOrdersPrompt: { zh: '目前此桌沒有進行中的訂單。', en: 'No active orders for this table.', ko: '현재 이 테이블에 진행 중인 주문이 없습니다.', ja: '現在このテーブルに進行中の注文はありません。', th: 'ไม่มีออเดอร์ที่กำลังดำเนินการสำหรับโต๊ะนี้', vi: 'Hiện tại bàn này không có đơn hàng nào đang thực hiện.' },
  orderTotalLabel: { zh: '訂單金額', en: 'Total', ko: '주문 금액', ja: '注文金額', th: 'ยอดรวม', vi: 'Tổng tiền' },
  customerPageTitle: { zh: '沙貝泰式炭火燒烤 Sabay BBQ', en: 'Sabay Thai BBQ Order', ko: '사바이 태국식 숯불 바베큐', ja: 'サバイ タイ風炭火焼肉', th: 'สะเบย ปิ้งย่างเตาถ่านสไตล์ไทย', vi: 'Nướng than Thái Sabay' },
  cartSummary: { zh: '購物車摘要', en: 'Cart Summary', ko: '장바구니 요약', ja: 'カート概要', th: 'สรุปรายการในตะกร้า', vi: 'Tóm tắt giỏ hàng' },
  discountLabel: { zh: '折扣優惠', en: 'Discount', ko: '할인 혜택', ja: '割引特典', th: 'ส่วนลดพิเศษ', vi: 'Ưu đãi giảm giá' },
  netTotalLabel: { zh: '應付金額', en: 'Net Payable', ko: '최종 결제 금액', ja: 'お支払い金額', th: 'ยอดสุทธิที่ต้องชำระ', vi: 'Số tiền thanh toán' },
  promoCodeLabel: { zh: '套用優惠代碼', en: 'Promo Code', ko: '프로모션 코드 적용', ja: 'プロモーションコードを適用', th: 'ใช้รหัสโปรโมชั่น', vi: 'Áp dụng mã khuyến mãi' },
  applyBtn: { zh: '套用', en: 'Apply', ko: '적용', ja: '適用', th: 'นำไปใช้', vi: 'Áp dụng' },
  invalidPromoAlert: { zh: '⚠️ 無效或已過期的優惠代碼！', en: '⚠️ Invalid or expired promo code!', ko: '⚠️ 유효하지 않거나 만료된 프로모션 코드입니다!', ja: '⚠️ 無効または期限切れのプロモコードです！', th: '⚠️ รหัสโปรโมชั่นไม่ถูกต้องหรือหมดอายุแล้ว!', vi: '⚠️ Mã khuyến mãi không hợp lệ hoặc đã hết hạn!' },
  promoSuccessAlert: { zh: '🎉 優惠代碼套用成功！', en: '🎉 Promo code applied successfully!', ko: '🎉 프로모션 코드가 적용되었습니다!', ja: '🎉 プロモコードが正常に適用されました！', th: '🎉 ใช้รหัสโปรโมชั่นสำเร็จแล้ว!', vi: '🎉 Áp dụng mã khuyến mãi thành công!' },
  callStaffBtn: { zh: '呼叫服務員 Service', en: 'Call Staff', ko: '직원 호출', ja: '店員を呼ぶ', th: 'เรียกพนักงาน', vi: 'Gọi nhân viên' },
  staffCalledSuccess: { zh: '🔔 已成功呼叫服務人員，我們將儘速前來為您服務！', en: '🔔 Staff called. We will assist you shortly!', ko: '🔔 직원을 호출했습니다. 잠시만 기다려 주세요!', ja: '🔔 店員を呼び出しました。少々お待ちください。', th: '🔔 เรียกพนักงานสำเร็จแล้ว พนักงานกำลังมาบริการท่าน!', vi: '🔔 Đã gọi nhân viên, chúng tôi sẽ đến hỗ trợ ngay lập tức!' },
  currentTableLabel: { zh: '目前桌號', en: 'Current Table', ko: '현재 테이블', ja: '現在のテーブル', th: 'โต๊ะปัจจุบัน', vi: 'Bàn hiện tại' },
  guestCountLabel: { zh: '用餐人數', en: 'Guests', ko: '식사 인원', ja: '人数', th: 'จำนวนลูกค้า', vi: 'Số khách' },
  minSpendPerPerson: {
    zh: '內用低消 NT$ {minSpend}/人 (每桌低消依人數累計)',
    en: 'Min Spend NT$ {minSpend}/person (Accumulated per table)',
    ko: '매장 내 최소 주문 금액 NT$ {minSpend}/1인 (인원수 기준 누적)',
    ja: '店内最低消費 NT$ {minSpend}/人 (人数にともなって累計)',
    th: 'ยอดสั่งขั้นต่ำในร้าน NT$ {minSpend}/ท่าน (สะสมตามจำนวนลูกค้า)',
    vi: 'Mức chi tiêu tối thiểu dùng tại quán NT$ {minSpend}/người (Tích lũy theo số khách)'
  },
  peopleUnit: {
    zh: '人',
    en: 'Guests',
    ko: '명',
    ja: '人',
    th: 'คน',
    vi: 'người'
  },
  changeTableBtn: { zh: '變更桌號', en: 'Change', ko: '변경', ja: '変更', th: 'เปลี่ยนโต๊ะ', vi: 'Thay đổi' },
  addMoreDishes: { zh: '繼續加點菜品', en: 'Add More Dishes', ko: '메뉴 계속 추가', ja: 'メニューをさらに追加', th: 'เลือกเมนูเพิ่ม', vi: 'Tiếp tục chọn món' },
  takeoutNoLabel: { zh: '外帶號碼', en: 'Takeout No.', ko: '포장 대기 번호', ja: 'テイクアウト番号', th: 'คิวกลับบ้านที่', vi: 'Số thứ tự mang đi' },
  guestModeLabel: { zh: '訪客瀏覽模式 (不限制桌號)', en: 'Guest Mode (No table limit)', ko: '방문객 모드 (테이블 제한 없음)', ja: 'ゲスト閲覧モード（テーブル制限なし）', th: 'โหมดผู้เยี่ยมชม (ไม่จำกัดโต๊ะ)', vi: 'Chế độ khách truy cập (Không giới hạn bàn)' },
  porkLabel: { zh: '豬肉', en: 'Pork', ko: '돼지고기', ja: '豚肉', th: 'หมู', vi: 'Thịt heo' },
  beefLabel: { zh: '牛肉', en: 'Beef', ko: '소고기', ja: '牛肉', th: 'เนื้อวัว', vi: 'Thịt bò' },
  seafoodLabel: { zh: '海鮮', en: 'Seafood', ko: '해산물', ja: 'シーフード', th: 'ซีฟู้ด', vi: 'Hải sản' },
  spicyFilterLabel: { zh: '辣味', en: 'Spicy', ko: '매운맛', ja: '辛口', th: 'เผ็ด', vi: 'Cay' },
  nonSpicyFilterLabel: { zh: '不辣', en: 'Non-Spicy', ko: '안 매운맛', ja: '辛くない', th: 'ไม่เผ็ด', vi: 'Không cay' },
  allFilterLabel: { zh: '全部', en: 'All', ko: '전체', ja: '全て', th: 'ทั้งหมด', vi: 'Tất cả' },
  filterTitle: { zh: '快速標籤篩選 Filter', en: 'Filter Tags', ko: '빠른 태그 필터', ja: 'クイックタグフィルター', th: 'ตัวกรองแท็กยอดนิยม', vi: 'Bộ lọc nhanh' },
  submitBtn: { zh: '確認送出', en: 'Submit', ko: '확인 제출', ja: '確認して送信', th: 'ยืนยันส่ง', vi: 'Gửi đi' },
  closeBtn: { zh: '關閉', en: 'Close', ko: '닫기', ja: '閉じる', th: 'ปิด', vi: 'Đóng' },
  ratingTitle: { zh: '餐後滿意度評價 Feedbacks', en: 'Order Feedback', ko: '식사 후 만족도 평가', ja: '食後の満足度評価', th: 'รีวิวความพึงพอใจหลังทานอาหาร', vi: 'Đánh giá mức độ hài lòng sau bữa ăn' },
  ratingPrompt: { zh: '您的肯定與寶貴建議，是沙貝團隊持續進步的動力，謝謝您！', en: 'Your feedback helps the Sabay team improve. Thank you!', ko: '고객님의 아낌없는 칭찬과 소중한 제안은 사바이 팀 발전의 원동력입니다. 감사합니다!', ja: 'お客様のお言葉や貴重なご提案は、サバイチームが向上するための原動力です。ありがとうございます！', th: 'คำแนะนำและรีวิวที่มีค่าของคุณคือแรงผลักดันให้ทีม Sabay พัฒนาอย่างต่อเนื่อง ขอบคุณครับ/ค่ะ!', vi: 'Những đánh giá và ý kiến quý báu của bạn là động lực để đội ngũ Sabay tiếp tục nâng cao chất lượng dịch vụ. Cảm ơn bạn!' },
  ratingStarExplanation: { zh: '請為本次用餐體驗打分 (1~5 星):', en: 'Rate your experience (1~5 stars):', ko: '이번 식사 경험을 평가해 주세요 (1~5점):', ja: '今回の食事体験を評価してください（1〜5星）：', th: 'กรุณาให้คะแนนประสบการณ์ทานอาหารครั้งนี้ (1-5 ดาว):', vi: 'Vui lòng đánh giá trải nghiệm dùng bữa lần này (1~5 sao):' },
  ratingCommentPlaceholder: { zh: '歡迎寫下您對餐點味道、服務態度或用餐環境的寶貴想法...', en: 'Share your thoughts on food, service, or environment...', ko: '음식 맛, 서비스 태도 또는 식사 환경에 대한 소중한 의견을 자유롭게 적어주세요...', ja: '料理の味、接客、またはお食事環境に関する貴重なご意見をお書きください...', th: 'ร่วมแชร์ความคิดเห็นเกี่ยวกับรสชาติอาหาร การบริการ หรือบรรยากาศภายในร้าน...', vi: 'Hãy chia sẻ những suy nghĩ quý báu của bạn về hương vị món ăn, thái độ phục vụ hoặc không gian dùng bữa...' },
  ratingCommentLabel: { zh: '文字備註 (選填):', en: 'Comments (Optional):', ko: '텍스트 의견 (선택):', ja: 'コメント（任意）：', th: 'คำคิดเห็นเพิ่มเติม (ไม่บังคับ):', vi: 'Ý kiến đóng góp (Không bắt buộc):' },
  pastOrdersTitle: { zh: '📜 已完成之歷史訂單 Past Orders', en: '📜 Past Orders', ko: '📜 이전 완료된 주문', ja: '📜 完了した履歴注文', th: '📜 ประวัติออเดอร์ที่เสร็จสิ้น', vi: '📜 Lịch sử đơn hàng đã hoàn thành' },
  pastRecordLabel: { zh: '歷史消費紀錄 Past', en: 'Past Record', ko: '이전 기록', ja: '履歴データ', th: 'ประวัติการสั่งซื้อ', vi: 'Lịch sử' },
  reorderBtn: { zh: '快速再點一次 Reorder', en: 'Quick Reorder', ko: '간편 재주문', ja: 'クイック再注文', th: 'สั่งซ้ำอย่างรวดเร็ว', vi: 'Đặt lại nhanh' },
  detailsOrAdjust: { zh: '詳情/調整', en: 'Details/Adjust', ko: '상세/조절', ja: '詳細・調整', th: 'รายละเอียด/ปรับแต่ง', vi: 'Chi tiết/Điều chỉnh' },
  clickToBrowse: { zh: '點擊瀏覽', en: 'View Details', ko: '자세히 보기', ja: 'クリックして閲覧', th: 'คลิกเพื่อดู', vi: 'Nhấp để xem' },
  quickAddCart: { zh: '直接加點', en: 'Quick Add', ko: '바로 담기', ja: 'クイック追加', th: 'เพิ่มทันที', vi: 'Thêm nhanh' },
  totalPastSpend: { zh: '消費總金額:', en: 'Total Past Spend:', ko: '총 소비 금액:', ja: '総消費金額:', th: 'ยอดรวมออเดอร์นี้:', vi: 'Tổng tiền chi tiêu:' },
  todayBestSellersHeader: { zh: '今日熱銷人氣餐點 Top Best-Sellers', en: 'Top Best-Sellers', ko: '오늘의 인기 베스트 셀러', ja: '本日の人気ベストセラー', th: 'เมนูยอดนิยมวันนี้', vi: 'Món ăn bán chạy nhất hôm nay' },
  todayBestSellersDesc: { zh: '沙貝宵夜場首選人氣絕品，點擊餐點即可看詳情與調整客製，或直接快速加入購物車！', en: 'Top choices for Sabay late-night. Click for details and options, or add directly to cart!', ko: '사바이 심야 최고의 인기 메뉴! 클릭해서 상세 설정하거나 바로 장바구니에 담아보세요!', ja: 'サバイ深夜一押しの絶品。クリックして詳細の調整、或者クイックカート追加！', th: 'เมนูมื้อดึกยอดฮิตของ Sabay คลิกเพื่อดูรายละเอียดและปรับแต่ง หรือใส่ตะกร้าทันที!', vi: 'Sự lựa chọn hàng đầu cho bữa đêm tại Sabay. Nhấp để xem chi tiết và tùy chỉnh, hoặc thêm nhanh vào giỏ hàng!' },
  thankYouRating: { zh: '感謝您的寶貴評價！ Thank you!', en: 'Thank you for your valuable feedback!', ko: '소중한 평가 감사드립니다!', ja: '貴重な評価をいただき、ありがとうございます！', th: 'ขอบคุณสำหรับรีวิวที่มีค่าของคุณ!', vi: 'Cảm ơn bạn đã đánh giá!' },
  editRatingBtn: { zh: '修改評價 Edit', en: 'Edit Feedback', ko: '리뷰 수정', ja: '評価を編集', th: 'แก้ไขรีวิว', vi: 'Sửa đánh giá' },
  pointsStarCount: { zh: '顆星', en: 'Stars', ko: '성급', ja: '星', th: 'ดาว', vi: 'Sao' },
  myOrdersTab: { zh: '我的訂單', en: 'My Orders', ko: '내 주문', ja: 'マイ注文', th: 'ออเดอร์ของฉัน', vi: 'Đơn hàng của tôi' },
  bestSellersTab: { zh: '熱銷排行', en: 'Best Sellers', ko: '인기 메뉴', ja: '人気メニュー', th: 'เมนูยอดนิยม', vi: 'Món bán chạy' },
  liveActiveQueue: { zh: '即時排隊訂單', en: 'Live Active Queue', ko: '실시간 주문 현황', ja: 'リアルタイム注文状況', th: 'คิวออเดอร์สด', vi: 'Đơn hàng đang chờ' },
  autoUpdate: { zh: '自動更新', en: 'Auto Update', ko: '자동 업데이트', ja: '自動更新', th: 'อัปเดตอัตโนมัติ', vi: 'Tự động cập nhật' },
  payableTotal: { zh: '應付總額', en: 'Total Payable', ko: '총 결제 금액', ja: 'お支払い合計', th: 'ยอดชำระทั้งหมด', vi: 'Tổng thanh toán' },
  rateExperience: { zh: '評價本次用餐體驗', en: 'Rate Your Experience', ko: '이번 식사 경험 평가', ja: '食事体験を評価する', th: 'รีวิวความพึงพอใจการทานอาหาร', vi: 'Đánh giá trải nghiệm dùng bữa' },
  selectStars: { zh: '請點擊星星進行評分:', en: 'Click stars to rate:', ko: '별을 클릭하여 평가해 주세요:', ja: '星をクリックして評価してください：', th: 'กรุณาแตะดาวเพื่อให้คะแนน:', vi: 'Nhấp vào sao để đánh giá:' },
  feedbackOptional: { zh: '提供您的建議或想法 (選填):', en: 'Provide feedback/ideas (Optional):', ko: '의견 또는 제안 작성 (선택):', ja: 'ご意見やご提案（任意）：', th: 'ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ):', vi: 'Ý kiến đóng góp (Không bắt buộc):' },
  feedbackPlaceholder: { zh: '味道、服務、環境，有什麼需要改進的地方嗎？', en: 'Any thoughts on food, service, or environment?', ko: '맛, 서비스, 환경 중 개선해야 할 점이 있나요?', ja: '味、服務、環境など、改善すべき点はありますか？', th: 'รสชาติ บริการ บรรยากาศ มีส่วนไหนที่อยากให้ปรับปรุงหรือไม่?', vi: 'Hương vị, phục vụ, không gian có điểm nào cần cải thiện không?' },
  submitRating: { zh: '送出滿意度評價', en: 'Submit Rating', ko: '평가 제출', ja: '評価を送信', th: 'ส่งรีวิว', vi: 'Gửi đánh giá' },
  rateOrderBtn: { zh: '評價此筆訂單', en: 'Rate This Order', ko: '이 주문 평가하기', ja: 'この注文を評価', th: 'รีวิวออเดอร์นี้', vi: 'Đánh giá đơn hàng này' },
  welcomeBackNotice: { zh: '✨ 歡迎再次光臨！您可以在此查看本次及之前的消費細項，也可以直接點擊【快速再點一次】進行加點。', en: '✨ Welcome back! You can view current & previous orders here, or click [Quick Reorder] to add items directly.', ko: '✨ 다시 오신 것을 환영합니다! 여기서 현재 및 이전 주문 세부 정보를 확인하거나 [간편 재주문]을 클릭하여 직접 추가할 수 있습니다.', ja: '✨ お帰りなさいませ！今回の注文と以前の注文明細を確認できます。【クイック再注文】をクリックして直接追加することも可能です。', th: '✨ ยินดีต้อนรับกลับมา! คุณสามารถดูรายละเอียดออเดอร์ปัจจุบันและครั้งก่อนได้ที่นี่ หรือคลิก [สั่งซ้ำอย่างรวดเร็ว] เพื่อเพิ่มเมนูได้ทันที', vi: '✨ Chào mừng quay trở lại! Bạn có thể xem chi tiết đơn hàng hiện tại và trước đó tại đây, hoặc nhấp vào [Đặt lại nhanh] để thêm món.' },
  noPastRecords: { zh: '尚無完成之歷史消費紀錄', en: 'No past order history found.', ko: '이전 완료된 주문 내역이 없습니다.', ja: '完了した注文履歴はありません。', th: 'ยังไม่มีประวัติการสั่งซื้อที่เสร็จสิ้น', vi: 'Chưa có lịch sử đơn hàng hoàn thành.' },
  soldOut: { zh: '售罄', en: 'Sold Out', ko: '품절', ja: '完売', th: 'หมดแล้ว', vi: 'Hết hàng' },
  sabayBBQ: {
    zh: '沙貝泰式炭火燒烤',
    en: 'Sabay Thai BBQ',
    ko: '사바이 태국식 바베큐',
    ja: 'サバイ タイ風焼肉',
    th: 'สะเบย ปิ้งย่างเตาถ่านสไตล์ไทย',
    vi: 'Nướng than Thái Sabay'
  },
  slogan: {
    zh: '宵夜首選！正宗泰式炭火雙人桌邊點餐',
    en: 'Top choice for late night! Authentic Thai charcoal BBQ table ordering.',
    ko: '심야 최고의 선택! 정통 태국식 숯불 바베큐 테이블 주문.',
    ja: '深夜の一押し！本場のタイ風炭火焼肉テーブル注文。',
    th: 'มื้อดึกสุดพิเศษ! สั่งปิ้งย่างเตาถ่านสไตล์ไทยแท้ที่โต๊ะคุณ',
    vi: 'Lựa chọn số một cho bữa đêm! Đặt món nướng than Thái chính hiệu tại bàn.'
  },
  orderPlaced: {
    zh: '訂單已送出',
    en: 'Order Placed',
    ko: '주문 접수됨',
    ja: '注文送信済み',
    th: 'ส่งออเดอร์แล้ว',
    vi: 'Đã đặt hàng'
  },
  waitingForAcceptance: {
    zh: '⏳ 餐廳正等待接單中...',
    en: '⏳ Waiting for kitchen to accept...',
    ko: '⏳ 주방 주문 접수 대기 중...',
    ja: '⏳ 店舗の注文受付をお待ちしています...',
    th: '⏳ กำลังรอทางร้านรับออเดอร์...',
    vi: '⏳ Đang chờ nhà hàng nhận đơn...'
  },
  orderAcceptedTitle: {
    zh: '🎉 已接單',
    en: '🎉 Order Accepted',
    ko: '🎉 주문 수락됨',
    ja: '🎉 注文受付完了',
    th: '🎉 รับออเดอร์แล้ว',
    vi: '🎉 Đã nhận đơn'
  },
  orderAcceptedDesc: {
    zh: '廚房已接受您的訂單，並開始為您製餐，請耐心等候！',
    en: 'The kitchen has accepted your order and started preparing, please wait!',
    ko: '주방에서 주문을 수락하고 조리를 시작했습니다. 잠시만 기다려 주세요!',
    ja: '厨房が注文を受け付け、調理を開始しました。しばらくお待ちください！',
    th: 'ห้องครัวได้รับออเดอร์แล้วและกำลังเริ่มเตรียมอาหาร โปรดรอสักครู่!',
    vi: 'Nhà bếp đã tiếp nhận đơn hàng và bắt đầu chế biến, xin vui lòng chờ!'
  },
  waitingForAcceptanceDesc: {
    zh: '系統已將您的訂餐訊息送出！待店內後台人員確認後，即會自動為您印單配菜、送至廚房配餐。',
    en: 'The system has transmitted your order message! Once the store staff confirms, the order will be printed and sent to the kitchen.',
    ko: '시스템이 주문 메시지를 전송했습니다! 매장 직원이 확인하면 주문이 인쇄되어 주방으로 전송됩니다.',
    ja: 'システムよりご注文情報を送信しました！店舗スタッフが確認次第、自動的に印刷され厨房へ送られます。',
    th: 'ระบบได้ส่งข้อมูลคำสั่งซื้อแล้ว! เมื่อพนักงานร้านยืนยัน ออเดอร์จะถูกพิมพ์และส่งไปยังห้องครัวทันที',
    vi: 'Hệ thống đã gửi thông tin đặt món của bạn! Sau khi nhân viên cửa hàng xác nhận, đơn sẽ tự động in và chuyển xuống bếp.'
  },
  orderCancelledTitle: {
    zh: '❌ 訂單已被拒絕 / 取消',
    en: '❌ Order Declined / Cancelled',
    ko: '❌ 주문 거절 / 취소됨',
    ja: '❌ 注文拒否 / キャンセルされました',
    th: '❌ ออเดอร์ถูกปฏิเสธ / ยกเลิก',
    vi: '❌ Đơn hàng bị từ chối / Hủy'
  },
  orderCancelledDesc: {
    zh: '請與櫃檯聯絡0966626408',
    en: 'Please contact the counter at 0966626408',
    ko: '카운터(0966626408)로 문의해 주세요',
    ja: 'カウンター（0966626408）までお問い合わせください',
    th: 'โปรดติดต่อเคาน์เตอร์ที่เบอร์ 0966626408',
    vi: 'Vui lòng liên hệ quầy qua số 0966626408'
  },
  confirmBtnText: {
    zh: '確認 (關閉對話框)',
    en: 'Confirm (Close Dialog)',
    ko: '확인 (대화창 닫기)',
    ja: '確認 (閉じる)',
    th: 'ยืนยัน (ปิดหน้าต่าง)',
    vi: 'Xác nhận (Đóng hộp thoại)'
  },
  acceptOrderBtn: {
    zh: '接受訂單 (開始製餐)',
    en: 'Accept Order (Start Prep)',
    ko: '주문 수락 (조리 시작)',
    ja: '注文受付 (調理開始)',
    th: 'ยอมรับออเดอร์ (เริ่มปรุง)',
    vi: 'Chấp nhận đơn (Bắt đầu nấu)'
  },
  itemPreparedBtn: {
    zh: '已備餐',
    en: 'Item Prepared',
    ko: '재료 준비됨',
    ja: '仕込み完了',
    th: 'เตรียมวัตถุดิบแล้ว',
    vi: 'Đã chuẩn bị món'
  },
  declineOrderBtn: {
    zh: '拒絕訂單',
    en: 'Decline Order',
    ko: '주문 거절',
    ja: '注文を拒絶',
    th: 'ปฏิเสธข้อมูลออเดอร์',
    vi: 'Từ chối đơn hàng'
  },
  categories: {
    zh: '餐點分類',
    en: 'Categories',
    ko: '카테고리',
    ja: 'カテゴリー',
    th: 'หมวดหมู่',
    vi: 'Danh mục'
  },
  noodleOption: {
    zh: '主食麵條選項',
    en: 'Noodle Option',
    ko: '면 종류 선택',
    ja: '麺の種類を選択',
    th: 'เลือกประเภทเส้น',
    vi: 'Chọn loại mì'
  },
  totalAmountLabel: {
    zh: '總計算額金額',
    en: 'Total Amount',
    ko: '총 금액',
    ja: '合計金額',
    th: 'ยอดรวมทั้งหมด',
    vi: 'Tổng cộng'
  },
  addToCartConfirm: {
    zh: '確定加入點餐單',
    en: 'Confirm Add to Cart',
    ko: '주문에 추가',
    ja: 'カートに追加する',
    th: 'ยืนยันเพิ่มลงตะกร้า',
    vi: 'Xác nhận thêm'
  },
  notSpicy: {
    zh: '完全不辣',
    en: 'Not Spicy',
    ko: '안 매운맛',
    ja: '辛くない',
    th: 'ไม่เผ็ดเลย',
    vi: 'Không cay'
  },
  classicSpicy: {
    zh: '經典手作香辣',
    en: 'Classic Spicy',
    ko: '클래식 매운맛',
    ja: 'クラシック辛口',
    th: 'เผ็ดจัดจ้านคลาสสิก',
    vi: 'Cay nồng cổ điển'
  },
  quantityPortion: {
    zh: '點餐份數',
    en: 'Quantity',
    ko: '주문 수량',
    ja: '注文数量',
    th: 'จำนวนที่สั่ง',
    vi: 'Số lượng đặt'
  },
  riceNoodle: {
    zh: '河粉',
    en: 'Rice Noodle',
    ko: '쌀국수',
    ja: '河粉（フォー）',
    th: 'เส้นเล็ก',
    vi: 'Hủ tiếu/Phở'
  },
  vermicelli: {
    zh: '米線',
    en: 'Vermicelli',
    ko: '버미셀리',
    ja: '米線（ミーシェン）',
    th: 'เส้นหมี่',
    vi: 'Bún'
  },
  plainSoup: {
    zh: '不加麵',
    en: 'No Noodles',
    ko: '면 없음',
    ja: '麺なし',
    th: 'ไม่ใส่เส้น',
    vi: 'Không thêm mì'
  },
  upgradeCoconutSoup: {
    zh: '升級奶香冬蔭功 (+NT$50)',
    en: 'Upgrade to Creamy Tom Yum (+NT$50)',
    ko: '크리미 똠얌 업그레이드 (+NT$50)',
    ja: 'クリーミー トムヤムクンにアップグレード (+NT$50)',
    th: 'อัปเกรดเป็นต้มยำน้ำข้น (+NT$50)',
    vi: 'Nâng cấp Tom Yum béo ngậy (+NT$50)'
  },
  upgradeCoconutSoupDesc: {
    zh: '加入大罐頂級泰國椰奶，香濃誘人',
    en: 'Add premium Thai coconut milk for rich & creamy flavor',
    ko: '태국산 코코넛 밀크를 추가하여 더욱 고소하고 부드럽게',
    ja: 'タイ産のプレミアムココナッツミルクを加えて濃厚なコクをプラス',
    th: 'เพิ่มกะทิเกรดพรีเมียมจากไทย เข้มข้นหอมมันชวนทาน',
    vi: 'Thêm nước cốt dừa Thái thượng hạng thơm béo hấp dẫn'
  },
  customAddOnsLabel: {
    zh: '加選附加選項',
    en: 'Custom Options',
    ko: '추가 옵션 선택',
    ja: '追加オプション選択',
    th: 'เลือกตัวเลือกเสริม',
    vi: 'Tùy chọn bổ sung'
  },
  lowStockWarning: {
    zh: '部分手作食材及海鮮數量吃緊，請儘速在下方完成下單。',
    en: 'Some handmade ingredients & seafood are running low. Please order soon!',
    ko: '일부 수제 재료 및 해산물 재고가 부족합니다. 서둘러 주문해 주세요!',
    ja: '一部の手作り食材や海鮮の在庫が残りわずかです。お早めにご注文ください！',
    th: 'วัตถุดิบบางรายการและซีฟู้ดมีจำนวนจำกัด กรุณายืนยันการสั่งซื้อโดยเร็ว!',
    vi: 'Một số nguyên liệu thủ công và hải sản sắp hết. Vui lòng đặt món sớm!'
  },
  closedLabel: {
    zh: '休息中 Closed',
    en: 'Closed',
    ko: '영업 종료',
    ja: '準備中',
    th: 'ปิดให้บริการ',
    vi: 'Đóng cửa'
  },
  emptyCartWarning: {
    zh: '購物車空空如也，馬上點餐吧！',
    en: 'Your cart is empty. Let\'s order some food!',
    ko: '장바구니가 비어 있습니다. 주문하러 가볼까요!',
    ja: 'カートは空です。早速美味しい料理を注文しましょう！',
    th: 'ตะกร้าสินค้าว่างเปล่า มาเริ่มสั่งอาหารกันเลย!',
    vi: 'Giỏ hàng trống rỗng, hãy đặt món ngay nào!'
  },
  cartSubtotalLabel: {
    zh: '餐點小計',
    en: 'Subtotal',
    ko: '소계',
    ja: '小計',
    th: 'ยอดรวมย่อย',
    vi: 'Tạm tính'
  },
  cartWalletBalance: {
    zh: '當前會員餘額 Account Wallet',
    en: 'Member Balance',
    ko: '회원 지갑 잔액',
    ja: 'メンバー財布残高',
    th: 'ยอดเงินคงเหลือในกระเป๋า',
    vi: 'Số dư ví thành viên'
  },
  netPayableToday: {
    zh: '本日總應付額',
    en: 'Total Payable Today',
    ko: '오늘 최종 결제 금액',
    ja: '本日お支払い総額',
    th: 'ยอดสุทธิที่ต้องชำระวันนี้',
    vi: 'Tổng tiền phải thanh toán hôm nay'
  },
  googleLoginPromo: {
    zh: '💡 綁定 Google 帳戶可累積點數！',
    en: '💡 Link Google account to earn reward points!',
    ko: '💡 구글 계정을 연동하면 포인트를 적립할 수 있습니다!',
    ja: '💡 Googleアカウント連携でポイントが貯まります！',
    th: '💡 เชื่อมต่อบัญชี Google เพื่อสะสมคะแนน!',
    vi: '💡 Liên kết tài khoản Google để tích điểm thành viên!'
  },
  loginNow: {
    zh: '手刀登入',
    en: 'Login Now',
    ko: '지금 로그인',
    ja: '今すぐログイン',
    th: 'เข้าสู่ระบบทันที',
    vi: 'Đăng nhập ngay'
  },
  kitchenPaused: {
    zh: '⚠️ 廚房暫停接單中，暫時停用下單 (Kitchen Paused)',
    en: '⚠️ Kitchen paused. Ordering is temporarily disabled.',
    ko: '⚠️ 주방 주문 일시 중단으로 주문이 제한됩니다.',
    ja: '⚠️ 厨房の注文受付が一時休止中のため、注文できません。',
    th: '⚠️ ห้องครัวงดรับออเดอร์ชั่วคราว ไม่สามารถสั่งอาหารได้ในขณะนี้',
    vi: '⚠️ Nhà bếp tạm ngừng nhận đơn, tạm thời không thể đặt món'
  },
  placingOrder: {
    zh: '正在傳送訂單中 (Placing Order...)',
    en: 'Placing Order...',
    ko: '주문을 전송하고 있습니다...',
    ja: '注文を送信しています...',
    th: 'กำลังส่งออเดอร์...',
    vi: 'Đang gửi đơn hàng...'
  },
  approxTimeValue: {
    zh: '約 10-15 分鐘',
    en: 'Approx. 10-15 mins',
    ko: '약 10-15분',
    ja: '約10〜15分',
    th: 'ประมาณ 10-15 นาที',
    vi: 'Khoảng 10-15 phút'
  },
  detailsOrAdjustBtn: {
    zh: '詳情',
    en: 'Details',
    ko: '상세',
    ja: '詳細',
    th: 'รายละเอียด',
    vi: 'Chi tiết'
  },
  browseBtn: {
    zh: '瀏覽',
    en: 'Browse',
    ko: '둘러보기',
    ja: '閲覧',
    th: 'ดูรายละเอียด',
    vi: 'Xem'
  },
  orderBtn: {
    zh: '點餐',
    en: 'Order',
    ko: '주문',
    ja: '注文',
    th: 'สั่งอาหาร',
    vi: 'Đặt món'
  },
  orderDish: {
    zh: '點餐',
    en: 'Order',
    ko: '주문',
    ja: '注文',
    th: 'สั่งอาหาร',
    vi: 'Đặt món'
  },
  cartLobby: {
    zh: '購物車結帳大廳',
    en: 'Shopping Cart Lobby',
    ko: '장바구니 결제 대기실',
    ja: 'カートお会計ロビー',
    th: 'หน้าชำระเงินในตะกร้า',
    vi: 'Sảnh thanh toán giỏ hàng'
  },
  seniorModeTitleStandard: {
    zh: '✨ 首選沙貝尊長大字點餐模式',
    en: '✨ Senior Friendly Large Font Mode',
    ko: '✨ 어르신을 위한 큰 글씨 모드',
    ja: '✨ シニア向け大文字モード',
    th: '✨ โหมดตัวอักษรใหญ่สำหรับผู้สูงอายุ',
    vi: '✨ Chế độ chữ lớn cho người cao tuổi'
  },
  seniorModeTitleActive: {
    zh: '👵👴 尊長大字/高對比點餐模式中',
    en: '👵👴 Senior Large Font / High Contrast Mode Active',
    ko: '👵👴 어르신 큰 글씨 / 고대비 모드 활성화 중',
    ja: '👵👴 シニア大文字・高コントラストモード有効中',
    th: '👵👴 โหมดตัวอักษรใหญ่และคอนทราสต์สูงทำงานอยู่',
    vi: '👵👴 Chế độ chữ lớn / Tương phản cao đang hoạt động'
  },
  seniorFriendlyBadge: {
    zh: '老年友善',
    en: 'Senior Friendly',
    ko: '어르신 친화',
    ja: 'シニアフレンドリー',
    th: 'เหมาะสำหรับผู้สูงอายุ',
    vi: 'Thân thiện với người cao tuổi'
  },
  seniorModeDescStandard: {
    zh: '一鍵開啟最溫馨、高清晰大字體、極簡潔且不含廣告簡介的點餐介面。誠邀銀髮長輩品嚐。',
    en: 'One-click to enable large fonts, clean high contrast layout, and an easy-to-use menu designed for seniors.',
    ko: '클릭 한 번으로 큰 글씨, 선명한 고대비 화면, 어르신들이 보기 쉬운 간결한 메뉴로 전환됩니다.',
    ja: 'ワンクリックで、大きな文字、高コントラストな配色、そしてシニアの方にも分かりやすいシンプルなメニュー表示に切り替わります。',
    th: 'คลิกเพียงครั้งเดียวเพื่อเปิดใช้งานตัวอักษรขนาดใหญ่ เลย์เอาต์คอนทราสต์สูง และเมนูที่ใช้งานง่ายสำหรับผู้สูงอายุ',
    vi: 'Một cú nhấp chuột để bật phông chữ lớn, bố cục tương phản cao rõ ràng và thực đơn đơn giản dễ dùng cho người cao tuổi.'
  },
  seniorModeDescActive: {
    zh: '已為您自動放大字體、啟用高對比高清晰底色，呈現超大型方塊，並移除冗餘介紹。',
    en: 'Fonts are enlarged, high-contrast clean background is active with extra large tap targets and simplified details.',
    ko: '글씨가 확대되고, 시인성 높은 고대비 배경과 큰 버튼, 간결한 설명으로 편안하게 이용하실 수 있습니다.',
    ja: '文字を拡大し、視認性の高い配色と大きなボタン、シンプルな説明文で快適にご利用いただけます。',
    th: 'ขยายขนาดตัวอักษรแล้ว เลย์เอาต์คอนทราสต์สูงและปุ่มขนาดใหญ่พิเศษพร้อมใช้งาน รวมถึงลดรายละเอียดส่วนเกิน',
    vi: 'Đã tự động phóng to phông chữ, bật nền tương phản cao rõ ràng, hiển thị các nút lớn và lược bỏ mô tả dư thừa.'
  },
  seniorModeBtnStandard: {
    zh: '👵👴 切換簡單/尊長大字模式',
    en: '👵👴 Switch to Senior/Large Font',
    ko: '👵👴 어르신/큰 글씨 모드로 전환',
    ja: '👵👴 シニア・大文字モードにする',
    th: '👵👴 เปลี่ยนเป็นโหมดตัวอักษรใหญ่',
    vi: '👵👴 Chuyển sang chữ lớn/Đơn giản'
  },
  seniorModeBtnActive: {
    zh: '🔄 返回標準夜色模式',
    en: '🔄 Back to Standard Dark Mode',
    ko: '🔄 표준 다크 모드로 돌아가기',
    ja: '🔄 標準のダークモードに戻る',
    th: '🔄 กลับสู่โหมดมืดมาตรฐาน',
    vi: '🔄 Trở lại chế độ tối tiêu chuẩn'
  },
  cartList: {
    zh: '購物車清單',
    en: 'Cart List',
    ko: '장바구니 목록',
    ja: 'カート一覧',
    th: 'รายการในตะกร้า',
    vi: 'Danh sách giỏ hàng'
  },
  checkoutNow: {
    zh: '立即結帳下單',
    en: 'Checkout Now',
    ko: '지금 바로 결제',
    ja: '今すぐお会計',
    th: 'ชำระเงินทันที',
    vi: 'Thanh toán ngay'
  },
  payMethod: {
    zh: '支付方式 Payment Method',
    en: 'Payment Method',
    ko: '결제 수단',
    ja: 'お支払い方法',
    th: 'วิธีการชำระเงิน',
    vi: 'Phương thức thanh toán'
  },
  payCash: {
    zh: '現金支付',
    en: 'Cash',
    ko: '현금 결제',
    ja: '現金払い',
    th: 'ชำระด้วยเงินสด',
    vi: 'Tiền mặt'
  },
  payCashDesc: {
    zh: '櫃台付現或找零',
    en: 'Pay at Counter',
    ko: '카운터 현금 수납',
    ja: 'レジでのお支払い',
    th: 'ชำระที่เคาน์เตอร์',
    vi: 'Thanh toán tại quầy'
  },
  payCredit: {
    zh: '信用卡 / 簽帳卡',
    en: 'Credit/Debit Card',
    ko: '신용/체크카드',
    ja: 'クレジットカード',
    th: 'บัตรเครดิต/เดบิต',
    vi: 'Thẻ tín dụng/Ghi nợ'
  },
  payCreditDesc: {
    zh: '支援 Visa/Master',
    en: 'Visa / Mastercard',
    ko: 'Visa / Mastercard 지원',
    ja: 'Visa / Mastercard 対応',
    th: 'รองรับ Visa / Mastercard',
    vi: 'Hỗ trợ Visa/Master'
  },
  payTwqr: {
    zh: 'TWQR 行動支付',
    en: 'TWQR Payment',
    ko: 'TWQR',
    ja: 'TWQR',
    th: 'TWQR',
    vi: 'TWQR'
  },
  payTwqrDesc: {
    zh: '跨機構行動支付 (支援各家銀行/電支)',
    en: 'Inter-bank Mobile Payment',
    ko: 'QR 코드 간편결제',
    ja: 'QRコード決済',
    th: 'สแกน QR Code',
    vi: 'Quét mã QR'
  },
  payMember: {
    zh: '會員儲值餘額',
    en: 'Member Balance',
    ko: '회원 충전 잔액',
    ja: '会員チャージ残高',
    th: 'ยอดเงินคงเหลือสมาชิก',
    vi: 'Số dư thành viên'
  },
  payMemberDesc: {
    zh: '扣除您的電子錢包',
    en: 'Deduct Wallet',
    ko: '전자지갑 잔액 차감',
    ja: 'ウォレットから引落',
    th: 'หักจากกระเป๋าเงิน',
    vi: 'Trừ vào ví điện tử'
  },
  removeBtn: {
    zh: '移除',
    en: 'Remove',
    ko: '삭제',
    ja: '削除',
    th: 'ลบออก',
    vi: 'Xóa'
  },
};

export const CAT_NAMES: { [key: string]: { [lang in Language]: string } } = {
  tomyum: { zh: '冬蔭功熱湯 Tom Yum', en: 'Tom Yum', ko: '똠얌', ja: 'トムヤム', th: 'ต้มยำ', vi: 'Tom Yum' },
  skewers: { zh: '炭烤串燒 Skewers', en: 'Skewers', ko: '꼬치구이', ja: '串焼き', th: 'ปิ้งย่างเสียบไม้', vi: 'Xiên nướng' },
  dessert: { zh: '南洋甜品 Desserts', en: 'Desserts', ko: '디저트', ja: 'デザート', th: 'ของหวาน', vi: 'Tráng miệng' },
  drinks: { zh: '南洋飲品 Drinks', en: 'Drinks', ko: '음료', ja: 'ドリンク', th: 'เครื่องดื่ม', vi: 'Thức uống' },
};

export const INITIAL_CATEGORIES: any[] = [
  {
    "name": {
      "zh": "小費及折扣",
      "en": "Tips & Discounts",
      "ko": "팁 및 할인",
      "th": "ทิปและส่วนลด",
      "vi": "Tiền tip & Giảm giá",
      "ja": "チップ・割引"
    },
    "orderIndex": 0,
    "showOnCustomerPage": false,
    "id": "cat-svadcb"
  },
  {
    "orderIndex": 1,
    "name": {
      "zh": "冰櫃酒水 🧊",
      "en": "Refrigerated Drinks & Alcohol 🍺",
      "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
      "ko": "냉장 음료 및 주류 🍺",
      "ja": "冷蔵ドリンク・お酒 🍺",
      "vi": "Đồ uống & Rượu lạnh 🍺"
    },
    "id": "cat-7cvvkq",
    "showOnCustomerPage": false
  },
  {
    "showOnCustomerPage": true,
    "id": "tomyum",
    "name": {
      "en": "Tom Yum Series 🍜",
      "zh": "冬蔭功系列 🍜",
      "vi": "Dòng súp Tom Yum 🍜",
      "ja": "トムヤムシリーズ 🍜",
      "ko": "똠얌 수프 시리즈 🍜",
      "th": "ชุดต้มยำสุดแซ่บ 🍜"
    },
    "orderIndex": 2
  },
  {
    "orderIndex": 3,
    "name": {
      "zh": "熱湯 🥢越南牛肉河粉",
      "en": "Hot Soups & Beef Pho 🥢",
      "vi": "Súp nóng & Phở bò Việt Nam 🥢",
      "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
      "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
      "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢"
    },
    "id": "noodles",
    "showOnCustomerPage": true
  },
  {
    "orderIndex": 4,
    "name": {
      "zh": "精選套餐 🍱優惠",
      "en": "Chef's Special Combos 🍱",
      "th": "เซตเมนูสุดคุ้ม 🍱",
      "ko": "셰프 추천 특선 세트 🍱",
      "vi": "Combo đặc biệt 🍱",
      "ja": "主理人厳選お得セット 🍱"
    },
    "id": "combos",
    "showOnCustomerPage": true
  },
  {
    "orderIndex": 5,
    "name": {
      "en": "Signature Thai Seafood 🦐",
      "zh": "招牌泰式海鮮 🦐",
      "vi": "Hải sản nướng Thái Lan 🦐",
      "ja": "本格タイ風炭火焼きシーフード 🦐",
      "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
      "ko": "시그니처 태국식 해산물 🦐"
    },
    "id": "seafood",
    "showOnCustomerPage": true
  },
  {
    "id": "veggies",
    "showOnCustomerPage": true,
    "orderIndex": 6,
    "name": {
      "en": "Farm Fresh Vegetables 🥬",
      "zh": "小農鮮蔬菜 🥬",
      "ko": "신선한 채소 구이 🥬",
      "th": "ผักสดฟาร์มย่าง 🥬",
      "ja": "地元新鮮野菜焼き 🥬",
      "vi": "Rau củ tươi sạch 🥬"
    }
  },
  {
    "id": "skewers",
    "showOnCustomerPage": true,
    "orderIndex": 7,
    "name": {
      "en": "Charcoal BBQ Skewers & Others 🍢",
      "zh": "碳烤肉類 🍢其他",
      "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
      "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢",
      "ja": "タイ風肉串炭火焼き・その他 🍢",
      "vi": "Thịt nướng xiên & Khác 🍢"
    }
  },
  {
    "id": "sweets",
    "showOnCustomerPage": true,
    "orderIndex": 8,
    "name": {
      "ja": "タイ風特製デザート 🍰",
      "vi": "Tráng miệng kiểu Thái 🍰",
      "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
      "ko": "태국식 달콤 디저트 🍰",
      "en": "Thai Desserts & Sweets 🍰",
      "zh": "泰式特色甜品 🍰"
    }
  },
  {
    "id": "drinks",
    "showOnCustomerPage": true,
    "orderIndex": 9,
    "name": {
      "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
      "ko": "태국식 청량 음료 🍹",
      "ja": "タイ風さわやかドリンク 🍹",
      "vi": "Đồ uống lạnh kiểu Thái 🍹",
      "zh": "泰特色沁涼飲品 🍹",
      "en": "Refreshing Thai Cold Drinks 🍹"
    }
  },
  {
    "showOnCustomerPage": true,
    "id": "cat-zene8j",
    "name": {
      "vi": "Nước sốt độc quyền 🥫",
      "ja": "秘伝の特製タレ・ソース 🥫",
      "ko": "단독 수제 특제 소스 🥫",
      "th": "ซอสสูตรลับพิเศษ 🥫",
      "zh": "獨家醬料 🥫",
      "en": "Exclusive Secret Sauces 🥫"
    },
    "orderIndex": 10
  },
  {
    "showOnCustomerPage": true,
    "id": "cat-6ovxss",
    "name": {
      "ja": "成人向けお酒エリア (18+) 🔞",
      "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
      "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
      "ko": "성인 주류 전용 구역 (18+) 🔞",
      "en": "Adult Alcoholic Beverages (18+) 🔞",
      "zh": "成人酒品專區 🔞"
    },
    "orderIndex": 11
  }
];

export const INITIAL_MENU: any[] = [
  {
    "containsPork": false,
    "customAddOns": [],
    "name": {
      "zh": "Vitamilk豆奶",
      "en": "Vitamilk Soy Milk",
      "ko": "비타밀크 두유",
      "ja": "ビタミルク豆乳",
      "th": "ไวตามิ้ลค์ นมถั่วเหลือง",
      "vi": "Sữa đậu nành Vitamilk"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2696007842576",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 60,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "(泰國知名豆奶)眾多口味:原味/黑芝麻/草莓/香蕉/泰式奶茶/巧克力/麥芽\n香濃順口 宵夜早餐無負擔 大人小孩都愛",
      "en": "(Famous Thai Soy Milk) Many flavors: Original/Black Sesame/Strawberry/Banana/Thai Tea/Chocolate/Malt. Rich and smooth, perfect for late-night snacks or breakfast. Loved by adults and kids.",
      "ko": "(태국 유명 두유) 다양한 맛: 오리지널/검은깨/딸기/바나나/타이티/초콜릿/맥아. 진하고 부드러우며 야식이나 아침으로 부담이 없습니다. 남녀노소 누구나 좋아합니다.",
      "ja": "（タイの有名豆乳）多数のフレーバー：オリジナル/黒ごま/イチゴ/バナナ/タイティー/チョコレート/麦芽。濃厚で滑らか、夜食や朝食にぴったり。大人も子供も大好き。",
      "th": "(นมถั่วเหลืองชื่อดังของไทย) มีหลายรสชาติ: ออริจินัล/งาดำ/สตรอว์เบอร์รี/กล้วย/ชาไทย/ช็อกโกแลต/มอลต์ เข้มข้นนุ่มนวล ทานเป็นมื้อดึกหรือมื้อเช้าก็อร่อย ถูกใจทั้งเด็กและผู้ใหญ่",
      "vi": "(Sữa đậu nành nổi tiếng Thái Lan) Nhiều hương vị: Nguyên bản/Mè đen/Dâu tây/Chuối/Trà sữa Thái/Socola/Mạch nha. Thơm ngon đậm đà, thích hợp cho bữa đêm hoặc bữa sáng. Người lớn và trẻ em đều thích."
    },
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "category": "drinks",
    "orderIndex": 0,
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "category": "cat-7cvvkq",
    "orderIndex": 1,
    "name": {
      "zh": "麒麟啤酒",
      "en": "Kirin Beer",
      "ko": "기린맥주",
      "th": "เบียร์คิริน",
      "ja": "キリンビール",
      "vi": "bia kirin"
    },
    "isNotSpicy": true,
    "id": "dish-2606012021064",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 150
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "price": 110,
    "containsBeef": false,
    "isNotSpicy": true,
    "name": {
      "en": "SPY Thai Wine Cooler",
      "zh": "SPY泰國雞尾酒",
      "ko": "SPY 타이 칵테일",
      "th": "สปายไทยค็อกเทล",
      "ja": "スパイタイカクテル",
      "vi": "Cocktail Thái SPY"
    },
    "available": true,
    "id": "dish-2605122152569",
    "orderIndex": 2,
    "category": "cat-7cvvkq",
    "recipe": [],
    "description": {
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "奶酪組合價",
      "en": "Panna Cotta Combo",
      "ko": "판나코타 콤보",
      "ja": "パンナコッタコンボ",
      "th": "ชุดคอมโบพานาคอตต้า",
      "vi": "Combo Panna Cotta"
    },
    "id": "dish-2603071951301",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": -10,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Super value combo, great deal, available for a limited time.",
      "ko": "가성비 최고의 한정판 콤보 세트입니다.",
      "ja": "超お得なコンボ、お値段以上の価値、期間限定。",
      "th": "ชุดคอมโบสุดคุ้ม ราคาโดนใจ มีจำนวนจำกัด",
      "vi": "Combo siêu ưu đãi, đáng giá tiền, phục vụ trong thời gian có hạn."
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 3,
    "category": "cat-svadcb",
    "containsPork": false,
    "isAvailable": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "price": 90,
    "containsBeef": false,
    "isNotSpicy": true,
    "name": {
      "zh": "桂花奶茶奶酪",
      "en": "Osmanthus Milk Tea Panna Cotta",
      "ko": "계화 밀크티 판나코타",
      "ja": "キンモクセイミルクティープリン",
      "th": "พานาคอตต้าชานมดอกหอมหมื่นลี้",
      "vi": "Panna Cotta Trà Sữa Hoa Mộc Tê"
    },
    "id": "dish-2602121900078",
    "available": true,
    "orderIndex": 4,
    "category": "sweets",
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "香濃奶酪融合桂花與奶茶的迷人香氣，口感滑順，甜而不膩。",
      "en": "Rich panna cotta infused with the charming aroma of osmanthus and milk tea, smooth and perfectly sweet.",
      "ko": "진한 판나코타에 계화와 밀크티의 매혹적인 향이 어우러져 부드럽고 적당히 달콤한 디저트입니다.",
      "ja": "濃厚なプリンにキンモクセイとミルクティーの魅惑的な香りが溶け込み、なめらかで上品な甘さ。",
      "th": "พานาคอตต้าเนื้อเนียนนุ่มผสมผสานกลิ่นหอมของดอกหอมหมื่นลี้และชานม หวานพอดีคำ",
      "vi": "Panna cotta thơm béo kết hợp hương hoa mộc tê và trà sữa quyến rũ, kết cấu mềm mịn, ngọt thanh không ngấy."
    },
    "hasNoodlesOption": false,
    "isTakeoutAvailable": true
  },
  {
    "id": "dish-2602121834434",
    "available": true,
    "isTakeoutAvailable": true,
    "isNotSpicy": true,
    "name": {
      "zh": "原肉板腱牛5oz",
      "en": "Top Blade Steak (5oz)",
      "ko": "탑블레이드 스테이크 (5oz)",
      "ja": "トップブレードステーキ (5oz)",
      "th": "สเต็กเนื้อใบพาย (5oz)",
      "vi": "Bít tết thăn vai bò (5oz)"
    },
    "containsBeef": true,
    "price": 390,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
      "en": "Slow-grilled CHOICE top blade steak over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워낸 CHOICE 부채살 원육 스테이크, 풍미가 가득하여 한 입마다 극상의 맛을 선사합니다.",
      "ja": "炭火でじっくり焼いたCHOICEトップブレード原肉ステーキ、香り高く一口ごとに至高の美味しさ。",
      "th": "สเต็กเนื้อใบพายเกรด CHOICE ย่างถ่านช้าๆ หอมฟุ้ง อร่อยเข้มข้นทุกคำ",
      "vi": "Bít tết thăn vai bò CHOICE nướng chậm trên than hoa, thơm nức nát, mỗi cắn đều là hương vị tuyệt hảo."
    },
    "recipe": [],
    "orderIndex": 5,
    "category": "skewers",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "獨特香斕葉的清香與濃郁鮮奶完美調配，滑嫩可口。",
      "en": "Fresh pandan aroma perfectly blended with rich milk, smooth and delicious.",
      "ko": "독특한 판단 잎의 은은한 향과 진한 우유가 어우러진 부드럽고 촉촉한 디저트.",
      "ja": "独特なパンダンの香りと濃厚なミルクが絶妙にマッチした、なめらかで美味しいプリン。",
      "th": "กลิ่นหอมอันเป็นเอกลักษณ์ของใบเตยผสมผสานกับรสนมเข้มข้นอย่างลงตัว เนื้อเนียนนุ่มละมุนลิ้น",
      "vi": "Hương lá dứa thơm mát hòa quyện cùng sữa tươi béo ngậy, kết cấu mềm mịn thơm ngon."
    },
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 6,
    "category": "sweets",
    "isNotSpicy": true,
    "name": {
      "zh": "香斕奶酪",
      "en": "Pandan Panna Cotta",
      "ko": "판단 판나코타",
      "ja": "パンダンプリン",
      "th": "พานาคอตต้าใบเตย",
      "vi": "Panna Cotta Lá Dứa"
    },
    "id": "dish-2601312248029",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90,
    "customAddOns": [],
    "containsPork": false,
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "純鮮乳製作，散發香純濃郁的奶香，入口即化。",
      "en": "Made with pure fresh milk, releasing a rich and natural milky aroma that melts in your mouth.",
      "ko": "순수 우유로 만들어 입안 가득 고소하고 진한 우유 향이 퍼지며 사르르 녹아내립니다.",
      "ja": "純粋な牛乳を使用し、濃厚なコクのある風味が口の中でとろけます。",
      "th": "ทำจากนมสดแท้ 100% ให้กลิ่นหอมนมเข้มข้น หอมมัน ละลายในปาก",
      "vi": "Làm từ sữa tươi nguyên chất, lan tỏa hương sữa thơm béo đặc trưng, tan ngay trong miệng."
    },
    "orderIndex": 7,
    "category": "sweets",
    "isNotSpicy": true,
    "name": {
      "zh": "鮮奶奶酪",
      "en": "Fresh Milk Panna Cotta",
      "ko": "우유 판나코타",
      "ja": "ミルクプリン",
      "th": "พานาคอตต้านมสด",
      "vi": "Panna Cotta Sữa Tươi"
    },
    "id": "dish-2601310009011",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 80,
    "isTakeoutAvailable": true
  },
  {
    "orderIndex": 8,
    "category": "sweets",
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "選用泰國經典手標紅茶葉，完美呈現泰奶的獨特風味與乳香。",
      "en": "Made with classic Thai ChaTraMue black tea leaves, perfectly presenting the unique flavor and milkiness of Thai milk tea.",
      "ko": "태국 클래식 차트라뮤 홍차 잎을 사용하여 타이 밀크티의 독특한 풍미와 우유향을 완벽하게 재현했습니다.",
      "ja": "タイの定番チャトラムー紅茶葉を使用し、タイティーの独特の風味とミルクの香りを完璧に再現しました。",
      "th": "ใช้ใบชาแดงตรามือยอดฮิตของไทย ถ่ายทอดรสชาติและกลิ่นนมอันเป็นเอกลักษณ์ของชาไทยได้อย่างสมบูรณ์แบบ",
      "vi": "Sử dụng lá trà đen ChaTraMue cổ điển của Thái Lan, thể hiện hoàn hảo hương vị độc đáo và vị sữa của trà sữa Thái."
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90,
    "name": {
      "zh": "泰式奶茶奶酪",
      "en": "Thai Tea Panna Cotta",
      "ko": "타이 밀크티 판나코타",
      "ja": "タイティーパンナコッタ",
      "th": "พานาคอตต้าชาไทย",
      "vi": "Panna Cotta Trà Thái"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2601310007093",
    "customAddOns": [],
    "containsPork": false,
    "isTakeoutAvailable": true
  },
  {
    "isNotSpicy": true,
    "name": {
      "ko": "고장차",
      "th": "ชาสลาย",
      "ja": "ブレイクダウンティー",
      "vi": "Trà suy sụp",
      "zh": "分解茶",
      "en": "Oolong Tea (Decomposing)"
    },
    "id": "dish-2512111741522",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 100,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "orderIndex": 9,
    "category": "cat-7cvvkq",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "price": 280,
    "containsBeef": false,
    "containsSeafood": true,
    "available": true,
    "id": "dish-2509281752083",
    "name": {
      "zh": "泰鮮大魷魚(碳烤)",
      "en": "Thai BBQ Giant Squid (L-Size)",
      "ko": "태국식 숯불 王오징어 구이 (L)",
      "ja": "タイ風炭火焼き大イカ (Lサイズ)",
      "th": "หมึกยักษ์ย่างถ่านสไตล์ไทย (ไซส์ L)",
      "vi": "Mực ống khổng lồ nướng than Thái (Size L)"
    },
    "isNotSpicy": false,
    "isTakeoutAvailable": true,
    "orderIndex": 10,
    "category": "seafood",
    "description": {
      "zh": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
      "en": "Strictly selected Taiwan deep-sea L-size giant squid! Savory, tender and juicy, low-fat & low-calorie quality protein.",
      "ko": "엄선된 대만 심해 L사이즈 왕오징어! 짭조름하고 신선하며 육즙이 가득한 저지방 고단백 건강식.",
      "ja": "厳選された台湾深海Lサイズ大イカ！香ばしく柔らかでジューシー、低脂質・低カロリーの高品質タンパク質。",
      "th": "คัดสรรหมึกยักษ์ไซส์ L จากทะเลลึกไต้หวัน รสชาติเค็มหอม นุ่มชุ่มฉ่ำ โปรตีนสูง ไขมันต่ำ",
      "vi": "Mực ống khổng lồ size L đại dương Đài Loan được tuyển chọn kỹ lượng, mặn mà tươi ngon mọng nước, bổ sung protein chất lượng cao ít béo."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": []
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "price": 140,
        "id": "addon-1784478515294-528",
        "name": {
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
        }
      }
    ],
    "containsSeafood": true,
    "containsBeef": false,
    "price": 390,
    "isNotSpicy": false,
    "name": {
      "zh": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
      "en": "Spicy Thai Seafood MAMA Noodles w/ Giant Squid",
      "th": "มาม่าปลาหมึกเส้นใหญ่และทะเลแห้งสูตรดั้งเดิมของไทย (รสเผ็ด)",
      "ko": "정통 태국식 대오징어와 해산물 건어물 마마면(매운맛)",
      "vi": "Mỳ khô mực lớn và hải sản Thái chính gốc (cay)",
      "ja": "本場タイの大イカと海鮮のドライママヌードル（辛口）"
    },
    "id": "dish-2509271759269",
    "available": true,
    "category": "tomyum",
    "orderIndex": 11,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยเผ็ดร้อน <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: ปลาหมึกทะเลน้ำลึกไซส์ L คัดมาอย่างดี กุ้งสด ปลาหมึก(วงแหวน) ลูกชิ้นปลาคอด ลูกชิ้น ปลาญี่ปุ่น หัวหอม แครอทฝอย แตงกวา กะหล่ำปลี",
      "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료 : 엄선한 심해 L사이즈 오징어, 생새우, 오징어(링), 대구볼, 공물볼, 생선살, 양파, 당근채, 오이, 양배추",
      "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua nóng <Đừng gọi nếu bạn không thích> Thành phần: Mực biển cỡ L được lựa chọn cẩn thận, tôm tươi, mực (vòng), cá tuyết viên, bi cống, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột, bắp cải",
      "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸辣湯前菜 ＜苦手な方はご遠慮ください＞ 材料：厳選深海イカLサイズ、活海老、いか（リング）、たらね、貢ぎ玉、国産魚盛り、玉ねぎ、人参千切り、キュウリ、キャベツ"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400"
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "containsBeef": false,
    "price": 550,
    "isNotSpicy": false,
    "name": {
      "zh": "雞皮10串",
      "en": "Grilled Chicken Skin (10 Skewers)",
      "th": "หนังไก่เสียบไม้ 10 ชิ้น",
      "ko": "닭 껍질 꼬치 10개",
      "vi": "10 xiên da gà",
      "ja": "鶏皮串 10本"
    },
    "id": "dish-2508252142113",
    "available": true,
    "orderIndex": 12,
    "category": "combos",
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂分が減り、カリッとした食感が魅力です",
      "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than hồng, mỡ được giảm bớt ~ chuyển thành kết cấu giòn hấp dẫn",
      "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 감소~바삭한 식감이 매력",
      "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันจะลดลง~กลายเป็นเนื้อกรอบที่น่าดึงดูด",
      "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400"
  },
  {
    "description": {
      "zh": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Beef rib skewers x5 + Lamb chop skewers x5. Slowly grilled over charcoal, rich in aroma and flavors.",
      "ko": "소갈비꼬치 5개 + 어린양고기꼬치 5개. 숯불에 천천히 구워 향긋함이 가득하며 매 한 입마다 극상의 맛.",
      "ja": "牛カルビ串5本＋子羊肉串5本。炭火でじっくり焼き上げ、香り高く一口ごとに至高の美味しさ。",
      "th": "เนื้อซี่โครง 5 ไม้ + เนื้อแกะ 5 ไม้ ย่างถ่านช้าๆ หอมฟุ้ง อร่อยฟินทุกคำ",
      "vi": "Xiên sườn bò x5 + Xiên thịt cừu x5. Nướng chậm trên than hoa, thơm nức nát, ngon tuyệt hảo từng miếng."
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 13,
    "category": "combos",
    "available": true,
    "id": "dish-2508252141154",
    "name": {
      "zh": "牛5羊5串",
      "en": "Beef 5 & Lamb 5 Skewers Combo",
      "ko": "소고기 5 & 양고기 5 꼬치 세트",
      "ja": "牛5本・羊5本 串セット",
      "th": "เซตเนื้อ 5 ไม้ & แกะ 5 ไม้",
      "vi": "Set 5 xiên bò & 5 xiên cừu"
    },
    "isNotSpicy": false,
    "isTakeoutAvailable": true,
    "price": 680,
    "containsBeef": true,
    "containsSeafood": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "orderIndex": 14,
    "category": "combos",
    "description": {
      "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주산) 숯불에 노릇노릇해질 때까지 굽고, 여분의 지방을 짜내고 큐민가루를 뿌려준다",
      "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีทอง บีบไขมันส่วนเกินออก แล้วโรยด้วยผงยี่หร่า",
      "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリア産） 炭火で焼き色がつくまで焼き、余分な脂を絞り、クミンパウダーをふりかける",
      "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi chín vàng, chắt bớt mỡ thừa rồi rắc bột thì là"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 650,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2508252136150",
    "isNotSpicy": false,
    "name": {
      "zh": "真。小羔羊肉10串",
      "en": "Australian Lamb Skewers (10 Skewers)",
      "ja": "そうです。子羊串 10本",
      "vi": "Đúng. 10 xiên thịt cừu",
      "ko": "사실이다. 양꼬치 10개",
      "th": "จริง. เนื้อแกะเสียบไม้ 10 ชิ้น"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsSeafood": false,
    "price": 650,
    "containsBeef": true,
    "isNotSpicy": false,
    "name": {
      "zh": "極炙牛肋10串",
      "en": "Beef Rib Skewers (10 Skewers)",
      "ko": "극상 소갈비꼬치 (10꼬치)",
      "ja": "極上牛カルビ串 (10本)",
      "th": "บาร์บีคิวเนื้อซี่โครงย่าง (10 ไม้)",
      "vi": "Xiên sườn bò nướng thượng hạng (10 xiên)"
    },
    "id": "dish-2508252133258",
    "available": true,
    "category": "combos",
    "orderIndex": 15,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "黃金比例 of 牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
      "en": "Golden ratio beef rib cubes, charcoal-grilled to crispy perfection outside and tender pink inside, an ultimate treat for your tastebuds.",
      "ko": "황금 비율의 소갈비살, 겉은 바삭하고 속은 촉촉한 핑크빛으로 구워내 한 입 베어물면 미각의 극치를 경험할 수 있습니다.",
      "ja": "黄金比率の牛カルビ串。外は香ばしく炙り、中はやわらかピンク色。一口食べれば至福の味わい。",
      "th": "เนื้อซี่โครงสัดส่วนทองคำ ย่างจนข้างนอกหอมกรอบ ข้างในนุ่มสีชมพู อร่อยฟินทุกคำ",
      "vi": "Thịt sườn bò tỉ lệ vàng, nướng xém cạnh bên ngoài, bên trong mềm hồng, một miếng cắn là trải nghiệm vị giác tuyệt vời."
    },
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "經典美祿可可飲品，冰鎮後撒上滿滿的可可粉，濃郁香甜的雙重享受。",
      "en": "Classic Milo chocolate drink, iced and topped with a generous amount of Milo powder for double the chocolate experience.",
      "ko": "아이스 마일로 초콜릿 음료 위에 마일로 가루를 듬뿍 올려 더욱 진하고 달콤한 초코 풍미를 즐길 수 있는 음료.",
      "ja": "冷たいマイロのココアドリンクに、たっぷりのココアパウダーをトッピングした濃厚で甘いダブルの味わい。",
      "th": "เครื่องดื่มโกโก้ไมโลคลาสสิก เสิร์ฟเย็นพร้อมโรยผงโกโก้พูนๆ ให้ความอร่อยเข้มข้นเป็นสองเท่า",
      "vi": "Thức uống cacao Milo cổ điển, ướp lạnh và phủ đầy bột cacao cho trải nghiệm ngọt ngào đậm đà nhân đôi."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 16,
    "category": "drinks",
    "available": true,
    "id": "dish-2508252009102",
    "name": {
      "zh": "恐龍美祿",
      "en": "Milo Dinosaur",
      "ko": "마일로 다이노소어",
      "ja": "マイロ・ダイナソー",
      "th": "ไมโลไดโนเสาร์",
      "vi": "Milo Khủng Long"
    },
    "isNotSpicy": true,
    "isTakeoutAvailable": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "id": "dish-2508252008143",
    "available": true,
    "isNotSpicy": true,
    "name": {
      "zh": "泰式可可冰奶",
      "en": "Thai Iced Cocoa Milk Tea",
      "ko": "타이 아이스 코코아 밀크티",
      "ja": "タイアイスココアミルクティー",
      "th": "ชาไทยโกโก้เย็น",
      "vi": "Trà Sữa Thái Cacao Đá"
    },
    "orderIndex": 17,
    "category": "drinks",
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "基底手標泰式奶茶~撒上大量香濃美祿可可粉!!!一杯飲品雙重享受",
      "en": "Base of ChaTraMue Thai Milk Tea sprinkled with plenty of rich Milo cocoa powder!!! Double enjoyment in one cup.",
      "ko": "차트라뮤 타이 밀크티 베이스에 진한 마일로 코코아 가루를 듬뿍 뿌렸습니다!!! 한 잔으로 두 가지 맛을 즐기세요.",
      "ja": "チャトラムータイティーをベースに、濃厚なミロココアパウダーをたっぷりトッピング！！！一杯で二つの味を楽しめます。",
      "th": "ชาไทยตรามือสุดคลาสสิกโรยหน้าด้วยผงโกโก้ไมโลหอมกรุ่นแบบจัดเต็ม!!! อร่อยฟินสองต่อในแก้วเดียว",
      "vi": "Trà sữa Thái ChaTraMue làm nền, rắc thêm nhiều bột cacao Milo thơm ngon!!! Một ly đồ uống mang đến niềm vui nhân đôi."
    },
    "hasNoodlesOption": false,
    "isTakeoutAvailable": true,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsSeafood": false,
    "price": 80,
    "containsBeef": false,
    "isNotSpicy": true,
    "name": {
      "zh": "爆漿泰奶包",
      "en": "Lava Thai Tea Bun",
      "ko": "용암 타이티 번",
      "ja": "とろけるタイティーパン",
      "th": "ขนมปังปิ้งไส้ชาไทยลาวา",
      "vi": "Bánh Mì Nướng Trà Thái Chảy"
    },
    "id": "dish-2508252003261",
    "available": true,
    "orderIndex": 18,
    "category": "sweets",
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "泰國國民小吃!碳烤過的香甜麵包~搭配流心泰奶醬!一吃會上癮!每日少量供應",
      "en": "A popular Thai street food! Charcoal-grilled sweet bun paired with molten Thai tea sauce! Highly addictive! Limited daily supply.",
      "ko": "태국 국민 간식! 숯불에 구운 달콤한 빵과 흘러내리는 타이티 소스의 조화! 중독성 강한 맛! 매일 소량 한정 판매.",
      "ja": "タイの国民的おやつ！炭火焼きの甘いパンにとろとろのタイティーソース！やみつきになる美味しさ！毎日数量限定。",
      "th": "สตรีทฟู้ดยอดฮิตของไทย! ขนมปังปิ้งเตาถ่านหอมหวาน ทานคู่กับซอสชาไทยเยิ้มๆ! กินแล้วติดใจแน่นอน! มีจำนวนจำกัดต่อวัน",
      "vi": "Món ăn vặt quốc dân của Thái Lan! Bánh mì nướng than hoa ngọt ngào kết hợp với sốt trà Thái tan chảy! Ăn một lần là ghiền! Số lượng có hạn mỗi ngày."
    },
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "combos",
    "orderIndex": 19,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "招牌海鮮乾拌mama麵1份、椰碳牛小排三重奏（佐麵包蔬菜）1份、 碳烤手工月亮蝦餅1份、明太子秋刀魚（去刺）2P🧉 贈手標泰奶2杯",
      "en": "1 serving of Signature Seafood dry mix MAMA noodles, 1 serving of Charcoal Grilled Beef Short Rib Trio (with bread and vegetables), 1 serving of Charcoal Grilled Handmade Moon Shrimp Cake, 2 pieces of Mentaiko Saury (deboned) 🧉 Free 2 cups of Thai milk tea",
      "ko": "시그니처 해물 비빔 MAMA 누들 1인분, 코코넛 숯불 우갈비 삼중주(빵, 야채 곁들임) 1인분, 숯불 수제 월량샤빙(새우전) 1인분, 명란 꽁치구이(가시 제거) 2P 🧉 타이 밀크티 2잔 무료 증정",
      "ja": "看板シーフードまぜMAMA麺 1人前、ココナッツ炭火牛カルビ三重奏（パン・野菜添え） 1人前、炭火焼き手作りムーンエビ餅 1人前、明太子秋刀魚（骨なし） 2P 🧉 タイミルクティー 2杯無料サービス",
      "th": "บะหมี่มาม่าแห้งทะเลซิกเนเจอร์ 1 ที่, ซี่โครงเนื้อย่างถ่านมะพร้าวทริโอ (เสิร์ฟพร้อมขนมปังและผัก) 1 ที่, ทอดมันกุ้งพระจันทร์ย่างถ่านทำมือ 1 ที่, ปลาซันมะราดซอสไข่ปลาค็อด (ไร้ก้าง) 2 ชิ้น 🧉 ฟรีชาไทยตรามือ 2 แก้ว",
      "vi": "1 phần Mì MAMA trộn khô Hải sản Đặc trưng, 1 phần Bò nướng than dừa Trio (kèm bánh mì & rau), 1 phần Chả tôm trăng nướng than thủ công, 2 phần Cá thu đao sốt trứng cá tuyết Mentaiko (đã rút xương) 🧉 Tặng 2 ly trà sữa Thái"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 1550,
    "name": {
      "zh": "人氣D餐",
      "en": "Popular Set D Combo",
      "ko": "인기 D 세트",
      "ja": "人気Dセット",
      "th": "เซ็ต D ยอดนิยม",
      "vi": "Combo D Phổ Biến"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2508202000500",
    "isTakeoutAvailable": true
  },
  {
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "嚴選海味，聚餐首選🥳 炙燒生食級干貝×4 椰碳烤大草蝦×6 泰式大生蠔×3 手撕魷魚干1份 日本鯖甘魚下巴1份",
      "en": "Carefully selected seafood, top choice for gatherings 🥳 Seared sashimi-grade scallops×4, Coconut-charcoal grilled giant tiger prawns×6, Thai large oysters×3, Shredded dried squid×1, Japanese amberjack collar×1",
      "ko": "엄선된 해산물, 모임에 최고🥳 직화구이 생식용 관자×4, 코코넛 숯불구이 대하×6, 타이식 대형 굴×3, 수제 오징어채 1개, 일본산 방어 턱살 1개",
      "ja": "厳選海鮮、集まりに最適🥳 炙り生食用ホタテ×4、ココナッツ炭焼き大エビ×6、タイ風大粒生牡蠣×3、手裂きスルメ1つ、日本産ブリカマ1つ",
      "th": "คัดสรรซีฟู้ดชั้นยอด ตัวเลือกอันดับหนึ่งสำหรับงานสังสรรค์🥳 หอยเชลล์เกรดซาชิมิย่าง 4 ตัว, กุ้งลายเสือย่างเตาถ่านกะลามะพร้าว 6 ตัว, หอยนางรมไทยไซส์ใหญ่ 3 ตัว, ปลาหมึกฉีก 1 ที่, คางปลาหางเหลืองญี่ปุ่น 1 ที่",
      "vi": "Hải sản tuyển chọn, lựa chọn hàng đầu cho các buổi tiệc🥳 Sò điệp nướng cháy cạnh ăn sống×4, Tôm sú nướng than gáo dừa×6, Hàu Thái lớn×3, Khô mực xé tay 1 phần, Má cá cam Nhật Bản 1 phần"
    },
    "hasNoodlesOption": false,
    "category": "combos",
    "orderIndex": 20,
    "name": {
      "zh": "奢華C餐",
      "en": "Luxury Combo C",
      "ko": "럭셔리 콤보 C",
      "ja": "豪華Cセット",
      "th": "ชุดคอมโบ C สุดหรู",
      "vi": "Combo C Sang Trọng"
    },
    "isNotSpicy": true,
    "id": "dish-2508201955573",
    "available": true,
    "containsSeafood": false,
    "price": 2160,
    "containsBeef": false,
    "customAddOns": [],
    "containsPork": false,
    "isTakeoutAvailable": true
  },
  {
    "description": {
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "ja": "期間限定の超お得な割引パッケージ",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time."
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "cat-svadcb",
    "orderIndex": 21,
    "id": "dish-2508141908165",
    "available": true,
    "name": {
      "zh": "泰奶空桶",
      "en": "Empty Thai Milk Tea Bucket (1L)",
      "ja": "タイミルクの空バケツ",
      "vi": "Xô sữa Thái rỗng",
      "ko": "태국 우유 빈 양동이",
      "th": "ถังเปล่านมไทย"
    },
    "isNotSpicy": true,
    "price": -30,
    "containsBeef": false,
    "containsSeafood": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "炭烤清脆香甜娃娃菜~低熱量高纖維~含多種維生素",
      "en": "Charcoal-grilled crisp and sweet baby cabbage, low calorie, high fiber, rich in vitamins.",
      "ko": "숯불에 구워 아삭하고 달콤한  베이비 배추~ 저칼로리 고섬유질, 풍부한 비타민 함유.",
      "ja": "炭火で焼いたシャキシャキ甘いベビー白菜。低カロリー・高食物繊維でビタミン豊富。",
      "th": "ผักกาดขาวเบบี้แรพย่างถ่าน กรอบหวาน แคลอรีต่ำ ไฟเบอร์สูง อุดมด้วยวิตามิน",
      "vi": "Cải baby nướng than giòn ngọt, ít calo giàu chất xơ, chứa nhiều vitamin."
    },
    "category": "veggies",
    "orderIndex": 22,
    "name": {
      "zh": "娃娃菜2p",
      "en": "Baby Chinese Cabbage (2pcs)",
      "ko": "베이비 배추 구이 (2개)",
      "ja": "ベビー白菜の炭火焼き (2個)",
      "th": "ผักกาดขาวเบบี้แรพย่าง (2 ชิ้น)",
      "vi": "Cải baby nướng (2 phần)"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2508112131059",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 80,
    "customAddOns": [],
    "containsPork": false,
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": true,
    "orderIndex": 23,
    "category": "skewers",
    "hasNoodlesOption": false,
    "description": {
      "zh": "嫩滑豬肉包裹鮮甜金針菇，炭火慢烤鎖住滿滿湯汁，每一口都爆汁。",
      "en": "Tender pork wrapped around sweet enoki mushrooms, slow-grilled over charcoal to lock in the juices for a burst of flavor in every bite.",
      "ko": "부드러운 삼겹살로 달콤한 팽이버섯을 감싸 숯불에 천천히 구워 육즙을 꽉 잡아냈습니다. 한 입 씹을 때마다 육즙이 터집니다.",
      "ja": "柔らかい豚肉で甘みのあるえのき茸を巻き、炭火でじっくり焼いて旨味を閉じ込めました。一口ごとにジューシーな味わいが広がります。",
      "th": "เนื้อหมูนุ่มๆ พันเห็ดเข็มทองรสหวาน ย่างถ่านช้าๆ เพื่อล็อคน้ำซุปเข้มข้น ชุ่มฉ่ำทุกคำที่กัด",
      "vi": "Thịt heo mềm ngọt cuộn nấm kim châm tươi ngon, nướng chậm trên than hoa khóa chặt nước sốt đậm đà, mọng nước trong từng miếng cắn."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": 90,
    "containsSeafood": false,
    "id": "dish-2508112130113",
    "available": true,
    "isNotSpicy": false,
    "name": {
      "zh": "爆汁金針菇豬肉",
      "en": "Juicy Pork Wrapped Enoki Mushroom",
      "ko": "육즙 가득 팽이버섯 삼겹살말이",
      "ja": "ジューシーえのき豚肉巻き",
      "th": "หมูสามชั้นพันเห็ดเข็มทองน้ำฉ่ำ",
      "vi": "Ba chỉ heo cuộn nấm kim châm mọng nước"
    },
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "isAvailable": true,
    "containsPork": false,
    "orderIndex": 24,
    "category": "cat-svadcb",
    "hasNoodlesOption": false,
    "description": {
      "ja": "期間限定の超お得な割引パッケージ",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time."
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": -1000,
    "containsSeafood": false,
    "id": "dish-2507182004409",
    "available": true,
    "name": {
      "zh": "客家幣刷卡",
      "en": "Hakka Coin Card Payment",
      "th": "การรูดบัตรสกุลเงินฮากกา",
      "ko": "객가 화폐 카드 스와이프",
      "vi": "Quẹt thẻ tiền tệ Hakka",
      "ja": "客家通貨カードのスワイプ"
    },
    "isNotSpicy": true
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "招牌A餐",
      "en": "Signature Set A Combo",
      "th": "ลายเซ็นมื้ออาหาร",
      "ko": "시그니처A 한끼",
      "vi": "Chữ ký Một bữa ăn",
      "ja": "シグネチャーAのお食事"
    },
    "id": "dish-2507072257199",
    "available": true,
    "containsSeafood": false,
    "price": 660,
    "containsBeef": false,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "처음 들어오시나요? 무엇을 선택해야 할지 모르시나요? 여기에 최고의 것들이 있습니다. 매장의 시그니처 제품을 한번에 만나보실 수 있어요! 태국산 수제 쇠고기 꼬치 / 육즙이 풍부한 팽이버섯 돼지고기 1개 / 태국 북부 신맛이 나는 고기와 쌀국수 소시지 1개 / 태국식 구운 닭날개 4조각 / 태국식 바삭한 두부껍질 1인분 / 매콤달콤한 태국식 두부껍질 1인분 / 태국식 밀크티 1컵!",
      "th": "เข้ามาครั้งแรก? ไม่รู้จะเลือกอะไร? นี่คือสิ่งที่ดีที่สุด คุณสามารถรับสินค้าซิกเนเจอร์ของร้านได้ในคราวเดียว! เนื้อไทยทำมือ 1 ไม้/หมูเห็ดเข็มทอง 1 ไม้/เนื้อเปรี้ยวและไส้กรอกเส้นก๋วยเตี๋ยว 1 ไม้/ปีกไก่ย่าง 4 ชิ้น/ผิวเต้าหู้กรอบ 1 ส่วน/เผ็ดร้อน 1 ส่วน/ชานมไทย 1 ถ้วย!",
      "ja": "初めて入りますか？何を選べばいいのか分からない？ここに最高のものがあります。お店の看板商品が一気に手に入る！タイ手打ちビーフ1串/ジューシーえのき茸ポーク1串/タイ北部の酸っぱい肉とビーフンソーセージ1串/タイ風手羽先グリル4本/タイ風パリパリ湯葉1食分/甘辛1食分/タイミルクティー1杯！",
      "vi": "Lần đầu tiên vào? Bạn không biết nên chọn gì? Dưới đây là những cái tốt nhất. Bạn có thể nhận được các sản phẩm đặc trưng của cửa hàng ngay lập tức! 1 xiên thịt bò thủ công kiểu Thái/1 xiên thịt lợn nấm kim châm ngon ngọt/1 xiên thịt chua miền Bắc Thái và xúc xích bún/4 miếng cánh gà nướng kiểu Thái/1 phần da đậu hũ chiên giòn kiểu Thái/1 phần cay ngọt ngọt/1 cốc trà sữa Thái!"
    },
    "hasNoodlesOption": false,
    "orderIndex": 25,
    "category": "combos",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "orderIndex": 26,
    "category": "cat-7cvvkq",
    "hasNoodlesOption": false,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": 100,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2506292231385",
    "name": {
      "ja": "かき氷（スノーマウンテン）",
      "vi": "Bá đá bào núi tuyết",
      "ko": "스노우 마운틴 팥빙수",
      "th": "น้ำแข็งไสภูเขาหิมะ",
      "zh": "雪山",
      "en": "Snow Mountain Shaved Ice"
    },
    "isNotSpicy": true
  },
  {
    "isNotSpicy": true,
    "name": {
      "vi": "rượu Zinfandel",
      "ja": "ジンファンデルワイン",
      "th": "ไวน์ซินฟานเดล",
      "ko": "진판델 와인",
      "zh": "金芬黛葡萄酒",
      "en": "Zinfandel Red Wine"
    },
    "id": "dish-2506182247281",
    "available": true,
    "containsSeafood": false,
    "price": 800,
    "containsBeef": false,
    "recipe": [],
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง"
    },
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "orderIndex": 27,
    "category": "cat-7cvvkq",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "orderIndex": 28,
    "category": "cat-zene8j",
    "description": {
      "zh": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ja": "店内の特製赤辛だれは、焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいです",
      "vi": "Nước sốt đỏ cay ở cửa hàng~tự làm độc quyền~rất ngon khi chấm cùng thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
      "ko": "매장에 있는 매콤한 빨간 소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
      "th": "น้ำจิ้มรสเด็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อนำไปจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง"
    },
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2506132134210",
    "isNotSpicy": false,
    "name": {
      "ja": "レッドソースの持ち帰り用ボトル",
      "vi": "Chai nước sốt đỏ mang theo",
      "ko": "레드 소스 테이크아웃 병",
      "th": "ขวดซอสแดงสำหรับพกพา",
      "zh": "紅醬外帶瓶",
      "en": "Signature Spicy Red Sauce Bottle"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Nước sốt xanh cay của cửa hàng ~ độc quyền tự làm ~ rất ngon khi chấm với thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
      "ja": "店内の特製グリーンソースは焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいですよ～自家製です～",
      "th": "ซอสเขียวรสเผ็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
      "ko": "매장에 있는 매콤한 그린소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
      "zh": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "en": "Carefully crafted with rich flavors to complement your meal"
    },
    "orderIndex": 29,
    "category": "cat-zene8j",
    "name": {
      "th": "ขวดซอสเขียวสำหรับพกพา",
      "ko": "그린 소스 테이크아웃 병",
      "vi": "Chai nước sốt xanh mang theo",
      "ja": "グリーンソースの持ち帰り用ボトル",
      "zh": "綠醬外帶瓶",
      "en": "Signature Thai Green Chili Sauce Bottle"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2506132131288",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 150
  },
  {
    "containsSeafood": false,
    "price": 140,
    "containsBeef": false,
    "isNotSpicy": false,
    "name": {
      "zh": "爆汁櫛瓜",
      "en": "Juicy Grilled Zucchini",
      "ko": "즙이 터지는 애호박 구이",
      "ja": "ジューシー焼きズッキーニ",
      "th": "ซูชินีย่างน้ำฉ่ำ",
      "vi": "Bí ngòi nướng mọng nước"
    },
    "isTakeoutAvailable": true,
    "available": true,
    "id": "dish-2505242017116",
    "orderIndex": 30,
    "category": "veggies",
    "recipe": [],
    "description": {
      "zh": "新鮮櫛瓜炭火烤至表皮微焦，內部依然飽滿多汁，清甜爽口。",
      "en": "Fresh zucchini grilled over charcoal until lightly charred, locking in sweet, refreshing juices.",
      "ko": "신선한 쥬키니 호박을 숯불에 겉은 노릇하게 굽고 속은 촉촉하게 채워 시원하고 달콤한 맛.",
      "ja": "新鮮なズッキーニを炭火で香ばしく焼き上げ、中は驚くほどジューシーでみずみずしい甘みが楽しめます。",
      "th": "ซูชินีสดใหม่ย่างถ่านจนผิวเกรียมเล็กน้อย แต่ด้านในยังชุ่มฉ่ำและหวานกรอบสดชื่น",
      "vi": "Bí ngòi tươi nướng than hoa xém nhẹ bên ngoài, bên trong vẫn giữ được nước ngọt tự nhiên thanh mát."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": []
  },
  {
    "customAddOns": [
      {
        "price": 20,
        "id": "addon-1784478850618-672",
        "name": {
          "ja": "フォーを追加",
          "vi": "Thêm phở",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "zh": "加河粉",
          "en": "Add pho"
        }
      },
      {
        "name": {
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "ko": "쌀국수 추가",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "en": "Add rice noodles",
          "zh": "加米線"
        },
        "price": 20,
        "id": "addon-1784478853337-718"
      },
      {
        "price": 140,
        "id": "addon-1784478856450-76",
        "name": {
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)"
        }
      }
    ],
    "containsPork": true,
    "recipe": [],
    "description": {
      "zh": "經典泰式冬蔭功湯底 配料:台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜",
      "en": "Classic Tom Yum soup base. Ingredients: Taiwanese pork belly slices, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage, bean sprouts.",
      "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추, 숙주.",
      "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ、もやし。",
      "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี, ถั่วงอก",
      "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải, giá đỗ."
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "orderIndex": 31,
    "category": "tomyum",
    "name": {
      "zh": "泰式豬肉.米線",
      "en": "Thai Pork Rice Noodles",
      "ko": "타이 돼지고기 쌀국수",
      "ja": "タイ風豚肉ライスヌードル",
      "th": "ขนมจีนหมูสไตล์ไทย",
      "vi": "Bún Thịt Heo Kiểu Thái"
    },
    "isNotSpicy": false,
    "isTakeoutAvailable": true,
    "id": "dish-2505041844456",
    "available": true,
    "containsSeafood": false,
    "price": 240,
    "containsBeef": false
  },
  {
    "containsPork": true,
    "customAddOns": [
      {
        "price": 20,
        "id": "addon-1784478881366-690",
        "name": {
          "th": "เพิ่มโพธิ์",
          "ko": "사진 추가",
          "vi": "Thêm phở",
          "ja": "フォーを追加",
          "zh": "加河粉",
          "en": "Add pho"
        }
      },
      {
        "id": "addon-1784478887811-679",
        "price": 20,
        "name": {
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "en": "Add rice noodles",
          "zh": "加米線"
        }
      },
      {
        "price": 140,
        "id": "addon-1784478890845-28",
        "name": {
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
        }
      }
    ],
    "containsSeafood": false,
    "containsBeef": false,
    "price": 240,
    "name": {
      "zh": "泰式豬肉.河粉",
      "en": "Thai Pork Flat Noodles",
      "ko": "타이 돼지고기 넙적 쌀국수",
      "ja": "タイ風豚肉フォー",
      "th": "เส้นเล็กหมูสไตล์ไทย",
      "vi": "Phở Thịt Heo Kiểu Thái"
    },
    "isNotSpicy": false,
    "id": "dish-2505041843176",
    "available": true,
    "orderIndex": 32,
    "category": "tomyum",
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "經典泰式冬蔭功湯底 配料台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜",
      "en": "Classic Tom Yum soup base. Ingredients: Taiwanese pork belly slices, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage, bean sprouts.",
      "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추, 숙주.",
      "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ、もやし。",
      "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี, ถั่วงอก",
      "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải, giá đỗ."
    },
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "drinks",
    "orderIndex": 33,
    "hasNoodlesOption": false,
    "description": {
      "zh": "網紅網帥拍照必備~茶香濃郁的經典泰奶~1000CC空桶回店回購再折30元!",
      "en": "A must-have for influencers~ Rich classic Thai milk tea~ Bring back the 1000CC empty bucket for a 30 NTD discount on your next purchase!",
      "ko": "인플루언서 사진 필수템~ 진한 풍미의 클래식 타이 밀크티~ 1000cc 빈 통을 다시 가져오시면 다음 구매 시 30달러 할인!",
      "ja": "インフルエンサー必見～香り豊かな定番タイティー～1000CCの空容器をお店に持ってくると、次回購入時に30元割引！",
      "th": "ไอเท็มเด็ดสำหรับสายคอนเทนต์~ ชาไทยสูตรดั้งเดิมเข้มข้น~ นำถังเปล่า 1,000 ซีซี กลับมาซื้อซ้ำ รับส่วนลดทันที 30 บาท!",
      "vi": "Vật dụng chụp ảnh không thể thiếu của các hot boy, hot girl~ Trà sữa Thái cổ điển đậm đà~ Mang vỏ xô 1000CC quay lại quán mua lần sau sẽ được giảm 30 Đài tệ!"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": 180,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2505041825592",
    "name": {
      "zh": "街頭泰奶1L",
      "en": "Street Thai Milk Tea 1L",
      "ko": "스트리트 타이 밀크티 1L",
      "ja": "屋台のタイティー1L",
      "th": "ชาไทยสตรีท 1 ลิตร",
      "vi": "Trà Sữa Thái Đường Phố 1L"
    },
    "isNotSpicy": true,
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "price": 20,
        "id": "addon-1784478928738-313",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "ja": "フォーを追加",
          "vi": "Thêm phở"
        }
      },
      {
        "id": "addon-1784478931302-574",
        "price": 20,
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가"
        }
      },
      {
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
        },
        "id": "addon-1784478933543-454",
        "price": 140
      }
    ],
    "id": "dish-2505041753253",
    "available": true,
    "isNotSpicy": false,
    "name": {
      "zh": "泰滿足海陸牛冬蔭功",
      "en": "Satisfying Surf & Turf Beef Tom Yum",
      "ko": "만족스러운 해물 육류 소고기 똠얌꿍",
      "ja": "大満足 海鮮＆牛肉 トムヤムクン",
      "th": "ต้มยำเซิร์ฟแอนด์เทิร์ฟเนื้อวัวสุดคุ้ม",
      "vi": "Tom Yum Bò Trộn Hải Sản Thỏa Mãn"
    },
    "containsBeef": true,
    "price": 390,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "description": {
      "zh": "經典泰式冬蔭功湯底 配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
      "en": "Classic Tom Yum soup. Ingredients: US Choice chuck eye roll beef slices, shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
      "ko": "클래식 똠얌꿍 육수. 재료: 미국산 초이스 등급 척 아이 롤 소고기 슬라이스, 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
      "ja": "定番トムヤムクンスープ。具材：アメリカ産チョイスグレードの肩ロース牛肉、エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
      "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: เนื้อวัวสันคอเกรดชอยส์จากสหรัฐฯ, กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
      "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt bò lõi vai Mỹ hạng Choice, tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải."
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasCoconutsMilkOption": true,
    "recipe": [],
    "orderIndex": 34,
    "category": "tomyum",
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [
      {
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ja": "フォーを追加",
          "vi": "Thêm phở",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์"
        },
        "id": "addon-1784478951444-682",
        "price": 20
      },
      {
        "id": "addon-1784478953658-987",
        "price": 20,
        "name": {
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "zh": "加米線",
          "en": "Add rice noodles"
        }
      },
      {
        "price": 140,
        "id": "addon-1784478955921-185",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）"
        }
      }
    ],
    "containsPork": true,
    "recipe": [],
    "hasCoconutsMilkOption": true,
    "description": {
      "zh": "經典泰式冬蔭功湯底 配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
      "en": "Classic Tom Yum soup. Ingredients: Taiwanese pork belly slices, shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
      "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
      "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
      "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
      "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải."
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "orderIndex": 35,
    "category": "tomyum",
    "name": {
      "zh": "泰澎湃海陸豬冬蔭功",
      "en": "Abundant Surf & Turf Pork Tom Yum",
      "ko": "푸짐한 해물 육류 돼지고기 똠얌꿍",
      "ja": "豪華 海鮮＆豚肉 トムヤムクン",
      "th": "ต้มยำเซิร์ฟแอนด์เทิร์ฟหมูสุดอลังการ",
      "vi": "Tom Yum Heo Trộn Hải Sản Phong Phú"
    },
    "isNotSpicy": false,
    "id": "dish-2505041751044",
    "available": true,
    "containsSeafood": false,
    "price": 360,
    "containsBeef": false,
    "isTakeoutAvailable": true
  },
  {
    "containsSeafood": false,
    "price": 260,
    "containsBeef": false,
    "name": {
      "zh": "蔬菜拼盤",
      "en": "Vegetable Platter",
      "ko": "채소 모둠",
      "ja": "野菜の盛り合わせ",
      "th": "ชุดผักรวมย่าง",
      "vi": "Mâm Rau Củ Nướng"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2504161837515",
    "orderIndex": 36,
    "category": "veggies",
    "recipe": [],
    "description": {
      "zh": "店家隨機出4種不同80元的碳烤蔬菜",
      "en": "Chef's random selection of 4 different charcoal-grilled vegetables worth 80 NTD.",
      "ko": "셰프가 랜덤으로 제공하는 4가지 숯불구이 채소 (80대만달러 상당).",
      "ja": "シェフがお任せで選ぶ4種類の炭火焼き野菜（80元相当）。",
      "th": "ทางร้านจะสุ่มเลือกผักย่างเตาถ่าน 4 ชนิด มูลค่า 80 บาท",
      "vi": "Quán chọn ngẫu nhiên 4 loại rau củ nướng than hoa trị giá 80 Đài tệ."
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "containsBeef": false,
    "price": 680,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2503181902333",
    "name": {
      "zh": "澳洲小羊肩排2P",
      "en": "Australian Lamb Shoulder Chops 2P",
      "ko": "호주산 양어깨갈비 2P",
      "ja": "オーストラリア産ラム肩ロースステーキ 2P",
      "th": "ซี่โครงไหล่แกะออสเตรเลียย่าง 2 ชิ้น",
      "vi": "Sườn vai cừu Úc 2P"
    },
    "isNotSpicy": false,
    "category": "skewers",
    "orderIndex": 37,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "嚴選澳洲小羊肩排，炭火慢烤，撒上孜然，香氣四溢，每一口都是極致鮮美味",
      "en": "Strictly selected Australian lamb shoulder chops, slowly grilled over charcoal and sprinkled with cumin. Rich in aroma, every bite is an ultimate delicious experience.",
      "ko": "엄선된 호주산 양어깨갈비를 숯불에 천천히 구워 큐민을 뿌렸습니다. 향긋함이 가득하여 한 입마다 극상의 신선하고 맛있는 풍미를 선사합니다.",
      "ja": "厳選されたオーストラリア産ラム肩ロースを炭火でじっくり焼き上げ、クミンを散らしました。豊かな香りが広がり、一口ごとに極上の美味しさをお楽しみいただけます。",
      "th": "คัดสรรซี่โครงไหล่แกะออสเตรเลียอย่างดี ย่างถ่านอย่างช้าๆ โรยด้วยยี่หร่า กลิ่นหอมกรุ่น ทุกคำคือความอร่อยระดับสุดยอด",
      "vi": "Sườn vai cừu Úc tuyển chọn, nướng chậm trên bếp than, rắc thêm bột thì là thơm phức, mỗi miếng cắn đều mang lại vị tươi ngon cực đỉnh."
    },
    "recipe": [],
    "containsPork": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "available": true,
    "id": "dish-2503171838086",
    "isTakeoutAvailable": false,
    "isNotSpicy": false,
    "name": {
      "zh": "泰式生蠔11p",
      "en": "Thai Oysters (11 pcs)",
      "ko": "타이식 굴 (11조각)",
      "ja": "タイ風生牡蠣11個",
      "th": "หอยนางรมไทย 11 ตัว",
      "vi": "Hàu Thái (11 con)"
    },
    "containsBeef": false,
    "price": 2200,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "description": {
      "zh": "(買十送一)嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "en": "(Buy 10 get 1 free) Premium L-size Miyagi oysters! Milky ocean flavor! Signature dish! Can be eaten raw or charcoal-grilled.",
      "ko": "(10+1 이벤트) 엄선된 L사이즈 미야기현 굴! 우유처럼 부드러운 바다의 맛! 시그니처 메뉴! 생으로 먹거나 숯불에 구워 드실 수 있습니다.",
      "ja": "（10個買うと1個無料）厳選されたLサイズの宮城産牡蠣！ミルキーな海の味！看板メニュー！生食も炭火焼きも可能。",
      "th": "(ซื้อ 10 แถม 1) หอยนางรมมิยางิไซส์ L คัดพิเศษ รสชาติน้ำนมทะเล! เมนูเด็ดประจำร้าน! ทานดิบหรือย่างเตาถ่านก็ได้",
      "vi": "(Mua 10 tặng 1) Hàu Miyagi size L tuyển chọn! Vị biển sữa! Món tủ của quán! Có thể ăn sống hoặc nướng than hoa."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "orderIndex": 38,
    "category": "seafood"
  },
  {
    "isNotSpicy": true,
    "name": {
      "ja": "客家の通貨",
      "vi": "tiền Khách Gia",
      "ko": "하카화폐",
      "th": "สกุลเงินฮากกา",
      "zh": "客家幣",
      "en": "Hakka Coin Coupon"
    },
    "available": true,
    "id": "dish-2503012218077",
    "containsSeafood": false,
    "containsBeef": false,
    "price": -1,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time."
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "category": "cat-svadcb",
    "orderIndex": 39,
    "containsPork": false,
    "customAddOns": []
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "name": {
      "zh": "多肉B餐",
      "en": "Meat Lover's Set B Combo",
      "ko": "고기 가득 B세트",
      "ja": "肉づくし Bセット",
      "th": "เซตคนรักเนื้อ B",
      "vi": "Set Thịt Đầy Đặn B"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2502252357010",
    "containsSeafood": false,
    "price": 460,
    "containsBeef": false,
    "recipe": [],
    "description": {
      "zh": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
      "en": "Thai Handmade Beef x1, Beef Rib Skewer x1, Lamb Chop Skewer x1, Chicken Butt Skewer x1, Crispy Pork Intestine Skewer x1, Juicy Sausage Skewer x1, Crispy Chicken Skin x1. The ultimate combo for undecided eaters!",
      "ko": "태국 수제 소고기×1, 소갈비꼬치×1, 어린양갈비꼬치×1, 닭꼬리꼬치×1, 엄선 대창꼬치×1, 육즙 소세지꼬치×1, 바삭 닭껍질×1. 결정 장애가 있을 땐 이 세트!",
      "ja": "タイ風手作り牛肉×1、牛カルビ串×1、子羊カルビ串×1、ぼんじり串×1、厳選肥腸串×1、ジューシーソーセージ串×1、パリパリ鶏皮×1。迷ったらこれ！",
      "th": "เนื้อวัวแฮนด์เมดไทย x1, เนื้อซี่โครง x1, ซี่โครงแกะ x1, ตูดไก่ x1, ไส้ใหญ่ย่าง x1, ไส้กรอกชีส x1, หนังไก่กรอบ x1 เซตนี้จบสำหรับคนเลือกไม่ถูก!",
      "vi": "Bò thủ công Thái x1, Xiên sườn bò x1, Xiên sườn cừu x1, Xiên phao câu gà x1, Xiên dồi trường x1, Xiên xúc xích mọng nước x1, Da gà giòn x1. Sự lựa chọn hoàn hảo khi không biết ăn gì!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "category": "combos",
    "orderIndex": 40,
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsBeef": false,
    "price": 3200,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2502031821565",
    "isTakeoutAvailable": false,
    "isNotSpicy": true,
    "name": {
      "zh": "大摩12年",
      "en": "The Dalmore 12 Years Whisky",
      "ja": "ダルモア 12年",
      "th": "ดาลมอร์ 12 ปี",
      "ko": "달모어 12년",
      "vi": "Rượu Dalmore 12 Năm"
    },
    "category": "cat-6ovxss",
    "orderIndex": 41,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "recipe": []
  },
  {
    "containsSeafood": false,
    "price": 2400,
    "containsBeef": false,
    "name": {
      "zh": "蘇格登13年",
      "en": "The Singleton 13 Years Whisky",
      "ja": "シングルトン 13年",
      "th": "เดอะ ซิงเกิลตัน 13 ปี",
      "ko": "싱글톤 13년",
      "vi": "Rượu Singleton 13 Năm"
    },
    "isNotSpicy": true,
    "isTakeoutAvailable": false,
    "id": "dish-2502031820148",
    "available": true,
    "orderIndex": 42,
    "category": "cat-6ovxss",
    "recipe": [],
    "description": {
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": []
  },
  {
    "orderIndex": 43,
    "category": "cat-6ovxss",
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "",
      "en": "",
      "ko": "",
      "ja": "",
      "th": "",
      "vi": ""
    },
    "recipe": [],
    "containsBeef": false,
    "price": 1800,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2502031818015",
    "isTakeoutAvailable": false,
    "isNotSpicy": true,
    "name": {
      "zh": "蘇格登12年",
      "en": "The Singleton 12 Years Whisky",
      "ko": "싱글톤 12년 위스키",
      "ja": "ザ・シングルトン 12年",
      "th": "เดอะ ซิงเกิลตัน 12 ปี",
      "vi": "Rượu Singleton 12 Năm"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "containsBeef": false,
    "price": 80,
    "name": {
      "ja": "有機トウモロコシの芽",
      "vi": "Măng ngô hữu cơ",
      "ko": "유기농 옥수수순",
      "th": "หน่อข้าวโพดออร์แกนิก",
      "zh": "有機玉米筍",
      "en": "Organic Baby Corn"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2502012109279",
    "category": "veggies",
    "orderIndex": 44,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "ko": "<Non-GMO> 느끼하지도 기름지지도 않은 ~ 달콤하고 맛있는 ~ 영양가 높은",
      "th": "<Non-GMO> ไม่มันเยิ้ม ~ หวานอร่อย ~ มีคุณค่าทางโภชนาการสูง",
      "ja": "＜非遺伝子組み換え＞脂っこくない～甘くて美味しい～栄養価が高い",
      "vi": "<Non-GMO> Không béo ngậy ~ ngọt ngào thơm ngon ~ giá trị dinh dưỡng cao",
      "zh": "<非基改>不油不膩~香甜可口~營養價高",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400"
  },
  {
    "category": "seafood",
    "orderIndex": 45,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "澎湖産の厳選海鮮～塊で食べられる",
      "vi": "Hải sản được lựa chọn cẩn thận từ Bành Hồ ~ bạn có thể ăn thành từng miếng",
      "ko": "펑후에서 엄선한 해산물~ 덩어리째 드실 수 있어요",
      "th": "อาหารทะเลที่คัดสรรอย่างพิถีพิถันจากเผิงหู~ ทานเป็นชิ้นๆ ได้เลย",
      "zh": "嚴選澎湖海味~吃得到塊狀花枝",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 80,
    "containsBeef": false,
    "containsSeafood": true,
    "id": "dish-2502012029386",
    "available": true,
    "isNotSpicy": false,
    "name": {
      "ja": "澎湖華志湾",
      "vi": "Bành Hồ Huazhiwan",
      "ko": "펑후 화지완",
      "th": "เผิงหู หัวจือวาน",
      "zh": "澎湖花枝丸",
      "en": "Penghu Cuttlefish Balls"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "name": {
      "zh": "碳烤爽脆高麗菜",
      "en": "Charcoal-Grilled Crispy Cabbage",
      "ko": "숯불구이 아삭 양배추",
      "ja": "炭焼きシャキシャキキャベツ",
      "th": "กะหล่ำปลีย่างเตาถ่านกรุบกรอบ",
      "vi": "Bắp Cải Nướng Than Hoa Giòn Rụm"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2501142131426",
    "containsSeafood": false,
    "price": 80,
    "containsBeef": false,
    "recipe": [],
    "description": {
      "zh": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?",
      "en": "Charcoal-grilled high-mountain cabbage~ Crispy and sweet~ You won't find this anywhere else~ Want to give it a try?",
      "ko": "숯불에 구운 고산지대 양배추~ 아삭하고 달콤합니다~ 다른 곳에는 없는 특별한 메뉴~ 한 번 드셔보시겠어요?",
      "ja": "炭火焼きの高山キャベツ～シャキシャキで甘い～他のお店ではなかなか売っていません～食べてみませんか？",
      "th": "กะหล่ำปลีภูเขาย่างเตาถ่าน~ กรุบกรอบหวานอร่อย~ ร้านอื่นไม่มีขายแน่นอน~ ลองชิมดูไหม?",
      "vi": "Bắp cải vùng cao nướng than hoa~ Nướng xong giòn ngọt~ Chắc quán khác không có đâu~ Thử một chút nhé?"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "orderIndex": 46,
    "category": "veggies",
    "isTakeoutAvailable": true
  },
  {
    "category": "drinks",
    "orderIndex": 47,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "숯불에 천천히 끓여낸 태국식 밀크티! 독특한 맛은 시도해 볼 가치가 있습니다",
      "th": "ชานมไทยปรุงช้าๆด้วยไฟถ่าน! รสชาติที่เป็นเอกลักษณ์คุ้มค่าแก่การลอง",
      "ja": "炭火でじっくり煮込んだタイミルクティー！独特の風味は試してみる価値あり",
      "vi": "Trà sữa Thái nấu chậm trên lửa than! Hương vị độc đáo đáng để thử"
    },
    "hasNoodlesOption": false,
    "containsSeafood": false,
    "price": 180,
    "containsBeef": false,
    "isNotSpicy": true,
    "name": {
      "zh": "炭燒奶茶(壺)",
      "en": "Charcoal Smoked Thai Tea (Pot)",
      "ja": "炭火焙煎タイミルクティー（ポット）",
      "th": "ชานมไทยคั่วเตาถ่าน (หม้อ)",
      "ko": "숯불 타이 밀크티 (포트)",
      "vi": "Trà sữa Thái rang than (Ấm)"
    },
    "isTakeoutAvailable": false,
    "id": "dish-2412022102224",
    "available": true,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "id": "dish-2412021741257",
    "available": true,
    "name": {
      "zh": "泰辣醬",
      "en": "Thai Spicy Sauce",
      "ko": "타이 매운 소스",
      "ja": "タイ風チリソース",
      "th": "น้ำจิ้มเผ็ดสไตล์ไทย",
      "vi": "Sốt Cay Thái"
    },
    "isNotSpicy": false,
    "containsBeef": false,
    "price": 10,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "嚴選3種辣椒精心炒製，口感層次豐富，嗜辣者必嚐",
      "en": "Carefully stir-fried with 3 types of selected chili peppers, offering a rich layered taste. A must-try for spicy food lovers.",
      "ko": "엄선된 3가지 고추를 볶아 만든 풍부한 맛. 매운맛 애호가라면 꼭 맛보세요.",
      "ja": "厳選された3種類の唐辛子を丁寧に炒め、豊かな風味を実現。辛いもの好きにはたまりません。",
      "th": "ผัดคลุกเคล้ากับพริก 3 ชนิดที่คัดสรรมาอย่างดี รสชาติเข้มข้นกลมกล่อม สายกินเผ็ดต้องลอง",
      "vi": "Rang tỉ mỉ với 3 loại ớt được lựa chọn kỹ càng, hương vị phong phú. Người thích ăn cay nhất định phải thử."
    },
    "recipe": [],
    "category": "cat-zene8j",
    "orderIndex": 48,
    "containsPork": false,
    "customAddOns": [],
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Phải đặt hàng với đồ uống! Một yêu thích của những người sành ăn!",
      "ja": "ドリンクと一緒に注文必須！食通の間で大人気！",
      "th": "ต้องสั่งพร้อมเครื่องดื่ม! ของโปรดในหมู่นักชิม!",
      "ko": "음료와 함께 꼭 주문해야해요! 미식가들 사이에서 가장 인기 있는 곳!",
      "zh": "下酒必點!老饕最愛!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "category": "seafood",
    "orderIndex": 49,
    "name": {
      "ko": "손으로 잘게 썬 대형 말린 오징어",
      "th": "ปลาหมึกแห้งขนาดใหญ่ฉีกด้วยมือ",
      "ja": "大スルメ手切り",
      "vi": "Mực khô lớn xé tay",
      "zh": "手撕大魷魚干",
      "en": "Shredded Dried Giant Squid"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2412021734433",
    "containsSeafood": true,
    "price": 390,
    "containsBeef": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "seafood",
    "orderIndex": 50,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
      "en": "Must-try for seafood lovers! Served with Thai lemon sauce, seared to perfection with mouthwatering aroma in every bite.",
      "ko": "해산물 마니아 필수 주문! 태국식 레몬 소스와 함께 직화로 구워 향긋함이 가득한 극상의 맛.",
      "ja": "海鮮好き必見！タイ風レモンソース付き、炙り立ての香ばしい香りと絶品の味わい。",
      "th": "สายอาหารทะเลต้องสั่ง! ทานคู่ซอสมะนาวสไตล์ไทย เบิร์นไฟหอมฟุ้ง อร่อยละมุนทุกคำ",
      "vi": "Món nướng hải sản không thể bỏ qua! Kèm sốt chanh Thái, khò lửa thơm nức nát, ngon tuyệt hảo từng miếng."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 390,
    "name": {
      "zh": "炙燒生食級干貝3P",
      "en": "Seared Sashimi Grade Scallops (3pcs)",
      "ko": "직화 아부리 생식용 가리비 관자 (3개)",
      "ja": "炙り生食可能ホタテ (3個)",
      "th": "หอยเชลล์เกรดซาซิมิเบิร์นไฟ (3 ชิ้น)",
      "vi": "Sò điệp ăn sống khò lửa (3 con)"
    },
    "isNotSpicy": true,
    "id": "dish-2412021733504",
    "available": true,
    "isTakeoutAvailable": true
  },
  {
    "category": "seafood",
    "orderIndex": 51,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Món ăn nhất định phải thử dành cho những ai thích ăn cay! Phải có để uống. Đã bóc vỏ",
      "ja": "辛いもの好きな方はぜひ試してみてください！お酒を飲む際の必需品。すでに殻をむいています",
      "th": "สำหรับผู้ที่ชอบอาหารรสเผ็ดต้องลอง! เป็นสิ่งที่ต้องมีสำหรับการดื่ม ปอกเปลือกแล้ว",
      "ko": "매운음식 좋아하시는 분들 꼭 드셔보세요! 술을 마실 때 꼭 필요한 것. 이미 껍질이 벗겨졌어",
      "zh": "嗜辣者必嚐!下酒必備 已去殼",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "id": "dish-2412021732545",
    "available": true,
    "name": {
      "zh": "泰辣扇貝9P",
      "en": "Spicy Thai Scallops (9pcs)",
      "th": "หอยเชลล์เผ็ดไทย 9P",
      "ko": "태국식 매운 가리비 9P",
      "vi": "Sò điệp cay Thái 9P",
      "ja": "タイ産スパイシーホタテ貝柱 9P"
    },
    "isNotSpicy": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "available": true,
    "id": "dish-2412021732071",
    "name": {
      "zh": "椰碳烤大草蝦6P",
      "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)",
      "ko": "코코넛 숯불 새우구이 6P",
      "th": "กุ้งเผาถ่านมะพร้าว6P",
      "ja": "エビのココナッツ炭火焼き 6P",
      "vi": "Tôm nướng than dừa 6P"
    },
    "isNotSpicy": true,
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "description": {
      "zh": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "vi": "6 con tôm lớn nướng ~ râu và gai nhọn đã được cắt bỏ ~ nhưng hãy cẩn thận khi bóc vỏ",
      "ja": "大海老のグリル6尾～ひげと鋭い棘はカットしてあります～殻を剥くときは注意してください",
      "th": "กุ้งเผาตัวใหญ่ 6 ตัว ~ หนวดและหนามแหลมถูกตัด ~ แต่ต้องระวังตอนปอกเปลือก",
      "ko": "큰새우구이 6개~수염과 날카로운 가시는 잘랐지만 껍질벗길때 조심하세요"
    },
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "seafood",
    "orderIndex": 52,
    "containsPork": false,
    "customAddOns": []
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "id": "dish-2411142306093",
    "available": true,
    "isNotSpicy": true,
    "name": {
      "zh": "泰醇奶酒5.6%",
      "en": "Thai Cream Liqueur 5.6%",
      "vi": "Rượu sữa Đài Xuân 5,6%",
      "ja": "台中ミルクワイン 5.6%",
      "th": "ไวน์นมไท่ชุน 5.6%",
      "ko": "타이춘 밀크와인 5.6%"
    },
    "price": 380,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
      "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say",
      "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다",
      "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
      "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "en": "Refreshing and cool, a perfect match for BBQ"
    },
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 53,
    "category": "cat-6ovxss"
  },
  {
    "category": "cat-6ovxss",
    "orderIndex": 54,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다",
      "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
      "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
      "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say",
      "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "en": "Refreshing and cool, a perfect match for BBQ"
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 280,
    "name": {
      "vi": "Rượu sữa Đài Xuân 1,4%",
      "ja": "台中ミルクワイン 1.4%",
      "th": "ไวน์นมไท่ชุน 1.4%",
      "ko": "타이춘 밀크와인 1.4%",
      "zh": "泰醇奶酒1.4%",
      "en": "Thai Cream Liqueur 1.4%"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2411142303467",
    "customAddOns": [],
    "containsPork": false
  },
  {
    "orderIndex": 55,
    "category": "cat-7cvvkq",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。"
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2411142030288",
    "name": {
      "ja": "ジュース・スパークリングウォーター",
      "vi": "Nước ép có ga",
      "ko": "주스 탄산수",
      "th": "น้ำผลไม้เป็นประกาย",
      "zh": "果汁氣泡水",
      "en": "Fruit Juice Sparkling Water"
    },
    "isNotSpicy": true,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "isNotSpicy": true,
    "name": {
      "zh": "海尼根",
      "en": "Heineken Beer",
      "ko": "하이네켄",
      "th": "ไฮเนเก้น",
      "ja": "ハイネケン",
      "vi": "Heineken"
    },
    "available": true,
    "id": "dish-2411142028551",
    "containsSeafood": false,
    "price": 150,
    "containsBeef": false,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。"
    },
    "hasNoodlesOption": false,
    "category": "cat-7cvvkq",
    "orderIndex": 56
  },
  {
    "category": "skewers",
    "orderIndex": 57,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Sự kết hợp bánh tiết heo + xúc xích được cả người lớn và trẻ em yêu thích♥️Đừng lo lắng về lượng calo hôm nay nhé!",
      "ja": "豚の血ケーキ＋ホットドッグの組み合わせは大人も子供も大好き♥️今日はカロリーを気にせず！",
      "th": "เค้กเลือดหมู + ฮอทด็อกเป็นที่ชื่นชอบของทั้งเด็กและผู้ใหญ่ ♥️วันนี้ไม่ต้องกังวลเรื่องแคลอรี่!",
      "ko": "돼지피케이크+핫도그 조합은 어른도 아이도 모두 좋아하는 조합♥️오늘은 칼로리 걱정하지 마세요!",
      "zh": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 70,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2411112029373",
    "isNotSpicy": false,
    "name": {
      "ko": "사악한 핫도그 돼지 혈액 케이크",
      "th": "เค้กเลือดหมูฮอทด็อกชั่วร้าย",
      "ja": "邪悪なホットドッグの豚血ケーキ",
      "vi": "Bánh huyết heo xúc xích ác quỷ",
      "zh": "邪惡熱狗豬血糕",
      "en": "Hot Dog & Pork Blood Cake Skewer"
    },
    "customAddOns": [],
    "containsPork": true
  },
  {
    "containsSeafood": false,
    "containsBeef": false,
    "price": 150,
    "isNotSpicy": true,
    "name": {
      "zh": "可樂娜",
      "en": "Corona Extra Beer",
      "vi": "Corona",
      "ja": "コロナ",
      "th": "โคโรนา",
      "ko": "코로나"
    },
    "id": "dish-2411091621575",
    "available": true,
    "category": "cat-7cvvkq",
    "orderIndex": 58,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "hasNoodlesOption": false,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ja": "期間限定の超お得な割引パッケージ",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น"
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "orderIndex": 59,
    "category": "cat-svadcb",
    "id": "dish-2411042135298",
    "available": true,
    "name": {
      "ko": "팁",
      "th": "ทิป",
      "ja": "ヒント",
      "vi": "tiền boa",
      "zh": "tip",
      "en": "Staff Tip / Service Gratitude"
    },
    "isNotSpicy": true,
    "containsBeef": false,
    "price": 10,
    "containsSeafood": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "customAddOns": [
      {
        "price": 0,
        "id": "addon-1784479411862-296",
        "name": {
          "zh": "加熱",
          "en": "heating",
          "th": "เครื่องทำความร้อน",
          "ko": "난방",
          "vi": "sưởi ấm",
          "ja": "暖房"
        }
      }
    ],
    "containsPork": false,
    "recipe": [],
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "category": "cat-6ovxss",
    "orderIndex": 60,
    "name": {
      "zh": "白鶴清酒",
      "en": "Hakutsuru Japanese Sake",
      "ja": "白鶴 清酒",
      "th": "สาเก ฮาคุรุ",
      "ko": "하쿠츠루 사케",
      "vi": "Rượu Sake Hakutsuru"
    },
    "isNotSpicy": true,
    "isTakeoutAvailable": false,
    "id": "dish-2410270119261",
    "available": true,
    "containsSeafood": false,
    "price": 350,
    "containsBeef": false
  },
  {
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2410132030420",
    "name": {
      "ko": "사랑의 맛 보리차",
      "th": "รสชาติของชาข้าวบาร์เลย์แห่งความรัก",
      "ja": "恋の麦茶の味",
      "vi": "Hương trà lúa mạch tình yêu",
      "zh": "愛之味麥茶",
      "en": "AGV Barley Tea"
    },
    "isNotSpicy": true,
    "category": "cat-7cvvkq",
    "orderIndex": 61,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "containsPork": false,
    "customAddOns": []
  },
  {
    "category": "cat-7cvvkq",
    "orderIndex": 62,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2410022148358",
    "available": true,
    "name": {
      "ja": "バドワイザー",
      "vi": "Budweiser",
      "ko": "버드와이저",
      "th": "บัดไวเซอร์",
      "zh": "百威",
      "en": "Budweiser Beer"
    },
    "isNotSpicy": true,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "orderIndex": 63,
    "category": "tomyum",
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
      "en": "5.2 oz Choice-grade beef short ribs (no water injection, non-reconstituted meat), charcoal-grilled then added to the soup! A foodie's favorite ♥️ Authentic rich Thai broth.",
      "ko": "5.2온스 초이스 등급 소갈비(물 주입 및 가공육 아님)를 숯불에 구워 육수에 넣었습니다! 미식가들의 최애 ♥️ 정통 타이식 진한 국물.",
      "ja": "5.2オンスのチョイスグレード牛カルビ（水注入や成型肉ではありません）を炭火で焼いてからスープに投入！食通の定番♥️本格的な濃厚タイ風スープ。",
      "th": "ซี่โครงวัวเกรดชอยส์ 5.2 ออนซ์ (ไม่ฉีดน้ำ ไม่ใช่เนื้อดัดแปลง) นำไปย่างเตาถ่านก่อนใส่ลงในซุป! เมนูโปรดของสายกิน♥️ น้ำซุปเข้มข้นสไตล์ไทยแท้",
      "vi": "Sườn bò Choice 5.2 oz (không bơm nước, không phải thịt tái tổ hợp) được nướng than hoa trước khi cho vào súp! Món ăn yêu thích của những người sành ăn♥️ Nước dùng đậm đà hương vị Thái Lan."
    },
    "hasCoconutsMilkOption": true,
    "recipe": [],
    "containsBeef": true,
    "price": 620,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2409232044239",
    "isNotSpicy": false,
    "name": {
      "zh": "牛小排冬蔭功湯",
      "en": "Beef Short Rib Tom Yum Soup",
      "ko": "소갈비 똠얌꿍 수프",
      "ja": "牛カルビ トムヤムクン",
      "th": "ต้มยำซี่โครงวัว",
      "vi": "Súp Tom Yum Sườn Bò"
    },
    "customAddOns": [
      {
        "name": {
          "vi": "Thêm phở",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "ko": "사진 추가",
          "zh": "加河粉",
          "en": "Add pho"
        },
        "id": "addon-1784479460272-831",
        "price": 20
      },
      {
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ja": "ビーフンを加えます",
          "vi": "Thêm bún",
          "ko": "쌀국수 추가",
          "th": "ใส่เส้นก๋วยเตี๋ยว"
        },
        "id": "addon-1784479462255-754",
        "price": 20
      },
      {
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)"
        },
        "price": 140,
        "id": "addon-1784479465274-753"
      }
    ],
    "containsPork": false,
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "price": 20,
        "id": "addon-1784479484092-785",
        "name": {
          "ja": "フォーを追加",
          "vi": "Thêm phở",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "zh": "加河粉",
          "en": "Add pho"
        }
      },
      {
        "price": 20,
        "id": "addon-1784479486352-323",
        "name": {
          "ja": "ビーフンを加えます",
          "vi": "Thêm bún",
          "ko": "쌀국수 추가",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "zh": "加米線",
          "en": "Add rice noodles"
        }
      },
      {
        "name": {
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
        },
        "id": "addon-1784479488427-739",
        "price": 140
      }
    ],
    "name": {
      "zh": "泰式牛小排.米線",
      "en": "Thai Beef Short Rib Rice Noodles",
      "ko": "타이 소갈비 쌀국수",
      "ja": "タイ風牛カルビライスヌードル",
      "th": "ขนมจีนซี่โครงวัวสไตล์ไทย",
      "vi": "Bún Sườn Bò Kiểu Thái"
    },
    "isNotSpicy": false,
    "id": "dish-2409232043478",
    "available": true,
    "containsSeafood": false,
    "price": 620,
    "containsBeef": true,
    "recipe": [],
    "description": {
      "zh": "5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "en": "5.2 oz Choice-grade beef short ribs (no water injection, non-reconstituted meat), charcoal-grilled then added to the soup! A foodie's favorite ♥️ Authentic Thai noodle soup, rich broth to warm your heart and stomach.",
      "ko": "5.2온스 초이스 등급 소갈비(물 주입 및 가공육 아님)를 숯불에 구워 육수에 넣었습니다! 미식가들의 최애 ♥️ 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
      "ja": "5.2オンスのチョイスグレード牛カルビ（水注入や成型肉ではありません）を炭火で焼いてからスープに投入！食通の定番♥️本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
      "th": "ซี่โครงวัวเกรดชอยส์ 5.2 ออนซ์ (ไม่ฉีดน้ำ ไม่ใช่เนื้อดัดแปลง) นำไปย่างเตาถ่านก่อนใส่ลงในซุป! เมนูโปรดของสายกิน♥️ ก๋วยเตี๋ยวน้ำใสสไตล์ไทยแท้ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
      "vi": "Sườn bò Choice 5.2 oz (không bơm nước, không phải thịt tái tổ hợp) được nướng than hoa trước khi cho vào súp! Món ăn yêu thích của những người sành ăn♥️ Phở nước kiểu Thái chính tông, nước dùng đậm đà làm ấm lòng người."
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "category": "tomyum",
    "orderIndex": 64,
    "isTakeoutAvailable": true
  },
  {
    "customAddOns": [
      {
        "id": "addon-1784479520251-308",
        "price": 20,
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "ja": "フォーを追加",
          "vi": "Thêm phở"
        }
      },
      {
        "id": "addon-1784479522216-624",
        "price": 20,
        "name": {
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "zh": "加米線",
          "en": "Add rice noodles"
        }
      },
      {
        "price": 140,
        "id": "addon-1784479526311-934",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        }
      }
    ],
    "containsPork": false,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "en": "5.2 oz Choice-grade beef short ribs (no water injection, non-reconstituted meat), charcoal-grilled then added to the soup! A foodie's favorite ♥️ Authentic Thai noodle soup, rich broth to warm your heart and stomach.",
      "ko": "5.2온스 초이스 등급 소갈비(물 주입 및 가공육 아님)를 숯불에 구워 육수에 넣었습니다! 미식가들의 최애 ♥️ 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
      "ja": "5.2オンスのチョイスグレード牛カルビ（水注入や成型肉ではありません）を炭火で焼いてからスープに投入！食通の定番♥️本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
      "th": "ซี่โครงวัวเกรดชอยส์ 5.2 ออนซ์ (ไม่ฉีดน้ำ ไม่ใช่เนื้อดัดแปลง) นำไปย่างเตาถ่านก่อนใส่ลงในซุป! เมนูโปรดของสายกิน♥️ ก๋วยเตี๋ยวน้ำใสสไตล์ไทยแท้ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
      "vi": "Sườn bò Choice 5.2 oz (không bơm nước, không phải thịt tái tổ hợp) được nướng than hoa trước khi cho vào súp! Món ăn yêu thích của những người sành ăn♥️ Phở nước kiểu Thái chính tông, nước dùng đậm đà làm ấm lòng người."
    },
    "hasNoodlesOption": false,
    "orderIndex": 65,
    "category": "tomyum",
    "name": {
      "zh": "泰式牛小排.河粉",
      "en": "Thai Beef Short Rib Flat Noodles",
      "ko": "타이 소갈비 넙적 쌀국수",
      "ja": "タイ風牛カルビフォー",
      "th": "เส้นเล็กซี่โครงวัวสไตล์ไทย",
      "vi": "Phở Sườn Bò Kiểu Thái"
    },
    "isNotSpicy": false,
    "id": "dish-2409232042549",
    "available": true,
    "containsSeafood": false,
    "price": 620,
    "containsBeef": true,
    "isTakeoutAvailable": true
  },
  {
    "recipe": [],
    "description": {
      "ko": "<3종 할인세트> 엄선된 L 사이즈 미야기현 굴과 우유, 해산물! 매장의 시그니처!\n생으로 먹어도 되고 구워서 먹어도 된다",
      "th": "<ชุดลดราคาสามชิ้น> หอยนางรมมิยากิ นม และอาหารทะเลขนาด L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน!\nสามารถรับประทานดิบหรือย่างได้",
      "ja": "＜お得な3点セット＞Lサイズの宮城産牡蠣・牛乳・魚介類を厳選！お店のサインも！\n生でも焼いても食べられる",
      "vi": "<Bộ giảm giá ba món> Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng!\nCó thể ăn sống hoặc nướng",
      "zh": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "category": "seafood",
    "orderIndex": 66,
    "name": {
      "vi": "Hàu Thái 3p",
      "ja": "タイオイスター3P",
      "th": "หอยนางรมไทย3p",
      "ko": "태국 굴 3p",
      "zh": "泰式生蠔3p",
      "en": "Thai Style Fresh Oysters (3pcs Combo)"
    },
    "isNotSpicy": false,
    "isTakeoutAvailable": false,
    "id": "dish-2409232024040",
    "available": true,
    "containsSeafood": true,
    "price": 660,
    "containsBeef": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "orderIndex": 67,
    "category": "cat-7cvvkq",
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "hasNoodlesOption": false,
    "containsSeafood": false,
    "price": 100,
    "containsBeef": false,
    "name": {
      "ja": "氷水（大）",
      "vi": "Nước đá (lớn)",
      "ko": "얼음물(대)",
      "th": "น้ำแข็งใส (ใหญ่)",
      "zh": "冰水(大)",
      "en": "Large Ice Water"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2409131907512"
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "isNotSpicy": true,
    "name": {
      "zh": "開瓶費1支",
      "en": "Corkage Fee (Per Bottle)",
      "ko": "코르키지 요금 1병",
      "th": "ค่าเปิดขวด 1 ขวด",
      "ja": "持ち込み料金 1本",
      "vi": "Phí đóng chai 1 chai"
    },
    "available": true,
    "id": "dish-2408192006066",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 500,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "description": {
      "th": "ค่าบริการเปิดขวดสำหรับเครื่องดื่มที่นำมาเอง (คิดราคาต่อขวด)",
      "ko": "주류 반입 시 적용되는 병당 코키지 서비스 요금입니다.",
      "vi": "Phí phục vụ khui chai đối với thức uống tự mang vào (tính theo chai).",
      "ja": "お持ち込み飲料のボトルごとの抜栓料（コーケージ）です。",
      "zh": "自備酒水之開瓶服務費（按瓶計費）。",
      "en": "Corkage fee for bringing your own beverage (charged per bottle)."
    },
    "category": "cat-svadcb",
    "orderIndex": 68
  },
  {
    "customAddOns": [],
    "containsPork": true,
    "category": "skewers",
    "orderIndex": 69,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "th": "ไส้กรอกอีสานเส้นหมี่เขียวแท้ <ไม่ใช่ว่าอาหารเปรี้ยวหรือบูด> ลูกค้าที่สั่งสินค้าต้องมีความเข้าใจดังนี้",
      "ko": "정통 태국식 신 돼지고기 소시지 녹색면 <음식이 신맛이 나거나 상한 것이 아닙니다> 본 상품을 주문하시는 고객께서는 이 점을 숙지하시기 바랍니다.",
      "vi": "Xúc xích heo chua Thái chính hãng với bún xanh <Không phải đồ ăn bị chua hay hư> Khách hàng đặt mua sản phẩm này phải hiểu rõ điều này",
      "ja": "本格タイ風サワーポークソーセージ グリーンヌードル入り ＜酸っぱい・傷むわけではありません＞ この商品をご注文いただくお客様は、この点をご理解いただいた上でご注文ください",
      "zh": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2408191941429",
    "available": true,
    "name": {
      "zh": "泰北酸肉冬粉腸",
      "en": "Northern Thai Fermented Pork Sausage w/ Glass Noodles",
      "ko": "북부 태국 신 돼지고기와 겨울 국수 소시지",
      "th": "หมูยอภาคเหนือและไส้กรอกหมี่ฤดูหนาว",
      "ja": "タイ北部のサワーポークとウィンターヌードルソーセージ",
      "vi": "Bún chua mùa đông và thịt chua miền Bắc Thái"
    },
    "isNotSpicy": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "cat-svadcb",
    "orderIndex": 70,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
      "ja": "期間限定の超お得な割引パッケージ"
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "price": -10,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2407231815553",
    "name": {
      "vi": "Giảm giá cho bạn bè",
      "ja": "友達割引",
      "th": "ส่วนลดเพื่อน",
      "ko": "친구할인",
      "zh": "好友折扣",
      "en": "Friend Discount Coupon"
    },
    "isNotSpicy": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "price": 70,
    "containsBeef": false,
    "isNotSpicy": false,
    "name": {
      "th": "ซี่โครงแกะ",
      "ko": "양갈비",
      "vi": "sườn cừu",
      "ja": "ラムリブ",
      "zh": "小羔羊肋",
      "en": "Cumin Lamb Rib Skewers"
    },
    "available": true,
    "id": "dish-2305152126508",
    "orderIndex": 71,
    "category": "skewers",
    "recipe": [],
    "description": {
      "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주수입) 숯불에 노릇노릇해질 때까지 구운 후 커민가루를 뿌려주세요! 매장에서 가장 많이 팔리는 NO2입니다.",
      "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีเหลืองทองโรยผงยี่หร่า! NO2 ที่ขายดีที่สุดในร้าน",
      "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリアから輸入） 炭火できつね色になるまで焼き、クミンパウダーをふりかける！当店の売れ筋NO2。",
      "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi vàng nâu và rắc bột thì là! NO2 bán chạy nhất tại cửa hàng.",
      "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false
  },
  {
    "available": true,
    "id": "dish-2304041737306",
    "name": {
      "zh": "果肉椰子水",
      "en": "Fresh Coconut Water w/ Pulp",
      "th": "น้ำมะพร้าวเนื้อ",
      "ko": "펄프 코코넛 워터",
      "vi": "Nước cốt dừa",
      "ja": "パルプココナッツウォーター"
    },
    "isNotSpicy": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 72,
    "category": "drinks",
    "containsPork": false,
    "customAddOns": []
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": true,
    "price": 250,
    "containsBeef": false,
    "name": {
      "th": "หอยนางรมไทย 1P",
      "ko": "타이 굴 1P",
      "vi": "Hàu Thái 1P",
      "ja": "タイオイスター 1P",
      "zh": "泰式生蠔1P",
      "en": "Thai Style Fresh Oyster (1pc)"
    },
    "isNotSpicy": false,
    "isTakeoutAvailable": false,
    "available": true,
    "id": "dish-2303301719168",
    "category": "seafood",
    "orderIndex": 73,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "엄선된 L 사이즈 미야기 굴, 우유, 해산물! 매장의 시그니처! 생으로 먹어도 되고 구워서 먹어도 된다",
      "th": "หอยนางรม มิยากิ นม และอาหารทะเลไซส์ L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน! สามารถรับประทานดิบหรือย่างได้",
      "ja": "宮城産の牡蠣・牛乳・魚介類をLサイズで厳選！お店のサインも！生でも焼いても食べられる",
      "vi": "Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng! Có thể ăn sống hoặc nướng"
    },
    "hasNoodlesOption": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "available": true,
    "id": "dish-2302272107257",
    "name": {
      "zh": "勝獅",
      "en": "Singha Beer",
      "ja": "シンガポール",
      "vi": "singapore",
      "ko": "싱가포르",
      "th": "สิงคโปร์"
    },
    "isNotSpicy": true,
    "price": 110,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "cat-7cvvkq",
    "orderIndex": 74
  },
  {
    "orderIndex": 75,
    "category": "cat-7cvvkq",
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 110,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2302162152176",
    "isNotSpicy": true,
    "name": {
      "zh": "泰象",
      "en": "Chang Beer",
      "ja": "太祥",
      "vi": "Thái Tường",
      "ko": "타이샹",
      "th": "ไท่เซียง"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
      "en": "Nutritious, low calories, calcium content close to milk! Excellent choice for stomach health.",
      "ko": "영양 만점~ 저칼로리~ 우유에 맞먹는 칼슘 함량! 위 건강에 좋은 탁월한 선택.",
      "ja": "栄養豊富・低カロリー！牛乳並みのカルシウムで胃に優しい健康的な選択。",
      "th": "กระเจี๊ยบเขียวมีประโยชน์สูง แคลอรีต่ำ แคลเซียมใกล้เคียงนมสด! ทางเลือกที่ดีสำหรับกระเพาะอาหาร",
      "vi": "Giàu dinh dưỡng, ít calo, hàm lượng canxi tiệm cận sữa tươi! Lựa chọn tuyệt vời cho dạ dày."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "category": "veggies",
    "orderIndex": 76,
    "name": {
      "zh": "秋葵(季節限定)",
      "en": "Charcoal Grilled Okra (Seasonal)",
      "ko": "오크라 구이 (계절 한정)",
      "ja": "オクラ炭火焼き (季節限定)",
      "th": "กระเจี๊ยบเขียวสไตล์ไทย (ตามฤดูกาล)",
      "vi": "Đậu bắp nướng than (Theo mùa)"
    },
    "isNotSpicy": false,
    "id": "dish-2211162026366",
    "available": true,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 80,
    "isTakeoutAvailable": true
  },
  {
    "available": true,
    "id": "dish-2209081804158",
    "isNotSpicy": false,
    "name": {
      "zh": "泰式海鮮.米線",
      "en": "Thai Seafood Rice Noodles",
      "ko": "타이 해산물 쌀국수",
      "ja": "タイ風海鮮ライスヌードル",
      "th": "ขนมจีนซีฟู้ดสไตล์ไทย",
      "vi": "Bún Hải Sản Kiểu Thái"
    },
    "price": 240,
    "containsBeef": false,
    "containsSeafood": true,
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "You haven't truly had Thai food if you haven't tried Tom Yum! Classic authentic Thai noodle soup, rich broth to warm your heart and stomach.",
      "ko": "똠얌꿍을 안 먹어봤다면 타이 음식을 먹어봤다고 할 수 없죠! 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
      "ja": "トムヤムクンを食べずしてタイ料理は語れない！本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
      "th": "ถ้าไม่เคยกินต้มยำกุ้งก็ถือว่ายังไม่เคยกินอาหารไทย! ก๋วยเตี๋ยวน้ำใสรสชาติต้นตำรับ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
      "vi": "Chưa ăn Tom Yum thì chưa thể nói là đã ăn món Thái! Món phở nước mang hương vị Thái Lan đích thực, nước dùng đậm đà sưởi ấm lòng người."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "tomyum",
    "orderIndex": 77,
    "containsPork": false,
    "customAddOns": [
      {
        "name": {
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "ja": "フォーを追加",
          "vi": "Thêm phở",
          "zh": "加河粉",
          "en": "Add pho"
        },
        "price": 20,
        "id": "addon-1784479721381-721"
      },
      {
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가"
        },
        "price": 20,
        "id": "addon-1784479723321-863"
      },
      {
        "id": "addon-1784479725596-570",
        "price": 140,
        "name": {
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
        }
      }
    ],
    "isTakeoutAvailable": true
  },
  {
    "id": "dish-2209081753180",
    "available": true,
    "isNotSpicy": true,
    "name": {
      "ja": "特選ビーフショートリブ-5オンス",
      "vi": "Sườn Bò Choice-5oz",
      "ko": "초이스 소갈비-5oz",
      "th": "ซี่โครงเนื้อทางเลือก-5oz",
      "zh": "Choice牛小排-5oz",
      "en": "USDA Choice Beef Short Rib Steak (5oz)"
    },
    "price": 590,
    "containsBeef": true,
    "containsSeafood": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "丁寧にそぎ落とした生肉を炭火でじっくり焼き上げると、香ばしさが溢れ、一口食べるごとにとても美味しいです！",
      "vi": "Sau khi thịt sống được cắt tỉa cẩn thận và nướng từ từ trên lửa than, mùi thơm tràn ngập, mỗi miếng cắn đều vô cùng thơm ngon!",
      "ko": "생고기를 정성스럽게 손질하여 숯불에 천천히 구워내면 고소한 향이 가득하고, 한입 먹을 때마다 정말 맛있습니다!",
      "th": "หลังจากที่เนื้อดิบได้รับการตัดแต่งอย่างระมัดระวังและย่างอย่างช้าๆบนไฟถ่าน กลิ่นหอมก็ล้นออกมา และทุกคำที่กัดก็อร่อยมาก!",
      "zh": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 78,
    "category": "skewers",
    "containsPork": false,
    "customAddOns": [
      {
        "name": {
          "th": "เพิ่มโพธิ์",
          "ko": "사진 추가",
          "vi": "Thêm phở",
          "ja": "フォーを追加",
          "zh": "加河粉",
          "en": "Add pho"
        },
        "price": 20,
        "id": "addon-1784479747323-7"
      },
      {
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "ko": "쌀국수 추가",
          "vi": "Thêm bún",
          "ja": "ビーフンを加えます"
        },
        "id": "addon-1784479750303-903",
        "price": 20
      },
      {
        "price": 140,
        "id": "addon-1784479752305-972",
        "name": {
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
        }
      }
    ]
  },
  {
    "category": "skewers",
    "orderIndex": 79,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ko": "아침에 시장에 갔다가 따기와 양념장을 가지고 가지고 왔습니다. (닭꽁초 좋아하시는 분들은 필수!) 아직 튀겨지지 않았기 때문에 15분 정도 구워주세요.",
      "th": "เมื่อเช้าผมไปตลาดก็เอากลับมาแบบถอนขนและหมักด้วย (คนชอบก้นไก่ต้องสั่ง!) เนื่องจากยังไม่ได้ทอดจึงอบประมาณ 15 นาที",
      "ja": "朝市場に行って、むしりとマリネを付けて持ち帰ってきました（鶏のお尻好きな人は必ず頼む！）まだ揚げていないので、15分ほど焼きます。",
      "vi": "Sáng đi chợ mang về cùng với cả tuốt và ướp (món phải gọi của ai thích mông gà!) Vì chưa chiên nên nướng khoảng 15 phút.",
      "zh": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2209081751117",
    "name": {
      "ko": "특대형 토종닭 Qilixiang",
      "th": "ไก่ท้องถิ่น Qilixiang ขนาดใหญ่พิเศษ",
      "ja": "特大地鶏七里香",
      "vi": "Gà địa phương cực lớn Qiilixiang",
      "zh": "特大土雞七里香",
      "en": "Extra Large Chicken Butt Skewers"
    },
    "isNotSpicy": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "category": "cat-zene8j",
    "orderIndex": 80,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal."
    },
    "recipe": [],
    "containsBeef": false,
    "price": 0,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2208121916271",
    "name": {
      "ko": "파프리카",
      "th": "พริกหยวก",
      "ja": "パプリカ",
      "vi": "ớt bột",
      "zh": "辣椒粉",
      "en": "Chili Powder Dip"
    },
    "isNotSpicy": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "id": "addon-1784479804720-626",
        "price": 20,
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "ja": "フォーを追加",
          "vi": "Thêm phở"
        }
      },
      {
        "id": "addon-1784479806981-555",
        "price": 20,
        "name": {
          "ja": "ビーフンを加えます",
          "vi": "Thêm bún",
          "ko": "쌀국수 추가",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "zh": "加米線",
          "en": "Add rice noodles"
        }
      },
      {
        "name": {
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
        },
        "price": 140,
        "id": "addon-1784479809050-307"
      }
    ],
    "available": true,
    "id": "dish-2208121912457",
    "isNotSpicy": false,
    "name": {
      "zh": "泰式海鮮.河粉",
      "en": "Thai Seafood Flat Noodles",
      "ko": "타이 해산물 넙적 쌀국수",
      "ja": "タイ風海鮮フォー",
      "th": "เส้นเล็กซีฟู้ดสไตล์ไทย",
      "vi": "Phở Hải Sản Kiểu Thái"
    },
    "containsBeef": false,
    "price": 240,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "You haven't truly had Thai food if you haven't tried Tom Yum! Classic authentic Thai noodle soup, rich broth to warm your heart and stomach.",
      "ko": "똠얌꿍을 안 먹어봤다면 타이 음식을 먹어봤다고 할 수 없죠! 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
      "ja": "トムヤムクンを食べずしてタイ料理は語れない！本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
      "th": "ถ้าไม่เคยกินต้มยำกุ้งก็ถือว่ายังไม่เคยกินอาหารไทย! ก๋วยเตี๋ยวน้ำใสรสชาติต้นตำรับ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
      "vi": "Chưa ăn Tom Yum thì chưa thể nói là đã ăn món Thái! Món phở nước mang hương vị Thái Lan đích thực, nước dùng đậm đà sưởi ấm lòng người."
    },
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "category": "tomyum",
    "orderIndex": 81,
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsBeef": false,
    "price": 90,
    "containsSeafood": false,
    "id": "dish-2208071821298",
    "available": true,
    "name": {
      "zh": "泰酥豆皮",
      "en": "Crispy Tofu Skin Skewer",
      "vi": "Da đậu hủ chiên giòn kiểu Thái",
      "ja": "タイのパリパリ豆腐皮",
      "th": "หนังเต้าหู้กรอบ",
      "ko": "태국식 바삭한 두부 스킨"
    },
    "isNotSpicy": false,
    "category": "skewers",
    "orderIndex": 82,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "外酥內嫩的口感，店內人氣商品!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "th": "กรอบนอกนุ่มในเป็นสินค้ายอดนิยมของร้าน!",
      "ko": "겉은 바삭하고 속은 부드러운 이 매장의 인기상품!",
      "vi": "Giòn bên ngoài và mềm bên trong, một mặt hàng phổ biến trong cửa hàng!",
      "ja": "外はカリッと中はふわっとしたお店の人気商品です！"
    },
    "recipe": []
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "id": "dish-2208071820475",
    "available": true,
    "isNotSpicy": true,
    "name": {
      "ja": "手作り月海老ケーキの炭火焼き",
      "vi": "Bánh trung thu nướng than thủ công",
      "ko": "숯불구이 수제 달새우떡",
      "th": "ขนมไหว้พระจันทร์ทำมือย่างถ่าน",
      "zh": "碳烤手工月亮蝦餅",
      "en": "Charcoal Grilled Handmade Moon Shrimp Cake"
    },
    "containsBeef": false,
    "price": 320,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Nếu bạn chưa từng thử bánh tôm trung thu nướng than thì nhất định phải thử nhé! Nước chấm sẽ được bao gồm -> bánh tôm được làm thủ công gồm có tôm, nhân hải sản và chả cá, có hương vị hảo hạng",
      "ja": "炭火焼月海老餅をまだ食べたことがない方はぜひお試しください！つけだれもついてきます → エビケーキ（手作り）はエビ、魚介餡、かまぼこが入っており、一級品の味わいです",
      "th": "ใครยังไม่เคยลองขนมไหว้พระจันทร์ย่างเตาถ่านต้องลอง! น้ำจิ้มจะรวมอยู่ด้วย -> ทอดมันกุ้ง (ทำมือ) ประกอบด้วยกุ้ง ไส้ทะเล และกะปิ และมีรสชาติชั้นหนึ่ง",
      "ko": "아직 숯불구이 달새우떡을 먹어본 적이 없다면 꼭 드셔보세요! 디핑 소스가 포함됩니다 -> 새우 케이크는 새우, 해산물 충전재 및 어묵이 들어 있으며 (수제) 맛이 일품입니다.",
      "zh": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "recipe": [],
    "category": "seafood",
    "orderIndex": 83
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "orderIndex": 84,
    "category": "noodles",
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "th": "เลือกไข่ 2 ฟองอย่างระมัดระวัง + เมล็ดข้าวโพด Hulk -> ปรุงโดยใช้ไฟอ่อน -> โรยด้วยพริกไทยดำบดสด -> เติมซุปเข้มข้นที่มีกลิ่นหอมของน้ำนมลงในชาม",
      "ko": "계란 2개 + 헐크옥수수 알갱이를 잘 골라서 -> 약불로 익히기 -> 갓 간 흑후추를 뿌리고 -> 우유향이 가득한 진한 국물 한 그릇 완성",
      "vi": "Cẩn thận chọn 2 quả trứng + hạt ngô Hulk -> Nấu trên lửa chậm -> Rắc hạt tiêu đen mới xay -> Hoàn thành một bát súp đậm đà thơm mùi sữa",
      "ja": "卵2個＋ハルクコーン粒を厳選 → 弱火でじっくり煮込む → 挽きたての黒胡椒を振る → ミルキーな香りが広がる濃厚なスープの完成"
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 160,
    "isNotSpicy": true,
    "name": {
      "zh": "奶香火腿玉米濃湯",
      "en": "Creamy Ham & Sweet Corn Soup",
      "ko": "크림 햄과 옥수수 수프",
      "th": "ครีมแฮมและซุปข้าวโพด",
      "ja": "ハムとコーンのクリーミースープ",
      "vi": "Súp kem ngô và giăm bông"
    },
    "available": true,
    "id": "dish-2208071816553"
  },
  {
    "customAddOns": [
      {
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "vi": "Thêm phở",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "ko": "사진 추가"
        },
        "price": 20,
        "id": "addon-1784479887987-726"
      },
      {
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ja": "ビーフンを加えます",
          "vi": "Thêm bún",
          "ko": "쌀국수 추가",
          "th": "ใส่เส้นก๋วยเตี๋ยว"
        },
        "price": 20,
        "id": "addon-1784479890262-993"
      },
      {
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "id": "addon-1784479892347-500",
        "price": 140
      }
    ],
    "containsPork": false,
    "category": "tomyum",
    "orderIndex": 85,
    "recipe": [],
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "道地泰式風味湯，濃郁湯底暖心暖胃 \n配料:蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
      "en": "Authentic Thai soup, rich broth to warm your heart and stomach. Ingredients: shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
      "ko": "정통 타이식 수프, 진한 국물이 몸과 마음을 따뜻하게 해줍니다. 재료: 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
      "ja": "本格タイ風スープ、濃厚なスープが心も体も温めます。具材：エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
      "th": "ต้มยำรสต้นตำรับไทย น้ำซุปเข้มข้นอุ่นทั้งกายและใจ ส่วนผสม: กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
      "vi": "Món súp chuẩn vị Thái, nước dùng đậm đà làm ấm lòng người. Thành phần: tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải."
    },
    "containsSeafood": true,
    "containsBeef": false,
    "price": 260,
    "isNotSpicy": false,
    "name": {
      "zh": "海鮮冬蔭功湯",
      "en": "Seafood Tom Yum Soup",
      "ko": "해산물 똠얌꿍",
      "ja": "海鮮 トムヤムクン",
      "th": "ต้มยำทะเล",
      "vi": "Súp Tom Yum Hải Sản"
    },
    "available": true,
    "id": "dish-2207122341556",
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "id": "addon-1784479915298-709",
        "price": 20,
        "name": {
          "ko": "사진 추가",
          "th": "เพิ่มโพธิ์",
          "ja": "フォーを追加",
          "vi": "Thêm phở",
          "zh": "加河粉",
          "en": "Add pho"
        }
      },
      {
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）"
        },
        "id": "addon-1784479917660-34",
        "price": 140
      }
    ],
    "name": {
      "ja": "ベトナムの新鮮な牛肉のフォー",
      "vi": "Phở bò tươi Việt Nam",
      "ko": "베트남산 신선한 쇠고기 포",
      "th": "เฝอเนื้อสดเวียดนาม",
      "zh": "越南鮮牛肉河粉",
      "en": "Vietnamese Fresh Beef Pho Noodle Soup"
    },
    "isNotSpicy": true,
    "id": "dish-2207122341013",
    "available": true,
    "containsSeafood": false,
    "price": 250,
    "containsBeef": true,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Nước súp ngọt ngọt (xương và rau được luộc trong 3 giờ. Không phải súp bột ngọt. Số lượng giới hạn 14 suất mỗi ngày và sẽ bán hết.) Các lát thịt được làm từ loại thịt thăn vai mềm của Mỹ tuyển chọn! Nguyên liệu: Cô gái Hoa lục, hành tây, hành lá, chùa chín tầng, tiêu đen, giá đỗ và bún.",
      "ja": "スープは甘めの甘め（骨と野菜を3時間煮込んでいます。MSGスープではありません。1日14食限定、売り切れ次第終了です。） 肉スライスはアメリカ産の柔らかい肩ヒレ肉特選グレードを使用！材料:中国大陸の女の子、玉ねぎ、ねぎ、九重塔、黒胡椒、もやし、ビーフン。",
      "th": "ซุปมีรสหวานอมหวาน (ต้มกระดูกและผักเป็นเวลา 3 ชั่วโมง ไม่ใช่ซุปผงชูรส จำกัดเพียง 14 มื้อต่อวันและจะขายหมด) เนื้อชิ้นทำจากเนื้อสันในอเมริกาเกรดคัดสรร! ส่วนผสม: เด็กหญิงจีนแผ่นดินใหญ่ หัวหอม ต้นหอม เจดีย์เก้าชั้น พริกไทยดำ ถั่วงอก และเส้นหมี่",
      "ko": "국물은 달큰하고 (뼈와 야채를 3시간 끓여서 만든 국물입니다. MSG 국물이 아닙니다. 하루 14인분 한정이며 품절됩니다.) 고기조각은 미국산 안심 안심 쇠고기 초이스 등급으로 만듭니다! 재료: 중국 본토녀, 양파, 쪽파, 구층탑, 후추, 콩나물, 쌀국수.",
      "zh": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
      "en": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "hasNoodlesOption": false,
    "category": "noodles",
    "orderIndex": 86
  },
  {
    "description": {
      "zh": "洗選雞蛋2顆+海帶芽~外食族補充膳食纖維白質的好選擇",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
      "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง"
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "category": "noodles",
    "orderIndex": 87,
    "name": {
      "ja": "海苔とたまごのスープ",
      "vi": "Súp Rong Biển Trứng",
      "ko": "김 계란국",
      "th": "ซุปสาหร่ายไข่นุ่ม",
      "zh": "紫菜蛋花湯",
      "en": "Seaweed & Egg Drop Soup"
    },
    "isNotSpicy": true,
    "available": true,
    "id": "dish-2207122338495",
    "containsPork": false,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90
  },
  {
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
      "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
      "zh": "每日早市新鮮採買~新鮮蛤蠣搭配蔥薑絲九層塔!越簡單越耐人尋味",
      "en": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "category": "noodles",
    "orderIndex": 88,
    "id": "dish-2207122336248",
    "available": true,
    "isNotSpicy": true,
    "name": {
      "ja": "新鮮アサリと生姜のクリアスープ",
      "vi": "Canh Nghêu Tươi Nấu Gừng Húng Quế",
      "ko": "신선한 바지락 생강 조개탕",
      "th": "ซุปหอยตลับสดใส่ขิงและโหระพา",
      "zh": "鮮味蛤蜊湯",
      "en": "Fresh Clam Soup w/ Ginger"
    },
    "price": 150,
    "containsBeef": false,
    "containsSeafood": true,
    "containsPork": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "recipe": [],
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
    },
    "orderIndex": 89,
    "category": "cat-7cvvkq",
    "isNotSpicy": true,
    "name": {
      "ja": "金メダル",
      "vi": "huy chương vàng",
      "ko": "금메달",
      "th": "เหรียญทอง",
      "zh": "金牌",
      "en": "Taiwan Gold Medal Beer"
    },
    "available": true,
    "id": "dish-2207122331502",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 100
  },
  {
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ."
    },
    "hasNoodlesOption": false,
    "category": "cat-7cvvkq",
    "orderIndex": 90,
    "name": {
      "zh": "金樽",
      "en": "Gold Draft Beer",
      "th": "ถ้วยทอง",
      "ko": "황금 컵",
      "vi": "cúp vàng",
      "ja": "黄金の杯"
    },
    "isNotSpicy": true,
    "id": "dish-2207122330338",
    "available": true,
    "containsSeafood": false,
    "price": 150,
    "containsBeef": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "category": "drinks",
    "orderIndex": 91,
    "description": {
      "ja": "冷たくさわやか、BBQに最高の組み合わせ",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng",
      "ko": "시원하고 상쾌한 음료로 바베큐와 완벽한 조화",
      "th": "เย็นชื่นใจ รสสดชื่น เข้ากับบาร์บีคิวได้อย่างลงตัว",
      "zh": "肥仔的快樂水~搭配燒烤絕配!",
      "en": "Refreshing and cool, a perfect match for BBQ"
    },
    "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400",
    "containsBeef": false,
    "price": 90,
    "containsPork": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-2207122323590",
    "name": {
      "th": "โคคา-โคล่า",
      "ko": "코카콜라",
      "vi": "Coca-Cola",
      "ja": "コカ・コーラ",
      "zh": "可口可樂",
      "en": "Coca-Cola"
    },
    "isNotSpicy": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90,
    "isNotSpicy": true,
    "name": {
      "ja": "タイミルクティー 400ml",
      "vi": "Trà sữa Thái 400ml",
      "ko": "타이 밀크티 400ml",
      "th": "ชานมไทย 400มล",
      "zh": "泰式奶茶400ml",
      "en": "Signature Thai Iced Milk Tea (400ml)"
    },
    "available": true,
    "id": "dish-2207122322371",
    "orderIndex": 92,
    "category": "drinks",
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "진한 차 향이 나는 클래식 핸드라벨 태국 우유~ 상큼하고 상큼한~ 시그니처!",
      "th": "นมไทยฉลากมือสุดคลาสสิค กลิ่นหอมชาเข้มข้น ~ สดชื่น สดชื่น ~ ซิกเนเจอร์!",
      "ja": "紅茶の香りが強い定番の手ラベルタイミルク～爽やかさわやか～の代表作！",
      "vi": "Sữa Thái được dán nhãn thủ công cổ điển với hương trà đậm đà ~ sảng khoái và sảng khoái ~ đặc trưng!"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400"
  },
  {
    "orderIndex": 93,
    "category": "cat-zene8j",
    "hasNoodlesOption": false,
    "description": {
      "zh": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ja": "朝天山椒、生姜、ニンニクの千切りを炒めました～保存料無添加で美味しいです！住宅購入時は要冷蔵",
      "vi": "Xào tiêu Chaotian, gừng và tỏi băm nhỏ ~ thơm ngon và không thêm chất bảo quản! Cần bảo quản tủ lạnh khi mua nhà",
      "ko": "차오티안 고추와 다진 생강, 마늘을 볶은 요리~ 맛있고 방부제도 넣지 않았습니다! 집 구입시 냉장보관 필수",
      "th": "ผัดพริกเผาขิงและกระเทียมฝอย ~ อร่อยไม่ใส่สารกันบูด! ต้องแช่เย็นเมื่อซื้อกลับบ้าน"
    },
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": 160,
    "containsSeafood": false,
    "id": "dish-2207122316233",
    "available": true,
    "isNotSpicy": false,
    "name": {
      "vi": "Tương ớt đặc biệt (mang đi)",
      "ja": "特製チリソース（持ち帰り）",
      "th": "น้ำพริกสูตรพิเศษ (ทูโก)",
      "ko": "특제 칠리소스(테이크아웃)",
      "zh": "特製辣椒醬(外帶)",
      "en": "House Special Chili Sauce (Takeout Jar)"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "containsSeafood": false,
    "price": 0,
    "containsBeef": false,
    "name": {
      "th": "ซอสเขียวไทย",
      "ko": "태국 그린 소스",
      "vi": "Nước sốt xanh Thái",
      "ja": "タイのグリーンソース",
      "zh": "泰式綠醬",
      "en": "Thai Seafood Green Chili Sauce"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2207122312525",
    "category": "cat-zene8j",
    "orderIndex": 94,
    "recipe": [],
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。"
    },
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false
  },
  {
    "containsSeafood": false,
    "price": 0,
    "containsBeef": false,
    "name": {
      "zh": "泰式紅醬",
      "en": "Thai BBQ Red Chili Sauce",
      "th": "น้ำแดงไทย",
      "ko": "태국식 빨간 소스",
      "vi": "Nước sốt đỏ Thái",
      "ja": "タイのレッドソース"
    },
    "isNotSpicy": false,
    "id": "dish-2207122311467",
    "available": true,
    "orderIndex": 95,
    "category": "cat-zene8j",
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。"
    },
    "hasNoodlesOption": false,
    "containsPork": false,
    "customAddOns": []
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "orderIndex": 96,
    "category": "veggies",
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "又稱作敏豆，口感清甜、富含營養且低熱量",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ja": "敏感豆とも呼ばれ、甘くて栄養が豊富でカロリーが低いです。",
      "vi": "Còn được gọi là đậu nhạy cảm, chúng có vị ngọt, giàu chất dinh dưỡng và ít calo.",
      "ko": "민감한 콩이라고도 알려진 이 콩은 맛이 달콤하고 영양분이 풍부하며 칼로리가 낮습니다.",
      "th": "เรียกอีกอย่างว่าถั่วที่ละเอียดอ่อน มีรสหวาน อุดมไปด้วยสารอาหารและมีแคลอรีต่ำ"
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2207122252395",
    "available": true,
    "name": {
      "zh": "四季豆",
      "en": "Charcoal Grilled Green Beans",
      "ja": "フランス豆",
      "vi": "Đậu pháp",
      "ko": "프랑스산 콩",
      "th": "ถั่วฝรั่งเศส"
    },
    "isNotSpicy": false
  },
  {
    "description": {
      "zh": "新竹人氣丸子~大人小孩都愛",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "신주의 인기 미트볼~어른도 아이도 좋아하는",
      "th": "ลูกชิ้นยอดนิยมในซินจู๋ ~ ถูกใจทั้งเด็กและผู้ใหญ่",
      "ja": "新竹で人気のミートボール ～大人も子供も大好き",
      "vi": "Món thịt viên nổi tiếng ở Tân Trúc ~ được cả người lớn và trẻ em yêu thích"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "orderIndex": 97,
    "category": "skewers",
    "available": true,
    "id": "dish-2207122141316",
    "isNotSpicy": false,
    "name": {
      "th": "ซินจู๋ กงวาน",
      "ko": "신주공완",
      "vi": "Tân Trúc Gongwan",
      "ja": "新竹公湾",
      "zh": "新竹貢丸",
      "en": "Hsinchu Pork Meatballs"
    },
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "customAddOns": [],
    "containsPork": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "hasNoodlesOption": false,
    "description": {
      "zh": "烤甜不辣，口感Q彈紮實!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "구워서 달콤하면서도 맵지 않고 쫄깃한 식감!",
      "th": "คั่วหวานแต่ไม่เผ็ด เนื้อเคี้ยวหนึบ!",
      "ja": "炙ってあり、甘いけど辛くなく、モチモチとした食感！",
      "vi": "Rang, ngọt nhưng không cay, dai dai!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "orderIndex": 98,
    "category": "seafood",
    "available": true,
    "id": "dish-2207122140364",
    "name": {
      "zh": "澎澎甜不辣",
      "en": "Chewy Charcoal Grilled Fish Cakes",
      "vi": "Peng Peng ngọt hay cay?",
      "ja": "ペンペンは甘いですか、それとも辛いですか?",
      "th": "เป้งเป้งหวานหรือเผ็ดคะ?",
      "ko": "펭펭은 달달한가요, 아니면 매운가요?"
    },
    "isNotSpicy": false,
    "containsBeef": false,
    "price": 80,
    "containsSeafood": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "seafood",
    "orderIndex": 99,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "嚴選日本鯖甘魚下巴，炭火鹽烤，油脂豐厚，肉質細嫩極富彈性。",
      "en": "Strictly selected Japanese yellowtail collar, salt-grilled over charcoal. Rich in healthy oils with tender and bouncy meat.",
      "ko": "엄선된 일본식 방어 턱밑살을 숯불에 소금구이했습니다. 풍부한 기름기와 부드럽고 탄력 있는 살코기가 일품입니다.",
      "ja": "厳選された日本産ブリカマを炭火で塩焼きに。脂がたっぷりのっており、身は引き締まって柔らかくジューシーです。",
      "th": "คางปลาฮามาจิญี่ปุ่นย่างเกลือด้วยเตาถ่าน เนื้อปลานุ่มแน่นและชุ่มฉ่ำด้วยไขมันปลาชั้นดี",
      "vi": "Má đùi cá cam Nhật tuyển chọn nướng muối than hoa, lớp mỡ béo ngậy cùng thịt cá mềm ngọt thơm ngon."
    },
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 390,
    "containsBeef": false,
    "containsSeafood": true,
    "id": "dish-2207122132048",
    "available": true,
    "name": {
      "zh": "鯖甘魚下巴",
      "en": "Japanese Yellowtail Collar (Hamachi Kama)",
      "ko": "일본산 방어 턱밑살 구이 (하마치 카마)",
      "ja": "ブリカマ塩焼き",
      "th": "คางปลาฮามาจิญี่ปุ่นย่างเกลือ",
      "vi": "Má đùi cá cam Nhật nướng (Hamachi Kama)"
    },
    "isNotSpicy": true,
    "isTakeoutAvailable": true
  },
  {
    "orderIndex": 100,
    "category": "skewers",
    "hasNoodlesOption": false,
    "description": {
      "zh": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "vi": "Phải đặt hàng! Phải đặt hàng! Phải đặt hàng! Mới mua ngoài chợ lúc sáng -> Rửa sạch và ướp với sốt Thái độc quyền",
      "ja": "必ず注文してください！必ず注文してください！必ず注文してください！朝市場から仕入れた新鮮→洗って特製タイソースに漬け込む",
      "ko": "주문해야합니다! 주문해야합니다! 주문해야합니다! 아침에 마트에서 구매한 신선한 재료 -> 씻어서 태국 전용 소스에 재워둡니다",
      "th": "ต้องสั่ง! ต้องสั่ง! ต้องสั่ง! ซื้อสดๆจากตลาดตอนเช้า -> ล้างและหมักด้วยน้ำจิ้มสูตรเฉพาะของไทย"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "containsBeef": false,
    "price": 160,
    "containsSeafood": false,
    "id": "dish-2207122058577",
    "available": true,
    "name": {
      "zh": "招牌泰式烤雞翅(4入)",
      "en": "Signature Thai BBQ Chicken Wings (4pcs)",
      "ko": "시그니처 타이 그릴드 치킨 윙(4개)\n--​​-\n태국산 수제 쇠고기",
      "th": "ปีกไก่ย่างซิกเนเจอร์ (4 ชิ้น)\n---​​-\nเนื้อไทยทำมือ",
      "vi": "Cánh gà nướng kiểu Thái đặc trưng (4 miếng)\n--​-\nThịt bò thủ công Thái Lan",
      "ja": "タイ風手羽先のグリル（4本）\n-- -\nタイの手作り牛肉"
    },
    "isNotSpicy": false,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "available": true,
    "id": "dish-2207122056269",
    "isNotSpicy": false,
    "name": {
      "zh": "泰式手工牛肉",
      "en": "Handmade Thai Spiced Beef Skewer",
      "ja": "潮吹きソーセージ",
      "vi": "xúc xích mực",
      "ko": "스쿼트 소시지",
      "th": "ไส้กรอกฉีด"
    },
    "containsBeef": true,
    "price": 90,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "전용 꼬치!!! 일일 수제 한정판~ 국내산 쇠고기를 사용하고 각종 태국 향신료에 절인 후 -> 고기를 쫄깃쫄깃해질 때까지 다진 뒤 윤린땅콩을 섞어 무기술, 아주 생기 넘치는 천연수공예품!",
      "th": "สเต๊กพิเศษ!!! สินค้าทำมือรายวัน รุ่นลิมิเต็ด อิดิชั่น ~ ใช้เนื้อท้องถิ่นหมักด้วยเครื่องเทศไทยนานาชนิด -> สับเนื้อให้เหนียวแล้วผสมถั่วลิสงหยุนลิน ไม่ใช้เทคโนโลยี มีชีวิตชีวามาก เป็นงานฝีมือจากธรรมชาติทั้งหมด!",
      "ja": "特製串！毎日の手作り限定版〜地元の牛肉を使用し、さまざまなタイのスパイスで漬け込みます -> 肉を粘りが出るまで刻み、雲林ピーナッツを混ぜます、テクノロジーは使用せず、非常に生き生きとした、すべて天然の手作りです！",
      "vi": "Xiên độc quyền!!! Phiên bản giới hạn thủ công hàng ngày ~ Sử dụng thịt bò địa phương và ngâm với nhiều loại gia vị Thái -> Cắt thịt cho đến khi dẻo rồi trộn vào đậu phộng Yunlin, không cần công nghệ, rất sống động, tất cả đều là thủ công tự nhiên!"
    },
    "recipe": [],
    "orderIndex": 101,
    "category": "skewers"
  },
  {
    "customAddOns": [],
    "containsPork": true,
    "category": "skewers",
    "orderIndex": 102,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "ja": "高尚な形容詞は一切ない ～ただストレートな美味しさだけ～ 台湾スナックの代表格",
      "vi": "Không có tính từ cao cả nào ~ chỉ có độ ngon trực tiếp nhất ~ đại diện cho món ăn nhẹ của Đài Loan",
      "ko": "고상한 형용사는 없다~가장 직접적인 맛만~대만과자 대표",
      "th": "ไม่มีคำคุณศัพท์ที่สูงส่ง ~ มีแต่ความอร่อยที่ตรงที่สุดเท่านั้น ~ เป็นตัวแทนของขนมไต้หวัน",
      "zh": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "containsSeafood": false,
    "price": 60,
    "containsBeef": false,
    "name": {
      "zh": "噴水香腸",
      "en": "Juicy Taiwanese Pork Sausage",
      "vi": "da gà gặm",
      "ja": "鶏の皮をかじった",
      "th": "หนังไก่แทะ",
      "ko": "갉아먹힌 닭 껍질"
    },
    "isNotSpicy": false,
    "id": "dish-2207122053275",
    "available": true
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "skewers",
    "orderIndex": 103,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than củi, chất béo được giảm bớt ~ và chuyển thành kết cấu giòn hấp dẫn!",
      "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂が減り、カリッとした食感が魅力的！",
      "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันก็ลดลง~ และกลายเป็นเนื้อกรอบที่น่าหลงใหล!",
      "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 줄어들고~ 바삭바삭한 식감이 매력으로 변신!",
      "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "hasNoodlesOption": false,
    "containsSeafood": false,
    "price": 60,
    "containsBeef": false,
    "isNotSpicy": false,
    "name": {
      "zh": "啃的雞皮",
      "en": "Crispy Charcoal Grilled Chicken Skin",
      "vi": "Đùi gà nướng không xương kiểu Thái",
      "ja": "タイ風骨なし鶏もも肉のグリル",
      "th": "สะโพกไก่ย่างไร้กระดูกแบบไทย",
      "ko": "태국식 뼈없는 구운 닭다리살"
    },
    "id": "dish-2207122051592",
    "available": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "isNotSpicy": false,
    "name": {
      "zh": "泰式去骨烤雞腿",
      "en": "Thai Boneless Grilled Chicken Leg",
      "ko": "타이 순살 구운 닭다리",
      "ja": "タイ風骨なしローストチキンレッグ",
      "th": "น่องไก่ย่างไร้กระดูกสไตล์ไทย",
      "vi": "Đùi Gà Nướng Rút Xương Kiểu Thái"
    },
    "available": true,
    "id": "dish-2207122037251",
    "containsSeafood": false,
    "price": 160,
    "containsBeef": false,
    "recipe": [],
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "去骨雞腿排以泰式香料醃製，外皮烤至金黃，肉質鮮嫩多汁，香氣十足。",
      "en": "Boneless chicken leg marinated with Thai spices, grilled to a golden brown. Tender, juicy, and full of flavor.",
      "ko": "타이 향신료로 재운 순살 닭다리살을 노릇노릇하게 구워냈습니다. 부드럽고 육즙이 가득하며 향긋합니다.",
      "ja": "タイのスパイスでマリネした骨なし鶏もも肉を黄金色に焼き上げました。柔らかくジューシーで香り豊かです。",
      "th": "สะโพกไก่เลาะกระดูกหมักเครื่องเทศไทย ย่างจนเหลืองกรอบ เนื้อนุ่มชุ่มฉ่ำ หอมกรุ่น",
      "vi": "Đùi gà rút xương ướp gia vị Thái Lan, nướng chín vàng, thịt mềm ngọt mọng nước, thơm lừng."
    },
    "hasNoodlesOption": false,
    "orderIndex": 104,
    "category": "skewers",
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [
      {
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）"
        },
        "id": "addon-1784480168973-5",
        "price": 140
      }
    ],
    "name": {
      "vi": "Mì khô mama hải sản Thái Lan chính hãng (cay)",
      "ja": "本格タイシーフードドライママヌードル（辛口）",
      "th": "บะหมี่แห้งมาม่าทะเลไทยแท้ (เผ็ด)",
      "ko": "정통 태국 해산물 드라이마마 누들(매운맛)",
      "zh": "道地泰式海鮮乾拌mama麵（辣）",
      "en": "Seafood MAMA Noodles"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-2005282340194",
    "containsSeafood": true,
    "price": 190,
    "containsBeef": false,
    "recipe": [],
    "description": {
      "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยร้อนๆ <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: กุ้งสด, ปลาหมึกแหวน, ลูกชิ้นปลาคอด, ลูกชิ้นหมู, ปลาญี่ปุ่น, หัวหอม, แครอทฝอย, แตงกวา และกะหล่ำปลี!",
      "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료: 신선한 새우, 오징어 링, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 양파, 채 썬 당근, 오이, 양배추!",
      "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua cay <Không thích thì không gọi> Thành phần: tôm tươi, mực khoanh, cá tuyết viên, thịt heo viên, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột và bắp cải!",
      "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸っぱい前菜 ＜苦手な方はご遠慮ください＞ 材料：新鮮なエビ、イカリング、タラ団子、豚団子、魚の盛り合わせ、玉ねぎ、人参の千切り、キュウリ、キャベツ！"
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "orderIndex": 105,
    "category": "tomyum"
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-1909192003211",
    "isNotSpicy": false,
    "name": {
      "zh": "爆汁杏鮑菇",
      "en": "Juicy King Oyster Mushroom Skewer",
      "ja": "爆裂キングヒラタケ",
      "vi": "Nấm Sò Vua Nổ",
      "ko": "터진 새송이버섯",
      "th": "เห็ดนางรมราชาระเบิด"
    },
    "orderIndex": 106,
    "category": "veggies",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "vi": "Ngon và ngon ngọt ~ Kết cấu của nấm sò ~ Hương vị của nấm sò vua giống như thịt gà",
      "ja": "ジューシーで美味しい〜エリンギの食感〜エリンギの味は鶏肉に似ています",
      "th": "อร่อยและชุ่มฉ่ำ ~ เนื้อสัมผัสของเห็ดนางรม ~ รสชาติของเห็ดนางรมหลวงก็เหมือนไก่",
      "ko": "맛있고 육즙이 풍부해요~ 느타리버섯의 식감~ 새송이버섯의 맛은 닭고기와 비슷해요"
    },
    "hasNoodlesOption": false,
    "recipe": []
  },
  {
    "hasNoodlesOption": false,
    "description": {
      "zh": "去骨去刺秋刀魚，填入明太子，口感一流!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "vi": "Cá thu đao không xương và không xương, nhồi mentaiko, có vị rất ngon!",
      "ja": "骨と背骨のないさんまに明太子を詰めて食べると美味しいですよ！",
      "th": "ปลาซันไรย์ไม่มีกระดูกและไร้กระดูกสันหลังสอดไส้เมนไทโกะ รสชาติเยี่ยมมาก!",
      "ko": "뼈도 없고 가시도 없는 꽁치를 멘타이코로 채워 맛이 좋습니다!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "recipe": [],
    "category": "seafood",
    "orderIndex": 107,
    "available": true,
    "id": "dish-1909191959076",
    "name": {
      "ja": "明太子さんま（骨抜き）2p",
      "vi": "Cá thu đao Mentaiko (đã bỏ xương) 2p",
      "ko": "멘타이코 꽁치(뼈제거) 2p",
      "th": "Mentaiko saury (เอากระดูกออก) 2p",
      "zh": "明太子秋刀魚(去刺)2p",
      "en": "Deboned Pacific Saury Stuffed w/ Mentaiko (2pcs)"
    },
    "isNotSpicy": true,
    "containsBeef": false,
    "price": 320,
    "containsSeafood": true,
    "customAddOns": [],
    "containsPork": false
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "veggies",
    "orderIndex": 108,
    "recipe": [],
    "description": {
      "zh": "新鮮大香菇刷上特製醬汁炭烤，鎖住香菇鮮甜多汁的原始美味。",
      "en": "Fresh large shiitake mushrooms brushed with special sauce and charcoal grilled to retain their sweet, juicy natural taste.",
      "ko": "신선하고 커다란 표고버섯에 특제 소스를 발라 숯불에 구워, 버섯 고유의 촉촉하고 달콤한 풍미를 가두었습니다.",
      "ja": "新鮮な大ぶり椎茸に特製タレを塗って炭火焼きに。椎茸のみずみずしい甘みと旨味をぎゅっと閉じ込めました。",
      "th": "เห็ดหอมสดดอกโตทาซอสสูตรพิเศษย่างเตาถ่าน รสชาติหวานชุ่มฉ่ำตามธรรมชาติ",
      "vi": "Nấm hương tươi cỡ lớn phết sốt đặc chế nướng than hoa, giữ trọn vị ngọt thanh mọng nước tự nhiên của nấm."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "containsSeafood": false,
    "price": 80,
    "containsBeef": false,
    "name": {
      "zh": "香菇",
      "en": "Charcoal Grilled Shiitake Mushrooms",
      "ko": "표고버섯 구い",
      "ja": "しいたけ焼き",
      "th": "เห็ดหอมย่าง",
      "vi": "Nấm hương nướng than hoa"
    },
    "isNotSpicy": false,
    "available": true,
    "id": "dish-1909191946205",
    "isTakeoutAvailable": true
  },
  {
    "containsPork": false,
    "customAddOns": [],
    "available": true,
    "id": "dish-1909191945086",
    "isNotSpicy": false,
    "name": {
      "ko": "피망",
      "th": "พริกเขียว",
      "ja": "ピーマン",
      "vi": "tiêu xanh",
      "zh": "青椒",
      "en": "Charcoal Grilled Green Bell Pepper"
    },
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "vi": "Ớt xanh là loại rau có hàm lượng vitamin C cao, cao hơn cả cam và liễu thái hạt lựu ở cùng trọng lượng!",
      "ja": "ピーマンはビタミンCが豊富な野菜で、同じ重量のオレンジや角切りのヤナギよりも多く含まれています。",
      "th": "พริกเขียวเป็นผักที่มีวิตามินซีสูง สูงกว่าส้ม และหลิวหั่นเต๋าในน้ำหนักเท่ากัน!",
      "ko": "풋고추는 같은 무게의 오렌지와 버드나무보다 비타민C 함량이 높은 채소입니다!",
      "zh": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "veggies",
    "orderIndex": 109
  },
  {
    "containsPork": true,
    "customAddOns": [],
    "available": true,
    "id": "dish-1909191943297",
    "name": {
      "ko": "엄선된 크리스피 소시지",
      "th": "ไส้กรอกกรอบคัดพิเศษ",
      "ja": "厳選クリスピーソーセージ",
      "vi": "Xúc Xích Giòn Tuyển Chọn",
      "zh": "精選香酥肥腸",
      "en": "Crispy Charcoal Grilled Pork Intestine"
    },
    "isNotSpicy": false,
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite."
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "category": "skewers",
    "orderIndex": 110
  },
  {
    "customAddOns": [],
    "containsPork": false,
    "category": "skewers",
    "orderIndex": 111,
    "recipe": [],
    "hasNoodlesOption": false,
    "description": {
      "zh": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "th": "ซี่โครงเนื้อที่ได้สัดส่วนกำลังดีจะถูกย่างด้านนอกและด้านในเป็นสีชมพู การได้กัดสักคำถือเป็นความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ!",
      "ko": "완벽한 비율의 소갈비살은 겉은 그을리고 속은 핑크빛을 띕니다. 한입 먹는 것이 입맛을 돋우는 최고의 즐거움입니다!",
      "vi": "Những miếng sườn bò có tỷ lệ hoàn hảo được nướng chín bên ngoài và hồng hào bên trong. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn!",
      "ja": "絶妙なバランスの牛カルビは、外は炙り、中はピンク色に焼き上げられています。一口食べると、味覚にとって最高の楽しみが得られます。"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "containsSeafood": false,
    "containsBeef": true,
    "price": 70,
    "name": {
      "ja": "ビーフリブのグリル（オーストラリア産牛肉）",
      "vi": "Sườn bò nướng (bò Úc)",
      "ko": "구운 쇠고기 갈비(호주산 쇠고기)",
      "th": "ซี่โครงเนื้อย่าง (เนื้อออสเตรเลีย)",
      "zh": "極炙原塊牛肋(澳牛)",
      "en": "Prime Australian Beef Rib Skewer"
    },
    "isNotSpicy": false,
    "id": "dish-1909191940395",
    "available": true
  },
  {
    "category": "skewers",
    "orderIndex": 112,
    "description": {
      "zh": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "vi": "Năm xiên gà thịt với Qilixiang ~ không cắt làm đôi! Mới mua ở chợ buổi sáng hàng ngày ~ quay lại hái, rửa sạch và ướp với nước xốt độc quyền!",
      "ja": "七里香入りブロイラー串5本～半分には切れません！毎日朝市で仕入れた新鮮〜摘み取って洗って専用マリネに漬け込んで帰ってきます！",
      "th": "ไก่เนื้อห้าเสียบไม้กับ Qilixiang ~ ไม่ผ่าครึ่ง! ซื้อสดใหม่ที่ตลาดเช้าทุกวัน ~ กลับมาถอน ล้าง และหมักด้วยน้ำดองสุดพิเศษ!",
      "ko": "칠리샹을 곁들인 육계 꼬치 5개~ 반으로 쪼개지지 않아요! 매일 아침시장에서 갓 구매한~ 직접 따서 씻어서 전용 양념장에 재워두세요!"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "price": 70,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-1909191316572",
    "available": true,
    "isNotSpicy": false,
    "name": {
      "ja": "ブロイラーチキン キリシャン",
      "vi": "Gà thịt Qilixiang",
      "ko": "육계 치킨 Qilixiang",
      "th": "ไก่เนื้อ Qilixiang",
      "zh": "肉雞七里香",
      "en": "Marinated Chicken Tail Skewers (5pcs)"
    },
    "customAddOns": [],
    "containsPork": false
  },
  {
    "containsPork": true,
    "customAddOns": [],
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "available": true,
    "id": "dish-1909191310334",
    "name": {
      "zh": "香菜豬肉捲",
      "en": "Pork Roll with Cilantro",
      "ko": "고수 삼겹살말이",
      "ja": "パクチー豚肉巻き",
      "th": "หมูสามชั้นพันผักชี",
      "vi": "Ba chỉ heo cuộn rau mùi (ngò rí)"
    },
    "isNotSpicy": false,
    "category": "skewers",
    "orderIndex": 113,
    "description": {
      "zh": "精選豬五花包裹新鮮香菜，炭火烤出油脂香氣，喜愛香菜者的必點美味。",
      "en": "Premium pork belly wrapped around fresh cilantro (coriander), grilled over charcoal to aromatic perfection. A must-try for cilantro lovers.",
      "ko": "엄선된 삼겹살로 신선한 고수를 감싸 숯불에 구워 고소한 고기 기름과 향긋한 고수 향이 어우러집니다. 고수 마니아라면 반드시 맛봐야 할 메뉴.",
      "ja": "厳選された豚バラ肉で新鮮なパクチーを包み、炭火で香ばしく焼き上げました。パクチー好きにはたまらない一品です。",
      "th": "หมูสามชั้นคัดพิเศษพันผักชีสด ย่างเตาถ่านจนส่งกลิ่นหอมละมุน เมนูที่คนรักผักชีห้ามพลาด",
      "vi": "Thịt ba chỉ tuyển chọn cuộn rau mùi tươi, nướng than hoa thơm lừng hòa quyện cùng vị béo của thịt. Món ngon không thể bỏ qua cho tín đồ mê rau mùi."
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "recipe": [],
    "isTakeoutAvailable": true
  }
];

export const INITIAL_INGREDIENTS: any[] = [

  {
    "id": "ig-01",
    "minThreshold": 15,
    "stock": 92,
    "name": {
      "zh": "大鮮蝦",
      "en": "Fresh Prawns",
      "ja": "新鮮なえび",
      "th": "กุ้งแชบ๊วย大",
      "ko": "생새우"
    },
    "unit": "pcs"
  },
  {
    "id": "ig-02",
    "name": {
      "en": "USDA Beef",
      "zh": "頂級牛肉串",
      "ko": "수제 소고기",
      "ja": "厳選牛肉串",
      "th": "เนื้อวัวพรีเมียม"
    },
    "stock": 99,
    "unit": "skewers",
    "minThreshold": 20
  },
  {
    "id": "ig-03",
    "stock": 100,
    "unit": "kg",
    "name": {
      "zh": "鮮甜高麗菜",
      "en": "Organic Cabbage",
      "ko": "유기농 양배추",
      "ja": "キャベツ",
      "th": "กะหล่ำปลีหวาน"
    },
    "minThreshold": 10
  },
  {
    "id": "ig-04",
    "minThreshold": 8,
    "unit": "pcs",
    "stock": 100,
    "name": {
      "en": "Oysters / Scallops",
      "zh": "生食干貝/生蠔",
      "ko": "석화 굴 및 가리비",
      "th": "หอยนางรมยักษ์/หอยเชลล์",
      "ja": "生牡蠣・干貝"
    }
  },
  {
    "id": "ig-05",
    "name": {
      "en": "Mama / Rice Noodles",
      "zh": "冬蔭功泡麵/米粉",
      "th": "บะหมี่มาม่า/ก๋วยเตี๋ยว",
      "ja": "ラーメン・フォー",
      "ko": "라면 사리"
    },
    "stock": 117,
    "unit": "packs",
    "minThreshold": 25
  },
  {
    "id": "ig-06",
    "minThreshold": 12,
    "stock": 99.75,
    "name": {
      "zh": "頂級椰奶罐",
      "en": "Rich Coconut Milk",
      "ja": "ココナッツミルク缶",
      "th": "กะทิกระป๋องออร์แกนิก",
      "ko": "코코넛 밀크"
    },
    "unit": "cans"
  },
  {
    "id": "ig-07",
    "stock": 100,
    "unit": "liters",
    "minThreshold": 20,
    "name": {
      "th": "ชาแดงตรามือเกรดส่งออก",
      "ja": "タイ茶葉",
      "ko": "홍차 베이스",
      "zh": "泰手標紅茶原料",
      "en": "Thai Red Tea Brew"
    }
  },
  {
    "id": "ig-08",
    "unit": "skewers",
    "stock": 99,
    "name": {
      "zh": "爆香豬五花 / 金針菇",
      "en": "Pork Belly & Enoki",
      "ja": "豚バラ・えのき",
      "th": "หมูสามชั้น/เห็ดเข็มทอง",
      "ko": "돼지 삼겹 및 팽이"
    },
    "minThreshold": 15
  }
];

export const INGREDIENT_RECIPE_MAP: { [foodId: string]: { ingredientId: string; amount: number }[] } = {};

