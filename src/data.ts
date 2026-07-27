import { Language, Category, MenuItem, Ingredient, Promotion } from './types';

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
        "vi": "Tiền tip & Giảm giá",
        "th": "ทิปและส่วนลด",
        "ja": "チップ・割引",
        "zh": "小費及折扣",
        "en": "Tips & Discounts",
        "ko": "팁 및 할인"
      },
      "id": "cat-svadcb",
      "orderIndex": 0,
      "showOnCustomerPage": false
    },
    {
      "showOnCustomerPage": false,
      "orderIndex": 1,
      "id": "cat-7cvvkq",
      "name": {
        "en": "Refrigerated Drinks & Alcohol 🍺",
        "zh": "冰櫃酒水 🧊",
        "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
        "ja": "冷蔵ドリンク・お酒 🍺",
        "vi": "Đồ uống & Rượu lạnh 🍺",
        "ko": "냉장 음료 및 주류 🍺"
      }
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 2,
      "id": "tomyum",
      "name": {
        "en": "Tom Yum Series 🍜",
        "zh": "冬蔭功系列 🍜",
        "th": "ชุดต้มยำสุดแซ่บ 🍜",
        "ja": "トムヤムシリーズ 🍜",
        "vi": "Dòng súp Tom Yum 🍜",
        "ko": "똠얌 수프 시리즈 🍜"
      }
    },
    {
      "name": {
        "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
        "vi": "Súp nóng & Phở bò Việt Nam 🥢",
        "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
        "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢",
        "en": "Hot Soups & Beef Pho 🥢",
        "zh": "熱湯 🥢越南牛肉河粉"
      },
      "id": "noodles",
      "orderIndex": 3,
      "showOnCustomerPage": true
    },
    {
      "orderIndex": 4,
      "showOnCustomerPage": true,
      "name": {
        "ko": "셰프 추천 특선 세트 🍱",
        "vi": "Combo đặc biệt 🍱",
        "ja": "主理人厳選お得セット 🍱",
        "th": "เซตเมนูสุดคุ้ม 🍱",
        "zh": "精選套餐 🍱優惠",
        "en": "Chef's Special Combos 🍱"
      },
      "id": "combos"
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 5,
      "id": "seafood",
      "name": {
        "vi": "Hải sản nướng Thái Lan 🦐",
        "ja": "本格タイ風炭火焼きシーフード 🦐",
        "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
        "en": "Signature Thai Seafood 🦐",
        "zh": "招牌泰式海鮮 🦐",
        "ko": "시그니처 태국식 해산물 🦐"
      }
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 6,
      "id": "veggies",
      "name": {
        "vi": "Rau củ tươi sạch 🥬",
        "th": "ผักสดฟาร์มย่าง 🥬",
        "ja": "地元新鮮野菜焼き 🥬",
        "zh": "小農鮮蔬菜 🥬",
        "en": "Farm Fresh Vegetables 🥬",
        "ko": "신선한 채소 구이 🥬"
      }
    },
    {
      "orderIndex": 7,
      "showOnCustomerPage": true,
      "name": {
        "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
        "en": "Charcoal BBQ Skewers & Others 🍢",
        "zh": "碳烤肉類 🍢其他",
        "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢",
        "vi": "Thịt nướng xiên & Khác 🍢",
        "ja": "タイ風肉串炭火焼き・その他 🍢"
      },
      "id": "skewers"
    },
    {
      "name": {
        "vi": "Tráng miệng kiểu Thái 🍰",
        "ja": "タイ風特製デザート 🍰",
        "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
        "zh": "泰式特色甜品 🍰",
        "en": "Thai Desserts & Sweets 🍰",
        "ko": "태국식 달콤 디저트 🍰"
      },
      "id": "sweets",
      "orderIndex": 8,
      "showOnCustomerPage": true
    },
    {
      "id": "drinks",
      "name": {
        "zh": "泰特色沁涼飲品 🍹",
        "en": "Refreshing Thai Cold Drinks 🍹",
        "ja": "タイ風さわやかドリンク 🍹",
        "vi": "Đồ uống lạnh kiểu Thái 🍹",
        "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
        "ko": "태국식 청량 음료 🍹"
      },
      "showOnCustomerPage": true,
      "orderIndex": 9
    },
    {
      "orderIndex": 10,
      "showOnCustomerPage": true,
      "name": {
        "en": "Exclusive Secret Sauces 🥫",
        "zh": "獨家醬料 🥫",
        "ja": "秘伝の特製タレ・ソース 🥫",
        "th": "ซอสสูตรลับพิเศษ 🥫",
        "vi": "Nước sốt độc quyền 🥫",
        "ko": "단독 수제 특제 소스 🥫"
      },
      "id": "cat-zene8j"
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 11,
      "id": "cat-6ovxss",
      "name": {
        "ko": "성인 주류 전용 구역 (18+) 🔞",
        "ja": "成人向けお酒エリア (18+) 🔞",
        "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
        "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
        "en": "Adult Alcoholic Beverages (18+) 🔞",
        "zh": "成人酒品專區 🔞"
      }
    }
  ];

export const INITIAL_MENU: any[] = [
    {
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ."
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2696007842576",
      "category": "cat-7cvvkq",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
      "name": {
        "th": "นมถั่วเหลืองไวตามิ้ลค์",
        "ja": "ビタミンミルク豆乳",
        "vi": "Sữa đậu nành Vitamilk",
        "zh": "Vitamilk豆奶",
        "en": "Vitamilk Soy Milk",
        "ko": "비타밀크 두유"
      },
      "orderIndex": 0,
      "hasNoodlesOption": false,
      "available": true,
      "price": 60,
      "isNotSpicy": true,
      "customAddOns": []
    },
    {
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "ko": "기린맥주",
        "vi": "bia kirin",
        "th": "เบียร์คิริน",
        "ja": "キリンビール",
        "en": "Kirin Beer",
        "zh": "麒麟啤酒"
      },
      "price": 150,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 1,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "containsSeafood": false,
      "id": "dish-2606012021064",
      "category": "cat-7cvvkq",
      "recipe": [],
      "description": {
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "containsPork": false
    },
    {
      "containsSeafood": false,
      "id": "dish-2605122152569",
      "category": "cat-7cvvkq",
      "recipe": [],
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
      },
      "containsPork": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "zh": "SPY泰國雞尾酒",
        "en": "SPY Thai Wine Cooler",
        "vi": "Cocktail Thái SPY",
        "th": "สปายไทยค็อกเทล",
        "ja": "スパイタイカクテル",
        "ko": "SPY 타이 칵테일"
      },
      "available": true,
      "price": 110,
      "orderIndex": 2,
      "hasNoodlesOption": false,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400"
    },
    {
      "isAvailable": false,
      "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "hasNoodlesOption": false,
      "orderIndex": 3,
      "price": -10,
      "available": true,
      "name": {
        "en": "Cheese Drink Combo Deal",
        "zh": "乳酪組合價",
        "th": "ราคา คอมโบชีส",
        "vi": "Giá combo phô mai",
        "ja": "チーズコンボの価格",
        "ko": "치즈 콤보 가격"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "containsPork": false,
      "description": {
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
        "ja": "期間限定の超お得な割引パッケージ",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "zh": "超值優惠組合，物超所值，限時享用",
        "en": "Great value combo package, high cost-performance deal for a limited time."
      },
      "recipe": [],
      "category": "cat-svadcb",
      "id": "dish-2603071951301",
      "containsSeafood": false
    },
    {
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "orderIndex": 4,
      "hasNoodlesOption": false,
      "price": 90,
      "available": true,
      "name": {
        "th": "ออสมันตัสชีส",
        "vi": "phô mai Osmanthus",
        "ja": "キンモクセイチーズ",
        "zh": "桂花乳酪",
        "en": "Osmanthus Cheese Drink",
        "ko": "오스만투스 치즈"
      },
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
      },
      "containsPork": false,
      "category": "sweets",
      "id": "dish-2602121900078",
      "containsSeafood": false,
      "recipe": []
    },
    {
      "customAddOns": [],
      "isNotSpicy": true,
      "available": true,
      "price": 390,
      "orderIndex": 5,
      "hasNoodlesOption": false,
      "name": {
        "zh": "原肉板腱牛5oz",
        "en": "Top Blade Steak (5oz)",
        "ja": "原肉板腱牛5oz",
        "vi": "原肉板腱牛5oz",
        "th": "原肉板腱牛5oz",
        "ko": "原肉板腱牛5oz"
      },
      "isTakeoutAvailable": true,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": true,
      "category": "skewers",
      "id": "dish-2602121834434",
      "containsSeafood": false,
      "recipe": [],
      "description": {
        "th": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
        "vi": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
        "ja": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
        "ko": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味"
      },
      "containsPork": false
    },
    {
      "available": true,
      "price": 90,
      "orderIndex": 6,
      "hasNoodlesOption": false,
      "name": {
        "en": "Pandan Cheese Drink",
        "zh": "香斕乳酪",
        "th": "ชีสรสเผ็ด",
        "ja": "スパイシーなチーズ",
        "vi": "Phô mai cay",
        "ko": "매운 치즈"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "sweets",
      "id": "dish-2601312248029",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。"
      }
    },
    {
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "zh": "鮮奶乳酪",
        "en": "Fresh Milk Cheese Drink",
        "ja": "フレッシュミルクチーズ",
        "th": "ชีสนมสด",
        "vi": "phô mai sữa tươi",
        "ko": "신선한 우유 치즈"
      },
      "price": 80,
      "available": true,
      "orderIndex": 7,
      "hasNoodlesOption": false,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
      "id": "dish-2601310009011",
      "containsSeafood": false,
      "category": "sweets",
      "recipe": [],
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ."
      },
      "containsPork": false
    },
    {
      "description": {
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "containsPork": false,
      "category": "sweets",
      "id": "dish-2601310007093",
      "containsSeafood": false,
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "available": true,
      "price": 90,
      "orderIndex": 8,
      "hasNoodlesOption": false,
      "name": {
        "en": "Thai Milk Tea Cheese Drink",
        "zh": "泰式奶茶乳酪",
        "th": "ชานมไทยชีส",
        "vi": "Trà sữa Thái phô mai",
        "ja": "タイのミルクティーチーズ",
        "ko": "태국식 밀크티 치즈"
      }
    },
    {
      "available": true,
      "price": 100,
      "hasNoodlesOption": false,
      "orderIndex": 9,
      "name": {
        "ko": "고장차",
        "vi": "Trà suy sụp",
        "th": "ชาสลาย",
        "ja": "ブレイクダウンティー",
        "zh": "分解茶",
        "en": "Oolong Tea (Decomposing)"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "cat-7cvvkq",
      "id": "dish-2512111741522",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      }
    },
    {
      "containsPork": false,
      "description": {
        "ko": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
        "th": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
        "ja": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
        "vi": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充"
      },
      "recipe": [],
      "category": "seafood",
      "id": "dish-2509281752083",
      "containsSeafood": true,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": true,
      "price": 280,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 10,
      "name": {
        "en": "Thai BBQ Giant Squid (L-Size)",
        "zh": "泰鮮大魷魚(碳烤)",
        "vi": "泰鮮大魷魚(碳烤)",
        "ja": "泰鮮大魷魚(碳烤)",
        "th": "泰鮮大魷魚(碳烤)",
        "ko": "泰鮮大魷魚(碳烤)"
      },
      "customAddOns": [],
      "isNotSpicy": false
    },
    {
      "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "available": true,
      "price": 390,
      "orderIndex": 11,
      "hasNoodlesOption": false,
      "name": {
        "th": "มาม่าปลาหมึกเส้นใหญ่และทะเลแห้งสูตรดั้งเดิมของไทย (รสเผ็ด)",
        "ja": "本場タイの大イカと海鮮のドライママヌードル（辛口）",
        "vi": "Mỳ khô mực lớn và hải sản Thái chính gốc (cay)",
        "en": "Spicy Thai Seafood MAMA Noodles w/ Giant Squid",
        "zh": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
        "ko": "정통 태국식 대오징어와 해산물 건어물 마마면(매운맛)"
      },
      "customAddOns": [
        {
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)"
          },
          "id": "addon-1784478515294-528",
          "price": 140
        }
      ],
      "isNotSpicy": false,
      "containsPork": false,
      "description": {
        "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료 : 엄선한 심해 L사이즈 오징어, 생새우, 오징어(링), 대구볼, 공물볼, 생선살, 양파, 당근채, 오이, 양배추",
        "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸辣湯前菜 ＜苦手な方はご遠慮ください＞ 材料：厳選深海イカLサイズ、活海老、いか（リング）、たらね、貢ぎ玉、国産魚盛り、玉ねぎ、人参千切り、キュウリ、キャベツ",
        "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยเผ็ดร้อน <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: ปลาหมึกทะเลน้ำลึกไซส์ L คัดมาอย่างดี กุ้งสด ปลาหมึก(วงแหวน) ลูกชิ้นปลาคอด ลูกชิ้น ปลาญี่ปุ่น หัวหอม แครอทฝอย แตงกวา กะหล่ำปลี",
        "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua nóng <Đừng gọi nếu bạn không thích> Thành phần: Mực biển cỡ L được lựa chọn cẩn thận, tôm tươi, mực (vòng), cá tuyết viên, bi cống, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột, bắp cải",
        "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
        "en": "Authentic Thai-style soup noodles with rich, warming broth"
      },
      "recipe": [],
      "category": "tomyum",
      "id": "dish-2509271759269",
      "containsSeafood": true
    },
    {
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "orderIndex": 12,
      "hasNoodlesOption": false,
      "available": true,
      "price": 550,
      "name": {
        "vi": "10 xiên da gà",
        "ja": "鶏皮串 10本",
        "th": "หนังไก่เสียบไม้ 10 ชิ้น",
        "zh": "雞皮10串",
        "en": "Grilled Chicken Skin (10 Skewers)",
        "ko": "닭 껍질 꼬치 10개"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "containsPork": false,
      "description": {
        "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂分が減り、カリッとした食感が魅力です",
        "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันจะลดลง~กลายเป็นเนื้อกรอบที่น่าดึงดูด",
        "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than hồng, mỡ được giảm bớt ~ chuyển thành kết cấu giòn hấp dẫn",
        "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 감소~바삭한 식감이 매력"
      },
      "recipe": [],
      "category": "combos",
      "containsSeafood": false,
      "id": "dish-2508252142113"
    },
    {
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": true,
      "isTakeoutAvailable": true,
      "available": true,
      "price": 680,
      "orderIndex": 13,
      "hasNoodlesOption": false,
      "name": {
        "ja": "牛5羊5串",
        "vi": "牛5羊5串",
        "th": "牛5羊5串",
        "en": "Beef & Lamb BBQ Skewers Combo (5 Beef + 5 Lamb)",
        "zh": "牛5羊5串",
        "ko": "牛5羊5串"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "containsPork": false,
      "description": {
        "zh": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "th": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
        "vi": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
        "ja": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
        "ko": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味"
      },
      "recipe": [],
      "category": "combos",
      "containsSeafood": false,
      "id": "dish-2508252141154"
    },
    {
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2508252136150",
      "category": "combos",
      "containsPork": false,
      "description": {
        "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีทอง บีบไขมันส่วนเกินออก แล้วโรยด้วยผงยี่หร่า",
        "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi chín vàng, chắt bớt mỡ thừa rồi rắc bột thì là",
        "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリア産） 炭火で焼き色がつくまで焼き、余分な脂を絞り、クミンパウダーをふりかける",
        "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주산) 숯불에 노릇노릇해질 때까지 굽고, 여분의 지방을 짜내고 큐민가루를 뿌려준다"
      },
      "name": {
        "ko": "사실이다. 양꼬치 10개",
        "ja": "そうです。子羊串 10本",
        "vi": "Đúng. 10 xiên thịt cừu",
        "th": "จริง. เนื้อแกะเสียบไม้ 10 ชิ้น",
        "zh": "真。小羔羊肉10串",
        "en": "Australian Lamb Skewers (10 Skewers)"
      },
      "orderIndex": 14,
      "hasNoodlesOption": false,
      "price": 650,
      "available": true,
      "isNotSpicy": false,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400"
    },
    {
      "price": 650,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 15,
      "name": {
        "vi": "Sườn bò nướng 10 xiên",
        "th": "ซี่โครงเนื้อย่าง 10 ไม้",
        "ja": "牛カルビグリル 10本",
        "zh": "極炙牛肋10串",
        "en": "Beef Rib Skewers (10 Skewers)",
        "ko": "소갈비구이 꼬치 10개"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "containsBeef": true,
      "recipe": [],
      "category": "combos",
      "containsSeafood": false,
      "id": "dish-2508252133258",
      "containsPork": false,
      "description": {
        "ko": "황금 비율의 쇠고기 갈비뼈는 겉은 까맣게 구워지고 속은 분홍색으로 부드러워집니다. 한 입 먹으면 미뢰가 최고의 즐거움을 선사합니다.",
        "th": "ซี่โครงเนื้อสีทองที่ได้สัดส่วนย่างจนเกรียมด้านนอกและด้านในสีชมพูและนุ่ม การกัดเพียงครั้งเดียวคือความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ",
        "vi": "Tỷ lệ vàng của sườn bò được nướng chín bên ngoài và bên trong hồng hào, mềm mại. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn.",
        "ja": "黄金比の牛カルビは、外は焦げ目、中はピンク色に柔らかく焼き上げられています。一口食べると、味覚にとって究極の楽しみが得られます。",
        "zh": "黃金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
      }
    },
    {
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "ja": "恐龍美祿",
        "vi": "恐龍美祿",
        "th": "恐龍美祿",
        "zh": "恐龍美祿",
        "en": "Milo Dinosaur Drink",
        "ko": "恐龍美祿"
      },
      "orderIndex": 16,
      "hasNoodlesOption": false,
      "available": true,
      "price": 90,
      "isTakeoutAvailable": true,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsSeafood": false,
      "id": "dish-2508252009102",
      "category": "drinks",
      "recipe": [],
      "description": {
        "th": "源自星馬地區,在冰美祿上方堆疊大量未溶解美祿粉的經典巧克力冰飲",
        "vi": "源自星馬地區,在冰美祿上方堆疊大量未溶解美祿粉的經典巧克力冰飲",
        "ja": "源自星馬地區,在冰美祿上方堆疊大量未溶解美祿粉的經典巧克力冰飲",
        "zh": "源自星馬地區,在冰美祿上方堆疊大量未溶解美祿粉的經典巧克力冰飲",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ko": "源自星馬地區,在冰美祿上方堆疊大量未溶解美祿粉的經典巧克力冰飲"
      },
      "containsPork": false
    },
    {
      "description": {
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
      "containsPork": false,
      "containsBeef": false,
      "category": "drinks",
      "id": "dish-2508252008143",
      "containsSeafood": false,
      "isNotSpicy": true,
      "price": 90,
      "available": true,
      "orderIndex": 17,
      "name": {
        "zh": "泰式可可冰奶",
        "en": "Thai Iced Cocoa Milk",
        "vi": "Sữa Ca Cao Đá Kiểu Thái",
        "ja": "タイ風アイスココア",
        "th": "โกโก้เย็นสไตล์ไทย",
        "ko": "태국식 아이스 코코아 밀크"
      }
    },
    {
      "recipe": [],
      "category": "sweets",
      "id": "dish-2508252003261",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "price": 80,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 18,
      "name": {
        "ko": "폭발적인 태국 우유 주머니",
        "zh": "爆漿泰奶包",
        "en": "Thai Milk Tea Custard Lava Bun",
        "ja": "爆発するタイの牛乳袋",
        "th": "ถุงนมไทยระเบิด",
        "vi": "Túi sữa Thái nổ"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "containsPork": false,
      "description": {
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "recipe": [],
      "id": "dish-2508202000500",
      "containsSeafood": false,
      "category": "combos",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "인기의 D식",
        "zh": "人氣D餐",
        "en": "Popular Set D Combo",
        "th": "อาหาร D ยอดนิยม",
        "vi": "Bữa ăn D phổ biến",
        "ja": "人気のDミール"
      },
      "available": true,
      "price": 1550,
      "orderIndex": 19,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": []
    },
    {
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "th": "มื้ออาหาร C สุดหรู",
        "ja": "贅沢Cミール",
        "vi": "Bữa ăn C sang trọng",
        "zh": "奢華C餐",
        "en": "Luxury Set C Combo",
        "ko": "호화로운 C 식사"
      },
      "hasNoodlesOption": false,
      "orderIndex": 20,
      "available": true,
      "price": 2160,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsSeafood": false,
      "id": "dish-2508201955573",
      "category": "combos",
      "recipe": [],
      "description": {
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "containsPork": false
    },
    {
      "category": "cat-svadcb",
      "id": "dish-2508141908165",
      "containsSeafood": false,
      "recipe": [],
      "description": {
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "ja": "期間限定の超お得な割引パッケージ",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "zh": "超值優惠組合，物超所值，限時享用",
        "en": "Great value combo package, high cost-performance deal for a limited time."
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "available": true,
      "price": -30,
      "hasNoodlesOption": false,
      "orderIndex": 21,
      "name": {
        "ko": "태국 우유 빈 양동이",
        "th": "ถังเปล่านมไทย",
        "vi": "Xô sữa Thái rỗng",
        "ja": "タイミルクの空バケツ",
        "en": "Empty Thai Milk Tea Bucket (1L)",
        "zh": "泰奶空桶"
      },
      "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "vi": "Bắp non 2p",
        "ja": "ベビーキャベツ 2P",
        "th": "กะหล่ำปลีเด็ก 2p",
        "zh": "娃娃菜2p",
        "en": "Baby Chinese Cabbage (2pcs)",
        "ko": "어린양배추 2p"
      },
      "hasNoodlesOption": false,
      "orderIndex": 22,
      "available": true,
      "price": 80,
      "description": {
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite."
      },
      "containsPork": false,
      "containsSeafood": false,
      "id": "dish-2508112131059",
      "category": "veggies",
      "recipe": []
    },
    {
      "name": {
        "zh": "爆汁金針菇豬肉",
        "en": "Juicy Pork Wrapped Enoki Mushroom",
        "vi": "Thịt lợn cay nấm kim châm",
        "ja": "スパイシーポークえのき添え",
        "th": "หมูสไปซี่กับเห็ดเข็มทอง",
        "ko": "팽이버섯을 곁들인 매콤한 돼지고기"
      },
      "orderIndex": 23,
      "hasNoodlesOption": false,
      "available": true,
      "price": 90,
      "isNotSpicy": false,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2508112130113",
      "category": "skewers",
      "containsPork": true,
      "description": {
        "th": "เห็ดเอโนกิกรอบห่อด้วยหมูสไลด์เนื้อนุ่มทาซอสแล้วย่างจนเป็นสีเหลืองทองและมีกลิ่นหอม",
        "ja": "シャキシャキのえのきを柔らかい豚肉で包み、タレを塗りこんがりと香ばしく焼き上げました。",
        "vi": "Nấm kim châm chiên giòn bọc trong những lát thịt lợn mềm, rưới nước sốt rồi nướng cho đến khi chín vàng và thơm",
        "zh": "鮮嫩豬肉片包裹爽脆金針菇，刷醬烤至金黃焦香",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "ko": "바삭한 에노키 버섯을 부드러운 돼지고기 조각으로 싸서 소스를 바르고 황금빛 갈색이 되고 향이 날 때까지 구워냅니다."
      }
    },
    {
      "orderIndex": 24,
      "hasNoodlesOption": false,
      "price": -1000,
      "available": true,
      "name": {
        "zh": "客家幣刷卡",
        "en": "Hakka Coin Card Payment",
        "th": "การรูดบัตรสกุลเงินฮากกา",
        "ja": "客家通貨カードのスワイプ",
        "vi": "Quẹt thẻ tiền tệ Hakka",
        "ko": "객가 화폐 카드 스와이프"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "isAvailable": true,
      "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "cat-svadcb",
      "containsSeafood": false,
      "id": "dish-2507182004409",
      "containsPork": false,
      "description": {
        "en": "Great value combo package, high cost-performance deal for a limited time.",
        "zh": "超值優惠組合，物超所值，限時享用",
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "ja": "期間限定の超お得な割引パッケージ",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공"
      }
    },
    {
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "orderIndex": 25,
      "hasNoodlesOption": false,
      "price": 660,
      "available": true,
      "name": {
        "ko": "시그니처A 한끼",
        "vi": "Chữ ký Một bữa ăn",
        "th": "ลายเซ็นมื้ออาหาร",
        "ja": "シグネチャーAのお食事",
        "zh": "招牌A餐",
        "en": "Signature Set A Combo"
      },
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
        "ja": "初めて入りますか？何を選べばいいのか分からない？ここに最高のものがあります。お店の看板商品が一気に手に入る！タイ手打ちビーフ1串/ジューシーえのき茸ポーク1串/タイ北部の酸っぱい肉とビーフンソーセージ1串/タイ風手羽先グリル4本/タイ風パリパリ湯葉1食分/甘辛1食分/タイミルクティー1杯！",
        "th": "เข้ามาครั้งแรก? ไม่รู้จะเลือกอะไร? นี่คือสิ่งที่ดีที่สุด คุณสามารถรับสินค้าซิกเนเจอร์ของร้านได้ในคราวเดียว! เนื้อไทยทำมือ 1 ไม้/หมูเห็ดเข็มทอง 1 ไม้/เนื้อเปรี้ยวและไส้กรอกเส้นก๋วยเตี๋ยว 1 ไม้/ปีกไก่ย่าง 4 ชิ้น/ผิวเต้าหู้กรอบ 1 ส่วน/เผ็ดร้อน 1 ส่วน/ชานมไทย 1 ถ้วย!",
        "vi": "Lần đầu tiên vào? Bạn không biết nên chọn gì? Dưới đây là những cái tốt nhất. Bạn có thể nhận được các sản phẩm đặc trưng của cửa hàng ngay lập tức! 1 xiên thịt bò thủ công kiểu Thái/1 xiên thịt lợn nấm kim châm ngon ngọt/1 xiên thịt chua miền Bắc Thái và xúc xích bún/4 miếng cánh gà nướng kiểu Thái/1 phần da đậu hũ chiên giòn kiểu Thái/1 phần cay ngọt ngọt/1 cốc trà sữa Thái!",
        "ko": "처음 들어오시나요? 무엇을 선택해야 할지 모르시나요? 여기에 최고의 것들이 있습니다. 매장의 시그니처 제품을 한번에 만나보실 수 있어요! 태국산 수제 쇠고기 꼬치 / 육즙이 풍부한 팽이버섯 돼지고기 1개 / 태국 북부 신맛이 나는 고기와 쌀국수 소시지 1개 / 태국식 구운 닭날개 4조각 / 태국식 바삭한 두부껍질 1인분 / 매콤달콤한 태국식 두부껍질 1인분 / 태국식 밀크티 1컵!"
      },
      "containsPork": false,
      "category": "combos",
      "id": "dish-2507072257199",
      "containsSeafood": false,
      "recipe": []
    },
    {
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "orderIndex": 26,
      "hasNoodlesOption": false,
      "available": true,
      "price": 100,
      "name": {
        "ko": "눈 산",
        "vi": "núi tuyết",
        "ja": "雪山",
        "th": "ภูเขาหิมะ",
        "en": "Snow Mountain Beer",
        "zh": "雪山"
      },
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配"
      },
      "containsPork": false,
      "category": "cat-7cvvkq",
      "id": "dish-2506292231385",
      "containsSeafood": false,
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "th": "ไวน์ซินฟานเดล",
        "vi": "rượu Zinfandel",
        "ja": "ジンファンデルワイン",
        "zh": "金芬黛葡萄酒",
        "en": "Zinfandel Red Wine",
        "ko": "진판델 와인"
      },
      "available": true,
      "price": 800,
      "orderIndex": 27,
      "hasNoodlesOption": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ."
      },
      "containsPork": false,
      "id": "dish-2506182247281",
      "containsSeafood": false,
      "category": "cat-7cvvkq",
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
      "name": {
        "en": "Signature Spicy Red Sauce Bottle",
        "zh": "紅醬外帶瓶",
        "vi": "Chai nước sốt đỏ mang theo",
        "ja": "レッドソースの持ち帰り用ボトル",
        "th": "ขวดซอสแดงสำหรับพกพา",
        "ko": "레드 소스 테이크아웃 병"
      },
      "orderIndex": 28,
      "hasNoodlesOption": false,
      "price": 150,
      "available": true,
      "isNotSpicy": false,
      "customAddOns": [],
      "containsPork": false,
      "description": {
        "ko": "매장에 있는 매콤한 빨간 소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
        "th": "น้ำจิ้มรสเด็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อนำไปจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
        "ja": "店内の特製赤辛だれは、焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいです",
        "vi": "Nước sốt đỏ cay ở cửa hàng~tự làm độc quyền~rất ngon khi chấm cùng thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
        "en": "Carefully crafted with rich flavors to complement your meal",
        "zh": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃"
      },
      "recipe": [],
      "id": "dish-2506132134210",
      "containsSeafood": false,
      "category": "cat-zene8j"
    },
    {
      "name": {
        "ko": "그린 소스 테이크아웃 병",
        "zh": "綠醬外帶瓶",
        "en": "Signature Thai Green Chili Sauce Bottle",
        "th": "ขวดซอสเขียวสำหรับพกพา",
        "vi": "Chai nước sốt xanh mang theo",
        "ja": "グリーンソースの持ち帰り用ボトル"
      },
      "hasNoodlesOption": false,
      "orderIndex": 29,
      "available": true,
      "price": 150,
      "isNotSpicy": false,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2506132131288",
      "category": "cat-zene8j",
      "containsPork": false,
      "description": {
        "en": "Carefully crafted with rich flavors to complement your meal",
        "zh": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
        "ja": "店内の特製グリーンソースは焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいですよ～自家製です～",
        "th": "ซอสเขียวรสเผ็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
        "vi": "Nước sốt xanh cay của cửa hàng ~ độc quyền tự làm ~ rất ngon khi chấm với thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
        "ko": "매장에 있는 매콤한 그린소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요"
      }
    },
    {
      "available": true,
      "price": 140,
      "hasNoodlesOption": false,
      "orderIndex": 30,
      "name": {
        "ja": "爆汁櫛瓜",
        "vi": "爆汁櫛瓜",
        "th": "爆汁櫛瓜",
        "zh": "爆汁櫛瓜",
        "en": "Juicy Grilled Zucchini",
        "ko": "爆汁櫛瓜"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": true,
      "recipe": [],
      "category": "veggies",
      "containsSeafood": false,
      "id": "dish-2505242017116",
      "containsPork": false,
      "description": {
        "ko": "店內最多人點的!多汁櫛瓜!五星好評都是因為它",
        "zh": "店內最多人點的!多汁櫛瓜!五星好評都是因為它",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "ja": "店內最多人點的!多汁櫛瓜!五星好評都是因為它",
        "vi": "店內最多人點的!多汁櫛瓜!五星好評都是因為它",
        "th": "店內最多人點的!多汁櫛瓜!五星好評都是因為它"
      }
    },
    {
      "isNotSpicy": false,
      "customAddOns": [
        {
          "name": {
            "zh": "加河粉",
            "en": "Add pho",
            "th": "เพิ่มโพธิ์",
            "vi": "Thêm phở",
            "ja": "フォーを追加",
            "ko": "사진 추가"
          },
          "id": "addon-1784478850618-672",
          "price": 20
        },
        {
          "price": 20,
          "id": "addon-1784478853337-718",
          "name": {
            "ko": "쌀국수 추가",
            "en": "Add rice noodles",
            "zh": "加米線",
            "ja": "ビーフンを加えます",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "vi": "Thêm bún"
          }
        },
        {
          "price": 140,
          "name": {
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784478856450-76"
        }
      ],
      "name": {
        "ko": "태국식 Tomyam 돼지고기와 쌀국수",
        "th": "ก๋วยเตี๋ยวหมูต้มยำไทยและข้าว",
        "ja": "タイのトムヤムポークとライスヌードル",
        "vi": "Bún thịt lợn và cơm Thái Tomyam",
        "zh": "泰式東炎豬肉.米線",
        "en": "Thai Tom Yum Pork Rice Noodle"
      },
      "available": true,
      "price": 240,
      "orderIndex": 31,
      "hasNoodlesOption": false,
      "isTakeoutAvailable": true,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "containsSeafood": false,
      "id": "dish-2505041844456",
      "category": "tomyum",
      "recipe": [],
      "description": {
        "ko": "대만산 삼겹살, 대구생선볼, 헌정볼, 일본식 생선살, 본토 소녀, 양파, 당근, 구층탑, 양배추",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
        "ja": "台湾産豚バラ肉、タラつみれ、貢ぎ目、日本産魚の切り身、本土娘、玉ねぎ、人参、九重塔、キャベツ",
        "th": "หมูสามชั้นไต้หวันสไลซ์ ลูกชิ้นปลาค็อด ลูกชิ้น เนื้อปลาญี่ปุ่น สาวแผ่นดิน หัวหอม แครอท เจดีย์เก้าชั้น กะหล่ำปลี",
        "vi": "Thịt ba chỉ Đài Loan, cá viên, cá viên, phi lê cá Nhật, cô gái đại lục, hành tây, cà rốt, chùa chín tầng, bắp cải"
      },
      "containsPork": true
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
      "name": {
        "zh": "泰式東炎豬肉.河粉",
        "en": "Thai Tom Yum Pork Pho Noodle",
        "vi": "Thịt lợn và phở Tomyam kiểu Thái",
        "th": "ต้มยำไทยหมูและเฝอ",
        "ja": "タイのトムヤムクンとフォー",
        "ko": "태국 톰얌 돼지고기와 쌀국수"
      },
      "available": true,
      "price": 240,
      "hasNoodlesOption": false,
      "orderIndex": 32,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "name": {
            "ko": "사진 추가",
            "en": "Add pho",
            "zh": "加河粉",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "vi": "Thêm phở"
          },
          "id": "addon-1784478881366-690",
          "price": 20
        },
        {
          "name": {
            "vi": "Thêm bún",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "ja": "ビーフンを加えます",
            "zh": "加米線",
            "en": "Add rice noodles",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784478887811-679",
          "price": 20
        },
        {
          "price": 140,
          "name": {
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784478890845-28"
        }
      ],
      "containsPork": true,
      "description": {
        "th": "หมูสามชั้นไต้หวันสไลซ์ ลูกชิ้นปลาค็อด ลูกชิ้น เนื้อปลาญี่ปุ่น สาวแผ่นดิน หัวหอม แครอท เจดีย์เก้าชั้น กะหล่ำปลี",
        "vi": "Thịt ba chỉ Đài Loan, cá viên, cá viên, phi lê cá Nhật, cô gái đại lục, hành tây, cà rốt, chùa chín tầng, bắp cải",
        "ja": "台湾産豚バラ肉、タラつみれ、貢ぎ目、日本産魚の切り身、本土娘、玉ねぎ、人参、九重塔、キャベツ",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
        "ko": "대만산 삼겹살, 대구생선볼, 헌정볼, 일본식 생선살, 본토 소녀, 양파, 당근, 구층탑, 양배추"
      },
      "recipe": [],
      "id": "dish-2505041843176",
      "containsSeafood": false,
      "category": "tomyum"
    },
    {
      "category": "drinks",
      "containsSeafood": false,
      "id": "dish-2505041825592",
      "recipe": [],
      "description": {
        "ko": "인터넷 연예인, 멋남들의 사진찍기 필수품~ 진한 차향이 나는 클래식 태국 우유~ 빈 양동이를 매장에 반납하고 30위안 할인 받으세요!",
        "en": "Refreshing and cool, a perfect match for BBQ",
        "zh": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!",
        "vi": "Một thứ không thể thiếu đối với những người nổi tiếng trên mạng và những chàng trai sành điệu khi chụp ảnh ~ Sữa Thái cổ điển với hương trà đậm đà ~ Trả lại chiếc xô rỗng cho cửa hàng và được giảm giá 30 nhân dân tệ!",
        "ja": "ネット有名人やかっこいい男性の写真撮影必需品～紅茶の香りが強い定番のタイミルク～空になったバケツを店舗に返却すると30元割引！",
        "th": "ดาราทางอินเทอร์เน็ตและหนุ่มเท่ๆ ที่ต้องมีไว้ถ่ายรูป~ นมไทยคลาสสิกกลิ่นชาเข้มข้น~ คืนถังเปล่าไปที่ร้านรับส่วนลด 30 หยวน!"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "hasNoodlesOption": false,
      "orderIndex": 33,
      "price": 180,
      "available": true,
      "name": {
        "ko": "스트리트 타이 우유 1L",
        "ja": "ストリートタイミルク 1L",
        "vi": "Sữa đường Thái 1L",
        "th": "สตรีทนมไทย 1ลิตร",
        "zh": "街頭泰奶1L",
        "en": "Thai Street Milk Tea (1L Bucket)"
      },
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "name": {
        "zh": "泰滿足海陸牛冬蔭功",
        "en": "Surf & Turf Beef Tom Yum Noodle Soup",
        "vi": "Món Thái Hài Lòng Thịt Bò Biển Tom Yum Goong",
        "ja": "タイの満足シーランドビーフのトムヤムクン",
        "th": "ความพึงพอใจของไทยซีแลนด์เนื้อต้มยำกุ้ง",
        "ko": "타이 만족 씨랜드 비프 똠얌꿍"
      },
      "available": true,
      "price": 390,
      "orderIndex": 34,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "id": "addon-1784478928738-313",
          "name": {
            "zh": "加河粉",
            "en": "Add pho",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "vi": "Thêm phở",
            "ko": "사진 추가"
          },
          "price": 20
        },
        {
          "id": "addon-1784478931302-574",
          "name": {
            "ko": "쌀국수 추가",
            "zh": "加米線",
            "en": "Add rice noodles",
            "ja": "ビーフンを加えます",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "vi": "Thêm bún"
          },
          "price": 20
        },
        {
          "name": {
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784478933543-454",
          "price": 140
        }
      ],
      "hasCoconutsMilkOption": true,
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2505041753253",
      "category": "tomyum",
      "containsPork": false,
      "description": {
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
        "vi": "Nguyên liệu: Thịt bò vai phi lê Mỹ chọn lọc lát mỏng, tôm, mực chiên, nghêu, cá tuyết viên, thịt lợn viên, đĩa cá Nhật, gái đất liền, hành tây, cà rốt, chùa chín tầng",
        "th": "ส่วนผสม: เนื้อวัวสันคอแบบอเมริกันสไลซ์ กุ้ง ปลาหมึกแหวน หอยลาย ลูกชิ้นปลาคอด ลูกชิ้นหมู ปลาญี่ปุ่น สาวแผ่นดินใหญ่ หัวหอม แครอท เจดีย์เก้าชั้น",
        "ja": "食材: アメリカ産柔らか肩フィレ特選牛スライス、海老、イカリング、アサリ、タラボール、ポークボール、国産フィッシュプレート、本土娘、玉ねぎ、人参、九重塔",
        "ko": "식품 : 미국산 부드러운 어깨 필레 특선 쇠고기 조각, 새우, 오징어 고리, 조개, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 본토 소녀, 양파, 당근, 구층탑"
      }
    },
    {
      "containsPork": true,
      "description": {
        "vi": "Nguyên liệu: Thịt ba chỉ Đài Loan lát, tôm, mực chiên, nghêu, cá viên, cá viên, cá viên Nhật, gái đất liền, hành tây, cà rốt, chùa chín tầng",
        "ja": "食材: 台湾産豚バラ肉、エビ、イカリング、ハマグリ、タラつみれ、貢ぎ目、日本魚片、本土娘、玉ねぎ、人参、九重塔",
        "th": "ส่วนผสม: หมูสามชั้นไต้หวันสไลซ์, กุ้ง, ปลาหมึกวง, หอยกาบ, ลูกชิ้นปลาคอด, ลูกชิ้น, แผ่นปลาญี่ปุ่น, สาวแผ่นดินใหญ่, หัวหอม, แครอท, เจดีย์เก้าชั้น",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
        "ko": "재료: 대만산 삼겹살, 새우, 오징어 링, 조개, 대구 완자, 공물 볼, 일본 생선 석판, 본토 소녀, 양파, 당근, 구층탑"
      },
      "recipe": [],
      "category": "tomyum",
      "id": "dish-2505041751044",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "hasCoconutsMilkOption": true,
      "available": true,
      "price": 360,
      "hasNoodlesOption": false,
      "orderIndex": 35,
      "name": {
        "ja": "ポークトムヤムスープ",
        "vi": "Súp Tom Yum Thịt Heo",
        "th": "ต้มยำหมู",
        "zh": "海陸豬冬蔭功湯",
        "en": "Surf & Turf Pork Tom Yum Soup",
        "ko": "돼지고기 똠양꿍 수프"
      },
      "customAddOns": [
        {
          "id": "addon-1784478951444-682",
          "name": {
            "zh": "加河粉",
            "en": "Add pho",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "vi": "Thêm phở",
            "ko": "사진 추가"
          },
          "price": 20
        },
        {
          "price": 20,
          "id": "addon-1784478953658-987",
          "name": {
            "ko": "쌀국수 추가",
            "zh": "加米線",
            "en": "Add rice noodles",
            "vi": "Thêm bún",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "ja": "ビーフンを加えます"
          }
        },
        {
          "price": 140,
          "name": {
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784478955921-185"
        }
      ],
      "isNotSpicy": false
    },
    {
      "category": "veggies",
      "containsSeafood": false,
      "id": "dish-2504161837515",
      "recipe": [],
      "description": {
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "orderIndex": 36,
      "hasNoodlesOption": false,
      "available": true,
      "price": 260,
      "name": {
        "vi": "Đĩa rau củ",
        "ja": "野菜盛り合わせ",
        "th": "จานผัก",
        "zh": "蔬菜拼盤",
        "en": "Fresh Vegetables Platter",
        "ko": "야채 플래터"
      },
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2503181902333",
      "recipe": [],
      "description": {
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "available": true,
      "price": 680,
      "hasNoodlesOption": false,
      "orderIndex": 37,
      "name": {
        "vi": "Bít tết vai cừu",
        "th": "สเต็กไหล่แกะ",
        "ja": "ラムショルダーステーキ",
        "en": "Charcoal Grilled Lamb Shoulder Chop",
        "zh": "小羊肩排",
        "ko": "양고기 어깨 스테이크"
      },
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "orderIndex": 38,
      "hasNoodlesOption": false,
      "available": true,
      "price": 2200,
      "name": {
        "ko": "태국 굴 11p",
        "en": "Thai Style Fresh Oysters (11pcs)",
        "zh": "泰式生蠔11p",
        "ja": "タイ産牡蠣 11ペンス",
        "th": "หอยนางรมไทย11บ",
        "vi": "Hàu Thái 11p"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": false,
      "recipe": [],
      "category": "seafood",
      "containsSeafood": true,
      "id": "dish-2503171838086",
      "containsPork": false,
      "description": {
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      }
    },
    {
      "customAddOns": [],
      "isNotSpicy": true,
      "price": -1,
      "available": true,
      "orderIndex": 39,
      "hasNoodlesOption": false,
      "name": {
        "ko": "하카화폐",
        "ja": "客家の通貨",
        "th": "สกุลเงินฮากกา",
        "vi": "tiền Khách Gia",
        "zh": "客家幣",
        "en": "Hakka Coin Coupon"
      },
      "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "category": "cat-svadcb",
      "id": "dish-2503012218077",
      "containsSeafood": false,
      "recipe": [],
      "description": {
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "ja": "期間限定の超お得な割引パッケージ",
        "zh": "超值優惠組合，物超所值，限時享用",
        "en": "Great value combo package, high cost-performance deal for a limited time."
      },
      "containsPork": false
    },
    {
      "description": {
        "zh": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "th": "เนื้อไทยทำมือ x 1 เคบับซี่โครงเนื้อ x 1 เคบับซี่โครงแกะ x 1\nไก่เนื้อเสียบไม้ x 1 ไส้กรอกไขมันเสียบไม้คัดพิเศษ x 1 ไส้กรอกเสียบไม้พ่นน้ำ x 1 หนังไก่ x 1 ตรงจุดนี้เลือกยาก",
        "vi": "Thịt bò Thái handmade x 1, sườn bò kebab x 1, sườn cừu kebab x 1\nXiên gà nướng x 1 Xiên xúc xích béo chọn lọc x 1 Xiên xúc xích phun nước x 1 Da gà x 1 Đây là điểm khó lựa chọn",
        "ja": "タイ産手作りビーフ×1、ビーフリブケバブ×1、ラムリブケバブ×1\nブロイラー鶏の串×1本 特選太ソーセージの串×1本 水をかけたソーセージの串×1本 鶏の皮×1本 ここが選択の難しいポイント",
        "ko": "태국 수제 쇠고기 x 1, 쇠고기 갈비 케밥 x 1, 양갈비 케밥 x 1\n브로일러 닭꼬치 x 1 엄선된 살찐 소시지 꼬치 x 1 물을 뿌린 소시지 꼬치 x 1 닭껍질 x 1 선택이 어려운 지점입니다"
      },
      "containsPork": false,
      "id": "dish-2502252357010",
      "containsSeafood": false,
      "category": "combos",
      "recipe": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ko": "고기가 많은 B 식사",
        "th": "อาหารมื้อสายเนื้อบี",
        "vi": "Bữa ăn nhiều thịt B",
        "ja": "肉たっぷりのBミール",
        "en": "Meat Lover's Set B Combo",
        "zh": "多肉B餐"
      },
      "available": true,
      "price": 460,
      "hasNoodlesOption": false,
      "orderIndex": 40
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
      "isTakeoutAvailable": false,
      "name": {
        "zh": "大摩12年",
        "en": "The Dalmore 12 Years Whisky",
        "vi": "Rượu Dalmore 12 Năm",
        "ja": "ダルモア 12年",
        "th": "ดาลมอร์ 12 ปี",
        "ko": "달모어 12년"
      },
      "hasNoodlesOption": false,
      "orderIndex": 41,
      "price": 3200,
      "available": true,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2502031821565",
      "category": "cat-6ovxss"
    },
    {
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": false,
      "price": 2400,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 42,
      "name": {
        "ko": "싱글톤 13년",
        "ja": "シングルトン 13年",
        "th": "เดอะ ซิงเกิลตัน 13 ปี",
        "vi": "Rượu Singleton 13 Năm",
        "en": "The Singleton 13 Years Whisky",
        "zh": "蘇格登13年"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配"
      },
      "recipe": [],
      "category": "cat-6ovxss",
      "id": "dish-2502031820148",
      "containsSeafood": false
    },
    {
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
      },
      "containsPork": false,
      "containsSeafood": false,
      "id": "dish-2502031818015",
      "category": "drinks",
      "recipe": [],
      "isTakeoutAvailable": false,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "en": "The Singleton 12 Years Whisky",
        "zh": "蘇格登12年",
        "th": "เดอะ ซิงเกิลตัน 12 ปี",
        "vi": "Rượu Singleton 12 Năm",
        "ja": "シングルトン 12年",
        "ko": "싱글톤 12년"
      },
      "available": true,
      "price": 1800,
      "hasNoodlesOption": false,
      "orderIndex": 43
    },
    {
      "category": "veggies",
      "id": "dish-2502012109279",
      "containsSeafood": false,
      "recipe": [],
      "description": {
        "ko": "<Non-GMO> 느끼하지도 기름지지도 않은 ~ 달콤하고 맛있는 ~ 영양가 높은",
        "zh": "<非基改>不油不膩~香甜可口~營養價高",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "<Non-GMO> Không béo ngậy ~ ngọt ngào thơm ngon ~ giá trị dinh dưỡng cao",
        "ja": "＜非遺伝子組み換え＞脂っこくない～甘くて美味しい～栄養価が高い",
        "th": "<Non-GMO> ไม่มันเยิ้ม ~ หวานอร่อย ~ มีคุณค่าทางโภชนาการสูง"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 80,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 44,
      "name": {
        "en": "Organic Baby Corn",
        "zh": "有機玉米筍",
        "vi": "Măng ngô hữu cơ",
        "th": "หน่อข้าวโพดออร์แกนิก",
        "ja": "有機トウモロコシの芽",
        "ko": "유기농 옥수수순"
      },
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "description": {
        "ko": "펑후에서 엄선한 해산물~ 덩어리째 드실 수 있어요",
        "vi": "Hải sản được lựa chọn cẩn thận từ Bành Hồ ~ bạn có thể ăn thành từng miếng",
        "ja": "澎湖産の厳選海鮮～塊で食べられる",
        "th": "อาหารทะเลที่คัดสรรอย่างพิถีพิถันจากเผิงหู~ ทานเป็นชิ้นๆ ได้เลย",
        "zh": "嚴選澎湖海味~吃得到塊狀花枝",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
      },
      "containsPork": false,
      "category": "seafood",
      "containsSeafood": true,
      "id": "dish-2502012029386",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "hasNoodlesOption": false,
      "orderIndex": 45,
      "available": true,
      "price": 80,
      "name": {
        "ko": "펑후 화지완",
        "vi": "Bành Hồ Huazhiwan",
        "ja": "澎湖華志湾",
        "th": "เผิงหู หัวจือวาน",
        "en": "Penghu Cuttlefish Balls",
        "zh": "澎湖花枝丸"
      }
    },
    {
      "recipe": [],
      "id": "dish-2501142131426",
      "containsSeafood": false,
      "category": "veggies",
      "containsPork": false,
      "description": {
        "ko": "숯불구이 산배추~바삭하고 달콤해요~다른 데는 안 파는 것 같아요~안 드셔보시겠어요?",
        "vi": "Bắp cải núi nướng than ~ Giòn và ngọt ~ Tôi không nghĩ nó được bán ở nơi khác ~ Bạn thử xem?",
        "th": "กะหล่ำปลีภูเขาย่างถ่าน~กรอบและหวาน~ไม่คิดว่าจะมีขายที่อื่น~อย่าลองนะ?",
        "ja": "山キャベツの炭火焼き～シャキシャキで甘い～他では売っていないと思います～食べてみませんか？",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?"
      },
      "name": {
        "en": "Crispy Grilled Cabbage",
        "zh": "爽脆高麗菜",
        "ja": "シャキシャキキャベツ",
        "vi": "bắp cải giòn",
        "th": "กะหล่ำปลีกรอบ",
        "ko": "바삭한 양배추"
      },
      "available": true,
      "price": 80,
      "orderIndex": 46,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400"
    },
    {
      "containsPork": false,
      "description": {
        "ko": "숯불에 천천히 끓여낸 태국식 밀크티! 독특한 맛은 시도해 볼 가치가 있습니다",
        "en": "Refreshing and cool, a perfect match for BBQ",
        "zh": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
        "ja": "炭火でじっくり煮込んだタイミルクティー！独特の風味は試してみる価値あり",
        "vi": "Trà sữa Thái nấu chậm trên lửa than! Hương vị độc đáo đáng để thử",
        "th": "ชานมไทยปรุงช้าๆด้วยไฟถ่าน! รสชาติที่เป็นเอกลักษณ์คุ้มค่าแก่การลอง"
      },
      "recipe": [],
      "category": "drinks",
      "id": "dish-2412022102224",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": false,
      "price": 180,
      "available": true,
      "orderIndex": 47,
      "hasNoodlesOption": false,
      "name": {
        "th": "ชานมไทยคั่วเตาถ่าน (หม้อ)",
        "ja": "炭火焙煎タイミルクティー（ポット）",
        "vi": "Trà sữa Thái rang than (Ấm)",
        "en": "Charcoal Smoked Thai Tea (Pot)",
        "zh": "炭燒奶茶(壺)",
        "ko": "숯불 타이 밀크티 (포트)"
      },
      "customAddOns": [],
      "isNotSpicy": true
    },
    {
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "hasNoodlesOption": false,
      "orderIndex": 48,
      "available": true,
      "price": 10,
      "name": {
        "zh": "泰辣醬",
        "en": "Thai Spicy Chili Dip",
        "vi": "Nước sốt Thái",
        "ja": "タイのホットソース",
        "th": "ซอสเผ็ดแบบไทยๆ",
        "ko": "태국식 핫소스"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "containsPork": false,
      "description": {
        "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
        "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
        "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
        "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
        "zh": "精心調製，口感層次豐富，為您的餐點添彩",
        "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다"
      },
      "recipe": [],
      "category": "cat-zene8j",
      "id": "dish-2412021741257",
      "containsSeafood": false
    },
    {
      "description": {
        "ko": "음료와 함께 꼭 주문해야해요! 미식가들 사이에서 가장 인기 있는 곳!",
        "zh": "下酒必點!老饕最愛!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "Phải đặt hàng với đồ uống! Một yêu thích của những người sành ăn!",
        "ja": "ドリンクと一緒に注文必須！食通の間で大人気！",
        "th": "ต้องสั่งพร้อมเครื่องดื่ม! ของโปรดในหมู่นักชิม!"
      },
      "containsPork": false,
      "category": "seafood",
      "containsSeafood": true,
      "id": "dish-2412021734433",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "hasNoodlesOption": false,
      "orderIndex": 49,
      "available": true,
      "price": 390,
      "name": {
        "ko": "손으로 잘게 썬 대형 말린 오징어",
        "zh": "手撕大魷魚干",
        "en": "Shredded Dried Giant Squid",
        "ja": "大スルメ手切り",
        "th": "ปลาหมึกแห้งขนาดใหญ่ฉีกด้วยมือ",
        "vi": "Mực khô lớn xé tay"
      }
    },
    {
      "recipe": [],
      "id": "dish-2412021733504",
      "containsSeafood": true,
      "category": "seafood",
      "containsPork": false,
      "description": {
        "ko": "해산물을 좋아한다면 꼭 먹어봐야 할 곳! 레몬 타이 소스와 함께\n로스팅 후 향이 넘쳐 한 입 한 입 베어 물면 최고의 맛이 난다",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
        "ja": "海鮮好きならぜひ試してみてください！レモンタイソースと合わせて\n焙煎後は香りが溢れ、噛むたびに最高の美味しさ",
        "vi": "Phải thử nếu bạn yêu thích hải sản! Ăn kèm sốt chanh Thái\nSau khi rang, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "th": "ต้องลองถ้าคุณรักอาหารทะเล! ทานคู่กับน้ำจิ้มมะนาวไทย\nหลังจากการคั่วกลิ่นหอมจะล้นออกมาและทุกคำที่กัดคือความอร่อยขั้นสุดยอด"
      },
      "name": {
        "ko": "생식등급 가리비구이 3P",
        "en": "Seared Sashimi Grade Scallops (3pcs)",
        "zh": "炙燒生食級干貝3P",
        "vi": "Sò điệp sống nướng loại 3P",
        "th": "หอยเชลล์ดิบย่าง3P",
        "ja": "生食用ホタテ貝柱のグリル 3P"
      },
      "orderIndex": 50,
      "hasNoodlesOption": false,
      "available": true,
      "price": 390,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400"
    },
    {
      "category": "seafood",
      "id": "dish-2412021732545",
      "containsSeafood": true,
      "recipe": [],
      "description": {
        "ko": "매운음식 좋아하시는 분들 꼭 드셔보세요! 술을 마실 때 꼭 필요한 것. 이미 껍질이 벗겨졌어",
        "zh": "嗜辣者必嚐!下酒必備 已去殼",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "Món ăn nhất định phải thử dành cho những ai thích ăn cay! Phải có để uống. Đã bóc vỏ",
        "ja": "辛いもの好きな方はぜひ試してみてください！お酒を飲む際の必需品。すでに殻をむいています",
        "th": "สำหรับผู้ที่ชอบอาหารรสเผ็ดต้องลอง! เป็นสิ่งที่ต้องมีสำหรับการดื่ม ปอกเปลือกแล้ว"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "available": true,
      "price": 360,
      "orderIndex": 51,
      "hasNoodlesOption": false,
      "name": {
        "vi": "Sò điệp cay Thái 9P",
        "ja": "タイ産スパイシーホタテ貝柱 9P",
        "th": "หอยเชลล์เผ็ดไทย 9P",
        "zh": "泰辣扇貝9P",
        "en": "Spicy Thai Scallops (9pcs)",
        "ko": "태국식 매운 가리비 9P"
      },
      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "hasNoodlesOption": false,
      "orderIndex": 52,
      "price": 360,
      "available": true,
      "name": {
        "ko": "코코넛 숯불 새우구이 6P",
        "th": "กุ้งเผาถ่านมะพร้าว6P",
        "ja": "エビのココナッツ炭火焼き 6P",
        "vi": "Tôm nướng than dừa 6P",
        "zh": "椰碳烤大草蝦6P",
        "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)"
      },
      "description": {
        "ko": "큰새우구이 6개~수염과 날카로운 가시는 잘랐지만 껍질벗길때 조심하세요",
        "zh": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "6 con tôm lớn nướng ~ râu và gai nhọn đã được cắt bỏ ~ nhưng hãy cẩn thận khi bóc vỏ",
        "th": "กุ้งเผาตัวใหญ่ 6 ตัว ~ หนวดและหนามแหลมถูกตัด ~ แต่ต้องระวังตอนปอกเปลือก",
        "ja": "大海老のグリル6尾～ひげと鋭い棘はカットしてあります～殻を剥くときは注意してください"
      },
      "containsPork": false,
      "category": "seafood",
      "id": "dish-2412021732071",
      "containsSeafood": true,
      "recipe": []
    },
    {
      "category": "cat-6ovxss",
      "containsSeafood": false,
      "id": "dish-2411142306093",
      "recipe": [],
      "description": {
        "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
        "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say",
        "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
        "en": "Refreshing and cool, a perfect match for BBQ",
        "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
        "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다"
      },
      "containsPork": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "price": 380,
      "available": true,
      "orderIndex": 53,
      "hasNoodlesOption": false,
      "name": {
        "zh": "泰醇奶酒5.6%",
        "en": "Thai Cream Liqueur 5.6%",
        "vi": "Rượu sữa Đài Xuân 5,6%",
        "th": "ไวน์นมไท่ชุน 5.6%",
        "ja": "台中ミルクワイン 5.6%",
        "ko": "타이춘 밀크와인 5.6%"
      },
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "hasNoodlesOption": false,
      "orderIndex": 54,
      "price": 280,
      "available": true,
      "name": {
        "zh": "泰醇奶酒1.4%",
        "en": "Thai Cream Liqueur 1.4%",
        "vi": "Rượu sữa Đài Xuân 1,4%",
        "th": "ไวน์นมไท่ชุน 1.4%",
        "ja": "台中ミルクワイン 1.4%",
        "ko": "타이춘 밀크와인 1.4%"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "containsPork": false,
      "description": {
        "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
        "en": "Refreshing and cool, a perfect match for BBQ",
        "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
        "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say",
        "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
        "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다"
      },
      "recipe": [],
      "category": "cat-6ovxss",
      "id": "dish-2411142303467",
      "containsSeafood": false
    },
    {
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2411142030288",
      "category": "cat-7cvvkq",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "주스 탄산수",
        "ja": "ジュース・スパークリングウォーター",
        "vi": "Nước ép có ga",
        "th": "น้ำผลไม้เป็นประกาย",
        "en": "Fruit Juice Sparkling Water",
        "zh": "果汁氣泡水"
      },
      "price": 100,
      "available": true,
      "orderIndex": 55,
      "hasNoodlesOption": false,
      "isNotSpicy": true,
      "customAddOns": []
    },
    {
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2411142028551",
      "category": "cat-7cvvkq",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "name": {
        "zh": "海尼根",
        "en": "Heineken Beer",
        "vi": "Heineken",
        "ja": "ハイネケン",
        "th": "ไฮเนเก้น",
        "ko": "하이네켄"
      },
      "hasNoodlesOption": false,
      "orderIndex": 56,
      "price": 150,
      "available": true,
      "isNotSpicy": true,
      "customAddOns": []
    },
    {
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2411112029373",
      "recipe": [],
      "description": {
        "vi": "Sự kết hợp bánh tiết heo + xúc xích được cả người lớn và trẻ em yêu thích♥️Đừng lo lắng về lượng calo hôm nay nhé!",
        "ja": "豚の血ケーキ＋ホットドッグの組み合わせは大人も子供も大好き♥️今日はカロリーを気にせず！",
        "th": "เค้กเลือดหมู + ฮอทด็อกเป็นที่ชื่นชอบของทั้งเด็กและผู้ใหญ่ ♥️วันนี้ไม่ต้องกังวลเรื่องแคลอรี่!",
        "zh": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "ko": "돼지피케이크+핫도그 조합은 어른도 아이도 모두 좋아하는 조합♥️오늘은 칼로리 걱정하지 마세요!"
      },
      "containsPork": true,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 70,
      "available": true,
      "orderIndex": 57,
      "hasNoodlesOption": false,
      "name": {
        "ko": "사악한 핫도그 돼지 혈액 케이크",
        "zh": "邪惡熱狗豬血糕",
        "en": "Hot Dog & Pork Blood Cake Skewer",
        "ja": "邪悪なホットドッグの豚血ケーキ",
        "th": "เค้กเลือดหมูฮอทด็อกชั่วร้าย",
        "vi": "Bánh huyết heo xúc xích ác quỷ"
      },
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "ko": "코로나",
        "zh": "可樂娜",
        "en": "Corona Extra Beer",
        "th": "โคโรนา",
        "vi": "Corona",
        "ja": "コロナ"
      },
      "orderIndex": 58,
      "hasNoodlesOption": false,
      "available": true,
      "price": 150,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ."
      },
      "containsPork": false,
      "id": "dish-2411091621575",
      "containsSeafood": false,
      "category": "cat-7cvvkq",
      "recipe": []
    },
    {
      "price": 10,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 59,
      "name": {
        "zh": "tip",
        "en": "Staff Tip / Service Gratitude",
        "vi": "tiền boa",
        "ja": "ヒント",
        "th": "ทิป",
        "ko": "팁"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "cat-svadcb",
      "id": "dish-2411042135298",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "ja": "期間限定の超お得な割引パッケージ",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "zh": "超值優惠組合，物超所值，限時享用",
        "en": "Great value combo package, high cost-performance deal for a limited time.",
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공"
      }
    },
    {
      "containsPork": false,
      "description": {
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "recipe": [],
      "category": "cat-6ovxss",
      "id": "dish-2410270119261",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "isTakeoutAvailable": false,
      "available": true,
      "price": 350,
      "orderIndex": 60,
      "hasNoodlesOption": false,
      "name": {
        "ko": "하쿠츠루 사케",
        "zh": "白鶴清酒",
        "en": "Hakutsuru Japanese Sake",
        "th": "สาเก ฮาคุรุ",
        "ja": "白鶴 清酒",
        "vi": "Rượu Sake Hakutsuru"
      },
      "customAddOns": [
        {
          "price": 0,
          "name": {
            "ko": "난방",
            "en": "heating",
            "zh": "加熱",
            "vi": "sưởi ấm",
            "th": "เครื่องทำความร้อน",
            "ja": "暖房"
          },
          "id": "addon-1784479411862-296"
        }
      ],
      "isNotSpicy": true
    },
    {
      "recipe": [],
      "category": "cat-7cvvkq",
      "containsSeafood": false,
      "id": "dish-2410132030420",
      "containsPork": false,
      "description": {
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "price": 100,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 61,
      "name": {
        "ko": "사랑의 맛 보리차",
        "zh": "愛之味麥茶",
        "en": "AGV Barley Tea",
        "ja": "恋の麦茶の味",
        "vi": "Hương trà lúa mạch tình yêu",
        "th": "รสชาติของชาข้าวบาร์เลย์แห่งความรัก"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง"
      },
      "containsPork": false,
      "containsSeafood": false,
      "id": "dish-2410022148358",
      "category": "cat-7cvvkq",
      "recipe": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "vi": "Budweiser",
        "th": "บัดไวเซอร์",
        "ja": "バドワイザー",
        "zh": "百威",
        "en": "Budweiser Beer",
        "ko": "버드와이저"
      },
      "hasNoodlesOption": false,
      "orderIndex": 62,
      "available": true,
      "price": 150
    },
    {
      "containsPork": false,
      "description": {
        "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가가 가장 좋아하는 ♥️ 정통 태국식 진한 수프 베이스",
        "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Món ăn yêu thích của người sành ăn♥️Súp đậm đà chính gốc Thái",
        "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本場タイの濃厚スープベース",
        "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม ♥️ฐานซุปเข้มข้นแบบไทยแท้",
        "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
        "en": "Authentic Thai-style soup noodles with rich, warming broth"
      },
      "recipe": [],
      "id": "dish-2409232044239",
      "containsSeafood": false,
      "category": "tomyum",
      "hasCoconutsMilkOption": true,
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "쇠고기 갈비 톰얌 수프",
        "zh": "牛小排冬蔭功湯",
        "en": "Charcoal Short Rib Beef Tom Yum Soup",
        "ja": "牛カルビのトムヤムスープ",
        "vi": "Súp Tom Yum Sườn Bò",
        "th": "ต้มยำซี่โครงเนื้อ"
      },
      "price": 620,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 63,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "id": "addon-1784479460272-831",
          "name": {
            "ja": "フォーを追加",
            "th": "เพิ่มโพธิ์",
            "vi": "Thêm phở",
            "en": "Add pho",
            "zh": "加河粉",
            "ko": "사진 추가"
          },
          "price": 20
        },
        {
          "name": {
            "ja": "ビーフンを加えます",
            "vi": "Thêm bún",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "en": "Add rice noodles",
            "zh": "加米線",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784479462255-754",
          "price": 20
        },
        {
          "price": 140,
          "id": "addon-1784479465274-753",
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
          }
        }
      ]
    },
    {
      "name": {
        "th": "ก๋วยเตี๋ยวเนื้อซี่โครงสั้นเนื้อไทย",
        "ja": "タイ産牛肉ショートリブビーフン",
        "vi": "Bún sườn bò kiểu Thái",
        "zh": "泰式牛小排米線",
        "en": "Thai Grilled Short Rib Beef Rice Noodle",
        "ko": "태국식 쇠고기 갈비 쌀국수"
      },
      "available": true,
      "price": 620,
      "orderIndex": 64,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "name": {
            "ko": "사진 추가",
            "vi": "Thêm phở",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "en": "Add pho",
            "zh": "加河粉"
          },
          "id": "addon-1784479484092-785",
          "price": 20
        },
        {
          "name": {
            "ko": "쌀국수 추가",
            "en": "Add rice noodles",
            "zh": "加米線",
            "vi": "Thêm bún",
            "ja": "ビーフンを加えます",
            "th": "ใส่เส้นก๋วยเตี๋ยว"
          },
          "id": "addon-1784479486352-323",
          "price": 20
        },
        {
          "name": {
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784479488427-739",
          "price": 140
        }
      ],
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "recipe": [],
      "id": "dish-2409232043478",
      "containsSeafood": false,
      "category": "tomyum",
      "containsPork": false,
      "description": {
        "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
        "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
        "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม♥️ซุปก๋วยเตี๋ยวสไตล์ไทยแท้ น้ำซุปเข้มข้นช่วยให้อุ่นหัวใจและท้อง",
        "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Là món ăn được những người sành ăn yêu thích♥️Mì Thái đúng kiểu Thái, nước súp đậm đà làm ấm lòng và dạ dày",
        "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本格的なタイ風ヌードルスープ、濃厚なスープベースで心もお腹も温まります",
        "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가들이 즐겨찾는 정통 태국식 누들스프, 진한 국물 베이스가 마음과 배를 따뜻하게 해주는 정통 태국식 누들스프"
      }
    },
    {
      "description": {
        "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가들이 즐겨찾는 정통 태국식 누들스프, 진한 국물 베이스가 마음과 배를 따뜻하게 해주는 정통 태국식 누들스프",
        "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
        "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
        "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Là món ăn được những người sành ăn yêu thích♥️Mì Thái đúng kiểu Thái, nước súp đậm đà làm ấm lòng và dạ dày",
        "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม♥️ซุปก๋วยเตี๋ยวสไตล์ไทยแท้ น้ำซุปเข้มข้นช่วยให้อุ่นหัวใจและท้อง",
        "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本格的なタイ風ヌードルスープ、濃厚なスープベースで心もお腹も温まります"
      },
      "containsPork": false,
      "id": "dish-2409232042549",
      "containsSeafood": false,
      "category": "tomyum",
      "recipe": [],
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [
        {
          "price": 20,
          "name": {
            "ko": "사진 추가",
            "en": "Add pho",
            "zh": "加河粉",
            "vi": "Thêm phở",
            "ja": "フォーを追加",
            "th": "เพิ่มโพธิ์"
          },
          "id": "addon-1784479520251-308"
        },
        {
          "price": 20,
          "name": {
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "vi": "Thêm bún",
            "ja": "ビーフンを加えます",
            "zh": "加米線",
            "en": "Add rice noodles",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784479522216-624"
        },
        {
          "price": 140,
          "id": "addon-1784479526311-934",
          "name": {
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          }
        }
      ],
      "name": {
        "th": "เฝอซี่โครงเนื้อไทย",
        "ja": "タイ産牛肉ショートリブのフォー",
        "vi": "Phở sườn bò kiểu Thái",
        "zh": "泰式牛小排河粉",
        "en": "Thai Grilled Short Rib Beef Pho Noodle",
        "ko": "태국식 쇠고기 갈비 포"
      },
      "price": 620,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 65
    },
    {
      "isTakeoutAvailable": false,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ja": "タイオイスター3P",
        "vi": "Hàu Thái 3p",
        "th": "หอยนางรมไทย3p",
        "zh": "泰式生蠔3p",
        "en": "Thai Style Fresh Oysters (3pcs Combo)",
        "ko": "태국 굴 3p"
      },
      "price": 660,
      "available": true,
      "orderIndex": 66,
      "hasNoodlesOption": false,
      "description": {
        "ko": "<3종 할인세트> 엄선된 L 사이즈 미야기현 굴과 우유, 해산물! 매장의 시그니처!\n생으로 먹어도 되고 구워서 먹어도 된다",
        "th": "<ชุดลดราคาสามชิ้น> หอยนางรมมิยากิ นม และอาหารทะเลขนาด L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน!\nสามารถรับประทานดิบหรือย่างได้",
        "vi": "<Bộ giảm giá ba món> Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng!\nCó thể ăn sống hoặc nướng",
        "ja": "＜お得な3点セット＞Lサイズの宮城産牡蠣・牛乳・魚介類を厳選！お店のサインも！\n生でも焼いても食べられる",
        "zh": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
      },
      "containsPork": false,
      "containsSeafood": true,
      "id": "dish-2409232024040",
      "category": "seafood",
      "recipe": []
    },
    {
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2409131907512",
      "category": "cat-7cvvkq",
      "containsPork": false,
      "description": {
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "name": {
        "ko": "얼음물(대)",
        "vi": "Nước đá (lớn)",
        "th": "น้ำแข็งใส (ใหญ่)",
        "ja": "氷水（大）",
        "en": "Large Ice Water",
        "zh": "冰水(大)"
      },
      "price": 100,
      "available": true,
      "orderIndex": 67,
      "hasNoodlesOption": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400"
    },
    {
      "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "price": 500,
      "available": true,
      "orderIndex": 68,
      "hasNoodlesOption": false,
      "name": {
        "th": "ค่าเปิดขวด 1 ขวด",
        "vi": "Phí đóng chai 1 chai",
        "ja": "持ち込み料金 1本",
        "zh": "開瓶費1支",
        "en": "Corkage Fee (Per Bottle)",
        "ko": "코르키지 요금 1병"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "containsPork": false,
      "description": {
        "en": "",
        "zh": "",
        "ja": "",
        "vi": "",
        "th": "",
        "ko": ""
      },
      "recipe": [],
      "category": "cat-svadcb",
      "id": "dish-2408192006066",
      "containsSeafood": false
    },
    {
      "containsPork": true,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
        "ja": "本格タイ風サワーポークソーセージ グリーンヌードル入り ＜酸っぱい・傷むわけではありません＞ この商品をご注文いただくお客様は、この点をご理解いただいた上でご注文ください",
        "vi": "Xúc xích heo chua Thái chính hãng với bún xanh <Không phải đồ ăn bị chua hay hư> Khách hàng đặt mua sản phẩm này phải hiểu rõ điều này",
        "th": "ไส้กรอกอีสานเส้นหมี่เขียวแท้ <ไม่ใช่ว่าอาหารเปรี้ยวหรือบูด> ลูกค้าที่สั่งสินค้าต้องมีความเข้าใจดังนี้",
        "ko": "정통 태국식 신 돼지고기 소시지 녹색면 <음식이 신맛이 나거나 상한 것이 아닙니다> 본 상품을 주문하시는 고객께서는 이 점을 숙지하시기 바랍니다."
      },
      "recipe": [],
      "category": "skewers",
      "id": "dish-2408191941429",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "hasNoodlesOption": false,
      "orderIndex": 69,
      "available": true,
      "price": 90,
      "name": {
        "ko": "북부 태국 신 돼지고기와 겨울 국수 소시지",
        "vi": "Bún chua mùa đông và thịt chua miền Bắc Thái",
        "ja": "タイ北部のサワーポークとウィンターヌードルソーセージ",
        "th": "หมูยอภาคเหนือและไส้กรอกหมี่ฤดูหนาว",
        "zh": "泰北酸肉冬粉腸",
        "en": "Northern Thai Fermented Pork Sausage w/ Glass Noodles"
      },
      "customAddOns": [],
      "isNotSpicy": false
    },
    {
      "containsPork": false,
      "description": {
        "en": "Great value combo package, high cost-performance deal for a limited time.",
        "zh": "超值優惠組合，物超所值，限時享用",
        "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
        "ja": "期間限定の超お得な割引パッケージ",
        "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
        "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공"
      },
      "recipe": [],
      "category": "cat-svadcb",
      "containsSeafood": false,
      "id": "dish-2407231815553",
      "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "orderIndex": 70,
      "hasNoodlesOption": false,
      "available": true,
      "price": -10,
      "name": {
        "ko": "친구할인",
        "zh": "好友折扣",
        "en": "Friend Discount Coupon",
        "th": "ส่วนลดเพื่อน",
        "ja": "友達割引",
        "vi": "Giảm giá cho bạn bè"
      },
      "customAddOns": [],
      "isNotSpicy": true
    },
    {
      "id": "dish-2305152126508",
      "containsSeafood": false,
      "category": "skewers",
      "recipe": [],
      "description": {
        "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주수입) 숯불에 노릇노릇해질 때까지 구운 후 커민가루를 뿌려주세요! 매장에서 가장 많이 팔리는 NO2입니다.",
        "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi vàng nâu và rắc bột thì là! NO2 bán chạy nhất tại cửa hàng.",
        "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีเหลืองทองโรยผงยี่หร่า! NO2 ที่ขายดีที่สุดในร้าน",
        "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリアから輸入） 炭火できつね色になるまで焼き、クミンパウダーをふりかける！当店の売れ筋NO2。"
      },
      "containsPork": false,
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ko": "양갈비",
        "vi": "sườn cừu",
        "th": "ซี่โครงแกะ",
        "ja": "ラムリブ",
        "zh": "小羔羊肋",
        "en": "Cumin Lamb Rib Skewers"
      },
      "hasNoodlesOption": false,
      "orderIndex": 71,
      "price": 70,
      "available": true,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400"
    },
    {
      "id": "dish-2304041737306",
      "containsSeafood": false,
      "category": "drinks",
      "recipe": [],
      "description": {
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "containsPork": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "ko": "펄프 코코넛 워터",
        "ja": "パルプココナッツウォーター",
        "vi": "Nước cốt dừa",
        "th": "น้ำมะพร้าวเนื้อ",
        "zh": "果肉椰子水",
        "en": "Fresh Coconut Water w/ Pulp"
      },
      "hasNoodlesOption": false,
      "orderIndex": 72,
      "price": 90,
      "available": true,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80&w=400"
    },
    {
      "isTakeoutAvailable": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "available": true,
      "price": 250,
      "hasNoodlesOption": false,
      "orderIndex": 73,
      "name": {
        "th": "หอยนางรมไทย 1P",
        "vi": "Hàu Thái 1P",
        "ja": "タイオイスター 1P",
        "zh": "泰式生蠔1P",
        "en": "Thai Style Fresh Oyster (1pc)",
        "ko": "타이 굴 1P"
      },
      "description": {
        "ko": "엄선된 L 사이즈 미야기 굴, 우유, 해산물! 매장의 시그니처! 생으로 먹어도 되고 구워서 먹어도 된다",
        "zh": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "th": "หอยนางรม มิยากิ นม และอาหารทะเลไซส์ L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน! สามารถรับประทานดิบหรือย่างได้",
        "ja": "宮城産の牡蠣・牛乳・魚介類をLサイズで厳選！お店のサインも！生でも焼いても食べられる",
        "vi": "Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng! Có thể ăn sống hoặc nướng"
      },
      "containsPork": false,
      "category": "seafood",
      "id": "dish-2303301719168",
      "containsSeafood": true,
      "recipe": []
    },
    {
      "name": {
        "zh": "勝獅",
        "en": "Singha Beer",
        "vi": "singapore",
        "th": "สิงคโปร์",
        "ja": "シンガポール",
        "ko": "싱가포르"
      },
      "available": true,
      "price": 110,
      "orderIndex": 74,
      "hasNoodlesOption": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "recipe": [],
      "id": "dish-2302272107257",
      "containsSeafood": false,
      "category": "cat-7cvvkq",
      "containsPork": false,
      "description": {
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      }
    },
    {
      "recipe": [],
      "category": "cat-7cvvkq",
      "id": "dish-2302162152176",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง"
      },
      "available": true,
      "price": 110,
      "hasNoodlesOption": false,
      "orderIndex": 75,
      "name": {
        "vi": "Thái Tường",
        "th": "ไท่เซียง",
        "ja": "太祥",
        "en": "Chang Beer",
        "zh": "泰象",
        "ko": "타이샹"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 80,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 76,
      "name": {
        "th": "กระเจี๊ยบ (ตามฤดูกาลเท่านั้น)",
        "ja": "オクラ（季節限定）",
        "vi": "Đậu bắp (chỉ theo mùa)",
        "zh": "秋葵(季節限定)",
        "en": "Charcoal Grilled Okra (Seasonal)",
        "ko": "오크라(계절 한정)"
      },
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
        "vi": "Giàu chất dinh dưỡng, ít calo và giàu canxi như sữa! Đó là một lựa chọn tốt cho sức khỏe dạ dày.",
        "ja": "栄養価が高く、カロリーが低く、カルシウムも牛乳と同じくらい豊富！胃の健康のためには良い選択です。",
        "th": "มีสารอาหารสูง แคลอรี่ต่ำ และมีแคลเซียมสูงเท่านม! เป็นทางเลือกที่ดีสำหรับสุขภาพกระเพาะอาหาร",
        "ko": "영양은 높고, 칼로리는 낮으며, 칼슘은 우유만큼 풍부! 위장 건강을 위한 좋은 선택입니다."
      },
      "containsPork": false,
      "category": "veggies",
      "containsSeafood": false,
      "id": "dish-2211162026366",
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "태국식 해산물 쌀국수",
        "en": "Thai Seafood Tom Yum Rice Noodle",
        "zh": "泰式海鮮米線",
        "ja": "タイ風シーフードビーフン",
        "vi": "Bún hải sản kiểu Thái",
        "th": "ก๋วยเตี๋ยวทะเลไทย"
      },
      "available": true,
      "price": 240,
      "orderIndex": 77,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "price": 20,
          "name": {
            "ko": "사진 추가",
            "en": "Add pho",
            "zh": "加河粉",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "vi": "Thêm phở"
          },
          "id": "addon-1784479721381-721"
        },
        {
          "price": 20,
          "name": {
            "en": "Add rice noodles",
            "zh": "加米線",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "vi": "Thêm bún",
            "ja": "ビーフンを加えます",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784479723321-863"
        },
        {
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)"
          },
          "id": "addon-1784479725596-570",
          "price": 140
        }
      ],
      "containsPork": false,
      "description": {
        "ko": "똠얌꿍을 맛보지 않았다면 태국 음식을 맛봤다고 말할 수 없습니다! 향토맛 국수면의 고전적인 맛, 풍부한 국물 베이스가 마음과 배를 따뜻하게 해준다.",
        "vi": "Bạn không thể nói mình đã nếm thử đồ ăn Thái nếu chưa thử Tom Yum Goong! Hương vị cổ điển của món phở đậm đà hương vị địa phương, nước súp đậm đà làm ấm lòng và dạ dày",
        "th": "คุณจะพูดไม่ได้ว่าเคยทานอาหารไทยแล้วถ้ายังไม่เคยลองต้มยำกุ้ง! รสชาติคลาสสิกของบะหมี่ซุปรสท้องถิ่น น้ำซุปเข้มข้นทำให้อุ่นหัวใจและท้อง",
        "ja": "トムヤムクンを試してみなければ、タイ料理を味わったとは言えません。郷土味スープ麺の定番の味わい、濃厚なスープが心もお腹も温まります",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃"
      },
      "recipe": [],
      "containsSeafood": true,
      "id": "dish-2209081804158",
      "category": "tomyum"
    },
    {
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "초이스 소갈비-5oz",
        "en": "USDA Choice Beef Short Rib Steak (5oz)",
        "zh": "Choice牛小排-5oz",
        "th": "ซี่โครงเนื้อทางเลือก-5oz",
        "ja": "特選ビーフショートリブ-5オンス",
        "vi": "Sườn Bò Choice-5oz"
      },
      "price": 590,
      "available": true,
      "orderIndex": 78,
      "hasNoodlesOption": false,
      "isNotSpicy": true,
      "customAddOns": [
        {
          "price": 20,
          "id": "addon-1784479747323-7",
          "name": {
            "ko": "사진 추가",
            "vi": "Thêm phở",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加",
            "zh": "加河粉",
            "en": "Add pho"
          }
        },
        {
          "price": 20,
          "id": "addon-1784479750303-903",
          "name": {
            "ko": "쌀국수 추가",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "ja": "ビーフンを加えます",
            "vi": "Thêm bún",
            "zh": "加米線",
            "en": "Add rice noodles"
          }
        },
        {
          "price": 140,
          "id": "addon-1784479752305-972",
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)"
          }
        }
      ],
      "containsPork": false,
      "description": {
        "ja": "丁寧にそぎ落とした生肉を炭火でじっくり焼き上げると、香ばしさが溢れ、一口食べるごとにとても美味しいです！",
        "th": "หลังจากที่เนื้อดิบได้รับการตัดแต่งอย่างระมัดระวังและย่างอย่างช้าๆบนไฟถ่าน กลิ่นหอมก็ล้นออกมา และทุกคำที่กัดก็อร่อยมาก!",
        "vi": "Sau khi thịt sống được cắt tỉa cẩn thận và nướng từ từ trên lửa than, mùi thơm tràn ngập, mỗi miếng cắn đều vô cùng thơm ngon!",
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
        "ko": "생고기를 정성스럽게 손질하여 숯불에 천천히 구워내면 고소한 향이 가득하고, 한입 먹을 때마다 정말 맛있습니다!"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2209081753180",
      "category": "skewers"
    },
    {
      "containsPork": false,
      "description": {
        "ko": "아침에 시장에 갔다가 따기와 양념장을 가지고 가지고 왔습니다. (닭꽁초 좋아하시는 분들은 필수!) 아직 튀겨지지 않았기 때문에 15분 정도 구워주세요.",
        "ja": "朝市場に行って、むしりとマリネを付けて持ち帰ってきました（鶏のお尻好きな人は必ず頼む！）まだ揚げていないので、15分ほど焼きます。",
        "th": "เมื่อเช้าผมไปตลาดก็เอากลับมาแบบถอนขนและหมักด้วย (คนชอบก้นไก่ต้องสั่ง!) เนื่องจากยังไม่ได้ทอดจึงอบประมาณ 15 นาที",
        "vi": "Sáng đi chợ mang về cùng với cả tuốt và ướp (món phải gọi của ai thích mông gà!) Vì chưa chiên nên nướng khoảng 15 phút.",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘"
      },
      "recipe": [],
      "category": "skewers",
      "id": "dish-2209081751117",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "available": true,
      "price": 90,
      "orderIndex": 79,
      "hasNoodlesOption": false,
      "name": {
        "en": "Extra Large Chicken Butt Skewers",
        "zh": "特大土雞七里香",
        "th": "ไก่ท้องถิ่น Qilixiang ขนาดใหญ่พิเศษ",
        "vi": "Gà địa phương cực lớn Qiilixiang",
        "ja": "特大地鶏七里香",
        "ko": "특대형 토종닭 Qilixiang"
      },
      "customAddOns": [],
      "isNotSpicy": false
    },
    {
      "containsPork": false,
      "description": {
        "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
        "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
        "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
        "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
        "zh": "精心調製，口感層次豐富，為您的餐點添彩",
        "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2208121916271",
      "category": "cat-zene8j",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
      "name": {
        "vi": "ớt bột",
        "ja": "パプリカ",
        "th": "พริกหยวก",
        "en": "Chili Powder Dip",
        "zh": "辣椒粉",
        "ko": "파프리카"
      },
      "price": 0,
      "available": true,
      "orderIndex": 80,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": []
    },
    {
      "id": "dish-2208121912457",
      "containsSeafood": true,
      "category": "tomyum",
      "recipe": [],
      "description": {
        "th": "คุณจะพูดไม่ได้ว่าเคยทานอาหารไทยแล้วถ้ายังไม่เคยลองต้มยำกุ้ง! รสชาติคลาสสิกของบะหมี่ซุปรสท้องถิ่น น้ำซุปเข้มข้นทำให้อุ่นหัวใจและท้อง",
        "vi": "Bạn không thể nói mình đã nếm thử đồ ăn Thái nếu chưa thử Tom Yum Goong! Hương vị cổ điển của món phở đậm đà hương vị địa phương, nước súp đậm đà làm ấm lòng và dạ dày",
        "ja": "トムヤムクンを試してみなければ、タイ料理を味わったとは言えません。郷土味スープ麺の定番の味わい、濃厚なスープが心もお腹も温まります",
        "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "ko": "똠얌꿍을 맛보지 않았다면 태국 음식을 맛봤다고 말할 수 없습니다! 향토맛 국수면의 고전적인 맛, 풍부한 국물 베이스가 마음과 배를 따뜻하게 해준다."
      },
      "containsPork": false,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "price": 20,
          "id": "addon-1784479804720-626",
          "name": {
            "vi": "Thêm phở",
            "ja": "フォーを追加",
            "th": "เพิ่มโพธิ์",
            "zh": "加河粉",
            "en": "Add pho",
            "ko": "사진 추가"
          }
        },
        {
          "name": {
            "zh": "加米線",
            "en": "Add rice noodles",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "vi": "Thêm bún",
            "ja": "ビーフンを加えます",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784479806981-555",
          "price": 20
        },
        {
          "price": 140,
          "id": "addon-1784479809050-307",
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）"
          }
        }
      ],
      "name": {
        "ja": "タイ風シーフードフォー",
        "vi": "Phở hải sản kiểu Thái",
        "th": "เฝอทะเลไทย",
        "zh": "泰式海鮮河粉",
        "en": "Thai Seafood Tom Yum Pho Noodle",
        "ko": "태국 해산물 포"
      },
      "price": 240,
      "available": true,
      "orderIndex": 81,
      "hasNoodlesOption": false,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400"
    },
    {
      "containsPork": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "外酥內嫩的口感，店內人氣商品!",
        "ja": "外はカリッと中はふわっとしたお店の人気商品です！",
        "vi": "Giòn bên ngoài và mềm bên trong, một mặt hàng phổ biến trong cửa hàng!",
        "th": "กรอบนอกนุ่มในเป็นสินค้ายอดนิยมของร้าน!",
        "ko": "겉은 바삭하고 속은 부드러운 이 매장의 인기상품!"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2208071821298",
      "category": "skewers",
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "태국식 바삭한 두부 스킨",
        "en": "Crispy Tofu Skin Skewer",
        "zh": "泰酥豆皮",
        "th": "หนังเต้าหู้กรอบ",
        "ja": "タイのパリパリ豆腐皮",
        "vi": "Da đậu hủ chiên giòn kiểu Thái"
      },
      "available": true,
      "price": 90,
      "orderIndex": 82,
      "hasNoodlesOption": false,
      "isNotSpicy": false,
      "customAddOns": []
    },
    {
      "recipe": [],
      "containsSeafood": true,
      "id": "dish-2208071820475",
      "category": "seafood",
      "containsPork": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
        "vi": "Nếu bạn chưa từng thử bánh tôm trung thu nướng than thì nhất định phải thử nhé! Nước chấm sẽ được bao gồm -> bánh tôm được làm thủ công gồm có tôm, nhân hải sản và chả cá, có hương vị hảo hạng",
        "th": "ใครยังไม่เคยลองขนมไหว้พระจันทร์ย่างเตาถ่านต้องลอง! น้ำจิ้มจะรวมอยู่ด้วย -> ทอดมันกุ้ง (ทำมือ) ประกอบด้วยกุ้ง ไส้ทะเล และกะปิ และมีรสชาติชั้นหนึ่ง",
        "ja": "炭火焼月海老餅をまだ食べたことがない方はぜひお試しください！つけだれもついてきます → エビケーキ（手作り）はエビ、魚介餡、かまぼこが入っており、一級品の味わいです",
        "ko": "아직 숯불구이 달새우떡을 먹어본 적이 없다면 꼭 드셔보세요! 디핑 소스가 포함됩니다 -> 새우 케이크는 새우, 해산물 충전재 및 어묵이 들어 있으며 (수제) 맛이 일품입니다."
      },
      "name": {
        "ko": "숯불구이 수제 달새우떡",
        "zh": "碳烤手工月亮蝦餅",
        "en": "Charcoal Grilled Handmade Moon Shrimp Cake",
        "th": "ขนมไหว้พระจันทร์ทำมือย่างถ่าน",
        "ja": "手作り月海老ケーキの炭火焼き",
        "vi": "Bánh trung thu nướng than thủ công"
      },
      "available": true,
      "price": 320,
      "orderIndex": 83,
      "hasNoodlesOption": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "name": {
        "ko": "크림 햄과 옥수수 수프",
        "vi": "Súp kem ngô và giăm bông",
        "ja": "ハムとコーンのクリーミースープ",
        "th": "ครีมแฮมและซุปข้าวโพด",
        "en": "Creamy Ham & Sweet Corn Soup",
        "zh": "奶香火腿玉米濃湯"
      },
      "available": true,
      "price": 160,
      "hasNoodlesOption": false,
      "orderIndex": 84,
      "isNotSpicy": true,
      "customAddOns": [],
      "containsPork": false,
      "description": {
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
        "vi": "Cẩn thận chọn 2 quả trứng + hạt ngô Hulk -> Nấu trên lửa chậm -> Rắc hạt tiêu đen mới xay -> Hoàn thành một bát súp đậm đà thơm mùi sữa",
        "ja": "卵2個＋ハルクコーン粒を厳選 → 弱火でじっくり煮込む → 挽きたての黒胡椒を振る → ミルキーな香りが広がる濃厚なスープの完成",
        "th": "เลือกไข่ 2 ฟองอย่างระมัดระวัง + เมล็ดข้าวโพด Hulk -> ปรุงโดยใช้ไฟอ่อน -> โรยด้วยพริกไทยดำบดสด -> เติมซุปเข้มข้นที่มีกลิ่นหอมของน้ำนมลงในชาม",
        "ko": "계란 2개 + 헐크옥수수 알갱이를 잘 골라서 -> 약불로 익히기 -> 갓 간 흑후추를 뿌리고 -> 우유향이 가득한 진한 국물 한 그릇 완성"
      },
      "recipe": [],
      "id": "dish-2208071816553",
      "containsSeafood": false,
      "category": "noodles"
    },
    {
      "recipe": [],
      "id": "dish-2207122341556",
      "containsSeafood": true,
      "category": "tomyum",
      "containsPork": false,
      "description": {
        "ko": "정통 태국 맛 수프, 풍부한 수프 베이스가 마음과 배를 따뜻하게 해줍니다.",
        "ja": "心もお腹も温まる、本場タイの風味豊かなスープベース",
        "vi": "Nước súp đậm đà hương vị Thái, nước súp đậm đà làm ấm lòng và dạ dày",
        "th": "น้ำซุปรสไทยแท้ น้ำซุปเข้มข้น อุ่นหัวใจและท้อง",
        "zh": "道地泰式風味湯，濃郁湯底暖心暖胃",
        "en": "Authentic Thai-style soup noodles with rich, warming broth"
      },
      "name": {
        "th": "ต้มยำทะเล",
        "ja": "シーフードトムヤムスープ",
        "vi": "Súp Tom Yum hải sản",
        "zh": "海鮮冬蔭功湯",
        "en": "Traditional Seafood Tom Yum Soup",
        "ko": "해산물 똠양꿍 수프"
      },
      "available": true,
      "price": 260,
      "hasNoodlesOption": false,
      "orderIndex": 85,
      "isNotSpicy": false,
      "customAddOns": [
        {
          "name": {
            "ko": "사진 추가",
            "en": "Add pho",
            "zh": "加河粉",
            "vi": "Thêm phở",
            "th": "เพิ่มโพธิ์",
            "ja": "フォーを追加"
          },
          "id": "addon-1784479887987-726",
          "price": 20
        },
        {
          "price": 20,
          "name": {
            "vi": "Thêm bún",
            "th": "ใส่เส้นก๋วยเตี๋ยว",
            "ja": "ビーフンを加えます",
            "en": "Add rice noodles",
            "zh": "加米線",
            "ko": "쌀국수 추가"
          },
          "id": "addon-1784479890262-993"
        },
        {
          "name": {
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          },
          "id": "addon-1784479892347-500",
          "price": 140
        }
      ],
      "containsBeef": false,
      "hasCoconutsMilkOption": true,
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400"
    },
    {
      "description": {
        "ja": "スープは甘めの甘め（骨と野菜を3時間煮込んでいます。MSGスープではありません。1日14食限定、売り切れ次第終了です。） 肉スライスはアメリカ産の柔らかい肩ヒレ肉特選グレードを使用！材料:中国大陸の女の子、玉ねぎ、ねぎ、九重塔、黒胡椒、もやし、ビーフン。",
        "th": "ซุปมีรสหวานอมหวาน (ต้มกระดูกและผักเป็นเวลา 3 ชั่วโมง ไม่ใช่ซุปผงชูรส จำกัดเพียง 14 มื้อต่อวันและจะขายหมด) เนื้อชิ้นทำจากเนื้อสันในอเมริกาเกรดคัดสรร! ส่วนผสม: เด็กหญิงจีนแผ่นดินใหญ่ หัวหอม ต้นหอม เจดีย์เก้าชั้น พริกไทยดำ ถั่วงอก และเส้นหมี่",
        "vi": "Nước súp ngọt ngọt (xương và rau được luộc trong 3 giờ. Không phải súp bột ngọt. Số lượng giới hạn 14 suất mỗi ngày và sẽ bán hết.) Các lát thịt được làm từ loại thịt thăn vai mềm của Mỹ tuyển chọn! Nguyên liệu: Cô gái Hoa lục, hành tây, hành lá, chùa chín tầng, tiêu đen, giá đỗ và bún.",
        "zh": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "ko": "국물은 달큰하고 (뼈와 야채를 3시간 끓여서 만든 국물입니다. MSG 국물이 아닙니다. 하루 14인분 한정이며 품절됩니다.) 고기조각은 미국산 안심 안심 쇠고기 초이스 등급으로 만듭니다! 재료: 중국 본토녀, 양파, 쪽파, 구층탑, 후추, 콩나물, 쌀국수."
      },
      "containsPork": false,
      "category": "noodles",
      "id": "dish-2207122341013",
      "containsSeafood": false,
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "containsBeef": true,
      "customAddOns": [
        {
          "price": 20,
          "name": {
            "ko": "사진 추가",
            "zh": "加河粉",
            "en": "Add pho",
            "ja": "フォーを追加",
            "vi": "Thêm phở",
            "th": "เพิ่มโพธิ์"
          },
          "id": "addon-1784479915298-709"
        },
        {
          "price": 140,
          "id": "addon-1784479917660-34",
          "name": {
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)"
          }
        }
      ],
      "isNotSpicy": true,
      "hasNoodlesOption": false,
      "orderIndex": 86,
      "available": true,
      "price": 250,
      "name": {
        "th": "เฝอเนื้อสดเวียดนาม",
        "ja": "ベトナムの新鮮な牛肉のフォー",
        "vi": "Phở bò tươi Việt Nam",
        "en": "Vietnamese Fresh Beef Pho Noodle Soup",
        "zh": "越南鮮牛肉河粉",
        "ko": "베트남산 신선한 쇠고기 포"
      }
    },
    {
      "description": {
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "洗選雞蛋2顆+海帶芽~外食族補充膳食纖維白質的好選擇",
        "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
        "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
        "vi": "Authentic Thai-style soup noodles with rich, warming broth",
        "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다"
      },
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "containsPork": false,
      "containsBeef": false,
      "category": "noodles",
      "containsSeafood": false,
      "id": "dish-2207122338495",
      "isNotSpicy": true,
      "available": true,
      "price": 90,
      "orderIndex": 87,
      "name": {
        "ko": "김 계란국",
        "vi": "Súp Rong Biển Trứng",
        "ja": "海苔とたまごのスープ",
        "th": "ซุปสาหร่ายไข่นุ่ม",
        "en": "Seaweed & Egg Drop Soup",
        "zh": "紫菜蛋花湯"
      }
    },
    {
      "description": {
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "每日早市新鮮採買~新鮮蛤蠣搭配蔥薑絲九層塔!越簡單越耐人尋味",
        "vi": "Authentic Thai-style soup noodles with rich, warming broth",
        "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
        "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
        "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다"
      },
      "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
      "containsPork": false,
      "containsBeef": false,
      "category": "noodles",
      "id": "dish-2207122336248",
      "containsSeafood": true,
      "isNotSpicy": true,
      "available": true,
      "price": 150,
      "orderIndex": 88,
      "name": {
        "vi": "Canh Nghêu Tươi Nấu Gừng Húng Quế",
        "th": "ซุปหอยตลับสดใส่ขิงและโหระพา",
        "ja": "新鮮アサリと生姜のクリアスープ",
        "zh": "鮮味蛤蜊湯",
        "en": "Fresh Clam Soup w/ Ginger",
        "ko": "신선한 바지락 생강 조개탕"
      }
    },
    {
      "hasNoodlesOption": false,
      "orderIndex": 89,
      "price": 100,
      "available": true,
      "name": {
        "ko": "금메달",
        "ja": "金メダル",
        "vi": "huy chương vàng",
        "th": "เหรียญทอง",
        "zh": "金牌",
        "en": "Taiwan Gold Medal Beer"
      },
      "customAddOns": [],
      "isNotSpicy": true,
      "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "cat-7cvvkq",
      "id": "dish-2207122331502",
      "containsSeafood": false,
      "containsPork": false,
      "description": {
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      }
    },
    {
      "id": "dish-2207122330338",
      "containsSeafood": false,
      "category": "cat-7cvvkq",
      "recipe": [],
      "description": {
        "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
        "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
        "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다."
      },
      "containsPork": false,
      "isNotSpicy": true,
      "customAddOns": [],
      "name": {
        "en": "Gold Draft Beer",
        "zh": "金樽",
        "vi": "cúp vàng",
        "th": "ถ้วยทอง",
        "ja": "黄金の杯",
        "ko": "황금 컵"
      },
      "hasNoodlesOption": false,
      "orderIndex": 90,
      "available": true,
      "price": 150,
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400"
    },
    {
      "description": {
        "ja": "冷たくさわやか、BBQに最高の組み合わせ",
        "th": "เย็นชื่นใจ รสสดชื่น เข้ากับบาร์บีคิวได้อย่างลงตัว",
        "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng",
        "zh": "肥仔的快樂水~搭配燒烤絕配!",
        "en": "Refreshing and cool, a perfect match for BBQ",
        "ko": "시원하고 상쾌한 음료로 바베큐와 완벽한 조화"
      },
      "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400",
      "containsPork": false,
      "containsBeef": false,
      "category": "drinks",
      "id": "dish-2207122323590",
      "containsSeafood": false,
      "isNotSpicy": true,
      "price": 90,
      "available": true,
      "orderIndex": 91,
      "name": {
        "ko": "코카콜라",
        "en": "Coca-Cola",
        "zh": "可口可樂",
        "ja": "コカ・コーラ",
        "vi": "Coca-Cola",
        "th": "โคคา-โคล่า"
      }
    },
    {
      "description": {
        "zh": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
        "en": "Refreshing and cool, a perfect match for delicious BBQ.",
        "vi": "Sữa Thái được dán nhãn thủ công cổ điển với hương trà đậm đà ~ sảng khoái và sảng khoái ~ đặc trưng!",
        "th": "นมไทยฉลากมือสุดคลาสสิค กลิ่นหอมชาเข้มข้น ~ สดชื่น สดชื่น ~ ซิกเนเจอร์!",
        "ja": "紅茶の香りが強い定番の手ラベルタイミルク～爽やかさわやか～の代表作！",
        "ko": "진한 차 향이 나는 클래식 핸드라벨 태국 우유~ 상큼하고 상큼한~ 시그니처!"
      },
      "containsPork": false,
      "category": "drinks",
      "containsSeafood": false,
      "id": "dish-2207122322371",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": true,
      "orderIndex": 92,
      "hasNoodlesOption": false,
      "available": true,
      "price": 90,
      "name": {
        "ko": "타이 밀크티 400ml",
        "ja": "タイミルクティー 400ml",
        "th": "ชานมไทย 400มล",
        "vi": "Trà sữa Thái 400ml",
        "en": "Signature Thai Iced Milk Tea (400ml)",
        "zh": "泰式奶茶400ml"
      }
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "en": "House Special Chili Sauce (Takeout Jar)",
        "zh": "特製辣椒醬(外帶)",
        "vi": "Tương ớt đặc biệt (mang đi)",
        "th": "น้ำพริกสูตรพิเศษ (ทูโก)",
        "ja": "特製チリソース（持ち帰り）",
        "ko": "특제 칠리소스(테이크아웃)"
      },
      "available": true,
      "price": 160,
      "orderIndex": 93,
      "hasNoodlesOption": false,
      "description": {
        "ko": "차오티안 고추와 다진 생강, 마늘을 볶은 요리~ 맛있고 방부제도 넣지 않았습니다! 집 구입시 냉장보관 필수",
        "ja": "朝天山椒、生姜、ニンニクの千切りを炒めました～保存料無添加で美味しいです！住宅購入時は要冷蔵",
        "th": "ผัดพริกเผาขิงและกระเทียมฝอย ~ อร่อยไม่ใส่สารกันบูด! ต้องแช่เย็นเมื่อซื้อกลับบ้าน",
        "vi": "Xào tiêu Chaotian, gừng và tỏi băm nhỏ ~ thơm ngon và không thêm chất bảo quản! Cần bảo quản tủ lạnh khi mua nhà",
        "zh": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
        "en": "Carefully crafted with rich flavors to complement your meal"
      },
      "containsPork": false,
      "id": "dish-2207122316233",
      "containsSeafood": false,
      "category": "cat-zene8j",
      "recipe": []
    },
    {
      "description": {
        "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
        "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
        "zh": "精心調製，口感層次豐富，為您的餐點添彩",
        "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
        "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
        "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ"
      },
      "containsPork": false,
      "category": "cat-zene8j",
      "id": "dish-2207122312525",
      "containsSeafood": false,
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "hasNoodlesOption": false,
      "orderIndex": 94,
      "price": 0,
      "available": true,
      "name": {
        "ja": "タイのグリーンソース",
        "th": "ซอสเขียวไทย",
        "vi": "Nước sốt xanh Thái",
        "en": "Thai Seafood Green Chili Sauce",
        "zh": "泰式綠醬",
        "ko": "태국 그린 소스"
      }
    },
    {
      "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "hasNoodlesOption": false,
      "orderIndex": 95,
      "price": 0,
      "available": true,
      "name": {
        "zh": "泰式紅醬",
        "en": "Thai BBQ Red Chili Sauce",
        "ja": "タイのレッドソース",
        "vi": "Nước sốt đỏ Thái",
        "th": "น้ำแดงไทย",
        "ko": "태국식 빨간 소스"
      },
      "description": {
        "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
        "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
        "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
        "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
        "zh": "精心調製，口感層次豐富，為您的餐點添彩",
        "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다"
      },
      "containsPork": false,
      "category": "cat-zene8j",
      "containsSeafood": false,
      "id": "dish-2207122311467",
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "zh": "四季豆",
        "en": "Charcoal Grilled Green Beans",
        "th": "ถั่วฝรั่งเศส",
        "vi": "Đậu pháp",
        "ja": "フランス豆",
        "ko": "프랑스산 콩"
      },
      "hasNoodlesOption": false,
      "orderIndex": 96,
      "price": 80,
      "available": true,
      "description": {
        "ko": "민감한 콩이라고도 알려진 이 콩은 맛이 달콤하고 영양분이 풍부하며 칼로리가 낮습니다.",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "又稱作敏豆，口感清甜、富含營養且低熱量",
        "vi": "Còn được gọi là đậu nhạy cảm, chúng có vị ngọt, giàu chất dinh dưỡng và ít calo.",
        "th": "เรียกอีกอย่างว่าถั่วที่ละเอียดอ่อน มีรสหวาน อุดมไปด้วยสารอาหารและมีแคลอรีต่ำ",
        "ja": "敏感豆とも呼ばれ、甘くて栄養が豊富でカロリーが低いです。"
      },
      "containsPork": false,
      "id": "dish-2207122252395",
      "containsSeafood": false,
      "category": "veggies",
      "recipe": []
    },
    {
      "description": {
        "ko": "신주의 인기 미트볼~어른도 아이도 좋아하는",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "新竹人氣丸子~大人小孩都愛",
        "th": "ลูกชิ้นยอดนิยมในซินจู๋ ~ ถูกใจทั้งเด็กและผู้ใหญ่",
        "ja": "新竹で人気のミートボール ～大人も子供も大好き",
        "vi": "Món thịt viên nổi tiếng ở Tân Trúc ~ được cả người lớn và trẻ em yêu thích"
      },
      "containsPork": true,
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2207122141316",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "hasNoodlesOption": false,
      "orderIndex": 97,
      "price": 60,
      "available": true,
      "name": {
        "zh": "新竹貢丸",
        "en": "Hsinchu Pork Meatballs",
        "ja": "新竹公湾",
        "vi": "Tân Trúc Gongwan",
        "th": "ซินจู๋ กงวาน",
        "ko": "신주공완"
      }
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ko": "펭펭은 달달한가요, 아니면 매운가요?",
        "en": "Chewy Charcoal Grilled Fish Cakes",
        "zh": "澎澎甜不辣",
        "th": "เป้งเป้งหวานหรือเผ็ดคะ?",
        "ja": "ペンペンは甘いですか、それとも辛いですか?",
        "vi": "Peng Peng ngọt hay cay?"
      },
      "orderIndex": 98,
      "hasNoodlesOption": false,
      "available": true,
      "price": 80,
      "description": {
        "zh": "烤甜不辣，口感Q彈紮實!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "ja": "炙ってあり、甘いけど辛くなく、モチモチとした食感！",
        "vi": "Rang, ngọt nhưng không cay, dai dai!",
        "th": "คั่วหวานแต่ไม่เผ็ด เนื้อเคี้ยวหนึบ!",
        "ko": "구워서 달콤하면서도 맵지 않고 쫄깃한 식감!"
      },
      "containsPork": false,
      "containsSeafood": true,
      "id": "dish-2207122140364",
      "category": "seafood",
      "recipe": []
    },
    {
      "containsPork": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "炭火慢烤，特大號，每一口都是極致美味!",
        "vi": "Nướng chậm trên lửa than, cực lớn, miếng nào cũng ngon!",
        "ja": "炭火でじっくり焼き上げた特大サイズで、一口食べても美味しい！",
        "th": "ย่างไฟบนเตาถ่าน ชิ้นใหญ่พิเศษ อร่อยทุกคำ!",
        "ko": "숯불에 천천히 구워서 특대형으로 한입 먹어도 맛있습니다!"
      },
      "recipe": [],
      "category": "seafood",
      "id": "dish-2207122132048",
      "containsSeafood": true,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "price": 390,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 99,
      "name": {
        "ko": "고등어 턱",
        "ja": "サバのチン",
        "th": "ปลาทูชิน",
        "vi": "cá thu cằm",
        "en": "Charcoal Grilled Mackerel Collar (XL)",
        "zh": "鯖甘魚下巴"
      },
      "customAddOns": [],
      "isNotSpicy": true
    },
    {
      "description": {
        "zh": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "th": "ต้องสั่ง! ต้องสั่ง! ต้องสั่ง! ซื้อสดๆจากตลาดตอนเช้า -> ล้างและหมักด้วยน้ำจิ้มสูตรเฉพาะของไทย",
        "ja": "必ず注文してください！必ず注文してください！必ず注文してください！朝市場から仕入れた新鮮→洗って特製タイソースに漬け込む",
        "vi": "Phải đặt hàng! Phải đặt hàng! Phải đặt hàng! Mới mua ngoài chợ lúc sáng -> Rửa sạch và ướp với sốt Thái độc quyền",
        "ko": "주문해야합니다! 주문해야합니다! 주문해야합니다! 아침에 마트에서 구매한 신선한 재료 -> 씻어서 태국 전용 소스에 재워둡니다"
      },
      "containsPork": false,
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2207122058577",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 160,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 100,
      "name": {
        "ja": "タイ風手羽先のグリル（4本）\n-- -\nタイの手作り牛肉",
        "vi": "Cánh gà nướng kiểu Thái đặc trưng (4 miếng)\n--​-\nThịt bò thủ công Thái Lan",
        "th": "ปีกไก่ย่างซิกเนเจอร์ (4 ชิ้น)\n---​​-\nเนื้อไทยทำมือ",
        "zh": "招牌泰式烤雞翅(4入)",
        "en": "Signature Thai BBQ Chicken Wings (4pcs)",
        "ko": "시그니처 타이 그릴드 치킨 윙(4개)\n--​​-\n태국산 수제 쇠고기"
      }
    },
    {
      "containsPork": false,
      "description": {
        "vi": "Xiên độc quyền!!! Phiên bản giới hạn thủ công hàng ngày ~ Sử dụng thịt bò địa phương và ngâm với nhiều loại gia vị Thái -> Cắt thịt cho đến khi dẻo rồi trộn vào đậu phộng Yunlin, không cần công nghệ, rất sống động, tất cả đều là thủ công tự nhiên!",
        "th": "สเต๊กพิเศษ!!! สินค้าทำมือรายวัน รุ่นลิมิเต็ด อิดิชั่น ~ ใช้เนื้อท้องถิ่นหมักด้วยเครื่องเทศไทยนานาชนิด -> สับเนื้อให้เหนียวแล้วผสมถั่วลิสงหยุนลิน ไม่ใช้เทคโนโลยี มีชีวิตชีวามาก เป็นงานฝีมือจากธรรมชาติทั้งหมด!",
        "ja": "特製串！毎日の手作り限定版〜地元の牛肉を使用し、さまざまなタイのスパイスで漬け込みます -> 肉を粘りが出るまで刻み、雲林ピーナッツを混ぜます、テクノロジーは使用せず、非常に生き生きとした、すべて天然の手作りです！",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
        "ko": "전용 꼬치!!! 일일 수제 한정판~ 국내산 쇠고기를 사용하고 각종 태국 향신료에 절인 후 -> 고기를 쫄깃쫄깃해질 때까지 다진 뒤 윤린땅콩을 섞어 무기술, 아주 생기 넘치는 천연수공예품!"
      },
      "recipe": [],
      "containsSeafood": false,
      "id": "dish-2207122056269",
      "category": "skewers",
      "containsBeef": true,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "name": {
        "zh": "泰式手工牛肉",
        "en": "Handmade Thai Spiced Beef Skewer",
        "vi": "xúc xích mực",
        "ja": "潮吹きソーセージ",
        "th": "ไส้กรอกฉีด",
        "ko": "스쿼트 소시지"
      },
      "hasNoodlesOption": false,
      "orderIndex": 101,
      "available": true,
      "price": 90,
      "isNotSpicy": false,
      "customAddOns": []
    },
    {
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
        "ja": "高尚な形容詞は一切ない ～ただストレートな美味しさだけ～ 台湾スナックの代表格",
        "vi": "Không có tính từ cao cả nào ~ chỉ có độ ngon trực tiếp nhất ~ đại diện cho món ăn nhẹ của Đài Loan",
        "th": "ไม่มีคำคุณศัพท์ที่สูงส่ง ~ มีแต่ความอร่อยที่ตรงที่สุดเท่านั้น ~ เป็นตัวแทนของขนมไต้หวัน",
        "ko": "고상한 형용사는 없다~가장 직접적인 맛만~대만과자 대표"
      },
      "containsPork": true,
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2207122053275",
      "recipe": [],
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 60,
      "available": true,
      "orderIndex": 102,
      "hasNoodlesOption": false,
      "name": {
        "ko": "갉아먹힌 닭 껍질",
        "th": "หนังไก่แทะ",
        "ja": "鶏の皮をかじった",
        "vi": "da gà gặm",
        "zh": "噴水香腸",
        "en": "Juicy Taiwanese Pork Sausage"
      }
    },
    {
      "orderIndex": 103,
      "hasNoodlesOption": false,
      "available": true,
      "price": 60,
      "name": {
        "ja": "タイ風骨なし鶏もも肉のグリル",
        "th": "สะโพกไก่ย่างไร้กระดูกแบบไทย",
        "vi": "Đùi gà nướng không xương kiểu Thái",
        "zh": "啃的雞皮",
        "en": "Crispy Charcoal Grilled Chicken Skin",
        "ko": "태국식 뼈없는 구운 닭다리살"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "recipe": [],
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-2207122051592",
      "containsPork": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
        "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันก็ลดลง~ และกลายเป็นเนื้อกรอบที่น่าหลงใหล!",
        "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than củi, chất béo được giảm bớt ~ và chuyển thành kết cấu giòn hấp dẫn!",
        "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂が減り、カリッとした食感が魅力的！",
        "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 줄어들고~ 바삭바삭한 식감이 매력으로 변신!"
      }
    },
    {
      "containsPork": false,
      "description": {
        "ko": "매일아침시장에서 갓 구매한 <순살닭다리는 대만산 꿩고기> <연육 무첨가>",
        "ja": "毎日朝市から新鮮仕入れ＜骨なし鶏もも肉は台湾産キジを使用＞＜肉軟化剤無添加＞",
        "vi": "Mới mua từ chợ buổi sáng hàng ngày <Chân gà không xương được làm từ gà lôi Đài Loan> <Không thêm chất làm mềm thịt>",
        "th": "ซื้อสดใหม่จากตลาดเช้าทุกวัน <ขาไก่ไร้กระดูกทำจากไก่ฟ้าไต้หวัน> <ไม่ใส่เนื้อนุ่ม>",
        "zh": "每日早市新鮮採買<去骨雞腿使用台灣放山雞><不添加嫩肉精>",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
      },
      "recipe": [],
      "category": "skewers",
      "id": "dish-2207122037251",
      "containsSeafood": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "available": true,
      "price": 160,
      "hasNoodlesOption": false,
      "orderIndex": 104,
      "name": {
        "vi": "Đùi gà nướng rút xương kiểu Thái",
        "th": "ไก่ย่างถอดกระดูกสไตล์ไทย",
        "ja": "タイ風骨なし鶏もも肉の炭火焼き",
        "zh": "泰式去骨烤雞腿",
        "en": "Thai Grilled Boneless Chicken Thigh",
        "ko": "태국식 뼈 없는 닭다리 구이"
      },
      "customAddOns": [],
      "isNotSpicy": false
    },
    {
      "category": "tomyum",
      "id": "dish-2005282340194",
      "containsSeafood": true,
      "recipe": [],
      "description": {
        "en": "Authentic Thai-style soup noodles with rich, warming broth",
        "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
        "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยร้อนๆ <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: กุ้งสด, ปลาหมึกแหวน, ลูกชิ้นปลาคอด, ลูกชิ้นหมู, ปลาญี่ปุ่น, หัวหอม, แครอทฝอย, แตงกวา และกะหล่ำปลี!",
        "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸っぱい前菜 ＜苦手な方はご遠慮ください＞ 材料：新鮮なエビ、イカリング、タラ団子、豚団子、魚の盛り合わせ、玉ねぎ、人参の千切り、キュウリ、キャベツ！",
        "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua cay <Không thích thì không gọi> Thành phần: tôm tươi, mực khoanh, cá tuyết viên, thịt heo viên, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột và bắp cải!",
        "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료: 신선한 새우, 오징어 링, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 양파, 채 썬 당근, 오이, 양배추!"
      },
      "containsPork": false,
      "customAddOns": [
        {
          "id": "addon-1784480168973-5",
          "name": {
            "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
            "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
            "zh": "升級套餐(烤蔬菜+泰奶一杯)",
            "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
            "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
            "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)"
          },
          "price": 140
        }
      ],
      "isNotSpicy": false,
      "orderIndex": 105,
      "hasNoodlesOption": false,
      "price": 190,
      "available": true,
      "name": {
        "th": "บะหมี่แห้งมาม่าทะเลไทยแท้ (เผ็ด)",
        "vi": "Mì khô mama hải sản Thái Lan chính hãng (cay)",
        "ja": "本格タイシーフードドライママヌードル（辛口）",
        "zh": "道地泰式海鮮乾拌mama麵（辣）",
        "en": "Seafood MAMA Noodles",
        "ko": "정통 태국 해산물 드라이마마 누들(매운맛)"
      },
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ko": "터진 새송이버섯",
        "zh": "爆汁杏鮑菇",
        "en": "Juicy King Oyster Mushroom Skewer",
        "vi": "Nấm Sò Vua Nổ",
        "ja": "爆裂キングヒラタケ",
        "th": "เห็ดนางรมราชาระเบิด"
      },
      "available": true,
      "price": 80,
      "orderIndex": 106,
      "hasNoodlesOption": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
        "th": "อร่อยและชุ่มฉ่ำ ~ เนื้อสัมผัสของเห็ดนางรม ~ รสชาติของเห็ดนางรมหลวงก็เหมือนไก่",
        "vi": "Ngon và ngon ngọt ~ Kết cấu của nấm sò ~ Hương vị của nấm sò vua giống như thịt gà",
        "ja": "ジューシーで美味しい〜エリンギの食感〜エリンギの味は鶏肉に似ています",
        "ko": "맛있고 육즙이 풍부해요~ 느타리버섯의 식감~ 새송이버섯의 맛은 닭고기와 비슷해요"
      },
      "containsPork": false,
      "id": "dish-1909192003211",
      "containsSeafood": false,
      "category": "veggies",
      "recipe": []
    },
    {
      "containsPork": false,
      "description": {
        "ko": "뼈도 없고 가시도 없는 꽁치를 멘타이코로 채워 맛이 좋습니다!",
        "vi": "Cá thu đao không xương và không xương, nhồi mentaiko, có vị rất ngon!",
        "ja": "骨と背骨のないさんまに明太子を詰めて食べると美味しいですよ！",
        "th": "ปลาซันไรย์ไม่มีกระดูกและไร้กระดูกสันหลังสอดไส้เมนไทโกะ รสชาติเยี่ยมมาก!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "去骨去刺秋刀魚，填入明太子，口感一流!"
      },
      "recipe": [],
      "category": "seafood",
      "containsSeafood": true,
      "id": "dish-1909191959076",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "orderIndex": 107,
      "hasNoodlesOption": false,
      "available": true,
      "price": 320,
      "name": {
        "ko": "멘타이코 꽁치(뼈제거) 2p",
        "th": "Mentaiko saury (เอากระดูกออก) 2p",
        "ja": "明太子さんま（骨抜き）2p",
        "vi": "Cá thu đao Mentaiko (đã bỏ xương) 2p",
        "zh": "明太子秋刀魚(去刺)2p",
        "en": "Deboned Pacific Saury Stuffed w/ Mentaiko (2pcs)"
      },
      "customAddOns": [],
      "isNotSpicy": true
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ko": "표고버섯",
        "ja": "しいたけ",
        "th": "เห็ดหอม",
        "vi": "nấm hương",
        "en": "Charcoal Grilled Shiitake Mushroom",
        "zh": "香菇"
      },
      "available": true,
      "price": 80,
      "hasNoodlesOption": false,
      "orderIndex": 108,
      "description": {
        "ko": "숯불에 천천히 구워낸 엄선된 버섯과 살이 두꺼워요~구운뒤 향이 가득!",
        "zh": "炭火慢烤，嚴選肉厚的香菇~烤完香氣十足!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "th": "ค่อยๆ ย่างบนไฟถ่าน เห็ดคัดสรรอย่างดี เนื้อหนา ~ ย่างแล้วหอมอวล!",
        "vi": "Nướng từ từ trên lửa than, nấm được lựa chọn cẩn thận với thịt dày ~ đầy mùi thơm sau khi rang!",
        "ja": "厳選した肉厚きのこを炭火でじっくり焼き上げました～焼き上がりは香り豊か！"
      },
      "containsPork": false,
      "id": "dish-1909191946205",
      "containsSeafood": false,
      "category": "veggies",
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "ja": "ピーマン",
        "vi": "tiêu xanh",
        "th": "พริกเขียว",
        "zh": "青椒",
        "en": "Charcoal Grilled Green Bell Pepper",
        "ko": "피망"
      },
      "price": 80,
      "available": true,
      "orderIndex": 109,
      "hasNoodlesOption": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
        "th": "พริกเขียวเป็นผักที่มีวิตามินซีสูง สูงกว่าส้ม และหลิวหั่นเต๋าในน้ำหนักเท่ากัน!",
        "vi": "Ớt xanh là loại rau có hàm lượng vitamin C cao, cao hơn cả cam và liễu thái hạt lựu ở cùng trọng lượng!",
        "ja": "ピーマンはビタミンCが豊富な野菜で、同じ重量のオレンジや角切りのヤナギよりも多く含まれています。",
        "ko": "풋고추는 같은 무게의 오렌지와 버드나무보다 비타민C 함량이 높은 채소입니다!"
      },
      "containsPork": false,
      "containsSeafood": false,
      "id": "dish-1909191945086",
      "category": "veggies",
      "recipe": []
    },
    {
      "containsBeef": false,
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "isNotSpicy": false,
      "customAddOns": [],
      "name": {
        "en": "Crispy Charcoal Grilled Pork Intestine",
        "zh": "精選香酥肥腸",
        "vi": "Xúc Xích Giòn Tuyển Chọn",
        "ja": "厳選クリスピーソーセージ",
        "th": "ไส้กรอกกรอบคัดพิเศษ",
        "ko": "엄선된 크리스피 소시지"
      },
      "available": true,
      "price": 60,
      "orderIndex": 110,
      "hasNoodlesOption": false,
      "description": {
        "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
        "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
        "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
        "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
        "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
        "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다"
      },
      "containsPork": true,
      "id": "dish-1909191943297",
      "containsSeafood": false,
      "category": "skewers",
      "recipe": []
    },
    {
      "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
      "containsBeef": true,
      "customAddOns": [],
      "isNotSpicy": false,
      "price": 70,
      "available": true,
      "hasNoodlesOption": false,
      "orderIndex": 111,
      "name": {
        "zh": "極炙原塊牛肋(澳牛)",
        "en": "Prime Australian Beef Rib Skewer",
        "th": "ซี่โครงเนื้อย่าง (เนื้อออสเตรเลีย)",
        "vi": "Sườn bò nướng (bò Úc)",
        "ja": "ビーフリブのグリル（オーストラリア産牛肉）",
        "ko": "구운 쇠고기 갈비(호주산 쇠고기)"
      },
      "description": {
        "ko": "완벽한 비율의 소갈비살은 겉은 그을리고 속은 핑크빛을 띕니다. 한입 먹는 것이 입맛을 돋우는 최고의 즐거움입니다!",
        "vi": "Những miếng sườn bò có tỷ lệ hoàn hảo được nướng chín bên ngoài và hồng hào bên trong. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn!",
        "ja": "絶妙なバランスの牛カルビは、外は炙り、中はピンク色に焼き上げられています。一口食べると、味覚にとって最高の楽しみが得られます。",
        "th": "ซี่โครงเนื้อที่ได้สัดส่วนกำลังดีจะถูกย่างด้านนอกและด้านในเป็นสีชมพู การได้กัดสักคำถือเป็นความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ!",
        "zh": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor"
      },
      "containsPork": false,
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-1909191940395",
      "recipe": []
    },
    {
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false,
      "customAddOns": [],
      "isNotSpicy": false,
      "available": true,
      "price": 70,
      "orderIndex": 112,
      "hasNoodlesOption": false,
      "name": {
        "th": "ไก่เนื้อ Qilixiang",
        "vi": "Gà thịt Qilixiang",
        "ja": "ブロイラーチキン キリシャン",
        "en": "Marinated Chicken Tail Skewers (5pcs)",
        "zh": "肉雞七里香",
        "ko": "육계 치킨 Qilixiang"
      },
      "description": {
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "zh": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
        "vi": "Năm xiên gà thịt với Qilixiang ~ không cắt làm đôi! Mới mua ở chợ buổi sáng hàng ngày ~ quay lại hái, rửa sạch và ướp với nước xốt độc quyền!",
        "th": "ไก่เนื้อห้าเสียบไม้กับ Qilixiang ~ ไม่ผ่าครึ่ง! ซื้อสดใหม่ที่ตลาดเช้าทุกวัน ~ กลับมาถอน ล้าง และหมักด้วยน้ำดองสุดพิเศษ!",
        "ja": "七里香入りブロイラー串5本～半分には切れません！毎日朝市で仕入れた新鮮〜摘み取って洗って専用マリネに漬け込んで帰ってきます！",
        "ko": "칠리샹을 곁들인 육계 꼬치 5개~ 반으로 쪼개지지 않아요! 매일 아침시장에서 갓 구매한~ 직접 따서 씻어서 전용 양념장에 재워두세요!"
      },
      "containsPork": false,
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-1909191316572",
      "recipe": []
    },
    {
      "recipe": [],
      "category": "skewers",
      "containsSeafood": false,
      "id": "dish-1909191310334",
      "containsPork": true,
      "description": {
        "ko": "고급스러운 태국식 바비큐를 꼭 맛보세요. 대만 현지 돼지고기를 신선한 고수풀로 말아서 황금빛 갈색이 되고 향긋해질 때까지 숯불에 구워냅니다. 한입 베어물면 육즙이 뿜어져 나옵니다!",
        "zh": "獨家泰式烤肉必點，選用台灣本土豬肉~捲入新鮮香菜~炭烤至金黃焦香一口咬下還會噴汁!",
        "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
        "vi": "Món thịt nướng Thái độc quyền là món bạn nhất định phải thử. Nó sử dụng thịt lợn địa phương của Đài Loan, cuộn trong rau mùi tươi và nướng trên than củi cho đến khi có màu vàng nâu và thơm. Nó sẽ phun ra nước trái cây khi bạn cắn nó!",
        "ja": "高級タイ風バーベキューはぜひお試しください。台湾産の豚肉を新鮮なコリアンダーで巻き、きつね色で香ばしく焼き上げるまで炭火で焼き上げました。噛むと汁が噴き出します！",
        "th": "บาร์บีคิวไทยสุดพิเศษเป็นสิ่งที่ต้องลอง ใช้หมูท้องถิ่นของไต้หวันคลุกผักชีสดแล้วย่างบนเตาถ่านจนเป็นสีเหลืองทองและมีกลิ่นหอม มันจะพ่นน้ำผลไม้เมื่อคุณกัด!"
      },
      "hasNoodlesOption": false,
      "orderIndex": 113,
      "price": 90,
      "available": true,
      "name": {
        "zh": "香菜豬肉捲",
        "en": "Coriander Pork Roll Skewer",
        "vi": "Chả giò ngò",
        "ja": "コリアンダーポークロール",
        "th": "ม้วนหมูผักชี",
        "ko": "고수 돼지고기 롤"
      },
      "customAddOns": [],
      "isNotSpicy": false,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "containsBeef": false
    }
  ];

export const INITIAL_INGREDIENTS: any[] = [
    {
      "minThreshold": 15,
      "id": "ig-01",
      "stock": 94,
      "unit": "pcs",
      "name": {
        "ko": "생새우",
        "ja": "新鮮なえび",
        "th": "กุ้งแชบ๊วย大",
        "zh": "大鮮蝦",
        "en": "Fresh Prawns"
      }
    },
    {
      "minThreshold": 20,
      "id": "ig-02",
      "stock": 99,
      "unit": "skewers",
      "name": {
        "en": "USDA Beef",
        "zh": "頂級牛肉串",
        "ja": "厳選牛肉串",
        "th": "เนื้อวัวพรีเมียม",
        "ko": "수제 소고기"
      }
    },
    {
      "id": "ig-03",
      "minThreshold": 10,
      "stock": 100,
      "unit": "kg",
      "name": {
        "ko": "유기농 양배추",
        "en": "Organic Cabbage",
        "zh": "鮮甜高麗菜",
        "th": "กะหล่ำปลีหวาน",
        "ja": "キャベツ"
      }
    },
    {
      "stock": 100,
      "minThreshold": 8,
      "id": "ig-04",
      "unit": "pcs",
      "name": {
        "en": "Oysters / Scallops",
        "zh": "生食干貝/生蠔",
        "th": "หอยนางรมยักษ์/หอยเชลล์",
        "ja": "生牡蠣・干貝",
        "ko": "석화 굴 및 가리비"
      }
    },
    {
      "minThreshold": 25,
      "id": "ig-05",
      "stock": 118,
      "unit": "packs",
      "name": {
        "ko": "라면 사리",
        "en": "Mama / Rice Noodles",
        "zh": "冬蔭功泡麵/米粉",
        "th": "บะหมี่มาม่า/ก๋วยเตี๋ยว",
        "ja": "ラーメン・フォー"
      }
    },
    {
      "name": {
        "ko": "코코넛 밀크",
        "ja": "ココナッツミルク缶",
        "th": "กะทิกระป๋องออร์แกนิก",
        "zh": "頂級椰奶罐",
        "en": "Rich Coconut Milk"
      },
      "stock": 100,
      "id": "ig-06",
      "minThreshold": 12,
      "unit": "cans"
    },
    {
      "unit": "liters",
      "stock": 100,
      "id": "ig-07",
      "minThreshold": 20,
      "name": {
        "ko": "홍차 베이스",
        "th": "ชาแดงตรามือเกรดส่งออก",
        "ja": "タイ茶葉",
        "zh": "泰手標紅茶原料",
        "en": "Thai Red Tea Brew"
      }
    },
    {
      "unit": "skewers",
      "minThreshold": 15,
      "id": "ig-08",
      "stock": 99,
      "name": {
        "ko": "돼지 삼겹 및 팽이",
        "en": "Pork Belly & Enoki",
        "zh": "爆香豬五花 / 金針菇",
        "ja": "豚バラ・えのき",
        "th": "หมูสามชั้น/เห็ดเข็มทอง"
      }
    }
  ];

export const INGREDIENT_RECIPE_MAP: { [foodId: string]: { ingredientId: string; amount: number }[] } = {};

export const INITIAL_PROMOTIONS: Promotion[] = [];














