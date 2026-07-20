import { MenuItem, Ingredient, Promotion, Language, Category } from './types';

export const TRANSLATIONS: { [key: string]: { [lang in Language]: string } } = {
  sabayBBQ: {
    zh: '沙貝燒烤 泰式烤肉',
    en: 'Sabay BBQ Thai Barbecue',
    ko: '사바이 바베큐 태국식 바베큐',
    ja: 'サバイ バーベキュー タイ風焼き肉',
    th: 'สบาย บาร์บีคิว หมูกระทะไทย',
    vi: 'Sabay BBQ Nướng Thái Lan',
  },
  slogan: {
    zh: '正宗泰式碳烤、冬蔭功系列、宵夜首選',
    en: 'Authentic Thai BBQ, Tom Yum & Perfect Late Night Bites',
    ko: '정통 태국식 바베큐, 똠얌 및 심야 꼬치',
    ja: '本格タイ風炭火焼き、トムヤム、深夜の絶品串焼き',
    th: 'บาร์บีคิวไทยแท้, ต้มยำ และอาหารมื้อดึกแสนอร่อย',
    vi: 'Nướng than Thái Lan chính hiệu, Tom Yum & Ăn đêm lý tưởng',
  },
  table: { zh: '桌號', en: 'Table', ko: '테이블 번호', ja: 'テーブル番号', th: 'โต๊ะที่', vi: 'Bàn số' },
  categories: { zh: '菜色分類', en: 'Categories', ko: '메뉴 분류', ja: 'カテゴリー', th: 'หมวดหมู่', vi: 'Danh mục' },
  addToCart: { zh: '加入購物車', en: 'Add to Cart', ko: '장바구니 담기', ja: 'カートに追加', th: 'ใส่ตะกร้า', vi: 'Thêm vào giỏ' },
  customOptions: { zh: '客製化選項', en: 'Custom Options', ko: '맞춤설정 옵션', ja: 'オプション調整', th: 'ตัวเลือกเพิ่มเติม', vi: 'Tùy chọn thêm' },
  spicinessLevel: { zh: '辣度調整', en: 'Spiciness', ko: '매운맛 조절', ja: '辛さの調整', th: 'ระดับความเผ็ด', vi: 'Mức độ cay' },
  sweetnessLevel: { zh: '甜度調整', en: 'Sweetness', ko: '당도 조절', ja: '甘さの調整', th: 'ระดับความหวาน', vi: 'Mức độ ngọt' },
  noodleOption: { zh: '麵體選擇', en: 'Noodle Option', ko: '면 선택', ja: '麺タイプの選択', th: 'เลือกประเภทเส้น', vi: 'Chọn loại mì' },
  coconutOption: { zh: '升級奶香冬蔭 (+NT0)', en: 'Add Coconut Milk (+NT0)', ko: '코코넛 밀크 추가 (+NT0)', ja: 'ココナッツミルク追加 (+NT0)', th: 'เพิ่มน้ำกะทิ (+NT0)', vi: 'Thêm nước cốt dừa (+NT0)' },
  spiciness: { zh: '辣度', en: 'Spiciness', ko: '매운맛', ja: '辛さ', th: 'ความเผ็ด', vi: 'Độ cay' },
  sweetness: { zh: '甜度', en: 'Sweetness', ko: '당도', ja: '甘み', th: 'ความหวาน', vi: 'Độ ngọt' },
  sauceNote: { zh: '醬料特別備註 (沙貝祕製沾醬)', en: 'Special Sauce Note (Sabay Sauce)', ko: '소스 특별 요청', ja: '特製ソースの要望', th: 'หมายเหตุซอส', vi: 'Ghi chú sốt (Sốt đặc biệt Sabay)' },
  lineLogin: { zh: '使用 Google 帳戶登入', en: 'Google Quick Login', ko: 'Google 계정으로 간편 로그인', ja: 'Google ログイン', th: 'เข้าสู่ระบบด้วย Google', vi: 'Đăng nhập nhanh Google' },
  checkout: { zh: '進一步結帳', en: 'Proceed to Checkout', ko: '결제하기', ja: 'お会計に進む', th: 'ดำเนินการชำระเงิน', vi: 'Tiến hành thanh toán' },
  myOrders: { zh: '我的歷史訂單', en: 'My Order History', ko: '내 주문 내역', ja: '주문履歴', th: 'ประวัติการสั่งซื้อ', vi: 'Lịch sử đơn hàng' },
  kitchenStaff: { zh: '廚房後台連線', en: 'Kitchen Display', ko: '주방 화면', ja: '厨房機器システム', th: 'หน้าจอในครัว', vi: 'Màn hình nhà bếp' },
  dashboard: { zh: '經營分析面板', en: 'Admin Management', ko: '경영 관리 대시보드', ja: '売上管理ダッシュボード', th: 'แผงจัดการร้าน', vi: 'Quản trị hệ thống' },
  inventoryTitle: { zh: '原料庫存管理', en: 'Ingredient Stock', ko: '식자재 재고 관리', ja: '原材料の在庫管理', th: 'จัดการคลังวัตถุดิบ', vi: 'Quản lý kho hàng' },
  totalPrice: { zh: '總金額', en: 'Total Price', ko: '총 合計 金額', ja: '合計金額', th: 'ราคารวม', vi: 'Tổng tiền' },
  orderPlaced: { zh: '訂單成功送出！正在為您準備', en: 'Order Placed! Preparing now...', ko: '주문 완료! 준비가 곧 완료됩니다.', ja: '注文完了！調理が始まりました。', th: 'ส่งออเดอร์แล้ว! กำลังเร่งเตรียมอาหารให้คุณ...', vi: 'Đặt món thành công! Đang chuẩn bị...' },
  printKitchenTicket: { zh: '列印廚房單 (模擬連線)', en: 'Print Kitchen Ticket', ko: '주방 전표 출력', ja: '伝票印刷', th: 'พิมพ์ใบสั่งงานครัว', vi: 'In hóa đơn bếp' },
  memberDiscount: { zh: '已綁定 Google 會員 (點數累積中)', en: 'Google Member Connected (Points Accumulating)', ko: 'Google 회원 연동됨 (포인트 적립 중)', ja: 'Google会員連携（ポイント貯まり中）', th: 'เชื่อมโยงสมาชิก Google แล้ว (สะสมคะแนน)', vi: 'Đã liên kết thành viên Google (Đang tích điểm)' },
  combo: { zh: '套餐', en: 'Set Meal', ko: '세트', ja: 'セット', th: 'เซ็ต', vi: 'Combo' },
  notSpicy: { zh: '不辣', en: 'Not Spicy', ko: '안 매움', ja: '辛くない', th: 'ไม่เผ็ด', vi: 'Không cay' },
  spicy: { zh: '辣', en: 'Spicy', ko: '매움', ja: '辛い', th: 'เผ็ด', vi: 'Cay' },
  approxTime: { zh: '約 10-15 分鐘', en: 'Approx. 10-15 mins', ko: '약 10-15분 소요', ja: '約10〜15分', th: 'ประมาณ 10-15 นาที', vi: 'Khoảng 10-15 phút' },
  orderDish: { zh: '點餐', en: 'Order', ko: '주문', ja: '注文', th: 'สั่งอาหาร', vi: 'Đặt món' },
  soldOut: { zh: '明日請早', en: 'Sold Out', ko: '품절', ja: '本日完売', th: 'หมดแล้ว', vi: 'Hết hàng' },
  myOrdersTab: { zh: '📜 您的即時與歷史訂單 My Orders', en: '📜 Live & Past Orders', ko: '📜 실시간 및 이전 주문', ja: '📜 リアルタイム＆履歴注文', th: '📜 ออเดอร์เรียลไทม์และประวัติ', vi: '📜 Đơn hàng hiện tại & Lịch sử' },
  bestSellersTab: { zh: '🔥 熱銷人氣 Best Sellers', en: '🔥 Best Sellers', ko: '🔥 베스트 셀러', ja: '🔥 人気ベストセラー', th: '🔥 เมนูขายดี', vi: '🔥 Bán chạy nhất' },
  liveActiveQueue: { zh: '⏳ 即時製作中 Live Active Queue', en: '⏳ Live Active Queue', ko: '⏳ 실시간 조리 중', ja: '⏳ 調理中リアルタイム', th: '⏳ กำลังปรุงอาหาร', vi: '⏳ Đang chuẩn bị món' },
  autoUpdate: { zh: '一秒自動更新', en: 'Auto-updates', ko: '실시간 자동 업데이트', ja: '自動更新', th: 'อัปเดตอัตโนมัติ', vi: 'Tự động cập nhật' },
  payMethod: { zh: '付費', en: 'Payment', ko: '결제 방식', ja: 'お支払い', th: 'การชำระเงิน', vi: 'Thanh toán' },
  payableTotal: { zh: '應付總額', en: 'Total Due', ko: '총 결제 금액', ja: '合計金額', th: 'ยอดรวมที่ต้องชำระ', vi: 'Tổng tiền thanh toán' },
  rateExperience: { zh: '✏️ 留下您的用餐評價 Rate Experience', en: '✏️ Rate Experience', ko: '✏️ 식사 후기 남기기', ja: '✏️ 評価を記入する', th: '✏️ เขียนรีวิวการทานอาหาร', vi: '✏️ Đánh giá trải nghiệm' },
  selectStars: { zh: '點選星星進行評分 Select stars:', en: 'Select stars:', ko: '별점 선택:', ja: '星をクリックして評価:', th: 'เลือกดาวเพื่อประเมิน:', vi: 'Chọn số sao đánh giá:' },
  feedbackOptional: { zh: '寫下您的寶貴建議 (選填) Optional Feedback:', en: 'Optional Feedback:', ko: '의견 쓰기 (선택):', ja: 'フィードバック (任意):', th: 'คำแนะนำเพิ่มเติม (ไม่บังคับ):', vi: 'Ý kiến đóng góp (tùy chọn):' },
  welcomeBackNotice: { zh: '歡迎再度光臨沙貝炭烤！系統已為您加載歷史消費與餐點足跡。點擊下方 「快速再點一次」 即可一鍵加入購物車快速重啟美味！', en: 'Welcome back to Sabay BBQ! Your history and footprint have been loaded. Click "Quick Reorder" below to add to cart and enjoy!', ko: '사바이 바베큐에 다시 오신 것을 환영합니다! 이전 기록과 발자취가 불러와졌습니다. 아래 "간편 재주문"을 클릭하여 장바구니에 담고 즐겨보세요!', ja: 'サバイバーベキューへようこそ！履歴データが読み込まれました。下の「クイック再注文」をクリックしてカートに追加し、お楽しみください！', th: 'ยินดีต้อนรับกลับสู่ Sabay BBQ! โหลดประวัติการสั่งซื้อของคุณแล้ว คลิก "สั่งซ้ำอย่างรวดเร็ว" ด้านล่างเพื่อใส่ตะกร้าและเพลิดเพลิน!', vi: 'Chào mừng trở lại Sabay BBQ! Lịch sử chi tiêu của bạn đã được tải. Nhấp vào "Đặt lại nhanh" bên dưới để thêm vào giỏ hàng và thưởng thức!' },
  noPastRecords: { zh: '尚無歷史消費紀錄 No past records found.', en: 'No past records found.', ko: '이전 소비 기록이 없습니다.', ja: '履歴はありません。', th: 'ไม่พบประวัติการสั่งซื้อ', vi: 'Không tìm thấy lịch sử đơn hàng.' },
  sugarFree: { zh: '無糖', en: '0%', ko: '무당', ja: '無糖', th: 'ไม่หวาน', vi: 'Không đường' },
  sweet30: { zh: '三分', en: '30%', ko: '3부', ja: '3分糖', th: 'หวานน้อย 30%', vi: '30% đường' },
  sweet50: { zh: '半糖', en: '50%', ko: '반당', ja: '半糖', th: 'หวานปานกลาง 50%', vi: '50% đường' },
  sweet100: { zh: '正常', en: '100%', ko: '정상', ja: '通常', th: 'หวานปกติ 100%', vi: '100% đường' },
  mildSpicy: { zh: '小辣', en: 'Mild', ko: '약간 매움', ja: '小辛', th: 'เผ็ดน้อย', vi: 'Cay ít' },
  mediumSpicy: { zh: '中辣', en: 'Medium', ko: '중간 매움', ja: '中辛', th: 'เผ็ดกลาง', vi: 'Cay vừa' },
  thaiSpicy: { zh: '泰大辣', en: 'Thai Hot', ko: '태국식 대단히 매움', ja: 'タイ大辛', th: 'เผ็ดมาก (สไตล์ไทย)', vi: 'Cay Thái siêu cay' },
  riceNoodle: { zh: '河粉', en: 'Rice Noodle', ko: '쌀국수', ja: 'フォー', th: 'เส้นเล็ก', vi: 'Hủ tiếu' },
  vermicelli: { zh: '米線', en: 'Vermicelli', ko: '미선', ja: 'ビーフン', th: 'เส้นหมี่', vi: 'Bún' },
  noNoodle: { zh: '無', en: 'None', ko: '없음', ja: 'なし', th: 'ไม่มี', vi: 'Không' },
  qtyPortion: { zh: '份', en: 'portion(s)', ko: '개', ja: 'つ', th:  'ที่', vi: 'phần' },
  sweet: { zh: '甜', en: 'Sweet', ko: '당도', ja: '甘さ', th: 'หวาน', vi: 'Ngọt' },
  spicyPrefix: { zh: '辣', en: 'Spiciness', ko: '매운맛', ja: '辛さ', th: 'เผ็ด', vi: 'Cay' },
  noodlePrefix: { zh: '麵', en: 'Noodle', ko: '면', ja: '麺', th: 'เส้น', vi: 'Mì' },
  coconutMilkAdd: { zh: '椰奶(+50)', en: 'Add Coconut Milk (+50)', ko: '코코넛 밀크 (+50)', ja: 'ココナッツミルク (+50)', th: 'กะทิ (+50)', vi: 'Cốt dừa (+50)' },
  quickNotesLabel: { zh: 'KDS 快速備註 (Quick Notes/Dictations)', en: 'KDS Quick Notes / Dictations', ko: 'KDS 신속 메모 / 구두 지시', ja: 'KDS クイックメモ / 口頭指示', th: 'บันทึกด่วน KDS', vi: 'Ghi chú nhanh KDS' },
  recordingText: { zh: '正在錄音...', en: 'Recording...', ko: '녹음 중...', ja: '録音中...', th: 'กำลังบันทึกเสียง...', vi: 'Đang ghi âm...' },
  voiceVoiceBtn: { zh: '🎙️ 語音語音', en: '🎙️ Voice Dictation', ko: '🎙️ 음성 인식', ja: '🎙️ 音声入力', th: '🎙️ แปลงเสียง', vi: '🎙️ Nhận diện giọng nói' },
  listeningPlaceholder: { zh: '正在傾聽並將語音轉換成文字...', en: 'Listening and converting speech to text...', ko: '듣고 음성을 텍스트로 변환하는 중...', ja: '音声を聞き取り、テキストに変換中...', th: 'กำลังฟังและแปลงเสียงเป็นข้อความ...', vi: 'Đang nghe và chuyển đổi giọng nói thành văn bản...' },
  notesPlaceholder: { zh: '請按下方按鈕或在此輸入備註/口頭指令...', en: 'Press the button below or enter notes/verbal instructions here...', ko: '아래 버튼을 누르거나 여기에 메모/구두 지시를 입력하세요...', ja: '下のボタンを押すか、ここにメモ・口頭指示を入力してください...', th: 'กดปุ่มด้านล่างหรือกรอกบันทึก/คำสั่งเสียงที่นี่...', vi: 'Nhấn nút bên dưới hoặc nhập ghi chú/chỉ thị bằng lời nói tại đây...' },
  cancelBtn: { zh: '取消', en: 'Cancel', ko: '취소', ja: 'キャンセル', th: 'ยกเลิก', vi: 'Hủy' },
  stopParseBtn: { zh: '停止/解析', en: 'Stop & Parse', ko: '중지/해석', ja: '停止・解析', th: 'หยุด/วิเคราะห์', vi: 'Dừng/Phân tích' },
  saveNotesBtn: { zh: '儲存備註', en: 'Save Notes', ko: '메모 저장', ja: '메모를保存', th: 'บันทึกข้อความ', vi: 'Lưu ghi chú' },
  noNotesPlaceholder: { zh: '暫無臨時備註，可使用麥克風錄製或口述', en: 'No notes yet. Use the microphone or type to dictate.', ko: '등록된 임시 메모가 없습니다. 마이크나 입력을 사용해 지시하세요.', ja: '臨時メモはありません。マイク録音または直接入力してください。', th: 'ไม่มีบันทึกด่วน สามารถใช้ไมค์บันทึกเสียงหรือพิมพ์ได้', vi: 'Chưa có ghi chú tạm thời, có thể sử dụng micro để ghi âm hoặc tự nhập' },
  paymentPrefix: { zh: '付費', en: 'Paid', ko: '결제', ja: 'お支払い', th: 'ชำระแล้ว', vi: 'Đã trả' },
  swipeToCompleteTip: { zh: '🤝 支援右滑直接出餐 Complete', en: '🤝 Swipe right to complete', ko: '🤝 오른쪽으로 밀어서 완료', ja: '🤝 右スワイプで出餐完了', th: '🤝 ปัดขวาเพื่อส่งอาหารทันที', vi: '🤝 Vuốt phải để hoàn thành đơn' },
  cookBtn: { zh: '下鍋烹調', en: 'Cook', ko: '조리 시작', ja: '調理開始', th: 'ปรุงอาหาร', vi: 'Chế biến' },
  completeBtn: { zh: '出餐完成', en: 'Done', ko: '출고 완료', ja: '出餐完了', th: 'เสร็จสิ้น', vi: 'Hoàn thành' },
  payCash: { zh: '現金支付', en: 'Cash Payment', ko: '현금 결제', ja: '現金支払い', th: 'ชำระด้วยเงินสด', vi: 'Thanh toán tiền mặt' },
  payCashDesc: { zh: '現場免加額/有優惠', en: 'No extra fee / Special offer', ko: '현장 추가 요금 없음/할인', ja: '手数料なし/割引あり', th: 'ไม่มีค่าธรรมเนียมเพิ่มเติม/มีส่วนลด', vi: 'Không phụ phí/Có ưu đãi' },
  payCredit: { zh: '信用卡支付', en: 'Credit Card', ko: '신용카드 결제', ja: 'クレジットカード支払い', th: 'บัตรเครดิต', vi: 'Thẻ tín dụng' },
  payCreditDesc: { zh: '均含服務加收10%', en: 'Includes 10% service charge', ko: '10% 서비스 요금 포함', ja: '10%のサービス料込み', th: 'รวมค่าบริการ 10%', vi: 'Đã bao gồm 10% phí dịch vụ' },
  payLinepay: { zh: 'TWQR支付', en: 'TWQR / Line Pay', ko: 'TWQR / 라인페い', ja: 'TWQR / LINE Pay', th: 'TWQR / Line Pay', vi: 'TWQR / Line Pay' },
  payLinepayDesc: { zh: '預設服務費10%', en: '10% service fee applies', ko: '기본 서비스 요금 10%', ja: '基本サービス料10%', th: 'ค่าธรรมเนียมบริการ 10%', vi: 'Phí dịch vụ mặc định 10%' },
  payMember: { zh: '會員儲值支付', en: 'Member Balance', ko: '회원 선불 결제', ja: '会員プリペイド決済', th: 'ชำระด้วยยอดสมาชิก', vi: 'Thanh toán số dư thành viên' },
  payMemberDesc: { zh: '扣抵會員帳戶餘額', en: 'Deduct from member balance', ko: '회원 계정 잔액에서 차감', ja: '会員アカウント残高から引落し', th: 'หักจากยอดเงินคงเหลือสมาชิก', vi: 'Khấu trừ từ số dư thành viên' },
  notesLabel: { zh: '備註', en: 'Note', ko: '메모', ja: '備考', th: 'หมายเหตุ', vi: 'Ghi chú' },
  soupBaseLabel: { zh: '湯頭', en: 'Soup Base', ko: '국물', ja: 'スープ', th: 'น้ำซุป', vi: 'Nước lèo' },
  addOnsLabel: { zh: '加購配料', en: 'Add-ons', ko: '추가 토핑', ja: 'トッピング', th: 'ท็อปปิ้ง', vi: 'Topping' },
  doneText: { zh: '已完成', en: 'Done', ko: '완료됨', ja: '完了', th: 'เสร็จสิ้น', vi: 'Đã xong' },
  makeDoneText: { zh: '製作完成', en: 'Mark Done', ko: '조리 완료', ja: '調理完了', th: 'ปรุงเสร็จ', vi: 'Chế biến xong' },
  deleteBtn: { zh: '刪除', en: 'Delete', ko: '삭제', ja: '削除', th: 'ลบ', vi: 'Xóa' },
  orderCompletedState: { zh: '已順利出餐 Done', en: 'Successfully Served', ko: '출고 완료됨 Done', ja: '出餐完了 Done', th: 'เสร็จสิ้นการส่งอาหาร Done', vi: 'Đã phục vụ xong' },
  orderCancelledState: { zh: '已廢棄 Cancel', en: 'Discarded Cancel', ko: '폐기됨 Cancel', ja: '廃棄済み Cancel', th: 'ยกเลิกออเดอร์แล้ว Cancel', vi: 'Đã hủy Cancel' },
  attentionReasonTitle: { zh: '特別關注原因 (Attention Reason)', en: 'Special Attention Reason', ko: '특별 관리 사유', ja: '特別指示の理由', th: 'เหตุผลที่ต้องดูแลเป็นพิเศษ', vi: 'Lý do cần lưu ý đặc biệt' },
  inputAttentionReasonPlaceholder: { zh: '請輸入關注原因（例如：餐點特製少鹽、急催出餐、湯少...）', en: 'Enter reason (e.g., less salt, rush order, less soup...)', ko: '주의 사유를 입력하세요 (예: 싱겁게, 신속 조리, 국물 적게...)', ja: '指示内容を入力（例：塩少なめ、急ぎ、スープ少なめ...）', th: 'กรุณากรอกเหตุผลที่ต้องเน้น (เช่น เกลือน้อย, รีบด่วน, น้ำซุปน้อย...)', vi: 'Vui lòng nhập lý do lưu ý (ví dụ: ít muối, làm gấp, ít nước súp...)' },
  confirmFlagBtn: { zh: '確定標記', en: 'Flag', ko: '표시 완료', ja: '마크 확정', th: 'ยืนยันปักหมุด', vi: 'Xác nhận gắn cờ' },
  specialAttentionActive: { zh: '🛑 特別關注 ORDER FLAGGED', en: '🛑 SPECIAL ATTENTION FLAGGED', ko: '🛑 특별 주의 ORDER FLAGGED', ja: '🛑 特別対応指示あり', th: '🛑 ดูแลเป็นพิเศษ ORDER FLAGGED', vi: '🛑 LƯU Ý ĐẶC BIỆT FLAGGED' },
  clearAttentionBtn: { zh: '取消關注', en: 'Unflag', ko: '주의 해제', ja: 'マーク解除', th: 'ยกเลิกปักหมุด', vi: 'Bỏ lưu ý' },
  noAttentionReasonNotes: { zh: '店員未備註具體原因', en: 'No specific reason provided by staff', ko: '직원의 구체적인 메모가 없습니다', ja: '店舗スタッフ의 구체적인 비고가 없습니다', th: 'พนักงานไม่ได้ระบุรายละเอียดเพิ่มเติม', vi: 'Nhân viên chưa ghi chú lý do cụ thể' },
  flagReasonPrefix: { zh: '原因', en: 'Reason', ko: '사유', ja: '理由', th: 'เหตุผล', vi: 'Lý do' },
  totalQtyPrefix: { zh: '總量', en: 'Total', ko: '총 수량', ja: '総量', th: 'จำนวนทั้งหมด', vi: 'Tổng cộng' },
  tableBreakdownTitle: { zh: '各桌點單分配 (Table Breakdown)', en: 'Table Breakdown', ko: '테이블별 주문 분배', ja: 'テーブルごとの注文割当', th: 'การกระจายออเดอร์ตามโต๊ะ', vi: 'Phân phối món theo bàn' },
  tableLabel: { zh: '桌', en: 'Table', ko: '테이블', ja: '番テーブル', th: 'โต๊ะ', vi: 'bàn' },
  takeoutLabel: { zh: '外帶', en: 'Takeout', ko: '포장', ja: '持ち帰り', th: 'กลับบ้าน', vi: 'Mang đi' },
  orderNoLabel: { zh: '單號', en: 'Order ID', ko: '주문번호', ja: '注文番号', th: 'หมายเลขออเดอร์', vi: 'Mã đơn' },
  timeElapsedLabel: { zh: '已等', en: 'Waited', ko: '대기시간', ja: '経過時間', th: 'รอแล้ว', vi: 'Đã chờ' },
  closingSoonAlert: { zh: '⚠️ 即將關店', en: '⚠️ Closing Soon', ko: '⚠️ 영업 종료 임박', ja: '⚠️ 閉店間近', th: '⚠️ ใกล้ปิดร้าน', vi: '⚠️ Sắp đóng cửa' },
  closingSoonRushAlert: { zh: '⚠️ 即將關店，加速出餐', en: '⚠️ Closing Soon, Rush Order', ko: '⚠️ 영업 종료 임박, 조리 속도 향상', ja: '⚠️ 閉店間近、お急ぎ出餐', th: '⚠️ ใกล้ปิดร้าน เร่งทำด่วน', vi: '⚠️ Sắp đóng cửa, đẩy nhanh tiến độ' },
  quickViewBtn: { zh: '快速檢視 View', en: 'Quick View', ko: '신속 보기', ja: 'クイック閲覧', th: 'ดูอย่างรวดเร็ว', vi: 'Xem nhanh' },
  printPreviewBtn: { zh: '列印預覽 Print', en: 'Print Preview', ko: '인쇄 미리보기', ja: '印刷プレビュー', th: 'ดูตัวอย่างพิมพ์', vi: 'Xem trước in' },
  notSelectedCategory: { zh: '非選定分區', en: 'Other category', ko: '미선택 구역', ja: '非対象カテゴリ', th: 'ไม่ได้เลือกหมวดหมู่นี้', vi: 'Không thuộc danh mục đã chọn' },
  sharedByTables: { zh: '個桌號點購此品項', en: 'table(s) ordered this item', ko: '개 테이블에서 이 품목을 주문했습니다', ja: '個のテーブルがこの品目を注文しました', th: 'โต๊ะที่สั่งเมนูนี้', vi: 'bàn đã đặt món này' },
  sharedByTablesPrefix: { zh: '共有', en: 'Ordered by', ko: '총', ja: '合計', th: 'มีทั้งหมด', vi: 'Có tổng cộng' },
  pendingWaitState: { zh: '⏱️ 待辦等候 Wait', en: '⏱️ Pending Wait', ko: '⏱️ 대기 중 Wait', ja: '⏱️ 待ち状態 Wait', th: '⏱️ กำลังรอ Wait', vi: '⏱️ Đang đợi Wait' },
  prepState: { zh: '🍳 製作中 Prep', en: '🍳 Preparing Prep', ko: '🍳 조리 중 Prep', ja: '🍳 調理中 Prep', th: '🍳 กำลังปรุง Prep', vi: '🍳 Đang làm Prep' },
  pendingOverdue: { zh: '⚠️ 待辦超時 Overdue', en: '⚠️ Pending Overdue', ko: '⚠️ 대기 초과 Overdue', ja: '⚠️ 待ち時間超過 Overdue', th: '⚠️ รอเกินเวลา Overdue', vi: '⚠️ Chờ quá giờ Overdue' },
  tableOccupiedLabel: { zh: '桌況佔用 Seated', en: 'Seated Duration', ko: '테이블 점유 시간', ja: '席の利用時間', th: 'เวลานั่งโต๊ะสะสม', vi: 'Thời gian ngồi bàn' },
  customerRetentionLabel: { zh: '顧客滯留 Live', en: 'Customer Duration', ko: '고객 체류 시간', ja: '顧客滞在時間', th: 'เวลาลูกค้าอยู่ในร้าน', vi: 'Thời gian khách ở quán' },
  attentionFlagBtnActive: { zh: '已標記關注', en: 'Flagged', ko: '관심 등록됨', ja: 'マーク済み', th: 'ปักหมุดแล้ว', vi: 'Đã gắn cờ' },
  attentionFlagBtnInactive: { zh: '關注標記', en: 'Flag', ko: '관심 등록', ja: 'マーク', th: 'ปักหมุด', vi: 'Gắn cờ' },
  dictatingState: { zh: '正在錄音...', en: 'Recording...', ko: '녹음 중...', ja: '녹음 중...', th: 'กำลังบันทึก...', vi: 'Đang ghi âm...' },
  dictateVoiceBtn: { zh: '🎙️ 語音語音', en: '🎙️ Dictate', ko: '🎙️ 음성입력', ja: '🎙️ 音声入力', th: '🎙️ พูดบันทึก', vi: '🎙️ Ghi âm' },
  submitRating: { zh: '送出評價 Submit Rating', en: 'Submit Rating', ko: '후기 등록', ja: '評価を送信', th: 'ส่งรีวิว', vi: 'Gửi đánh giá' },
  rateOrderBtn: { zh: '評價此筆訂單 Rate Order', en: 'Rate Order', ko: '이 주문 평가하기', ja: 'この注文を評価', th: 'รีวิวออเดอร์นี้', vi: 'Đánh giá đơn hàng này' },
  pastOrdersTitle: { zh: '📜 已完成之歷史訂單 Past Orders', en: '📜 Past Orders', ko: '📜 이전 완료된 주문', ja: '📜 完了した履歴注文', th: '📜 ประวัติออเดอร์ที่เสร็จสิ้น', vi: '📜 Lịch sử đơn hàng đã hoàn thành' },
  pastRecordLabel: { zh: '歷史消費紀錄 Past', en: 'Past Record', ko: '이전 기록', ja: '履歴データ', th: 'ประวัติการสั่งซื้อ', vi: 'Lịch sử' },
  reorderBtn: { zh: '快速再點一次 Reorder', en: 'Quick Reorder', ko: '간편 재주문', ja: 'クイック再注文', th: 'สั่งซ้ำอย่างรวดเร็ว', vi: 'Đặt lại nhanh' },
  detailsOrAdjust: { zh: '詳情/調整', en: 'Details/Adjust', ko: '상세/조절', ja: '詳細・調整', th: 'รายละเอียด/ปรับแต่ง', vi: 'Chi tiết/Điều chỉnh' },
  clickToBrowse: { zh: '點擊瀏覽', en: 'View Details', ko: '자세히 보기', ja: 'クリックして閲覧', th: 'คลิกเพื่อดู', vi: 'Nhấp để xem' },
  quickAddCart: { zh: '直接加點', en: 'Quick Add', ko: '바로 담기', ja: 'クイック追加', th: 'เพิ่มทันที', vi: 'Thêm nhanh' },
  totalPastSpend: { zh: '消費總金額:', en: 'Total Past Spend:', ko: '총 소비 금액:', ja: '総消費金額:', th: 'ยอดรวมออเดอร์นี้:', vi: 'Tổng tiền chi tiêu:' },
  todayBestSellersHeader: { zh: '今日熱銷人氣餐點 Top Best-Sellers', en: 'Top Best-Sellers', ko: '오늘의 인기 베스트 셀러', ja: '本日の人気ベストセラー', th: 'เมนูยอดนิยมวันนี้', vi: 'Món ăn bán chạy nhất hôm nay' },
  todayBestSellersDesc: { zh: '沙貝宵夜場首選人氣絕品，點擊餐點即可看詳情與調整客製，或直接快速加入購物車！', en: 'Top choices for Sabay late-night. Click for details and options, or add directly to cart!', ko: '사바이 심야 최고의 인기 메뉴! 클릭해서 상세 설정하거나 바로 장바구니에 담아보세요!', ja: 'サバイ深夜一押しの絶品。クリックして詳細の調整、またはクイックカート追加！', th: 'เมนูมื้อดึกยอดฮิตของ Sabay คลิกเพื่อดูรายละเอียดและปรับแต่ง หรือใส่ตะกร้าทันที!', vi: 'Sự lựa chọn hàng đầu cho bữa đêm tại Sabay. Nhấp để xem chi tiết và tùy chỉnh, hoặc thêm nhanh vào giỏ hàng!' },
  thankYouRating: { zh: '感謝您的寶貴評價！ Thank you!', en: 'Thank you for your valuable feedback!', ko: '소중한 평가 감사드립니다!', ja: '貴重な評価をいただき、ありがとうございます！', th: 'ขอบคุณสำหรับรีวิวที่มีค่าของคุณ!', vi: 'Cảm ơn bạn đã đánh giá!' },
  editRatingBtn: { zh: '修改評價 Edit', en: 'Edit Feedback', ko: '리뷰 수정', ja: '評価を編集', th: 'แก้ไขรีวิว', vi: 'Sửa đánh giá' },
  pointsStarCount: { zh: '顆星', en: 'Stars', ko: '성급', ja: '星', th: 'ดาว', vi: 'Sao' },
};

export const CAT_NAMES: { [key: string]: { [lang in Language]: string } } = {
  combos: { zh: '優惠折扣 🍱', en: 'Discounts & Combos', ko: '할인 및 세트', ja: '割引・セット', th: 'ส่วนลดและคอมโบ', vi: 'Ưu đãi & Combo 🍱' },
  sides: { zh: '小菜及醬料 🥬', en: 'Sides & Sauces', ko: '반찬 및 소스', ja: '小皿・ソース', th: 'เครื่องเคียงและซอส', vi: 'Món phụ & Sốt 🥬' },
  skewers: { zh: '原味碳烤肉類 🍢', en: 'Charcoal BBQ Skewers', ko: '오리지널 숯불 꼬치', ja: 'タイ風肉串炭火焼き', th: 'บาร์บีคิวเสียบไม้ย่าง', vi: 'Xiên nướng than 🍢' },
  noodles: { zh: '單人熱麵食 🥢', en: 'Single Noodles', ko: '단품 매운 면 요리', ja: 'お一人様用麺類', th: 'บะหมี่และก๋วยเตี๋ยวจานเดี่ยว', vi: 'Mì tô 🥢' },
  drinks: { zh: '泰特色沁涼飲品 🍹', en: 'Thai Cold Drinks', ko: '태국식 야외 청량 음료', ja: 'タイ風さわやかドリンク', th: 'เครื่องดื่มดับร้อนรสสดชื่น', vi: 'Nước uống giải khát 🍹' }
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    "orderIndex": 0,
    "showOnCustomerPage": false,
    "name": {
      "ko": "팁 및 할인",
      "zh": "小費及折扣",
      "ja": "チップ・割引",
      "vi": "Tiền tip & Giảm giá",
      "th": "ทิปและส่วนลด",
      "en": "Tips & Discounts"
    },
    "id": "cat-svadcb"
  },
  {
    "showOnCustomerPage": false,
    "name": {
      "en": "Refrigerated Drinks & Alcohol",
      "ko": "냉장 음료 및 주류",
      "zh": "冰櫃酒水",
      "ja": "冷蔵ドリンク・お酒",
      "vi": "Đồ uống & Rượu lạnh",
      "th": "เครื่องดื่มและสุราแช่เย็น"
    },
    "id": "cat-7cvvkq",
    "orderIndex": 1
  },
  {
    "name": {
      "zh": "冬蔭功系列 🍜",
      "en": "Tom Yum Series 🍜",
      "ko": "똠얌 수프 시리즈 🍜",
      "ja": "トムヤムシリーズ 🍜",
      "th": "ชุดต้มยำสุดแซ่บ 🍜",
      "vi": "Dòng súp Tom Yum 🍜"
    },
    "id": "tomyum",
    "orderIndex": 2
  },
  {
    "name": {
      "zh": "熱湯 🥢越南牛肉河粉",
      "en": "Single Noodle Dishes 🥢",
      "th": "บะหมี่และก๋วยเตี๋ยวจานเดี่ยว 🥢",
      "ja": "お一人様用麺類 🥢",
      "ko": "단품 따뜻한 면 요리 🥢"
    },
    "id": "noodles",
    "orderIndex": 3,
    "showOnCustomerPage": true
  },
  {
    "name": {
      "zh": "精選套餐 🍱優惠",
      "en": "Chef's Special Combos 🍱",
      "th": "เซตเมนูยอดนิยม Sabay 🍱",
      "ja": "主理人お得セット 🍱",
      "ko": "셰프 추천 세트 요리 🍱"
    },
    "id": "combos",
    "orderIndex": 4,
    "showOnCustomerPage": true
  },
  {
    "name": {
      "zh": "招牌泰式海鮮 🦐",
      "en": "Signature Thai Seafood 🦐",
      "ko": "시그니처 태국식 해산물 구이 🦐",
      "ja": "本格タイ風炭火焼きシーフード 🦐",
      "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
      "vi": "Hải sản nướng Thái Lan 🦐"
    },
    "id": "seafood",
    "orderIndex": 5
  },
  {
    "orderIndex": 6,
    "name": {
      "zh": "小農鮮蔬菜 🥬",
      "en": "Farm Fresh Vegetables 🥬",
      "ko": "신선한 채소 구이 🥬",
      "ja": "地元新鮮野菜焼き 🥬",
      "th": "ผักสดฟาร์มย่าง 🥬",
      "vi": "Rau củ tươi sạch 🥬"
    },
    "id": "veggies"
  },
  {
    "id": "skewers",
    "name": {
      "zh": "碳烤肉類 🍢其他",
      "en": "Charcoal BBQ Skewers 🍢",
      "th": "บาร์บีคิวเสียบไม้ย่าง 🍢",
      "ja": "タイ風肉串炭火焼き 🍢",
      "ko": "오리지널 숯불 꼬치 🍢"
    },
    "orderIndex": 7,
    "showOnCustomerPage": true
  },
  {
    "orderIndex": 8,
    "name": {
      "zh": "泰式特色甜品 🍰",
      "en": "Thai Desserts & Sweets 🍰",
      "ko": "태국식 달콤 디저트 🍰",
      "ja": "タイ風特製デザート 🍰",
      "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
      "vi": "Tráng miệng kiểu Thái 🍰"
    },
    "id": "sweets"
  },
  {
    "id": "drinks",
    "name": {
      "zh": "泰特色沁涼飲品 🍹",
      "en": "Refreshing Thai Cold Drinks 🍹",
      "ko": "태국식 청량 음료 🍹",
      "ja": "タイ風さわやかドリンク 🍹",
      "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
      "vi": "Đồ uống lạnh kiểu Thái 🍹"
    },
    "orderIndex": 9
  },
  {
    "orderIndex": 10,
    "showOnCustomerPage": true,
    "name": {
      "en": "Exclusive Sauces",
      "vi": "Nước sốt độc quyền",
      "th": "ซอสสูตรพิเศษ",
      "ko": "단독 수제 소스",
      "zh": "獨家醬料",
      "ja": "秘伝のタレ・ソース"
    },
    "id": "cat-zene8j"
  },
  {
    "showOnCustomerPage": true,
    "id": "cat-6ovxss",
    "name": {
      "th": "โซนเครื่องดื่มแอลกอฮอล์",
      "vi": "Khu vực đồ uống có cồn",
      "ko": "주류 전용 구역",
      "ja": "アルコール飲料エリア",
      "zh": "成人酒品專區",
      "en": "Alcoholic Beverages (18+)"
    },
    "orderIndex": 11
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2696007842576",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 0,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "isNotSpicy": true,
    "name": {
      "zh": "Vitamilk豆奶",
      "en": "Vitamilk Soy Milk",
      "ko": "비타밀크 두유",
      "ja": "ビタミンミルク豆乳",
      "th": "นมถั่วเหลืองไวตามิ้ลค์",
      "vi": "Sữa đậu nành Vitamilk"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 1,
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2606012021064",
    "name": {
      "zh": "麒麟啤酒",
      "en": "Kirin Beer",
      "ko": "기린맥주",
      "ja": "キリンビール",
      "th": "เบียร์คิริน",
      "vi": "bia kirin"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 2,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2605122152569",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 110,
    "available": true,
    "name": {
      "zh": "SPY泰國雞尾酒",
      "en": "SPY Thai Wine Cooler",
      "ko": "SPY 타이 칵테일",
      "ja": "スパイタイカクテル",
      "th": "สปายไทยค็อกเทล",
      "vi": "Cocktail Thái SPY"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "乳酪組合價",
      "en": "Cheese Drink Combo Deal",
      "ko": "치즈 콤보 가격",
      "ja": "チーズコンボの価格",
      "th": "ราคา คอมโบชีส",
      "vi": "Giá combo phô mai"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 3,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "category": "cat-svadcb",
    "containsPork": false,
    "id": "dish-2603071951301",
    "price": -10,
    "containsSeafood": false,
    "containsBeef": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 4,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "category": "sweets",
    "containsPork": false,
    "id": "dish-2602121900078",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 90,
    "available": true,
    "name": {
      "zh": "桂花乳酪",
      "en": "Osmanthus Cheese Drink",
      "ko": "오스만투스 치즈",
      "ja": "キンモクセイチーズ",
      "th": "ออสมันตัสชีส",
      "vi": "phô mai Osmanthus"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 5,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "skewers",
    "id": "dish-2602121834434",
    "containsBeef": true,
    "containsSeafood": false,
    "price": 390,
    "available": true,
    "name": {
      "zh": "板腱牛5oz",
      "en": "Top Blade Steak (5oz)",
      "ko": "힘줄 쇠고기 5oz",
      "ja": "牛すじ 5オンス",
      "th": "เนื้อเอ็น 5 ออนซ์",
      "vi": "Gân bò 5oz"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 6,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "sweets",
    "containsPork": false,
    "id": "dish-2601312248029",
    "name": {
      "zh": "香斕乳酪",
      "en": "Pandan Cheese Drink",
      "ko": "매운 치즈",
      "ja": "スパイシーなチーズ",
      "th": "ชีสรสเผ็ด",
      "vi": "Phô mai cay"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 7,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "category": "sweets",
    "id": "dish-2601310009011",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "available": true,
    "name": {
      "zh": "鮮奶乳酪",
      "en": "Fresh Milk Cheese Drink",
      "ko": "신선한 우유 치즈",
      "ja": "フレッシュミルクチーズ",
      "th": "ชีสนมสด",
      "vi": "phô mai sữa tươi"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "泰式奶茶乳酪",
      "en": "Thai Milk Tea Cheese Drink",
      "ko": "태국식 밀크티 치즈",
      "ja": "タイのミルクティーチーズ",
      "th": "ชานมไทยชีส",
      "vi": "Trà sữa Thái phô mai"
    },
    "containsPork": false,
    "category": "sweets",
    "id": "dish-2601310007093",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 8,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2512111741522",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "price": 100,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 9,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "分解茶",
      "en": "Oolong Tea (Decomposing)",
      "ko": "고장차",
      "ja": "ブレイクダウンティー",
      "th": "ชาสลาย",
      "vi": "Trà suy sụp"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 10,
    "description": {
      "zh": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "엄선된 대만 심해대오징어 L사이즈~일반 매장의 M사이즈가 아닙니다! 고소하고 부드러우며 육즙이 풍부한 저지방, 저칼로리, 고품질 단백질 보충제",
      "ja": "厳選した台湾深海大イカを一般店ではMサイズではないLサイズ～！香ばしくて柔らかくてジューシー〜低脂肪、低カロリー、高品質のプロテインサプリメント",
      "th": "ปลาหมึกทะเลน้ำลึกขนาดใหญ่ของไต้หวันที่คัดสรรมาอย่างดีในขนาด L ~ ไม่ใช่ขนาด M ในร้านค้าทั่วไป! อร่อย นุ่ม ชุ่มฉ่ำ ~ ไขมันต่ำ แคลอรี่ต่ำ อาหารเสริมโปรตีนคุณภาพสูง",
      "vi": "Mực lớn biển sâu Đài Loan được lựa chọn cẩn thận ở cỡ L ~ không phải cỡ M ở các cửa hàng thông thường! Vị mặn, mềm và ngon ngọt ~ bổ sung protein chất lượng cao, ít béo, ít calo"
    },
    "price": 280,
    "containsBeef": false,
    "containsSeafood": true,
    "category": "seafood",
    "id": "dish-2509281752083",
    "containsPork": false,
    "name": {
      "zh": "泰鮮大魷魚(碳烤)",
      "en": "Thai BBQ Giant Squid (L-Size)",
      "ko": "태국식 신선한 대왕오징어(숯불구이)",
      "ja": "タイ産活ダイオウイカ（炭火焼き）",
      "th": "ปลาหมึกยักษ์สดไทย(ย่างถ่าน)",
      "vi": "Mực khổng lồ tươi Thái (nướng than)"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 11,
    "description": {
      "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료 : 엄선한 심해 L사이즈 오징어, 생새우, 오징어(링), 대구볼, 공물볼, 생선살, 양파, 당근채, 오이, 양배추",
      "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸辣湯前菜 ＜苦手な方はご遠慮ください＞ 材料：厳選深海イカLサイズ、活海老、いか（リング）、たらね、貢ぎ玉、国産魚盛り、玉ねぎ、人参千切り、キュウリ、キャベツ",
      "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยเผ็ดร้อน <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: ปลาหมึกทะเลน้ำลึกไซส์ L คัดมาอย่างดี กุ้งสด ปลาหมึก(วงแหวน) ลูกชิ้นปลาคอด ลูกชิ้น ปลาญี่ปุ่น หัวหอม แครอทฝอย แตงกวา กะหล่ำปลี",
      "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua nóng <Đừng gọi nếu bạn không thích> Thành phần: Mực biển cỡ L được lựa chọn cẩn thận, tôm tươi, mực (vòng), cá tuyết viên, bi cống, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột, bắp cải"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "tomyum",
    "id": "dish-2509271759269",
    "price": 390,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
      "en": "Spicy Thai Seafood MAMA Noodles w/ Giant Squid",
      "ko": "정통 태국식 대오징어와 해산물 건어물 마마면(매운맛)",
      "ja": "本場タイの大イカと海鮮のドライママヌードル（辛口）",
      "th": "มาม่าปลาหมึกเส้นใหญ่และทะเลแห้งสูตรดั้งเดิมของไทย (รสเผ็ด)",
      "vi": "Mỳ khô mực lớn và hải sản Thái chính gốc (cay)"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478515294-528",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 12,
    "description": {
      "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 감소~바삭한 식감이 매력",
      "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂分が減り、カリッとした食感が魅力です",
      "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันจะลดลง~กลายเป็นเนื้อกรอบที่น่าดึงดูด",
      "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than hồng, mỡ được giảm bớt ~ chuyển thành kết cấu giòn hấp dẫn"
    },
    "price": 550,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "id": "dish-2508252142113",
    "containsPork": false,
    "name": {
      "zh": "雞皮10串",
      "en": "Grilled Chicken Skin (10 Skewers)",
      "ko": "닭 껍질 꼬치 10개",
      "ja": "鶏皮串 10本",
      "th": "หนังไก่เสียบไม้ 10 ชิ้น",
      "vi": "10 xiên da gà"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsSeafood": false,
    "containsBeef": true,
    "price": 680,
    "category": "combos",
    "id": "dish-2508252141154",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "orderIndex": 13,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "牛5羊5串",
      "en": "Beef & Lamb BBQ Skewers Combo (5 Beef + 5 Lamb)",
      "ko": "소 5개 양 꼬치 5개",
      "ja": "牛5匹羊5串",
      "th": "วัว 5 แกะ 5 ไม้เสียบไม้",
      "vi": "Bò 5 con cừu 5 xiên"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "真。小羔羊肉10串",
      "en": "Australian Lamb Skewers (10 Skewers)",
      "ko": "사실이다. 양꼬치 10개",
      "ja": "そうです。子羊串 10本",
      "th": "จริง. เนื้อแกะเสียบไม้ 10 ชิ้น",
      "vi": "Đúng. 10 xiên thịt cừu"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 14,
    "description": {
      "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주산) 숯불에 노릇노릇해질 때까지 굽고, 여분의 지방을 짜내고 큐민가루를 뿌려준다",
      "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリア産） 炭火で焼き色がつくまで焼き、余分な脂を絞り、クミンパウダーをふりかける",
      "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีทอง บีบไขมันส่วนเกินออก แล้วโรยด้วยผงยี่หร่า",
      "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi chín vàng, chắt bớt mỡ thừa rồi rắc bột thì là"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 650,
    "containsPork": false,
    "id": "dish-2508252136150",
    "category": "combos",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "極炙牛肋10串",
      "en": "Beef Rib Skewers (10 Skewers)",
      "ko": "소갈비구이 꼬치 10개",
      "ja": "牛カルビグリル 10本",
      "th": "ซี่โครงเนื้อย่าง 10 ไม้",
      "vi": "Sườn bò nướng 10 xiên"
    },
    "available": true,
    "id": "dish-2508252133258",
    "category": "combos",
    "containsPork": false,
    "price": 650,
    "containsSeafood": false,
    "containsBeef": true,
    "description": {
      "zh": "黃金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "황금 비율의 쇠고기 갈비뼈는 겉은 까맣게 구워지고 속은 분홍색으로 부드러워집니다. 한 입 먹으면 미뢰가 최고의 즐거움을 선사합니다.",
      "ja": "黄金比の牛カルビは、外は焦げ目、中はピンク色に柔らかく焼き上げられています。一口食べると、味覚にとって究極の楽しみが得られます。",
      "th": "ซี่โครงเนื้อสีทองที่ได้สัดส่วนย่างจนเกรียมด้านนอกและด้านในสีชมพูและนุ่ม การกัดเพียงครั้งเดียวคือความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ",
      "vi": "Tỷ lệ vàng của sườn bò được nướng chín bên ngoài và bên trong hồng hào, mềm mại. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn."
    },
    "orderIndex": 15,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "恐龍美祿",
      "en": "Milo Dinosaur Drink",
      "ko": "마일로 다이노소어",
      "ja": "ミロダイナソー",
      "th": "ไมโลไดโนเสาร์",
      "vi": "Milo Khủng Long"
    },
    "available": true,
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2508252009102",
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 16,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=400"
  },
  {
    "containsPork": false,
    "id": "dish-2508252008143",
    "category": "drinks",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 17,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "泰式可可冰奶",
      "en": "Thai Iced Cocoa Milk",
      "ko": "태국식 아이스 코코아 밀크",
      "ja": "タイ風アイスココア",
      "th": "โกโก้เย็นสไตล์ไทย",
      "vi": "Sữa Ca Cao Đá Kiểu Thái"
    }
  },
  {
    "name": {
      "zh": "爆漿泰奶包",
      "en": "Thai Milk Tea Custard Lava Bun",
      "ko": "폭발적인 태국 우유 주머니",
      "ja": "爆発するタイの牛乳袋",
      "th": "ถุงนมไทยระเบิด",
      "vi": "Túi sữa Thái nổ"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "orderIndex": 18,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2508252003261",
    "category": "sweets",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 19,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "price": 1550,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "containsPork": false,
    "id": "dish-2508202000500",
    "name": {
      "zh": "人氣D餐",
      "en": "Popular Set D Combo",
      "ko": "인기의 D식",
      "ja": "人気のDミール",
      "th": "อาหาร D ยอดนิยม",
      "vi": "Bữa ăn D phổ biến"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "奢華C餐",
      "en": "Luxury Set C Combo",
      "ko": "호화로운 C 식사",
      "ja": "贅沢Cミール",
      "th": "มื้ออาหาร C สุดหรู",
      "vi": "Bữa ăn C sang trọng"
    },
    "available": true,
    "price": 2160,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "combos",
    "containsPork": false,
    "id": "dish-2508201955573",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 20,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "泰奶空桶",
      "en": "Empty Thai Milk Tea Bucket (1L)",
      "ko": "태국 우유 빈 양동이",
      "ja": "タイミルクの空バケツ",
      "th": "ถังเปล่านมไทย",
      "vi": "Xô sữa Thái rỗng"
    },
    "available": true,
    "price": -30,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2508141908165",
    "category": "cat-svadcb",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "orderIndex": 21,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 22,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2508112131059",
    "category": "veggies",
    "containsPork": false,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "娃娃菜2p",
      "en": "Baby Chinese Cabbage (2pcs)",
      "ko": "어린양배추 2p",
      "ja": "ベビーキャベツ 2P",
      "th": "กะหล่ำปลีเด็ก 2p",
      "vi": "Bắp non 2p"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "爆汁金針菇豬肉",
      "en": "Juicy Pork Wrapped Enoki Mushroom",
      "ko": "팽이버섯을 곁들인 매콤한 돼지고기",
      "ja": "スパイシーポークえのき添え",
      "th": "หมูสไปซี่กับเห็ดเข็มทอง",
      "vi": "Thịt lợn cay nấm kim châm"
    },
    "available": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "skewers",
    "containsPork": true,
    "id": "dish-2508112130113",
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 23,
    "description": {
      "zh": "鮮嫩豬肉片包裹爽脆金針菇，刷醬烤至金黃焦香",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "바삭한 에노키 버섯을 부드러운 돼지고기 조각으로 싸서 소스를 바르고 황금빛 갈색이 되고 향이 날 때까지 구워냅니다.",
      "ja": "シャキシャキのえのきを柔らかい豚肉で包み、タレを塗りこんがりと香ばしく焼き上げました。",
      "th": "เห็ดเอโนกิกรอบห่อด้วยหมูสไลด์เนื้อนุ่มทาซอสแล้วย่างจนเป็นสีเหลืองทองและมีกลิ่นหอม",
      "vi": "Nấm kim châm chiên giòn bọc trong những lát thịt lợn mềm, rưới nước sốt rồi nướng cho đến khi chín vàng và thơm"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "客家幣刷卡",
      "en": "Hakka Coin Card Payment",
      "ko": "객가 화폐 카드 스와이프",
      "ja": "客家通貨カードのスワイプ",
      "th": "การรูดบัตรสกุลเงินฮากกา",
      "vi": "Quẹt thẻ tiền tệ Hakka"
    },
    "available": true,
    "price": -1000,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2507182004409",
    "category": "cat-svadcb",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 24,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "招牌A餐",
      "en": "Signature Set A Combo",
      "ko": "시그니처A 한끼",
      "ja": "シグネチャーAのお食事",
      "th": "ลายเซ็นมื้ออาหาร",
      "vi": "Chữ ký Một bữa ăn"
    },
    "available": true,
    "id": "dish-2507072257199",
    "category": "combos",
    "containsPork": false,
    "price": 660,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "zh": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "처음 들어오시나요? 무엇을 선택해야 할지 모르시나요? 여기에 최고의 것들이 있습니다. 매장의 시그니처 제품을 한번에 만나보실 수 있어요! 태국산 수제 쇠고기 꼬치 / 육즙이 풍부한 팽이버섯 돼지고기 1개 / 태국 북부 신맛이 나는 고기와 쌀국수 소시지 1개 / 태국식 구운 닭날개 4조각 / 태국식 바삭한 두부껍질 1인분 / 매콤달콤한 태국식 두부껍질 1인분 / 태국식 밀크티 1컵!",
      "ja": "初めて入りますか？何を選べばいいのか分からない？ここに最高のものがあります。お店の看板商品が一気に手に入る！タイ手打ちビーフ1串/ジューシーえのき茸ポーク1串/タイ北部の酸っぱい肉とビーフンソーセージ1串/タイ風手羽先グリル4本/タイ風パリパリ湯葉1食分/甘辛1食分/タイミルクティー1杯！",
      "th": "เข้ามาครั้งแรก? ไม่รู้จะเลือกอะไร? นี่คือสิ่งที่ดีที่สุด คุณสามารถรับสินค้าซิกเนเจอร์ของร้านได้ในคราวเดียว! เนื้อไทยทำมือ 1 ไม้/หมูเห็ดเข็มทอง 1 ไม้/เนื้อเปรี้ยวและไส้กรอกเส้นก๋วยเตี๋ยว 1 ไม้/ปีกไก่ย่าง 4 ชิ้น/ผิวเต้าหู้กรอบ 1 ส่วน/เผ็ดร้อน 1 ส่วน/ชานมไทย 1 ถ้วย!",
      "vi": "Lần đầu tiên vào? Bạn không biết nên chọn gì? Dưới đây là những cái tốt nhất. Bạn có thể nhận được các sản phẩm đặc trưng của cửa hàng ngay lập tức! 1 xiên thịt bò thủ công kiểu Thái/1 xiên thịt lợn nấm kim châm ngon ngọt/1 xiên thịt chua miền Bắc Thái và xúc xích bún/4 miếng cánh gà nướng kiểu Thái/1 phần da đậu hũ chiên giòn kiểu Thái/1 phần cay ngọt ngọt/1 cốc trà sữa Thái!"
    },
    "orderIndex": 25,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "雪山",
      "en": "Snow Mountain Beer",
      "ko": "눈 산",
      "ja": "雪山",
      "th": "ภูเขาหิมะ",
      "vi": "núi tuyết"
    },
    "available": true,
    "id": "dish-2506292231385",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 26,
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
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "金芬黛葡萄酒",
      "en": "Zinfandel Red Wine",
      "ko": "진판델 와인",
      "ja": "ジンファンデルワイン",
      "th": "ไวน์ซินฟานเดล",
      "vi": "rượu Zinfandel"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 27,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "price": 800,
    "containsSeafood": false,
    "containsBeef": false,
    "id": "dish-2506182247281",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "紅醬外帶瓶",
      "en": "Signature Spicy Red Sauce Bottle",
      "ko": "레드 소스 테이크아웃 병",
      "ja": "レッドソースの持ち帰り用ボトル",
      "th": "ขวดซอสแดงสำหรับพกพา",
      "vi": "Chai nước sốt đỏ mang theo"
    },
    "available": true,
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2506132134210",
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 28,
    "description": {
      "zh": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "매장에 있는 매콤한 빨간 소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
      "ja": "店内の特製赤辛だれは、焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいです",
      "th": "น้ำจิ้มรสเด็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อนำไปจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
      "vi": "Nước sốt đỏ cay ở cửa hàng~tự làm độc quyền~rất ngon khi chấm cùng thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "綠醬外帶瓶",
      "en": "Signature Thai Green Chili Sauce Bottle",
      "ko": "그린 소스 테이크아웃 병",
      "ja": "グリーンソースの持ち帰り用ボトル",
      "th": "ขวดซอสเขียวสำหรับพกพา",
      "vi": "Chai nước sốt xanh mang theo"
    },
    "available": true,
    "price": 150,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2506132131288",
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 29,
    "description": {
      "zh": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "매장에 있는 매콤한 그린소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
      "ja": "店内の特製グリーンソースは焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいですよ～自家製です～",
      "th": "ซอสเขียวรสเผ็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
      "vi": "Nước sốt xanh cay của cửa hàng ~ độc quyền tự làm ~ rất ngon khi chấm với thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "爆汁櫛瓜",
      "en": "Juicy Grilled Zucchini",
      "ko": "육즙이 풍부한 호박",
      "ja": "ジューシーなズッキーニ",
      "th": "บวบฉ่ำ",
      "vi": "Bí xanh ngon ngọt"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "orderIndex": 30,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "category": "veggies",
    "id": "dish-2505242017116",
    "containsPork": false,
    "price": 140,
    "containsBeef": false,
    "containsSeafood": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "泰式東炎豬肉.米線",
      "en": "Thai Tom Yum Pork Rice Noodle",
      "ko": "태국식 Tomyam 돼지고기와 쌀국수",
      "ja": "タイのトムヤムポークとライスヌードル",
      "th": "ก๋วยเตี๋ยวหมูต้มยำไทยและข้าว",
      "vi": "Bún thịt lợn và cơm Thái Tomyam"
    },
    "isNotSpicy": false,
    "orderIndex": 31,
    "description": {
      "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "대만산 삼겹살, 대구생선볼, 헌정볼, 일본식 생선살, 본토 소녀, 양파, 당근, 구층탑, 양배추",
      "ja": "台湾産豚バラ肉、タラつみれ、貢ぎ目、日本産魚の切り身、本土娘、玉ねぎ、人参、九重塔、キャベツ",
      "th": "หมูสามชั้นไต้หวันสไลซ์ ลูกชิ้นปลาค็อด ลูกชิ้น เนื้อปลาญี่ปุ่น สาวแผ่นดิน หัวหอม แครอท เจดีย์เก้าชั้น กะหล่ำปลี",
      "vi": "Thịt ba chỉ Đài Loan, cá viên, cá viên, phi lê cá Nhật, cô gái đại lục, hành tây, cà rốt, chùa chín tầng, bắp cải"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "category": "tomyum",
    "containsPork": true,
    "id": "dish-2505041844456",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 240,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478850618-672",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784478853337-718",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784478856450-76",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "泰式東炎豬肉.河粉",
      "en": "Thai Tom Yum Pork Pho Noodle",
      "ko": "태국 톰얌 돼지고기와 쌀국수",
      "ja": "タイのトムヤムクンとフォー",
      "th": "ต้มยำไทยหมูและเฝอ",
      "vi": "Thịt lợn và phở Tomyam kiểu Thái"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 32,
    "description": {
      "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "대만산 삼겹살, 대구생선볼, 헌정볼, 일본식 생선살, 본토 소녀, 양파, 당근, 구층탑, 양배추",
      "ja": "台湾産豚バラ肉、タラつみれ、貢ぎ目、日本産魚の切り身、本土娘、玉ねぎ、人参、九重塔、キャベツ",
      "th": "หมูสามชั้นไต้หวันสไลซ์ ลูกชิ้นปลาค็อด ลูกชิ้น เนื้อปลาญี่ปุ่น สาวแผ่นดิน หัวหอม แครอท เจดีย์เก้าชั้น กะหล่ำปลี",
      "vi": "Thịt ba chỉ Đài Loan, cá viên, cá viên, phi lê cá Nhật, cô gái đại lục, hành tây, cà rốt, chùa chín tầng, bắp cải"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 240,
    "id": "dish-2505041843176",
    "containsPork": true,
    "category": "tomyum",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478881366-690",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784478887811-679",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784478890845-28",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "街頭泰奶1L",
      "en": "Thai Street Milk Tea (1L Bucket)",
      "ko": "스트리트 타이 우유 1L",
      "ja": "ストリートタイミルク 1L",
      "th": "สตรีทนมไทย 1ลิตร",
      "vi": "Sữa đường Thái 1L"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 33,
    "description": {
      "zh": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "인터넷 연예인, 멋남들의 사진찍기 필수품~ 진한 차향이 나는 클래식 태국 우유~ 빈 양동이를 매장에 반납하고 30위안 할인 받으세요!",
      "ja": "ネット有名人やかっこいい男性の写真撮影必需品～紅茶の香りが強い定番のタイミルク～空になったバケツを店舗に返却すると30元割引！",
      "th": "ดาราทางอินเทอร์เน็ตและหนุ่มเท่ๆ ที่ต้องมีไว้ถ่ายรูป~ นมไทยคลาสสิกกลิ่นชาเข้มข้น~ คืนถังเปล่าไปที่ร้านรับส่วนลด 30 หยวน!",
      "vi": "Một thứ không thể thiếu đối với những người nổi tiếng trên mạng và những chàng trai sành điệu khi chụp ảnh ~ Sữa Thái cổ điển với hương trà đậm đà ~ Trả lại chiếc xô rỗng cho cửa hàng và được giảm giá 30 nhân dân tệ!"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 180,
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2505041825592",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": true,
    "hasNoodlesOption": false,
    "hasCoconutsMilkOption": true,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 34,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰滿足海陸牛冬蔭功",
      "en": "Surf & Turf Beef Tom Yum Noodle Soup",
      "ko": "타이 만족 씨랜드 비프 똠얌꿍",
      "ja": "タイの満足シーランドビーフのトムヤムクン",
      "th": "ความพึงพอใจของไทยซีแลนด์เนื้อต้มยำกุ้ง",
      "vi": "Món Thái Hài Lòng Thịt Bò Biển Tom Yum Goong"
    },
    "containsSeafood": false,
    "price": 390,
    "category": "tomyum",
    "containsPork": false,
    "id": "dish-2505041753253",
    "description": {
      "zh": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "식품 : 미국산 부드러운 어깨 필레 특선 쇠고기 조각, 새우, 오징어 고리, 조개, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 본토 소녀, 양파, 당근, 구층탑",
      "ja": "食材: アメリカ産柔らか肩フィレ特選牛スライス、海老、イカリング、アサリ、タラボール、ポークボール、国産フィッシュプレート、本土娘、玉ねぎ、人参、九重塔",
      "th": "ส่วนผสม: เนื้อวัวสันคอแบบอเมริกันสไลซ์ กุ้ง ปลาหมึกแหวน หอยลาย ลูกชิ้นปลาคอด ลูกชิ้นหมู ปลาญี่ปุ่น สาวแผ่นดินใหญ่ หัวหอม แครอท เจดีย์เก้าชั้น",
      "vi": "Nguyên liệu: Thịt bò vai phi lê Mỹ chọn lọc lát mỏng, tôm, mực chiên, nghêu, cá tuyết viên, thịt lợn viên, đĩa cá Nhật, gái đất liền, hành tây, cà rốt, chùa chín tầng"
    },
    "customAddOns": [
      {
        "id": "addon-1784478928738-313",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784478931302-574",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784478933543-454",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "id": "dish-2505041751044",
    "category": "tomyum",
    "containsPork": true,
    "price": 360,
    "containsSeafood": false,
    "description": {
      "zh": "配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "재료: 대만산 삼겹살, 새우, 오징어 링, 조개, 대구 완자, 공물 볼, 일본 생선 석판, 본토 소녀, 양파, 당근, 구층탑",
      "ja": "食材: 台湾産豚バラ肉、エビ、イカリング、ハマグリ、タラつみれ、貢ぎ目、日本魚片、本土娘、玉ねぎ、人参、九重塔",
      "th": "ส่วนผสม: หมูสามชั้นไต้หวันสไลซ์, กุ้ง, ปลาหมึกวง, หอยกาบ, ลูกชิ้นปลาคอด, ลูกชิ้น, แผ่นปลาญี่ปุ่น, สาวแผ่นดินใหญ่, หัวหอม, แครอท, เจดีย์เก้าชั้น",
      "vi": "Nguyên liệu: Thịt ba chỉ Đài Loan lát, tôm, mực chiên, nghêu, cá viên, cá viên, cá viên Nhật, gái đất liền, hành tây, cà rốt, chùa chín tầng"
    },
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "containsBeef": false,
    "orderIndex": 35,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "海陸豬冬蔭功湯",
      "en": "Surf & Turf Pork Tom Yum Soup",
      "ko": "돼지고기 똠양꿍 수프",
      "ja": "ポークトムヤムスープ",
      "th": "ต้มยำหมู",
      "vi": "Súp Tom Yum Thịt Heo"
    },
    "available": true,
    "customAddOns": [
      {
        "id": "addon-1784478951444-682",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784478953658-987",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784478955921-185",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "蔬菜拼盤",
      "en": "Fresh Vegetables Platter",
      "ko": "야채 플래터",
      "ja": "野菜盛り合わせ",
      "th": "จานผัก",
      "vi": "Đĩa rau củ"
    },
    "id": "dish-2504161837515",
    "containsPork": false,
    "category": "veggies",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 260,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "orderIndex": 36,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsPork": false,
    "category": "skewers",
    "id": "dish-2503181902333",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 680,
    "orderIndex": 37,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "小羊肩排",
      "en": "Charcoal Grilled Lamb Shoulder Chop",
      "ko": "양고기 어깨 스테이크",
      "ja": "ラムショルダーステーキ",
      "th": "สเต็กไหล่แกะ",
      "vi": "Bít tết vai cừu"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "泰式生蠔11p",
      "en": "Thai Style Fresh Oysters (11pcs)",
      "ko": "태국 굴 11p",
      "ja": "タイ産牡蠣 11ペンス",
      "th": "หอยนางรมไทย11บ",
      "vi": "Hàu Thái 11p"
    },
    "available": true,
    "isNotSpicy": false,
    "orderIndex": 38,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "category": "seafood",
    "containsPork": false,
    "id": "dish-2503171838086",
    "price": 2200,
    "containsBeef": false,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "客家幣",
      "en": "Hakka Coin Coupon",
      "ko": "하카화폐",
      "ja": "客家の通貨",
      "th": "สกุลเงินฮากกา",
      "vi": "tiền Khách Gia"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 39,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "category": "cat-svadcb",
    "id": "dish-2503012218077",
    "containsPork": false,
    "price": -1,
    "containsSeafood": false,
    "containsBeef": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2502252357010",
    "category": "combos",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 460,
    "description": {
      "zh": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "태국 수제 쇠고기 x 1, 쇠고기 갈비 케밥 x 1, 양갈비 케밥 x 1\n브로일러 닭꼬치 x 1 엄선된 살찐 소시지 꼬치 x 1 물을 뿌린 소시지 꼬치 x 1 닭껍질 x 1 선택이 어려운 지점입니다",
      "ja": "タイ産手作りビーフ×1、ビーフリブケバブ×1、ラムリブケバブ×1\nブロイラー鶏の串×1本 特選太ソーセージの串×1本 水をかけたソーセージの串×1本 鶏の皮×1本 ここが選択の難しいポイント",
      "th": "เนื้อไทยทำมือ x 1 เคบับซี่โครงเนื้อ x 1 เคบับซี่โครงแกะ x 1\nไก่เนื้อเสียบไม้ x 1 ไส้กรอกไขมันเสียบไม้คัดพิเศษ x 1 ไส้กรอกเสียบไม้พ่นน้ำ x 1 หนังไก่ x 1 ตรงจุดนี้เลือกยาก",
      "vi": "Thịt bò Thái handmade x 1, sườn bò kebab x 1, sườn cừu kebab x 1\nXiên gà nướng x 1 Xiên xúc xích béo chọn lọc x 1 Xiên xúc xích phun nước x 1 Da gà x 1 Đây là điểm khó lựa chọn"
    },
    "orderIndex": 40,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "多肉B餐",
      "en": "Meat Lover's Set B Combo",
      "ko": "고기가 많은 B 식사",
      "ja": "肉たっぷりのBミール",
      "th": "อาหารมื้อสายเนื้อบี",
      "vi": "Bữa ăn nhiều thịt B"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 41,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "category": "cat-6ovxss",
    "id": "dish-2502031821565",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 3200,
    "available": true,
    "name": {
      "zh": "大摩12年",
      "en": "The Dalmore 12 Years Whisky",
      "ko": "달모어 12년",
      "ja": "ダルモア 12年",
      "th": "ดาลมอร์ 12 ปี",
      "vi": "Dalmore 12 năm"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 42,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 2400,
    "id": "dish-2502031820148",
    "containsPork": false,
    "category": "cat-6ovxss",
    "available": true,
    "name": {
      "zh": "蘇格登13年",
      "en": "The Singleton 13 Years Whisky",
      "ko": "13년 후",
      "ja": "スグデン 13年",
      "th": "ซูเดน 13 ปี",
      "vi": "Đề nghị 13 năm"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 43,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2502031818015",
    "category": "drinks",
    "containsPork": false,
    "price": 1800,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "蘇格登12年",
      "en": "The Singleton 12 Years Whisky",
      "ko": "12년 후",
      "ja": "スグデン 12年",
      "th": "ซูเดน 12 ปี",
      "vi": "Đề nghị 12 năm"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "有機玉米筍",
      "en": "Organic Baby Corn",
      "ko": "유기농 옥수수순",
      "ja": "有機トウモロコシの芽",
      "th": "หน่อข้าวโพดออร์แกนิก",
      "vi": "Măng ngô hữu cơ"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "<非基改>不油不膩~香甜可口~營養價高",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "<Non-GMO> 느끼하지도 기름지지도 않은 ~ 달콤하고 맛있는 ~ 영양가 높은",
      "ja": "＜非遺伝子組み換え＞脂っこくない～甘くて美味しい～栄養価が高い",
      "th": "<Non-GMO> ไม่มันเยิ้ม ~ หวานอร่อย ~ มีคุณค่าทางโภชนาการสูง",
      "vi": "<Non-GMO> Không béo ngậy ~ ngọt ngào thơm ngon ~ giá trị dinh dưỡng cao"
    },
    "orderIndex": 44,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "containsPork": false,
    "id": "dish-2502012109279",
    "category": "veggies",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "嚴選澎湖海味~吃得到塊狀花枝",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "펑후에서 엄선한 해산물~ 덩어리째 드실 수 있어요",
      "ja": "澎湖産の厳選海鮮～塊で食べられる",
      "th": "อาหารทะเลที่คัดสรรอย่างพิถีพิถันจากเผิงหู~ ทานเป็นชิ้นๆ ได้เลย",
      "vi": "Hải sản được lựa chọn cẩn thận từ Bành Hồ ~ bạn có thể ăn thành từng miếng"
    },
    "orderIndex": 45,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2502012029386",
    "category": "seafood",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": true,
    "price": 80,
    "available": true,
    "name": {
      "zh": "澎湖花枝丸",
      "en": "Penghu Cuttlefish Balls",
      "ko": "펑후 화지완",
      "ja": "澎湖華志湾",
      "th": "เผิงหู หัวจือวาน",
      "vi": "Bành Hồ Huazhiwan"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "爽脆高麗菜",
      "en": "Crispy Grilled Cabbage",
      "ko": "바삭한 양배추",
      "ja": "シャキシャキキャベツ",
      "th": "กะหล่ำปลีกรอบ",
      "vi": "bắp cải giòn"
    },
    "available": true,
    "price": 80,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "veggies",
    "containsPork": false,
    "id": "dish-2501142131426",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 46,
    "description": {
      "zh": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "숯불구이 산배추~바삭하고 달콤해요~다른 데는 안 파는 것 같아요~안 드셔보시겠어요?",
      "ja": "山キャベツの炭火焼き～シャキシャキで甘い～他では売っていないと思います～食べてみませんか？",
      "th": "กะหล่ำปลีภูเขาย่างถ่าน~กรอบและหวาน~ไม่คิดว่าจะมีขายที่อื่น~อย่าลองนะ?",
      "vi": "Bắp cải núi nướng than ~ Giòn và ngọt ~ Tôi không nghĩ nó được bán ở nơi khác ~ Bạn thử xem?"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "炭燒奶茶(壺)",
      "en": "Charcoal Smoked Thai Tea (Pot)",
      "ko": "숯불밀크티(냄비)",
      "ja": "炭火焙煎ミルクティー（ポット）",
      "th": "ชานมคั่วเตาถ่าน (หม้อ)",
      "vi": "Trà sữa rang than (nồi)"
    },
    "available": true,
    "price": 180,
    "containsSeafood": false,
    "containsBeef": false,
    "category": "drinks",
    "containsPork": false,
    "id": "dish-2412022102224",
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 47,
    "description": {
      "zh": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "숯불에 천천히 끓여낸 태국식 밀크티! 독특한 맛은 시도해 볼 가치가 있습니다",
      "ja": "炭火でじっくり煮込んだタイミルクティー！独特の風味は試してみる価値あり",
      "th": "ชานมไทยปรุงช้าๆด้วยไฟถ่าน! รสชาติที่เป็นเอกลักษณ์คุ้มค่าแก่การลอง",
      "vi": "Trà sữa Thái nấu chậm trên lửa than! Hương vị độc đáo đáng để thử"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰辣醬",
      "en": "Thai Spicy Chili Dip",
      "ko": "태국식 핫소스",
      "ja": "タイのホットソース",
      "th": "ซอสเผ็ดแบบไทยๆ",
      "vi": "Nước sốt Thái"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 10,
    "id": "dish-2412021741257",
    "category": "cat-zene8j",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn"
    },
    "orderIndex": 48,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "下酒必點!老饕最愛!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "음료와 함께 꼭 주문해야해요! 미식가들 사이에서 가장 인기 있는 곳!",
      "ja": "ドリンクと一緒に注文必須！食通の間で大人気！",
      "th": "ต้องสั่งพร้อมเครื่องดื่ม! ของโปรดในหมู่นักชิม!",
      "vi": "Phải đặt hàng với đồ uống! Một yêu thích của những người sành ăn!"
    },
    "orderIndex": 49,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "id": "dish-2412021734433",
    "category": "seafood",
    "price": 390,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "手撕大魷魚干",
      "en": "Shredded Dried Giant Squid",
      "ko": "손으로 잘게 썬 대형 말린 오징어",
      "ja": "大スルメ手切り",
      "th": "ปลาหมึกแห้งขนาดใหญ่ฉีกด้วยมือ",
      "vi": "Mực khô lớn xé tay"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "炙燒生食級干貝3P",
      "en": "Seared Sashimi Grade Scallops (3pcs)",
      "ko": "생식등급 가리비구이 3P",
      "ja": "生食用ホタテ貝柱のグリル 3P",
      "th": "หอยเชลล์ดิบย่าง3P",
      "vi": "Sò điệp sống nướng loại 3P"
    },
    "isNotSpicy": true,
    "orderIndex": 50,
    "description": {
      "zh": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "해산물을 좋아한다면 꼭 먹어봐야 할 곳! 레몬 타이 소스와 함께\n로스팅 후 향이 넘쳐 한 입 한 입 베어 물면 최고의 맛이 난다",
      "ja": "海鮮好きならぜひ試してみてください！レモンタイソースと合わせて\n焙煎後は香りが溢れ、噛むたびに最高の美味しさ",
      "th": "ต้องลองถ้าคุณรักอาหารทะเล! ทานคู่กับน้ำจิ้มมะนาวไทย\nหลังจากการคั่วกลิ่นหอมจะล้นออกมาและทุกคำที่กัดคือความอร่อยขั้นสุดยอด",
      "vi": "Phải thử nếu bạn yêu thích hải sản! Ăn kèm sốt chanh Thái\nSau khi rang, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2412021733504",
    "containsPork": false,
    "category": "seafood",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 390,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2412021732545",
    "category": "seafood",
    "containsPork": false,
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "description": {
      "zh": "嗜辣者必嚐!下酒必備 已去殼",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "매운음식 좋아하시는 분들 꼭 드셔보세요! 술을 마실 때 꼭 필요한 것. 이미 껍질이 벗겨졌어",
      "ja": "辛いもの好きな方はぜひ試してみてください！お酒を飲む際の必需品。すでに殻をむいています",
      "th": "สำหรับผู้ที่ชอบอาหารรสเผ็ดต้องลอง! เป็นสิ่งที่ต้องมีสำหรับการดื่ม ปอกเปลือกแล้ว",
      "vi": "Món ăn nhất định phải thử dành cho những ai thích ăn cay! Phải có để uống. Đã bóc vỏ"
    },
    "orderIndex": 51,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "泰辣扇貝9P",
      "en": "Spicy Thai Scallops (9pcs)",
      "ko": "태국식 매운 가리비 9P",
      "ja": "タイ産スパイシーホタテ貝柱 9P",
      "th": "หอยเชลล์เผ็ดไทย 9P",
      "vi": "Sò điệp cay Thái 9P"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 360,
    "containsBeef": false,
    "containsSeafood": true,
    "category": "seafood",
    "id": "dish-2412021732071",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 52,
    "description": {
      "zh": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "큰새우구이 6개~수염과 날카로운 가시는 잘랐지만 껍질벗길때 조심하세요",
      "ja": "大海老のグリル6尾～ひげと鋭い棘はカットしてあります～殻を剥くときは注意してください",
      "th": "กุ้งเผาตัวใหญ่ 6 ตัว ~ หนวดและหนามแหลมถูกตัด ~ แต่ต้องระวังตอนปอกเปลือก",
      "vi": "6 con tôm lớn nướng ~ râu và gai nhọn đã được cắt bỏ ~ nhưng hãy cẩn thận khi bóc vỏ"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "椰碳烤大草蝦6P",
      "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)",
      "ko": "코코넛 숯불 새우구이 6P",
      "ja": "エビのココナッツ炭火焼き 6P",
      "th": "กุ้งเผาถ่านมะพร้าว6P",
      "vi": "Tôm nướng than dừa 6P"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 380,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "category": "cat-6ovxss",
    "id": "dish-2411142306093",
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 53,
    "description": {
      "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다",
      "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
      "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
      "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "泰醇奶酒5.6%",
      "en": "Thai Cream Liqueur 5.6%",
      "ko": "타이춘 밀크와인 5.6%",
      "ja": "台中ミルクワイン 5.6%",
      "th": "ไวน์นมไท่ชุน 5.6%",
      "vi": "Rượu sữa Đài Xuân 5,6%"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다",
      "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
      "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
      "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say"
    },
    "orderIndex": 54,
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2411142303467",
    "category": "cat-6ovxss",
    "containsPork": false,
    "price": 280,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "泰醇奶酒1.4%",
      "en": "Thai Cream Liqueur 1.4%",
      "ko": "타이춘 밀크와인 1.4%",
      "ja": "台中ミルクワイン 1.4%",
      "th": "ไวน์นมไท่ชุน 1.4%",
      "vi": "Rượu sữa Đài Xuân 1,4%"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "果汁氣泡水",
      "en": "Fruit Juice Sparkling Water",
      "ko": "주스 탄산수",
      "ja": "ジュース・スパークリングウォーター",
      "th": "น้ำผลไม้เป็นประกาย",
      "vi": "Nước ép có ga"
    },
    "available": true,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2411142030288",
    "price": 100,
    "containsBeef": false,
    "containsSeafood": false,
    "orderIndex": 55,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "海尼根",
      "en": "Heineken Beer",
      "ko": "하이네켄",
      "ja": "ハイネケン",
      "th": "ไฮเนเก้น",
      "vi": "Heineken"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 56,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 150,
    "id": "dish-2411142028551",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "category": "skewers",
    "containsPork": true,
    "id": "dish-2411112029373",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 70,
    "orderIndex": 57,
    "description": {
      "zh": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "돼지피케이크+핫도그 조합은 어른도 아이도 모두 좋아하는 조합♥️오늘은 칼로리 걱정하지 마세요!",
      "ja": "豚の血ケーキ＋ホットドッグの組み合わせは大人も子供も大好き♥️今日はカロリーを気にせず！",
      "th": "เค้กเลือดหมู + ฮอทด็อกเป็นที่ชื่นชอบของทั้งเด็กและผู้ใหญ่ ♥️วันนี้ไม่ต้องกังวลเรื่องแคลอรี่!",
      "vi": "Sự kết hợp bánh tiết heo + xúc xích được cả người lớn và trẻ em yêu thích♥️Đừng lo lắng về lượng calo hôm nay nhé!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "邪惡熱狗豬血糕",
      "en": "Hot Dog & Pork Blood Cake Skewer",
      "ko": "사악한 핫도그 돼지 혈액 케이크",
      "ja": "邪悪なホットドッグの豚血ケーキ",
      "th": "เค้กเลือดหมูฮอทด็อกชั่วร้าย",
      "vi": "Bánh huyết heo xúc xích ác quỷ"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "可樂娜",
      "en": "Corona Extra Beer",
      "ko": "코로나",
      "ja": "コロナ",
      "th": "โคโรนา",
      "vi": "Corona"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 150,
    "id": "dish-2411091621575",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 58,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-2411042135298",
    "containsPork": false,
    "category": "cat-svadcb",
    "price": 10,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 59,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "tip",
      "en": "Staff Tip / Service Gratitude",
      "ko": "팁",
      "ja": "ヒント",
      "th": "ทิป",
      "vi": "tiền boa"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "category": "cat-6ovxss",
    "containsPork": false,
    "id": "dish-2410270119261",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 350,
    "orderIndex": 60,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "白鶴清酒",
      "en": "Hakutsuru Japanese Sake",
      "ko": "하쿠헤 사케",
      "ja": "白河酒",
      "th": "ฮาคุเฮสาเก",
      "vi": "Rượu sake Hakuhe"
    },
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479411862-296",
        "name": {
          "zh": "加熱",
          "en": "heating",
          "ko": "난방",
          "ja": "暖房",
          "th": "เครื่องทำความร้อน",
          "vi": "sưởi ấm"
        },
        "price": 0
      }
    ],
    "recipe": []
  },
  {
    "id": "dish-2410132030420",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 100,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 61,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "愛之味麥茶",
      "en": "AGV Barley Tea",
      "ko": "사랑의 맛 보리차",
      "ja": "恋の麦茶の味",
      "th": "รสชาติของชาข้าวบาร์เลย์แห่งความรัก",
      "vi": "Hương trà lúa mạch tình yêu"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 62,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2410022148358",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 150,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "百威",
      "en": "Budweiser Beer",
      "ko": "버드와이저",
      "ja": "バドワイザー",
      "th": "บัดไวเซอร์",
      "vi": "Budweiser"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 620,
    "containsSeafood": false,
    "containsPork": false,
    "id": "dish-2409232044239",
    "category": "tomyum",
    "description": {
      "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가가 가장 좋아하는 ♥️ 정통 태국식 진한 수프 베이스",
      "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本場タイの濃厚スープベース",
      "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม ♥️ฐานซุปเข้มข้นแบบไทยแท้",
      "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Món ăn yêu thích của người sành ăn♥️Súp đậm đà chính gốc Thái"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "牛小排冬蔭功湯",
      "en": "Charcoal Short Rib Beef Tom Yum Soup",
      "ko": "쇠고기 갈비 톰얌 수프",
      "ja": "牛カルビのトムヤムスープ",
      "th": "ต้มยำซี่โครงเนื้อ",
      "vi": "Súp Tom Yum Sườn Bò"
    },
    "available": true,
    "containsBeef": true,
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 63,
    "customAddOns": [
      {
        "id": "addon-1784479460272-831",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479462255-754",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479465274-753",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式牛小排米線",
      "en": "Thai Grilled Short Rib Beef Rice Noodle",
      "ko": "태국식 쇠고기 갈비 쌀국수",
      "ja": "タイ産牛肉ショートリブビーフン",
      "th": "ก๋วยเตี๋ยวเนื้อซี่โครงสั้นเนื้อไทย",
      "vi": "Bún sườn bò kiểu Thái"
    },
    "containsBeef": true,
    "containsSeafood": false,
    "price": 620,
    "id": "dish-2409232043478",
    "containsPork": false,
    "category": "tomyum",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
      "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가들이 즐겨찾는 정통 태국식 누들스프, 진한 국물 베이스가 마음과 배를 따뜻하게 해주는 정통 태국식 누들스프",
      "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本格的なタイ風ヌードルスープ、濃厚なスープベースで心もお腹も温まります",
      "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม♥️ซุปก๋วยเตี๋ยวสไตล์ไทยแท้ น้ำซุปเข้มข้นช่วยให้อุ่นหัวใจและท้อง",
      "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Là món ăn được những người sành ăn yêu thích♥️Mì Thái đúng kiểu Thái, nước súp đậm đà làm ấm lòng và dạ dày"
    },
    "orderIndex": 64,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479484092-785",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479486352-323",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479488427-739",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "price": 620,
    "containsSeafood": false,
    "containsBeef": true,
    "id": "dish-2409232042549",
    "containsPork": false,
    "category": "tomyum",
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai style noodle soup with a rich, heart-warming broth.",
      "ko": "5.2온스의 쇠고기 갈비(물을 넣지 않고, 재구성하지 않은 고기 선택 등급)를 숯불에 구워 국물에 곁들여 먹습니다! 미식가들이 즐겨찾는 정통 태국식 누들스프, 진한 국물 베이스가 마음과 배를 따뜻하게 해주는 정통 태국식 누들스프",
      "ja": "5.2オンスのビーフショートリブ（非加水、非再構造肉特選グレード）を炭火で焼き、スープで提供します。グルメに大人気♥️本格的なタイ風ヌードルスープ、濃厚なスープベースで心もお腹も温まります",
      "th": "ซี่โครงเนื้อวัวขนาด 5.2 ออนซ์ (เกรดเลือกเนื้อสัตว์แบบไม่รดน้ำและไม่มีการปรับโครงสร้างใหม่) ย่างบนถ่านและเสิร์ฟในซุป! ของโปรดของนักชิม♥️ซุปก๋วยเตี๋ยวสไตล์ไทยแท้ น้ำซุปเข้มข้นช่วยให้อุ่นหัวใจและท้อง",
      "vi": "5,2 ounce sườn bò ngắn (loại thịt không nước, không tái cấu trúc) nướng trên than củi và dùng trong súp! Là món ăn được những người sành ăn yêu thích♥️Mì Thái đúng kiểu Thái, nước súp đậm đà làm ấm lòng và dạ dày"
    },
    "orderIndex": 65,
    "isNotSpicy": false,
    "name": {
      "zh": "泰式牛小排河粉",
      "en": "Thai Grilled Short Rib Beef Pho Noodle",
      "ko": "태국식 쇠고기 갈비 포",
      "ja": "タイ産牛肉ショートリブのフォー",
      "th": "เฝอซี่โครงเนื้อไทย",
      "vi": "Phở sườn bò kiểu Thái"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479520251-308",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479522216-624",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479526311-934",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": true,
    "price": 660,
    "id": "dish-2409232024040",
    "category": "seafood",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "<3종 할인세트> 엄선된 L 사이즈 미야기현 굴과 우유, 해산물! 매장의 시그니처!\n생으로 먹어도 되고 구워서 먹어도 된다",
      "ja": "＜お得な3点セット＞Lサイズの宮城産牡蠣・牛乳・魚介類を厳選！お店のサインも！\n生でも焼いても食べられる",
      "th": "<ชุดลดราคาสามชิ้น> หอยนางรมมิยากิ นม และอาหารทะเลขนาด L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน!\nสามารถรับประทานดิบหรือย่างได้",
      "vi": "<Bộ giảm giá ba món> Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng!\nCó thể ăn sống hoặc nướng"
    },
    "orderIndex": 66,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式生蠔3p",
      "en": "Thai Style Fresh Oysters (3pcs Combo)",
      "ko": "태국 굴 3p",
      "ja": "タイオイスター3P",
      "th": "หอยนางรมไทย3p",
      "vi": "Hàu Thái 3p"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "冰水(大)",
      "en": "Large Ice Water",
      "ko": "얼음물(대)",
      "ja": "氷水（大）",
      "th": "น้ำแข็งใส (ใหญ่)",
      "vi": "Nước đá (lớn)"
    },
    "available": true,
    "price": 100,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": false,
    "category": "cat-7cvvkq",
    "id": "dish-2409131907512",
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 67,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 68,
    "description": {
      "zh": "",
      "en": "",
      "ko": "",
      "ja": "",
      "th": ""
    },
    "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2408192006066",
    "containsPork": false,
    "category": "cat-svadcb",
    "price": 500,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "開瓶費1支",
      "en": "Corkage Fee (Per Bottle)",
      "ko": "코르키지 요금 1병",
      "ja": "持ち込み料金 1本",
      "th": "ค่าเปิดขวด 1 ขวด",
      "vi": "Phí đóng chai 1 chai"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "name": {
      "zh": "泰北酸肉冬粉腸",
      "en": "Northern Thai Fermented Pork Sausage w/ Glass Noodles",
      "ko": "북부 태국 신 돼지고기와 겨울 국수 소시지",
      "ja": "タイ北部のサワーポークとウィンターヌードルソーセージ",
      "th": "หมูยอภาคเหนือและไส้กรอกหมี่ฤดูหนาว",
      "vi": "Bún chua mùa đông và thịt chua miền Bắc Thái"
    },
    "available": true,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": true,
    "category": "skewers",
    "id": "dish-2408191941429",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "정통 태국식 신 돼지고기 소시지 녹색면 <음식이 신맛이 나거나 상한 것이 아닙니다> 본 상품을 주문하시는 고객께서는 이 점을 숙지하시기 바랍니다.",
      "ja": "本格タイ風サワーポークソーセージ グリーンヌードル入り ＜酸っぱい・傷むわけではありません＞ この商品をご注文いただくお客様は、この点をご理解いただいた上でご注文ください",
      "th": "ไส้กรอกอีสานเส้นหมี่เขียวแท้ <ไม่ใช่ว่าอาหารเปรี้ยวหรือบูด> ลูกค้าที่สั่งสินค้าต้องมีความเข้าใจดังนี้",
      "vi": "Xúc xích heo chua Thái chính hãng với bún xanh <Không phải đồ ăn bị chua hay hư> Khách hàng đặt mua sản phẩm này phải hiểu rõ điều này"
    },
    "orderIndex": 69,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": -10,
    "containsPork": false,
    "id": "dish-2407231815553",
    "category": "cat-svadcb",
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 70,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
      "ja": "期間限定の超お得な割引パッケージ",
      "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
      "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn"
    },
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "好友折扣",
      "en": "Friend Discount Coupon",
      "ko": "친구할인",
      "ja": "友達割引",
      "th": "ส่วนลดเพื่อน",
      "vi": "Giảm giá cho bạn bè"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 71,
    "description": {
      "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주수입) 숯불에 노릇노릇해질 때까지 구운 후 커민가루를 뿌려주세요! 매장에서 가장 많이 팔리는 NO2입니다.",
      "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリアから輸入） 炭火できつね色になるまで焼き、クミンパウダーをふりかける！当店の売れ筋NO2。",
      "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีเหลืองทองโรยผงยี่หร่า! NO2 ที่ขายดีที่สุดในร้าน",
      "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi vàng nâu và rắc bột thì là! NO2 bán chạy nhất tại cửa hàng."
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2305152126508",
    "containsPork": false,
    "category": "skewers",
    "price": 70,
    "containsSeafood": false,
    "containsBeef": false,
    "name": {
      "zh": "小羔羊肋",
      "en": "Cumin Lamb Rib Skewers",
      "ko": "양갈비",
      "ja": "ラムリブ",
      "th": "ซี่โครงแกะ",
      "vi": "sườn cừu"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "果肉椰子水",
      "en": "Fresh Coconut Water w/ Pulp",
      "ko": "펄프 코코넛 워터",
      "ja": "パルプココナッツウォーター",
      "th": "น้ำมะพร้าวเนื้อ",
      "vi": "Nước cốt dừa"
    },
    "available": true,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "containsPork": false,
    "id": "dish-2304041737306",
    "category": "drinks",
    "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 72,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "泰式生蠔1P",
      "en": "Thai Style Fresh Oyster (1pc)",
      "ko": "타이 굴 1P",
      "ja": "タイオイスター 1P",
      "th": "หอยนางรมไทย 1P",
      "vi": "Hàu Thái 1P"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "엄선된 L 사이즈 미야기 굴, 우유, 해산물! 매장의 시그니처! 생으로 먹어도 되고 구워서 먹어도 된다",
      "ja": "宮城産の牡蠣・牛乳・魚介類をLサイズで厳選！お店のサインも！生でも焼いても食べられる",
      "th": "หอยนางรม มิยากิ นม และอาหารทะเลไซส์ L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน! สามารถรับประทานดิบหรือย่างได้",
      "vi": "Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng! Có thể ăn sống hoặc nướng"
    },
    "orderIndex": 73,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2303301719168",
    "containsPork": false,
    "category": "seafood",
    "price": 250,
    "containsBeef": false,
    "containsSeafood": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 74,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "category": "cat-7cvvkq",
    "containsPork": false,
    "id": "dish-2302272107257",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 110,
    "available": true,
    "name": {
      "zh": "勝獅",
      "en": "Singha Beer",
      "ko": "싱가포르",
      "ja": "シンガポール",
      "th": "สิงคโปร์",
      "vi": "singapore"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 110,
    "containsBeef": false,
    "containsSeafood": false,
    "category": "cat-7cvvkq",
    "id": "dish-2302162152176",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 75,
    "isNotSpicy": true,
    "name": {
      "zh": "泰象",
      "en": "Chang Beer",
      "ko": "타이샹",
      "ja": "太祥",
      "th": "ไท่เซียง",
      "vi": "Thái Tường"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2211162026366",
    "category": "veggies",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 76,
    "description": {
      "zh": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "영양은 높고, 칼로리는 낮으며, 칼슘은 우유만큼 풍부! 위장 건강을 위한 좋은 선택입니다.",
      "ja": "栄養価が高く、カロリーが低く、カルシウムも牛乳と同じくらい豊富！胃の健康のためには良い選択です。",
      "th": "มีสารอาหารสูง แคลอรี่ต่ำ และมีแคลเซียมสูงเท่านม! เป็นทางเลือกที่ดีสำหรับสุขภาพกระเพาะอาหาร",
      "vi": "Giàu chất dinh dưỡng, ít calo và giàu canxi như sữa! Đó là một lựa chọn tốt cho sức khỏe dạ dày."
    },
    "isNotSpicy": false,
    "name": {
      "zh": "秋葵(季節限定)",
      "en": "Charcoal Grilled Okra (Seasonal)",
      "ko": "오크라(계절 한정)",
      "ja": "オクラ（季節限定）",
      "th": "กระเจี๊ยบ (ตามฤดูกาลเท่านั้น)",
      "vi": "Đậu bắp (chỉ theo mùa)"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "泰式海鮮米線",
      "en": "Thai Seafood Tom Yum Rice Noodle",
      "ko": "태국식 해산물 쌀국수",
      "ja": "タイ風シーフードビーフン",
      "th": "ก๋วยเตี๋ยวทะเลไทย",
      "vi": "Bún hải sản kiểu Thái"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "똠얌꿍을 맛보지 않았다면 태국 음식을 맛봤다고 말할 수 없습니다! 향토맛 국수면의 고전적인 맛, 풍부한 국물 베이스가 마음과 배를 따뜻하게 해준다.",
      "ja": "トムヤムクンを試してみなければ、タイ料理を味わったとは言えません。郷土味スープ麺の定番の味わい、濃厚なスープが心もお腹も温まります",
      "th": "คุณจะพูดไม่ได้ว่าเคยทานอาหารไทยแล้วถ้ายังไม่เคยลองต้มยำกุ้ง! รสชาติคลาสสิกของบะหมี่ซุปรสท้องถิ่น น้ำซุปเข้มข้นทำให้อุ่นหัวใจและท้อง",
      "vi": "Bạn không thể nói mình đã nếm thử đồ ăn Thái nếu chưa thử Tom Yum Goong! Hương vị cổ điển của món phở đậm đà hương vị địa phương, nước súp đậm đà làm ấm lòng và dạ dày"
    },
    "orderIndex": 77,
    "containsSeafood": true,
    "containsBeef": false,
    "price": 240,
    "id": "dish-2209081804158",
    "containsPork": false,
    "category": "tomyum",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479721381-721",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479723321-863",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479725596-570",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "Choice牛小排-5oz",
      "en": "USDA Choice Beef Short Rib Steak (5oz)",
      "ko": "초이스 소갈비-5oz",
      "ja": "特選ビーフショートリブ-5オンス",
      "th": "ซี่โครงเนื้อทางเลือก-5oz",
      "vi": "Sườn Bò Choice-5oz"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "생고기를 정성스럽게 손질하여 숯불에 천천히 구워내면 고소한 향이 가득하고, 한입 먹을 때마다 정말 맛있습니다!",
      "ja": "丁寧にそぎ落とした生肉を炭火でじっくり焼き上げると、香ばしさが溢れ、一口食べるごとにとても美味しいです！",
      "th": "หลังจากที่เนื้อดิบได้รับการตัดแต่งอย่างระมัดระวังและย่างอย่างช้าๆบนไฟถ่าน กลิ่นหอมก็ล้นออกมา และทุกคำที่กัดก็อร่อยมาก!",
      "vi": "Sau khi thịt sống được cắt tỉa cẩn thận và nướng từ từ trên lửa than, mùi thơm tràn ngập, mỗi miếng cắn đều vô cùng thơm ngon!"
    },
    "orderIndex": 78,
    "containsSeafood": false,
    "containsBeef": true,
    "price": 590,
    "id": "dish-2209081753180",
    "category": "skewers",
    "containsPork": false,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479747323-7",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479750303-903",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479752305-972",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "아침에 시장에 갔다가 따기와 양념장을 가지고 가지고 왔습니다. (닭꽁초 좋아하시는 분들은 필수!) 아직 튀겨지지 않았기 때문에 15분 정도 구워주세요.",
      "ja": "朝市場に行って、むしりとマリネを付けて持ち帰ってきました（鶏のお尻好きな人は必ず頼む！）まだ揚げていないので、15分ほど焼きます。",
      "th": "เมื่อเช้าผมไปตลาดก็เอากลับมาแบบถอนขนและหมักด้วย (คนชอบก้นไก่ต้องสั่ง!) เนื่องจากยังไม่ได้ทอดจึงอบประมาณ 15 นาที",
      "vi": "Sáng đi chợ mang về cùng với cả tuốt và ướp (món phải gọi của ai thích mông gà!) Vì chưa chiên nên nướng khoảng 15 phút."
    },
    "orderIndex": 79,
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2209081751117",
    "category": "skewers",
    "containsPork": false,
    "name": {
      "zh": "特大土雞七里香",
      "en": "Extra Large Chicken Butt Skewers",
      "ko": "특대형 토종닭 Qilixiang",
      "ja": "特大地鶏七里香",
      "th": "ไก่ท้องถิ่น Qilixiang ขนาดใหญ่พิเศษ",
      "vi": "Gà địa phương cực lớn Qiilixiang"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 80,
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 0,
    "containsPork": false,
    "category": "cat-zene8j",
    "id": "dish-2208121916271",
    "available": true,
    "name": {
      "zh": "辣椒粉",
      "en": "Chili Powder Dip",
      "ko": "파프리카",
      "ja": "パプリカ",
      "th": "พริกหยวก",
      "vi": "ớt bột"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "泰式海鮮河粉",
      "en": "Thai Seafood Tom Yum Pho Noodle",
      "ko": "태국 해산물 포",
      "ja": "タイ風シーフードフォー",
      "th": "เฝอทะเลไทย",
      "vi": "Phở hải sản kiểu Thái"
    },
    "isNotSpicy": false,
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "똠얌꿍을 맛보지 않았다면 태국 음식을 맛봤다고 말할 수 없습니다! 향토맛 국수면의 고전적인 맛, 풍부한 국물 베이스가 마음과 배를 따뜻하게 해준다.",
      "ja": "トムヤムクンを試してみなければ、タイ料理を味わったとは言えません。郷土味スープ麺の定番の味わい、濃厚なスープが心もお腹も温まります",
      "th": "คุณจะพูดไม่ได้ว่าเคยทานอาหารไทยแล้วถ้ายังไม่เคยลองต้มยำกุ้ง! รสชาติคลาสสิกของบะหมี่ซุปรสท้องถิ่น น้ำซุปเข้มข้นทำให้อุ่นหัวใจและท้อง",
      "vi": "Bạn không thể nói mình đã nếm thử đồ ăn Thái nếu chưa thử Tom Yum Goong! Hương vị cổ điển của món phở đậm đà hương vị địa phương, nước súp đậm đà làm ấm lòng và dạ dày"
    },
    "orderIndex": 81,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "id": "dish-2208121912457",
    "category": "tomyum",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 240,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479804720-626",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479806981-555",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479809050-307",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "orderIndex": 82,
    "description": {
      "zh": "外酥內嫩的口感，店內人氣商品!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "겉은 바삭하고 속은 부드러운 이 매장의 인기상품!",
      "ja": "外はカリッと中はふわっとしたお店の人気商品です！",
      "th": "กรอบนอกนุ่มในเป็นสินค้ายอดนิยมของร้าน!",
      "vi": "Giòn bên ngoài và mềm bên trong, một mặt hàng phổ biến trong cửa hàng!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2208071821298",
    "category": "skewers",
    "containsPork": false,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "available": true,
    "name": {
      "zh": "泰酥豆皮",
      "en": "Crispy Tofu Skin Skewer",
      "ko": "태국식 바삭한 두부 스킨",
      "ja": "タイのパリパリ豆腐皮",
      "th": "หนังเต้าหู้กรอบ",
      "vi": "Da đậu hủ chiên giòn kiểu Thái"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "아직 숯불구이 달새우떡을 먹어본 적이 없다면 꼭 드셔보세요! 디핑 소스가 포함됩니다 -> 새우 케이크는 새우, 해산물 충전재 및 어묵이 들어 있으며 (수제) 맛이 일품입니다.",
      "ja": "炭火焼月海老餅をまだ食べたことがない方はぜひお試しください！つけだれもついてきます → エビケーキ（手作り）はエビ、魚介餡、かまぼこが入っており、一級品の味わいです",
      "th": "ใครยังไม่เคยลองขนมไหว้พระจันทร์ย่างเตาถ่านต้องลอง! น้ำจิ้มจะรวมอยู่ด้วย -> ทอดมันกุ้ง (ทำมือ) ประกอบด้วยกุ้ง ไส้ทะเล และกะปิ และมีรสชาติชั้นหนึ่ง",
      "vi": "Nếu bạn chưa từng thử bánh tôm trung thu nướng than thì nhất định phải thử nhé! Nước chấm sẽ được bao gồm -> bánh tôm được làm thủ công gồm có tôm, nhân hải sản và chả cá, có hương vị hảo hạng"
    },
    "orderIndex": 83,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2208071820475",
    "containsPork": false,
    "category": "seafood",
    "price": 320,
    "containsBeef": false,
    "containsSeafood": true,
    "name": {
      "zh": "碳烤手工月亮蝦餅",
      "en": "Charcoal Grilled Handmade Moon Shrimp Cake",
      "ko": "숯불구이 수제 달새우떡",
      "ja": "手作り月海老ケーキの炭火焼き",
      "th": "ขนมไหว้พระจันทร์ทำมือย่างถ่าน",
      "vi": "Bánh trung thu nướng than thủ công"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 84,
    "description": {
      "zh": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "계란 2개 + 헐크옥수수 알갱이를 잘 골라서 -> 약불로 익히기 -> 갓 간 흑후추를 뿌리고 -> 우유향이 가득한 진한 국물 한 그릇 완성",
      "ja": "卵2個＋ハルクコーン粒を厳選 → 弱火でじっくり煮込む → 挽きたての黒胡椒を振る → ミルキーな香りが広がる濃厚なスープの完成",
      "th": "เลือกไข่ 2 ฟองอย่างระมัดระวัง + เมล็ดข้าวโพด Hulk -> ปรุงโดยใช้ไฟอ่อน -> โรยด้วยพริกไทยดำบดสด -> เติมซุปเข้มข้นที่มีกลิ่นหอมของน้ำนมลงในชาม",
      "vi": "Cẩn thận chọn 2 quả trứng + hạt ngô Hulk -> Nấu trên lửa chậm -> Rắc hạt tiêu đen mới xay -> Hoàn thành một bát súp đậm đà thơm mùi sữa"
    },
    "price": 160,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-2208071816553",
    "containsPork": false,
    "category": "noodles",
    "name": {
      "zh": "奶香火腿玉米濃湯",
      "en": "Creamy Ham & Sweet Corn Soup",
      "ko": "크림 햄과 옥수수 수프",
      "ja": "ハムとコーンのクリーミースープ",
      "th": "ครีมแฮมและซุปข้าวโพด",
      "vi": "Súp kem ngô và giăm bông"
    },
    "available": true,
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 260,
    "containsSeafood": true,
    "id": "dish-2207122341556",
    "category": "tomyum",
    "containsPork": false,
    "description": {
      "zh": "道地泰式風味湯，濃郁湯底暖心暖胃",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "정통 태국 맛 수프, 풍부한 수프 베이스가 마음과 배를 따뜻하게 해줍니다.",
      "ja": "心もお腹も温まる、本場タイの風味豊かなスープベース",
      "th": "น้ำซุปรสไทยแท้ น้ำซุปเข้มข้น อุ่นหัวใจและท้อง",
      "vi": "Nước súp đậm đà hương vị Thái, nước súp đậm đà làm ấm lòng và dạ dày"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "海鮮冬蔭功湯",
      "en": "Traditional Seafood Tom Yum Soup",
      "ko": "해산물 똠양꿍 수프",
      "ja": "シーフードトムヤムスープ",
      "th": "ต้มยำทะเล",
      "vi": "Súp Tom Yum hải sản"
    },
    "available": true,
    "containsBeef": false,
    "hasCoconutsMilkOption": true,
    "hasNoodlesOption": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 85,
    "customAddOns": [
      {
        "id": "addon-1784479887987-726",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479890262-993",
        "name": {
          "zh": "加米線",
          "en": "Add rice noodles",
          "ko": "쌀국수 추가",
          "ja": "ビーフンを加えます",
          "th": "ใส่เส้นก๋วยเตี๋ยว",
          "vi": "Thêm bún"
        },
        "price": 20
      },
      {
        "id": "addon-1784479892347-500",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "越南鮮牛肉河粉",
      "en": "Vietnamese Fresh Beef Pho Noodle Soup",
      "ko": "베트남산 신선한 쇠고기 포",
      "ja": "ベトナムの新鮮な牛肉のフォー",
      "th": "เฝอเนื้อสดเวียดนาม",
      "vi": "Phở bò tươi Việt Nam"
    },
    "available": true,
    "containsPork": false,
    "category": "noodles",
    "id": "dish-2207122341013",
    "price": 250,
    "containsSeafood": false,
    "containsBeef": true,
    "orderIndex": 86,
    "description": {
      "zh": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "국물은 달큰하고 (뼈와 야채를 3시간 끓여서 만든 국물입니다. MSG 국물이 아닙니다. 하루 14인분 한정이며 품절됩니다.) 고기조각은 미국산 안심 안심 쇠고기 초이스 등급으로 만듭니다! 재료: 중국 본토녀, 양파, 쪽파, 구층탑, 후추, 콩나물, 쌀국수.",
      "ja": "スープは甘めの甘め（骨と野菜を3時間煮込んでいます。MSGスープではありません。1日14食限定、売り切れ次第終了です。） 肉スライスはアメリカ産の柔らかい肩ヒレ肉特選グレードを使用！材料:中国大陸の女の子、玉ねぎ、ねぎ、九重塔、黒胡椒、もやし、ビーフン。",
      "th": "ซุปมีรสหวานอมหวาน (ต้มกระดูกและผักเป็นเวลา 3 ชั่วโมง ไม่ใช่ซุปผงชูรส จำกัดเพียง 14 มื้อต่อวันและจะขายหมด) เนื้อชิ้นทำจากเนื้อสันในอเมริกาเกรดคัดสรร! ส่วนผสม: เด็กหญิงจีนแผ่นดินใหญ่ หัวหอม ต้นหอม เจดีย์เก้าชั้น พริกไทยดำ ถั่วงอก และเส้นหมี่",
      "vi": "Nước súp ngọt ngọt (xương và rau được luộc trong 3 giờ. Không phải súp bột ngọt. Số lượng giới hạn 14 suất mỗi ngày và sẽ bán hết.) Các lát thịt được làm từ loại thịt thăn vai mềm của Mỹ tuyển chọn! Nguyên liệu: Cô gái Hoa lục, hành tây, hành lá, chùa chín tầng, tiêu đen, giá đỗ và bún."
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479915298-709",
        "name": {
          "zh": "加河粉",
          "en": "Add pho",
          "ko": "사진 추가",
          "ja": "フォーを追加",
          "th": "เพิ่มโพธิ์",
          "vi": "Thêm phở"
        },
        "price": 20
      },
      {
        "id": "addon-1784479917660-34",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "name": {
      "zh": "紫菜蛋花湯",
      "en": "Seaweed & Egg Drop Soup",
      "ko": "김 계란국",
      "ja": "海苔とたまごのスープ",
      "th": "ซุปสาหร่ายไข่นุ่ม",
      "vi": "Súp Rong Biển Trứng"
    },
    "available": true,
    "isNotSpicy": true,
    "description": {
      "zh": "洗選雞蛋2顆+海帶芽~外食族補充膳食纖維白質的好選擇",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
      "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
      "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "orderIndex": 87,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122338495",
    "containsPork": false,
    "category": "noodles",
    "price": 90,
    "containsBeef": false,
    "containsSeafood": false
  },
  {
    "orderIndex": 88,
    "description": {
      "zh": "每日早市新鮮採買~新鮮蛤蠣搭配蔥薑絲九層塔!越簡單越耐人尋味",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
      "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
      "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
      "vi": "Authentic Thai-style soup noodles with rich, warming broth"
    },
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "category": "noodles",
    "containsPork": false,
    "id": "dish-2207122336248",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 150,
    "available": true,
    "name": {
      "zh": "鮮味蛤蜊湯",
      "en": "Fresh Clam Soup w/ Ginger",
      "ko": "신선한 바지락 생강 조개탕",
      "ja": "新鮮アサリと生姜のクリアスープ",
      "th": "ซุปหอยตลับสดใส่ขิงและโหระพา",
      "vi": "Canh Nghêu Tươi Nấu Gừng Húng Quế"
    },
    "isNotSpicy": true
  },
  {
    "orderIndex": 89,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122331502",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 100,
    "available": true,
    "name": {
      "zh": "金牌",
      "en": "Taiwan Gold Medal Beer",
      "ko": "금메달",
      "ja": "金メダル",
      "th": "เหรียญทอง",
      "vi": "huy chương vàng"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": true,
    "name": {
      "zh": "金樽",
      "en": "Gold Draft Beer",
      "ko": "황금 컵",
      "ja": "黄金の杯",
      "th": "ถ้วยทอง",
      "vi": "cúp vàng"
    },
    "available": true,
    "id": "dish-2207122330338",
    "containsPork": false,
    "category": "cat-7cvvkq",
    "price": 150,
    "containsBeef": false,
    "containsSeafood": false,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
      "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
      "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng."
    },
    "orderIndex": 90,
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "可口可樂",
      "en": "Coca-Cola",
      "ko": "코카콜라",
      "ja": "コカ・コーラ",
      "th": "โคคา-โคล่า",
      "vi": "Coca-Cola"
    },
    "isNotSpicy": true,
    "description": {
      "zh": "肥仔的快樂水~搭配燒烤絕配!",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "시원하고 상쾌한 음료로 바베큐와 완벽한 조화",
      "ja": "冷たくさわやか、BBQに最高の組み合わせ",
      "th": "เย็นชื่นใจ รสสดชื่น เข้ากับบาร์บีคิวได้อย่างลงตัว",
      "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng"
    },
    "orderIndex": 91,
    "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "drinks",
    "id": "dish-2207122323590",
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90
  },
  {
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "泰式奶茶400ml",
      "en": "Signature Thai Iced Milk Tea (400ml)",
      "ko": "타이 밀크티 400ml",
      "ja": "タイミルクティー 400ml",
      "th": "ชานมไทย 400มล",
      "vi": "Trà sữa Thái 400ml"
    },
    "containsBeef": false,
    "containsSeafood": false,
    "price": 90,
    "category": "drinks",
    "id": "dish-2207122322371",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "진한 차 향이 나는 클래식 핸드라벨 태국 우유~ 상큼하고 상큼한~ 시그니처!",
      "ja": "紅茶の香りが強い定番の手ラベルタイミルク～爽やかさわやか～の代表作！",
      "th": "นมไทยฉลากมือสุดคลาสสิค กลิ่นหอมชาเข้มข้น ~ สดชื่น สดชื่น ~ ซิกเนเจอร์!",
      "vi": "Sữa Thái được dán nhãn thủ công cổ điển với hương trà đậm đà ~ sảng khoái và sảng khoái ~ đặc trưng!"
    },
    "orderIndex": 92,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsSeafood": false,
    "containsBeef": false,
    "price": 160,
    "id": "dish-2207122316233",
    "containsPork": false,
    "category": "cat-zene8j",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 93,
    "description": {
      "zh": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
      "en": "Carefully crafted with rich flavors to complement your meal",
      "ko": "차오티안 고추와 다진 생강, 마늘을 볶은 요리~ 맛있고 방부제도 넣지 않았습니다! 집 구입시 냉장보관 필수",
      "ja": "朝天山椒、生姜、ニンニクの千切りを炒めました～保存料無添加で美味しいです！住宅購入時は要冷蔵",
      "th": "ผัดพริกเผาขิงและกระเทียมฝอย ~ อร่อยไม่ใส่สารกันบูด! ต้องแช่เย็นเมื่อซื้อกลับบ้าน",
      "vi": "Xào tiêu Chaotian, gừng và tỏi băm nhỏ ~ thơm ngon và không thêm chất bảo quản! Cần bảo quản tủ lạnh khi mua nhà"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "特製辣椒醬(外帶)",
      "en": "House Special Chili Sauce (Takeout Jar)",
      "ko": "특제 칠리소스(테이크아웃)",
      "ja": "特製チリソース（持ち帰り）",
      "th": "น้ำพริกสูตรพิเศษ (ทูโก)",
      "vi": "Tương ớt đặc biệt (mang đi)"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 94,
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn"
    },
    "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    "containsPork": false,
    "category": "cat-zene8j",
    "id": "dish-2207122312525",
    "price": 0,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "泰式綠醬",
      "en": "Thai Seafood Green Chili Sauce",
      "ko": "태국 그린 소스",
      "ja": "タイのグリーンソース",
      "th": "ซอสเขียวไทย",
      "vi": "Nước sốt xanh Thái"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 0,
    "category": "cat-zene8j",
    "containsPork": false,
    "id": "dish-2207122311467",
    "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "精心調製，口感層次豐富，為您的餐點添彩",
      "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
      "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
      "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
      "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
      "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn"
    },
    "orderIndex": 95,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式紅醬",
      "en": "Thai BBQ Red Chili Sauce",
      "ko": "태국식 빨간 소스",
      "ja": "タイのレッドソース",
      "th": "น้ำแดงไทย",
      "vi": "Nước sốt đỏ Thái"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "id": "dish-2207122252395",
    "category": "veggies",
    "containsPork": false,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "又稱作敏豆，口感清甜、富含營養且低熱量",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "민감한 콩이라고도 알려진 이 콩은 맛이 달콤하고 영양분이 풍부하며 칼로리가 낮습니다.",
      "ja": "敏感豆とも呼ばれ、甘くて栄養が豊富でカロリーが低いです。",
      "th": "เรียกอีกอย่างว่าถั่วที่ละเอียดอ่อน มีรสหวาน อุดมไปด้วยสารอาหารและมีแคลอรีต่ำ",
      "vi": "Còn được gọi là đậu nhạy cảm, chúng có vị ngọt, giàu chất dinh dưỡng và ít calo."
    },
    "orderIndex": 96,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "四季豆",
      "en": "Charcoal Grilled Green Beans",
      "ko": "프랑스산 콩",
      "ja": "フランス豆",
      "th": "ถั่วฝรั่งเศส",
      "vi": "Đậu pháp"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 97,
    "description": {
      "zh": "新竹人氣丸子~大人小孩都愛",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "신주의 인기 미트볼~어른도 아이도 좋아하는",
      "ja": "新竹で人気のミートボール ～大人も子供も大好き",
      "th": "ลูกชิ้นยอดนิยมในซินจู๋ ~ ถูกใจทั้งเด็กและผู้ใหญ่",
      "vi": "Món thịt viên nổi tiếng ở Tân Trúc ~ được cả người lớn và trẻ em yêu thích"
    },
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "containsPork": true,
    "category": "skewers",
    "id": "dish-2207122141316",
    "containsSeafood": false,
    "containsBeef": false,
    "price": 60,
    "available": true,
    "name": {
      "zh": "新竹貢丸",
      "en": "Hsinchu Pork Meatballs",
      "ko": "신주공완",
      "ja": "新竹公湾",
      "th": "ซินจู๋ กงวาน",
      "vi": "Tân Trúc Gongwan"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "澎澎甜不辣",
      "en": "Chewy Charcoal Grilled Fish Cakes",
      "ko": "펭펭은 달달한가요, 아니면 매운가요?",
      "ja": "ペンペンは甘いですか、それとも辛いですか?",
      "th": "เป้งเป้งหวานหรือเผ็ดคะ?",
      "vi": "Peng Peng ngọt hay cay?"
    },
    "category": "seafood",
    "containsPork": false,
    "id": "dish-2207122140364",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 80,
    "description": {
      "zh": "烤甜不辣，口感Q彈紮實!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "구워서 달콤하면서도 맵지 않고 쫄깃한 식감!",
      "ja": "炙ってあり、甘いけど辛くなく、モチモチとした食感！",
      "th": "คั่วหวานแต่ไม่เผ็ด เนื้อเคี้ยวหนึบ!",
      "vi": "Rang, ngọt nhưng không cay, dai dai!"
    },
    "orderIndex": 98,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "available": true,
    "name": {
      "zh": "鯖甘魚下巴",
      "en": "Charcoal Grilled Mackerel Collar (XL)",
      "ko": "고등어 턱",
      "ja": "サバのチン",
      "th": "ปลาทูชิน",
      "vi": "cá thu cằm"
    },
    "isNotSpicy": true,
    "description": {
      "zh": "炭火慢烤，特大號，每一口都是極致美味!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "숯불에 천천히 구워서 특대형으로 한입 먹어도 맛있습니다!",
      "ja": "炭火でじっくり焼き上げた特大サイズで、一口食べても美味しい！",
      "th": "ย่างไฟบนเตาถ่าน ชิ้นใหญ่พิเศษ อร่อยทุกคำ!",
      "vi": "Nướng chậm trên lửa than, cực lớn, miếng nào cũng ngon!"
    },
    "orderIndex": 99,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "id": "dish-2207122132048",
    "containsPork": false,
    "category": "seafood",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 390,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "招牌泰式烤雞翅(4入)",
      "en": "Signature Thai BBQ Chicken Wings (4pcs)",
      "ko": "시그니처 타이 그릴드 치킨 윙(4개)\n--​​-\n태국산 수제 쇠고기",
      "ja": "タイ風手羽先のグリル（4本）\n-- -\nタイの手作り牛肉",
      "th": "ปีกไก่ย่างซิกเนเจอร์ (4 ชิ้น)\n---​​-\nเนื้อไทยทำมือ",
      "vi": "Cánh gà nướng kiểu Thái đặc trưng (4 miếng)\n--​-\nThịt bò thủ công Thái Lan"
    },
    "id": "dish-2207122058577",
    "category": "skewers",
    "containsPork": false,
    "containsSeafood": false,
    "containsBeef": false,
    "price": 160,
    "description": {
      "zh": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "주문해야합니다! 주문해야합니다! 주문해야합니다! 아침에 마트에서 구매한 신선한 재료 -> 씻어서 태국 전용 소스에 재워둡니다",
      "ja": "必ず注文してください！必ず注文してください！必ず注文してください！朝市場から仕入れた新鮮→洗って特製タイソースに漬け込む",
      "th": "ต้องสั่ง! ต้องสั่ง! ต้องสั่ง! ซื้อสดๆจากตลาดตอนเช้า -> ล้างและหมักด้วยน้ำจิ้มสูตรเฉพาะของไทย",
      "vi": "Phải đặt hàng! Phải đặt hàng! Phải đặt hàng! Mới mua ngoài chợ lúc sáng -> Rửa sạch và ướp với sốt Thái độc quyền"
    },
    "orderIndex": 100,
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式手工牛肉",
      "en": "Handmade Thai Spiced Beef Skewer",
      "ko": "스쿼트 소시지",
      "ja": "潮吹きソーセージ",
      "th": "ไส้กรอกฉีด",
      "vi": "xúc xích mực"
    },
    "id": "dish-2207122056269",
    "containsPork": false,
    "category": "skewers",
    "containsBeef": true,
    "containsSeafood": false,
    "price": 90,
    "description": {
      "zh": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "전용 꼬치!!! 일일 수제 한정판~ 국내산 쇠고기를 사용하고 각종 태국 향신료에 절인 후 -> 고기를 쫄깃쫄깃해질 때까지 다진 뒤 윤린땅콩을 섞어 무기술, 아주 생기 넘치는 천연수공예품!",
      "ja": "特製串！毎日の手作り限定版〜地元の牛肉を使用し、さまざまなタイのスパイスで漬け込みます -> 肉を粘りが出るまで刻み、雲林ピーナッツを混ぜます、テクノロジーは使用せず、非常に生き生きとした、すべて天然の手作りです！",
      "th": "สเต๊กพิเศษ!!! สินค้าทำมือรายวัน รุ่นลิมิเต็ด อิดิชั่น ~ ใช้เนื้อท้องถิ่นหมักด้วยเครื่องเทศไทยนานาชนิด -> สับเนื้อให้เหนียวแล้วผสมถั่วลิสงหยุนลิน ไม่ใช้เทคโนโลยี มีชีวิตชีวามาก เป็นงานฝีมือจากธรรมชาติทั้งหมด!",
      "vi": "Xiên độc quyền!!! Phiên bản giới hạn thủ công hàng ngày ~ Sử dụng thịt bò địa phương và ngâm với nhiều loại gia vị Thái -> Cắt thịt cho đến khi dẻo rồi trộn vào đậu phộng Yunlin, không cần công nghệ, rất sống động, tất cả đều là thủ công tự nhiên!"
    },
    "orderIndex": 101,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "噴水香腸",
      "en": "Juicy Taiwanese Pork Sausage",
      "ko": "갉아먹힌 닭 껍질",
      "ja": "鶏の皮をかじった",
      "th": "หนังไก่แทะ",
      "vi": "da gà gặm"
    },
    "id": "dish-2207122053275",
    "category": "skewers",
    "containsPork": true,
    "containsBeef": false,
    "containsSeafood": false,
    "price": 60,
    "orderIndex": 102,
    "description": {
      "zh": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "고상한 형용사는 없다~가장 직접적인 맛만~대만과자 대표",
      "ja": "高尚な形容詞は一切ない ～ただストレートな美味しさだけ～ 台湾スナックの代表格",
      "th": "ไม่มีคำคุณศัพท์ที่สูงส่ง ~ มีแต่ความอร่อยที่ตรงที่สุดเท่านั้น ~ เป็นตัวแทนของขนมไต้หวัน",
      "vi": "Không có tính từ cao cả nào ~ chỉ có độ ngon trực tiếp nhất ~ đại diện cho món ăn nhẹ của Đài Loan"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 103,
    "description": {
      "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 줄어들고~ 바삭바삭한 식감이 매력으로 변신!",
      "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂が減り、カリッとした食感が魅力的！",
      "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันก็ลดลง~ และกลายเป็นเนื้อกรอบที่น่าหลงใหล!",
      "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than củi, chất béo được giảm bớt ~ và chuyển thành kết cấu giòn hấp dẫn!"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 60,
    "containsPork": false,
    "id": "dish-2207122051592",
    "category": "skewers",
    "available": true,
    "name": {
      "zh": "啃的雞皮",
      "en": "Crispy Charcoal Grilled Chicken Skin",
      "ko": "태국식 뼈없는 구운 닭다리살",
      "ja": "タイ風骨なし鶏もも肉のグリル",
      "th": "สะโพกไก่ย่างไร้กระดูกแบบไทย",
      "vi": "Đùi gà nướng không xương kiểu Thái"
    },
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 104,
    "description": {
      "zh": "每日早市新鮮採買<去骨雞腿使用台灣放山雞><不添加嫩肉精>",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "매일아침시장에서 갓 구매한 <순살닭다리는 대만산 꿩고기> <연육 무첨가>",
      "ja": "毎日朝市から新鮮仕入れ＜骨なし鶏もも肉は台湾産キジを使用＞＜肉軟化剤無添加＞",
      "th": "ซื้อสดใหม่จากตลาดเช้าทุกวัน <ขาไก่ไร้กระดูกทำจากไก่ฟ้าไต้หวัน> <ไม่ใส่เนื้อนุ่ม>",
      "vi": "Mới mua từ chợ buổi sáng hàng ngày <Chân gà không xương được làm từ gà lôi Đài Loan> <Không thêm chất làm mềm thịt>"
    },
    "price": 160,
    "containsSeafood": false,
    "containsBeef": false,
    "id": "dish-2207122037251",
    "containsPork": false,
    "category": "skewers",
    "name": {
      "zh": "泰式去骨烤雞腿",
      "en": "Thai Grilled Boneless Chicken Thigh",
      "ko": "泰式去骨烤雞腿",
      "ja": "泰式去骨烤雞腿",
      "th": "泰式去骨烤雞腿",
      "vi": "泰式去骨烤雞腿"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "道地泰式海鮮乾拌mama麵（辣）",
      "en": "Seafood MAMA Noodles",
      "ko": "정통 태국 해산물 드라이마마 누들(매운맛)",
      "ja": "本格タイシーフードドライママヌードル（辛口）",
      "th": "บะหมี่แห้งมาม่าทะเลไทยแท้ (เผ็ด)",
      "vi": "Mì khô mama hải sản Thái Lan chính hãng (cay)"
    },
    "category": "tomyum",
    "containsPork": false,
    "id": "dish-2005282340194",
    "containsBeef": false,
    "containsSeafood": true,
    "price": 190,
    "description": {
      "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료: 신선한 새우, 오징어 링, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 양파, 채 썬 당근, 오이, 양배추!",
      "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸っぱい前菜 ＜苦手な方はご遠慮ください＞ 材料：新鮮なエビ、イカリング、タラ団子、豚団子、魚の盛り合わせ、玉ねぎ、人参の千切り、キュウリ、キャベツ！",
      "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยร้อนๆ <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: กุ้งสด, ปลาหมึกแหวน, ลูกชิ้นปลาคอด, ลูกชิ้นหมู, ปลาญี่ปุ่น, หัวหอม, แครอทฝอย, แตงกวา และกะหล่ำปลี!",
      "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua cay <Không thích thì không gọi> Thành phần: tôm tươi, mực khoanh, cá tuyết viên, thịt heo viên, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột và bắp cải!"
    },
    "orderIndex": 105,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784480168973-5",
        "name": {
          "zh": "升級套餐(烤蔬菜+泰奶一杯)",
          "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
          "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
          "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
          "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
          "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)"
        },
        "price": 140
      }
    ],
    "recipe": []
  },
  {
    "containsBeef": false,
    "containsSeafood": false,
    "price": 80,
    "id": "dish-1909192003211",
    "containsPork": false,
    "category": "veggies",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 106,
    "description": {
      "zh": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "맛있고 육즙이 풍부해요~ 느타리버섯의 식감~ 새송이버섯의 맛은 닭고기와 비슷해요",
      "ja": "ジューシーで美味しい〜エリンギの食感〜エリンギの味は鶏肉に似ています",
      "th": "อร่อยและชุ่มฉ่ำ ~ เนื้อสัมผัสของเห็ดนางรม ~ รสชาติของเห็ดนางรมหลวงก็เหมือนไก่",
      "vi": "Ngon và ngon ngọt ~ Kết cấu của nấm sò ~ Hương vị của nấm sò vua giống như thịt gà"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "爆汁杏鮑菇",
      "en": "Juicy King Oyster Mushroom Skewer",
      "ko": "터진 새송이버섯",
      "ja": "爆裂キングヒラタケ",
      "th": "เห็ดนางรมราชาระเบิด",
      "vi": "Nấm Sò Vua Nổ"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "orderIndex": 107,
    "description": {
      "zh": "去骨去刺秋刀魚，填入明太子，口感一流!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "뼈도 없고 가시도 없는 꽁치를 멘타이코로 채워 맛이 좋습니다!",
      "ja": "骨と背骨のないさんまに明太子を詰めて食べると美味しいですよ！",
      "th": "ปลาซันไรย์ไม่มีกระดูกและไร้กระดูกสันหลังสอดไส้เมนไทโกะ รสชาติเยี่ยมมาก!",
      "vi": "Cá thu đao không xương và không xương, nhồi mentaiko, có vị rất ngon!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "id": "dish-1909191959076",
    "containsPork": false,
    "category": "seafood",
    "containsSeafood": true,
    "containsBeef": false,
    "price": 320,
    "available": true,
    "name": {
      "zh": "明太子秋刀魚(去刺)2p",
      "en": "Deboned Pacific Saury Stuffed w/ Mentaiko (2pcs)",
      "ko": "멘타이코 꽁치(뼈제거) 2p",
      "ja": "明太子さんま（骨抜き）2p",
      "th": "Mentaiko saury (เอากระดูกออก) 2p",
      "vi": "Cá thu đao Mentaiko (đã bỏ xương) 2p"
    },
    "isNotSpicy": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "炭火慢烤，嚴選肉厚的香菇~烤完香氣十足!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "숯불에 천천히 구워낸 엄선된 버섯과 살이 두꺼워요~구운뒤 향이 가득!",
      "ja": "厳選した肉厚きのこを炭火でじっくり焼き上げました～焼き上がりは香り豊か！",
      "th": "ค่อยๆ ย่างบนไฟถ่าน เห็ดคัดสรรอย่างดี เนื้อหนา ~ ย่างแล้วหอมอวล!",
      "vi": "Nướng từ từ trên lửa than, nấm được lựa chọn cẩn thận với thịt dày ~ đầy mùi thơm sau khi rang!"
    },
    "orderIndex": 108,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "category": "veggies",
    "id": "dish-1909191946205",
    "containsPork": false,
    "price": 80,
    "containsBeef": false,
    "containsSeafood": false,
    "name": {
      "zh": "香菇",
      "en": "Charcoal Grilled Shiitake Mushroom",
      "ko": "표고버섯",
      "ja": "しいたけ",
      "th": "เห็ดหอม",
      "vi": "nấm hương"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 80,
    "containsSeafood": false,
    "containsBeef": false,
    "containsPork": false,
    "category": "veggies",
    "id": "dish-1909191945086",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 109,
    "description": {
      "zh": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "풋고추는 같은 무게의 오렌지와 버드나무보다 비타민C 함량이 높은 채소입니다!",
      "ja": "ピーマンはビタミンCが豊富な野菜で、同じ重量のオレンジや角切りのヤナギよりも多く含まれています。",
      "th": "พริกเขียวเป็นผักที่มีวิตามินซีสูง สูงกว่าส้ม และหลิวหั่นเต๋าในน้ำหนักเท่ากัน!",
      "vi": "Ớt xanh là loại rau có hàm lượng vitamin C cao, cao hơn cả cam và liễu thái hạt lựu ở cùng trọng lượng!"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "青椒",
      "en": "Charcoal Grilled Green Bell Pepper",
      "ko": "피망",
      "ja": "ピーマン",
      "th": "พริกเขียว",
      "vi": "tiêu xanh"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "price": 60,
    "containsBeef": false,
    "containsSeafood": false,
    "id": "dish-1909191943297",
    "category": "skewers",
    "containsPork": true,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 110,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
      "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
      "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
      "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "精選香酥肥腸",
      "en": "Crispy Charcoal Grilled Pork Intestine",
      "ko": "엄선된 크리스피 소시지",
      "ja": "厳選クリスピーソーセージ",
      "th": "ไส้กรอกกรอบคัดพิเศษ",
      "vi": "Xúc Xích Giòn Tuyển Chọn"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "極炙原塊牛肋(澳牛)",
      "en": "Prime Australian Beef Rib Skewer",
      "ko": "구운 쇠고기 갈비(호주산 쇠고기)",
      "ja": "ビーフリブのグリル（オーストラリア産牛肉）",
      "th": "ซี่โครงเนื้อย่าง (เนื้อออสเตรเลีย)",
      "vi": "Sườn bò nướng (bò Úc)"
    },
    "containsBeef": true,
    "containsSeafood": false,
    "price": 70,
    "id": "dish-1909191940395",
    "containsPork": false,
    "category": "skewers",
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "완벽한 비율의 소갈비살은 겉은 그을리고 속은 핑크빛을 띕니다. 한입 먹는 것이 입맛을 돋우는 최고의 즐거움입니다!",
      "ja": "絶妙なバランスの牛カルビは、外は炙り、中はピンク色に焼き上げられています。一口食べると、味覚にとって最高の楽しみが得られます。",
      "th": "ซี่โครงเนื้อที่ได้สัดส่วนกำลังดีจะถูกย่างด้านนอกและด้านในเป็นสีชมพู การได้กัดสักคำถือเป็นความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ!",
      "vi": "Những miếng sườn bò có tỷ lệ hoàn hảo được nướng chín bên ngoài và hồng hào bên trong. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn!"
    },
    "orderIndex": 111,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "肉雞七里香",
      "en": "Marinated Chicken Tail Skewers (5pcs)",
      "ko": "육계 치킨 Qilixiang",
      "ja": "ブロイラーチキン キリシャン",
      "th": "ไก่เนื้อ Qilixiang",
      "vi": "Gà thịt Qilixiang"
    },
    "containsSeafood": false,
    "containsBeef": false,
    "price": 70,
    "containsPork": false,
    "category": "skewers",
    "id": "dish-1909191316572",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 112,
    "description": {
      "zh": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "칠리샹을 곁들인 육계 꼬치 5개~ 반으로 쪼개지지 않아요! 매일 아침시장에서 갓 구매한~ 직접 따서 씻어서 전용 양념장에 재워두세요!",
      "ja": "七里香入りブロイラー串5本～半分には切れません！毎日朝市で仕入れた新鮮〜摘み取って洗って専用マリネに漬け込んで帰ってきます！",
      "th": "ไก่เนื้อห้าเสียบไม้กับ Qilixiang ~ ไม่ผ่าครึ่ง! ซื้อสดใหม่ที่ตลาดเช้าทุกวัน ~ กลับมาถอน ล้าง และหมักด้วยน้ำดองสุดพิเศษ!",
      "vi": "Năm xiên gà thịt với Qilixiang ~ không cắt làm đôi! Mới mua ở chợ buổi sáng hàng ngày ~ quay lại hái, rửa sạch và ướp với nước xốt độc quyền!"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "id": "dish-1909191310334",
    "category": "skewers",
    "containsPork": true,
    "price": 90,
    "containsSeafood": false,
    "containsBeef": false,
    "orderIndex": 113,
    "description": {
      "zh": "獨家泰式烤肉必點，選用台灣本土豬肉~捲入新鮮香菜~炭烤至金黃焦香一口咬下還會噴汁!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "고급스러운 태국식 바비큐를 꼭 맛보세요. 대만 현지 돼지고기를 신선한 고수풀로 말아서 황금빛 갈색이 되고 향긋해질 때까지 숯불에 구워냅니다. 한입 베어물면 육즙이 뿜어져 나옵니다!",
      "ja": "高級タイ風バーベキューはぜひお試しください。台湾産の豚肉を新鮮なコリアンダーで巻き、きつね色で香ばしく焼き上げるまで炭火で焼き上げました。噛むと汁が噴き出します！",
      "th": "บาร์บีคิวไทยสุดพิเศษเป็นสิ่งที่ต้องลอง ใช้หมูท้องถิ่นของไต้หวันคลุกผักชีสดแล้วย่างบนเตาถ่านจนเป็นสีเหลืองทองและมีกลิ่นหอม มันจะพ่นน้ำผลไม้เมื่อคุณกัด!",
      "vi": "Món thịt nướng Thái độc quyền là món bạn nhất định phải thử. Nó sử dụng thịt lợn địa phương của Đài Loan, cuộn trong rau mùi tươi và nướng trên than củi cho đến khi có màu vàng nâu và thơm. Nó sẽ phun ra nước trái cây khi bạn cắn nó!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "香菜豬肉捲",
      "en": "Coriander Pork Roll Skewer",
      "ko": "고수 돼지고기 롤",
      "ja": "コリアンダーポークロール",
      "th": "ม้วนหมูผักชี",
      "vi": "Chả giò ngò"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [

  { id: 'ig-01', name: { zh: '大鮮蝦', en: 'Fresh Prawns', ko: '생새우', ja: '新鮮なえび', th: 'กุ้งแชบ๊วย大' }, stock: 100, minThreshold: 15, unit: 'pcs' },
  { id: 'ig-02', name: { zh: '頂級牛肉串', en: 'USDA Beef', ko: '수제 소고기', ja: '厳選牛肉串', th: 'เนื้อวัวพรีเมียม' }, stock: 100, minThreshold: 20, unit: 'skewers' },
  { id: 'ig-03', name: { zh: '鮮甜高麗菜', en: 'Organic Cabbage', ko: '유기농 양배추', ja: 'キャベツ', th: 'กะหล่ำปลีหวาน' }, stock: 100, minThreshold: 10, unit: 'kg' },
  { id: 'ig-04', name: { zh: '生食干貝/生蠔', en: 'Oysters / Scallops', ko: '석화 굴 및 가리비', ja: '生牡蠣・干貝', th: 'หอยนางรมยักษ์/หอยเชลล์' }, stock: 100, minThreshold: 8, unit: 'pcs' },
  { id: 'ig-05', name: { zh: '冬蔭功泡麵/米粉', en: 'Mama / Rice Noodles', ko: '라면 사리', ja: 'ラーメン・フォー', th: 'บะหมี่มาม่า/ก๋วยเตี๋ยว' }, stock: 120, minThreshold: 25, unit: 'packs' },
  { id: 'ig-06', name: { zh: '頂級椰奶罐', en: 'Rich Coconut Milk', ko: '코코넛 밀크', ja: 'ココナッツミルク缶', th: 'กะทิกระป๋องออร์แกนิก' }, stock: 100, minThreshold: 12, unit: 'cans' },
  { id: 'ig-07', name: { zh: '泰手標紅茶原料', en: 'Thai Red Tea Brew', ko: '홍차 베이스', ja: 'タイ茶葉', th: 'ชาแดงตรามือเกรดส่งออก' }, stock: 100, minThreshold: 20, unit: 'liters' },
  { id: 'ig-08', name: { zh: '爆香豬五花 / 金針菇', en: 'Pork Belly & Enoki', ko: '돼지 삼겹 및 팽이', ja: '豚バラ・えのき', th: 'หมูสามชั้น/เห็ดเข็มทอง' }, stock: 100, minThreshold: 15, unit: 'skewers' },

];


export const INGREDIENT_RECIPE_MAP: { [foodId: string]: { ingredientId: string; amount: number }[] } = {};

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'pm-01',
    title: { zh: 'Google帳戶限定！消費可累積會員點數', en: 'Google Member Exclusive - Earn Loyalty Points', ko: 'Google 계정 전용! 멤버십 포인트 적립', ja: 'Google 会員限定！ポイント貯まる', th: 'สิทธิพิเศษสมาชิก Google สะสมคะแนนได้ทันที' },
    code: 'SABAYGOOGLEPOINTS',
    discountRate: 1.0,
    description: {
      zh: '凡綁定 Google 帳號登入，在沙貝燒烤手機點餐結帳即可累積點數，不限低消。',
      en: 'Log in with Google to earn loyalty points on every purchase made via your mobile device.',
      ko: '구글 연동 회원 가입 후 주문 시 고유 포인트 자동 적립 혜택',
      ja: 'Googleログインでお会計いただくと、お買い上げ金額總額よりその場でポイント還元。',
      th: 'เข้าสู่ระบบผ่าน Google เพื่อรับคะแนนสะสมพิเศษได้ทุกยอดบิล ไม่มีขั้นต่ำ',
    },
    active: true,
  }
];
