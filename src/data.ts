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
    "id": "cat-svadcb",
    "name": {
      "zh": "小費及折扣",
      "vi": "Tiền tip & Giảm giá",
      "th": "ทิปและส่วนลด",
      "ja": "チップ・割引",
      "ko": "팁 및 할인",
      "en": "Tips & Discounts"
    },
    "orderIndex": 0,
    "showOnCustomerPage": false
  },
  {
    "id": "cat-7cvvkq",
    "name": {
      "vi": "Đồ uống & Rượu lạnh 🍺",
      "zh": "冰櫃酒水 🧊",
      "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
      "ja": "冷蔵ドリンク・お酒 🍺",
      "en": "Refrigerated Drinks & Alcohol 🍺",
      "ko": "냉장 음료 및 주류 🍺"
    },
    "showOnCustomerPage": false,
    "orderIndex": 1
  },
  {
    "id": "tomyum",
    "showOnCustomerPage": true,
    "orderIndex": 2,
    "name": {
      "ko": "똠얌 수프 시리즈 🍜",
      "en": "Tom Yum Series 🍜",
      "ja": "トムヤムシリーズ 🍜",
      "th": "ชุดต้มยำสุดแซ่บ 🍜",
      "zh": "冬蔭功系列 🍜",
      "vi": "Dòng súp Tom Yum 🍜"
    }
  },
  {
    "id": "noodles",
    "showOnCustomerPage": true,
    "orderIndex": 3,
    "name": {
      "en": "Hot Soups & Beef Pho 🥢",
      "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
      "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
      "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢",
      "vi": "Súp nóng & Phở bò Việt Nam 🥢",
      "zh": "熱湯 🥢越南牛肉河粉"
    }
  },
  {
    "id": "combos",
    "showOnCustomerPage": true,
    "name": {
      "zh": "精選套餐 🍱優惠",
      "vi": "Combo đặc biệt 🍱",
      "th": "เซตเมนูสุดคุ้ม 🍱",
      "ja": "主理人厳選お得セット 🍱",
      "en": "Chef's Special Combos 🍱",
      "ko": "셰프 추천 특선 세트 🍱"
    },
    "orderIndex": 4
  },
  {
    "id": "seafood",
    "name": {
      "vi": "Hải sản nướng Thái Lan 🦐",
      "zh": "招牌泰式海鮮 🦐",
      "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
      "ja": "本格タイ風炭火焼きシーフード 🦐",
      "en": "Signature Thai Seafood 🦐",
      "ko": "시그니처 태국식 해산물 🦐"
    },
    "orderIndex": 5,
    "showOnCustomerPage": true
  },
  {
    "id": "veggies",
    "showOnCustomerPage": true,
    "name": {
      "ja": "地元新鮮野菜焼き 🥬",
      "ko": "신선한 채소 구이 🥬",
      "en": "Farm Fresh Vegetables 🥬",
      "zh": "小農鮮蔬菜 🥬",
      "vi": "Rau củ tươi sạch 🥬",
      "th": "ผักสดฟาร์มย่าง 🥬"
    },
    "orderIndex": 6
  },
  {
    "id": "skewers",
    "orderIndex": 7,
    "showOnCustomerPage": true,
    "name": {
      "ja": "タイ風肉串炭火焼き・その他 🍢",
      "en": "Charcoal BBQ Skewers & Others 🍢",
      "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
      "vi": "Thịt nướng xiên & Khác 🍢",
      "zh": "碳烤肉類 🍢其他",
      "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢"
    }
  },
  {
    "id": "sweets",
    "name": {
      "en": "Thai Desserts & Sweets 🍰",
      "ko": "태국식 달콤 디저트 🍰",
      "ja": "タイ風特製デザート 🍰",
      "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
      "zh": "泰式特色甜品 🍰",
      "vi": "Tráng miệng kiểu Thái 🍰"
    },
    "orderIndex": 8,
    "showOnCustomerPage": true
  },
  {
    "id": "drinks",
    "showOnCustomerPage": true,
    "name": {
      "ja": "タイ風さわやかドリンク 🍹",
      "ko": "태국식 청량 음료 🍹",
      "en": "Refreshing Thai Cold Drinks 🍹",
      "vi": "Đồ uống lạnh kiểu Thái 🍹",
      "zh": "泰特色沁涼飲品 🍹",
      "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹"
    },
    "orderIndex": 9
  },
  {
    "id": "cat-zene8j",
    "showOnCustomerPage": true,
    "name": {
      "ko": "단독 수제 특제 소스 🥫",
      "en": "Exclusive Secret Sauces 🥫",
      "ja": "秘伝の特製タレ・ソース 🥫",
      "th": "ซอสสูตรลับพิเศษ 🥫",
      "zh": "獨家醬料 🥫",
      "vi": "Nước sốt độc quyền 🥫"
    },
    "orderIndex": 10
  },
  {
    "id": "cat-6ovxss",
    "orderIndex": 11,
    "showOnCustomerPage": true,
    "name": {
      "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
      "zh": "成人酒品專區 🔞",
      "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
      "ko": "성인 주류 전용 구역 (18+) 🔞",
      "en": "Adult Alcoholic Beverages (18+) 🔞",
      "ja": "成人向けお酒エリア (18+) 🔞"
    }
  }
];

export const INITIAL_MENU: any[] = [
];

export const INITIAL_INGREDIENTS: any[] = [

  {
    "id": "ig-01",
    "unit": "pcs",
    "name": {
      "zh": "大鮮蝦",
      "th": "กุ้งแชบ๊วย大",
      "ja": "新鮮なえび",
      "en": "Fresh Prawns",
      "ko": "생새우"
    },
    "stock": 92,
    "minThreshold": 15
  },
  {
    "id": "ig-02",
    "unit": "skewers",
    "stock": 99,
    "name": {
      "zh": "頂級牛肉串",
      "th": "เนื้อวัวพรีเมียม",
      "ja": "厳選牛肉串",
      "en": "USDA Beef",
      "ko": "수제 소고기"
    },
    "minThreshold": 20
  },
  {
    "id": "ig-03",
    "stock": 100,
    "unit": "kg",
    "name": {
      "zh": "鮮甜高麗菜",
      "th": "กะหล่ำปลีหวาน",
      "ja": "キャベツ",
      "ko": "유기농 양배추",
      "en": "Organic Cabbage"
    },
    "minThreshold": 10
  },
  {
    "id": "ig-04",
    "unit": "pcs",
    "name": {
      "th": "หอยนางรมยักษ์/หอยเชลล์",
      "zh": "生食干貝/生蠔",
      "en": "Oysters / Scallops",
      "ko": "석화 굴 및 가리비",
      "ja": "生牡蠣・干貝"
    },
    "stock": 100,
    "minThreshold": 8
  },
  {
    "id": "ig-05",
    "stock": 117,
    "minThreshold": 25,
    "unit": "packs",
    "name": {
      "th": "บะหมี่มาม่า/ก๋วยเตี๋ยว",
      "zh": "冬蔭功泡麵/米粉",
      "en": "Mama / Rice Noodles",
      "ko": "라면 사리",
      "ja": "ラーメン・フォー"
    }
  },
  {
    "id": "ig-06",
    "unit": "cans",
    "minThreshold": 12,
    "name": {
      "ja": "ココナッツミルク缶",
      "ko": "코코넛 밀크",
      "en": "Rich Coconut Milk",
      "zh": "頂級椰奶罐",
      "th": "กะทิกระป๋องออร์แกนิก"
    },
    "stock": 99.75
  },
  {
    "id": "ig-07",
    "minThreshold": 20,
    "unit": "liters",
    "stock": 100,
    "name": {
      "zh": "泰手標紅茶原料",
      "th": "ชาแดงตรามือเกรดส่งออก",
      "ja": "タイ茶葉",
      "ko": "홍차 베이스",
      "en": "Thai Red Tea Brew"
    }
  },
  {
    "id": "ig-08",
    "stock": 99,
    "unit": "skewers",
    "minThreshold": 15,
    "name": {
      "ja": "豚バラ・えのき",
      "en": "Pork Belly & Enoki",
      "ko": "돼지 삼겹 및 팽이",
      "zh": "爆香豬五花 / 金針菇",
      "th": "หมูสามชั้น/เห็ดเข็มทอง"
    }
  }
];

export const INGREDIENT_RECIPE_MAP: { [foodId: string]: { ingredientId: string; amount: number }[] } = {};

