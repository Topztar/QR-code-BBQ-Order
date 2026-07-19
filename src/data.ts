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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "Vitamilk豆奶",
      "en": "Vitamilk Soy Milk",
      "ko": "Vitamilk豆奶",
      "ja": "Vitamilk豆奶",
      "th": "Vitamilk豆奶"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "麒麟啤酒",
      "ja": "麒麟啤酒",
      "th": "麒麟啤酒"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "SPY泰國雞尾酒",
      "ja": "SPY泰國雞尾酒",
      "th": "SPY泰國雞尾酒"
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
      "ko": "乳酪組合價",
      "ja": "乳酪組合價",
      "th": "乳酪組合價"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 3,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "桂花乳酪",
      "ja": "桂花乳酪",
      "th": "桂花乳酪"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "板腱牛5oz",
      "ja": "板腱牛5oz",
      "th": "板腱牛5oz"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "香斕乳酪",
      "ja": "香斕乳酪",
      "th": "香斕乳酪"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "鮮奶乳酪",
      "ja": "鮮奶乳酪",
      "th": "鮮奶乳酪"
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
      "ko": "泰式奶茶乳酪",
      "ja": "泰式奶茶乳酪",
      "th": "泰式奶茶乳酪"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "分解茶",
      "en": "Oolong Tea (Decomposing)",
      "ko": "分解茶",
      "ja": "分解茶",
      "th": "分解茶"
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
      "ko": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
      "ja": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
      "th": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充"
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
      "ko": "泰鮮大魷魚(碳烤)",
      "ja": "泰鮮大魷魚(碳烤)",
      "th": "泰鮮大魷魚(碳烤)"
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
      "ko": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
      "ja": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
      "th": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜"
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
      "ko": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
      "ja": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
      "th": "道地泰式大魷魚海鮮乾拌mama麵（辣）"
    },
    "available": true,
    "isNotSpicy": false,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784478515294-528",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
      "ja": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
      "th": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感"
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
      "ko": "雞皮10串",
      "ja": "雞皮10串",
      "th": "雞皮10串"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
    },
    "orderIndex": 13,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "牛5羊5串",
      "en": "Beef & Lamb BBQ Skewers Combo (5 Beef + 5 Lamb)",
      "ko": "牛5羊5串",
      "ja": "牛5羊5串",
      "th": "牛5羊5串"
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
      "ko": "真。小羔羊肉10串",
      "ja": "真。小羔羊肉10串",
      "th": "真。小羔羊肉10串"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 14,
    "description": {
      "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
      "ja": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
      "th": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉"
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
      "ko": "極炙牛肋10串",
      "ja": "極炙牛肋10串",
      "th": "極炙牛肋10串"
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
      "ko": "黃金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
      "ja": "黃金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
      "th": "黃金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受"
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
      "ko": "爆漿泰奶包",
      "ja": "爆漿泰奶包",
      "th": "爆漿泰奶包"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "人氣D餐",
      "ja": "人氣D餐",
      "th": "人氣D餐"
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
      "ko": "奢華C餐",
      "ja": "奢華C餐",
      "th": "奢華C餐"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "泰奶空桶",
      "ja": "泰奶空桶",
      "th": "泰奶空桶"
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
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "娃娃菜2p",
      "ja": "娃娃菜2p",
      "th": "娃娃菜2p"
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
      "ko": "爆汁金針菇豬肉",
      "ja": "爆汁金針菇豬肉",
      "th": "爆汁金針菇豬肉"
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
      "ko": "鮮嫩豬肉片包裹爽脆金針菇，刷醬烤至金黃焦香",
      "ja": "鮮嫩豬肉片包裹爽脆金針菇，刷醬烤至金黃焦香",
      "th": "鮮嫩豬肉片包裹爽脆金針菇，刷醬烤至金黃焦香"
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
      "ko": "客家幣刷卡",
      "ja": "客家幣刷卡",
      "th": "客家幣刷卡"
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
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
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
      "ko": "招牌A餐",
      "ja": "招牌A餐",
      "th": "招牌A餐"
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
      "ko": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
      "ja": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
      "th": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!"
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
      "ko": "雪山",
      "ja": "雪山",
      "th": "雪山"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "金芬黛葡萄酒",
      "ja": "金芬黛葡萄酒",
      "th": "金芬黛葡萄酒"
    },
    "available": true,
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 27,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "紅醬外帶瓶",
      "ja": "紅醬外帶瓶",
      "th": "紅醬外帶瓶"
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
      "ko": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "ja": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "th": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃"
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
      "ko": "綠醬外帶瓶",
      "ja": "綠醬外帶瓶",
      "th": "綠醬外帶瓶"
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
      "ko": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "ja": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
      "th": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "爆汁櫛瓜",
      "en": "Juicy Grilled Zucchini",
      "ko": "爆汁櫛瓜",
      "ja": "爆汁櫛瓜",
      "th": "爆汁櫛瓜"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "泰式東炎豬肉.米線",
      "ja": "泰式東炎豬肉.米線",
      "th": "泰式東炎豬肉.米線"
    },
    "isNotSpicy": false,
    "orderIndex": 31,
    "description": {
      "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "ja": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "th": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784478853337-718",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784478856450-76",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "泰式東炎豬肉.河粉",
      "ja": "泰式東炎豬肉.河粉",
      "th": "泰式東炎豬肉.河粉"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 32,
    "description": {
      "zh": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "ja": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜",
      "th": "台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784478887811-679",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784478890845-28",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "街頭泰奶1L",
      "ja": "街頭泰奶1L",
      "th": "街頭泰奶1L"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 33,
    "description": {
      "zh": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!",
      "en": "Refreshing and cool, a perfect match for BBQ",
      "ko": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!",
      "ja": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!",
      "th": "網紅網帥拍照必備~茶香濃郁的經典泰奶~空桶回店回購再折30元!"
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
      "ko": "泰滿足海陸牛冬蔭功",
      "ja": "泰滿足海陸牛冬蔭功",
      "th": "泰滿足海陸牛冬蔭功"
    },
    "containsSeafood": false,
    "price": 390,
    "category": "tomyum",
    "containsPork": false,
    "id": "dish-2505041753253",
    "description": {
      "zh": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "ja": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "th": "配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔"
    },
    "customAddOns": [
      {
        "id": "addon-1784478928738-313",
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784478931302-574",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784478933543-454",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "ja": "配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔",
      "th": "配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔"
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
      "ko": "海陸豬冬蔭功湯",
      "ja": "海陸豬冬蔭功湯",
      "th": "海陸豬冬蔭功湯"
    },
    "available": true,
    "customAddOns": [
      {
        "id": "addon-1784478951444-682",
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784478953658-987",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784478955921-185",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "蔬菜拼盤",
      "ja": "蔬菜拼盤",
      "th": "蔬菜拼盤"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
    },
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "小羊肩排",
      "en": "Charcoal Grilled Lamb Shoulder Chop",
      "ko": "小羊肩排",
      "ja": "小羊肩排",
      "th": "小羊肩排"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "泰式生蠔11p",
      "en": "Thai Style Fresh Oysters (11pcs)",
      "ko": "泰式生蠔11p",
      "ja": "泰式生蠔11p",
      "th": "泰式生蠔11p"
    },
    "available": true,
    "isNotSpicy": false,
    "orderIndex": 38,
    "description": {
      "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
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
      "ko": "客家幣",
      "ja": "客家幣",
      "th": "客家幣"
    },
    "available": true,
    "isNotSpicy": true,
    "orderIndex": 39,
    "description": {
      "zh": "超值優惠組合，物超所值，限時享用",
      "en": "Great value combo package, high cost-performance deal for a limited time.",
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
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
      "ko": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
      "ja": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
      "th": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了"
    },
    "orderIndex": 40,
    "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "多肉B餐",
      "en": "Meat Lover's Set B Combo",
      "ko": "多肉B餐",
      "ja": "多肉B餐",
      "th": "多肉B餐"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "大摩12年",
      "ja": "大摩12年",
      "th": "大摩12年"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "蘇格登13年",
      "ja": "蘇格登13年",
      "th": "蘇格登13年"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "蘇格登12年",
      "ja": "蘇格登12年",
      "th": "蘇格登12年"
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
      "ko": "有機玉米筍",
      "ja": "有機玉米筍",
      "th": "有機玉米筍"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "<非基改>不油不膩~香甜可口~營養價高",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "<非基改>不油不膩~香甜可口~營養價高",
      "ja": "<非基改>不油不膩~香甜可口~營養價高",
      "th": "<非基改>不油不膩~香甜可口~營養價高"
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
      "ko": "嚴選澎湖海味~吃得到塊狀花枝",
      "ja": "嚴選澎湖海味~吃得到塊狀花枝",
      "th": "嚴選澎湖海味~吃得到塊狀花枝"
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
      "ko": "澎湖花枝丸",
      "ja": "澎湖花枝丸",
      "th": "澎湖花枝丸"
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
      "ko": "爽脆高麗菜",
      "ja": "爽脆高麗菜",
      "th": "爽脆高麗菜"
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
      "ko": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?",
      "ja": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?",
      "th": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?"
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
      "ko": "炭燒奶茶(壺)",
      "ja": "炭燒奶茶(壺)",
      "th": "炭燒奶茶(壺)"
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
      "ko": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
      "ja": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
      "th": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試"
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
      "ko": "泰辣醬",
      "ja": "泰辣醬",
      "th": "泰辣醬"
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
      "ko": "精心調製，口感層次豐富，為您的餐點添彩",
      "ja": "精心調製，口感層次豐富，為您的餐點添彩",
      "th": "精心調製，口感層次豐富，為您的餐點添彩"
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
      "ko": "下酒必點!老饕最愛!",
      "ja": "下酒必點!老饕最愛!",
      "th": "下酒必點!老饕最愛!"
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
      "ko": "手撕大魷魚干",
      "ja": "手撕大魷魚干",
      "th": "手撕大魷魚干"
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
      "ko": "炙燒生食級干貝3P",
      "ja": "炙燒生食級干貝3P",
      "th": "炙燒生食級干貝3P"
    },
    "isNotSpicy": true,
    "orderIndex": 50,
    "description": {
      "zh": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
      "ja": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
      "th": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味"
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
      "ko": "嗜辣者必嚐!下酒必備 已去殼",
      "ja": "嗜辣者必嚐!下酒必備 已去殼",
      "th": "嗜辣者必嚐!下酒必備 已去殼"
    },
    "orderIndex": 51,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "泰辣扇貝9P",
      "en": "Spicy Thai Scallops (9pcs)",
      "ko": "泰辣扇貝9P",
      "ja": "泰辣扇貝9P",
      "th": "泰辣扇貝9P"
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
      "ko": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
      "ja": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
      "th": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "椰碳烤大草蝦6P",
      "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)",
      "ko": "椰碳烤大草蝦6P",
      "ja": "椰碳烤大草蝦6P",
      "th": "椰碳烤大草蝦6P"
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
      "ko": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "ja": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "th": "泰式風味奶酒!妹酒 微醺最佳選擇"
    },
    "isNotSpicy": true,
    "name": {
      "zh": "泰醇奶酒5.6%",
      "en": "Thai Cream Liqueur 5.6%",
      "ko": "泰醇奶酒5.6%",
      "ja": "泰醇奶酒5.6%",
      "th": "泰醇奶酒5.6%"
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
      "ko": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "ja": "泰式風味奶酒!妹酒 微醺最佳選擇",
      "th": "泰式風味奶酒!妹酒 微醺最佳選擇"
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
      "ko": "泰醇奶酒1.4%",
      "ja": "泰醇奶酒1.4%",
      "th": "泰醇奶酒1.4%"
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
      "ko": "果汁氣泡水",
      "ja": "果汁氣泡水",
      "th": "果汁氣泡水"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "海尼根",
      "ja": "海尼根",
      "th": "海尼根"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
    "orderIndex": 56,
    "description": {
      "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "en": "Refreshing and cool, a perfect match for delicious BBQ.",
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
      "ja": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
      "th": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "邪惡熱狗豬血糕",
      "en": "Hot Dog & Pork Blood Cake Skewer",
      "ko": "邪惡熱狗豬血糕",
      "ja": "邪惡熱狗豬血糕",
      "th": "邪惡熱狗豬血糕"
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
      "ko": "可樂娜",
      "ja": "可樂娜",
      "th": "可樂娜"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
    },
    "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "name": {
      "zh": "tip",
      "en": "Staff Tip / Service Gratitude",
      "ko": "tip",
      "ja": "tip",
      "th": "tip"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "白鶴清酒",
      "en": "Hakutsuru Japanese Sake",
      "ko": "白鶴清酒",
      "ja": "白鶴清酒",
      "th": "白鶴清酒"
    },
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479411862-296",
        "name": "加熱",
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "orderIndex": 61,
    "image": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "愛之味麥茶",
      "en": "AGV Barley Tea",
      "ko": "愛之味麥茶",
      "ja": "愛之味麥茶",
      "th": "愛之味麥茶"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "百威",
      "ja": "百威",
      "th": "百威"
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
      "ko": " 5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
      "ja": " 5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
      "th": " 5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "牛小排冬蔭功湯",
      "en": "Charcoal Short Rib Beef Tom Yum Soup",
      "ko": "牛小排冬蔭功湯",
      "ja": "牛小排冬蔭功湯",
      "th": "牛小排冬蔭功湯"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479462255-754",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479465274-753",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "泰式牛小排米線",
      "ja": "泰式牛小排米線",
      "th": "泰式牛小排米線"
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
      "ko": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "ja": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "th": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃"
    },
    "orderIndex": 64,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479484092-785",
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479486352-323",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479488427-739",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "ja": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
      "th": " 5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃"
    },
    "orderIndex": 65,
    "isNotSpicy": false,
    "name": {
      "zh": "泰式牛小排河粉",
      "en": "Thai Grilled Short Rib Beef Pho Noodle",
      "ko": "泰式牛小排河粉",
      "ja": "泰式牛小排河粉",
      "th": "泰式牛小排河粉"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479520251-308",
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479522216-624",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479526311-934",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
      "ja": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
      "th": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤"
    },
    "orderIndex": 66,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式生蠔3p",
      "en": "Thai Style Fresh Oysters (3pcs Combo)",
      "ko": "泰式生蠔3p",
      "ja": "泰式生蠔3p",
      "th": "泰式生蠔3p"
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
      "ko": "冰水(大)",
      "ja": "冰水(大)",
      "th": "冰水(大)"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "開瓶費1支",
      "ja": "開瓶費1支",
      "th": "開瓶費1支"
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
      "ko": "泰北酸肉冬粉腸",
      "ja": "泰北酸肉冬粉腸",
      "th": "泰北酸肉冬粉腸"
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
      "ko": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
      "ja": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
      "th": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知"
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
      "ko": "超值優惠組合，物超所值，限時享用",
      "ja": "超值優惠組合，物超所值，限時享用",
      "th": "超值優惠組合，物超所值，限時享用"
    },
    "isNotSpicy": true,
    "available": true,
    "name": {
      "zh": "好友折扣",
      "en": "Friend Discount Coupon",
      "ko": "好友折扣",
      "ja": "好友折扣",
      "th": "好友折扣"
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
      "ko": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
      "ja": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
      "th": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2."
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
      "ko": "小羔羊肋",
      "ja": "小羔羊肋",
      "th": "小羔羊肋"
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
      "ko": "果肉椰子水",
      "ja": "果肉椰子水",
      "th": "果肉椰子水"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  },
  {
    "name": {
      "zh": "泰式生蠔1P",
      "en": "Thai Style Fresh Oyster (1pc)",
      "ko": "泰式生蠔1P",
      "ja": "泰式生蠔1P",
      "th": "泰式生蠔1P"
    },
    "available": true,
    "isNotSpicy": false,
    "description": {
      "zh": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "ja": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
      "th": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "勝獅",
      "ja": "勝獅",
      "th": "勝獅"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
    },
    "orderIndex": 75,
    "isNotSpicy": true,
    "name": {
      "zh": "泰象",
      "en": "Chang Beer",
      "ko": "泰象",
      "ja": "泰象",
      "th": "泰象"
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
      "ko": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
      "ja": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
      "th": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "秋葵(季節限定)",
      "en": "Charcoal Grilled Okra (Seasonal)",
      "ko": "秋葵(季節限定)",
      "ja": "秋葵(季節限定)",
      "th": "秋葵(季節限定)"
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
      "ko": "泰式海鮮米線",
      "ja": "泰式海鮮米線",
      "th": "泰式海鮮米線"
    },
    "isNotSpicy": false,
    "image": "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "ja": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "th": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479723321-863",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479725596-570",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "Choice牛小排-5oz",
      "ja": "Choice牛小排-5oz",
      "th": "Choice牛小排-5oz"
    },
    "isNotSpicy": true,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "description": {
      "zh": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
      "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
      "ko": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
      "ja": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
      "th": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479750303-903",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479752305-972",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘",
      "ja": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘",
      "th": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘"
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
      "ko": "特大土雞七里香",
      "ja": "特大土雞七里香",
      "th": "特大土雞七里香"
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
      "ko": "精心調製，口感層次豐富，為您的餐點添彩",
      "ja": "精心調製，口感層次豐富，為您的餐點添彩",
      "th": "精心調製，口感層次豐富，為您的餐點添彩"
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
      "ko": "辣椒粉",
      "ja": "辣椒粉",
      "th": "辣椒粉"
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
      "ko": "泰式海鮮河粉",
      "ja": "泰式海鮮河粉",
      "th": "泰式海鮮河粉"
    },
    "isNotSpicy": false,
    "description": {
      "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "en": "Authentic Thai-style soup noodles with rich, warming broth",
      "ko": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "ja": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
      "th": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479806981-555",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479809050-307",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "外酥內嫩的口感，店內人氣商品!",
      "ja": "外酥內嫩的口感，店內人氣商品!",
      "th": "外酥內嫩的口感，店內人氣商品!"
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
      "ko": "泰酥豆皮",
      "ja": "泰酥豆皮",
      "th": "泰酥豆皮"
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
      "ko": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
      "ja": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
      "th": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流"
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
      "ko": "碳烤手工月亮蝦餅",
      "ja": "碳烤手工月亮蝦餅",
      "th": "碳烤手工月亮蝦餅"
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
      "ko": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
      "ja": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
      "th": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成"
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
      "ko": "奶香火腿玉米濃湯",
      "ja": "奶香火腿玉米濃湯",
      "th": "奶香火腿玉米濃湯"
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
      "ko": "道地泰式風味湯，濃郁湯底暖心暖胃",
      "ja": "道地泰式風味湯，濃郁湯底暖心暖胃",
      "th": "道地泰式風味湯，濃郁湯底暖心暖胃"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "海鮮冬蔭功湯",
      "en": "Traditional Seafood Tom Yum Soup",
      "ko": "海鮮冬蔭功湯",
      "ja": "海鮮冬蔭功湯",
      "th": "海鮮冬蔭功湯"
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
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479890262-993",
        "name": "加米線",
        "price": 20
      },
      {
        "id": "addon-1784479892347-500",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "越南鮮牛肉河粉",
      "ja": "越南鮮牛肉河粉",
      "th": "越南鮮牛肉河粉"
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
      "ko": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
      "ja": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
      "th": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。"
    },
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784479915298-709",
        "name": "加河粉",
        "price": 20
      },
      {
        "id": "addon-1784479917660-34",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "金牌",
      "ja": "金牌",
      "th": "金牌"
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
      "ko": "金樽",
      "ja": "金樽",
      "th": "金樽"
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
      "ko": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "ja": "沁涼消暑，口感清爽，搭配燒烤絕配",
      "th": "沁涼消暑，口感清爽，搭配燒烤絕配"
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
      "ko": "泰式奶茶400ml",
      "ja": "泰式奶茶400ml",
      "th": "泰式奶茶400ml"
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
      "ko": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
      "ja": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
      "th": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!"
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
      "ko": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
      "ja": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
      "th": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "特製辣椒醬(外帶)",
      "en": "House Special Chili Sauce (Takeout Jar)",
      "ko": "特製辣椒醬(外帶)",
      "ja": "特製辣椒醬(外帶)",
      "th": "特製辣椒醬(外帶)"
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
      "ko": "精心調製，口感層次豐富，為您的餐點添彩",
      "ja": "精心調製，口感層次豐富，為您的餐點添彩",
      "th": "精心調製，口感層次豐富，為您的餐點添彩"
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
      "ko": "泰式綠醬",
      "ja": "泰式綠醬",
      "th": "泰式綠醬"
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
      "ko": "精心調製，口感層次豐富，為您的餐點添彩",
      "ja": "精心調製，口感層次豐富，為您的餐點添彩",
      "th": "精心調製，口感層次豐富，為您的餐點添彩"
    },
    "orderIndex": 95,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "泰式紅醬",
      "en": "Thai BBQ Red Chili Sauce",
      "ko": "泰式紅醬",
      "ja": "泰式紅醬",
      "th": "泰式紅醬"
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
      "ko": "又稱作敏豆，口感清甜、富含營養且低熱量",
      "ja": "又稱作敏豆，口感清甜、富含營養且低熱量",
      "th": "又稱作敏豆，口感清甜、富含營養且低熱量"
    },
    "orderIndex": 96,
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "四季豆",
      "en": "Charcoal Grilled Green Beans",
      "ko": "四季豆",
      "ja": "四季豆",
      "th": "四季豆"
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
      "ko": "新竹人氣丸子~大人小孩都愛",
      "ja": "新竹人氣丸子~大人小孩都愛",
      "th": "新竹人氣丸子~大人小孩都愛"
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
      "ko": "新竹貢丸",
      "ja": "新竹貢丸",
      "th": "新竹貢丸"
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
      "ko": "澎澎甜不辣",
      "ja": "澎澎甜不辣",
      "th": "澎澎甜不辣"
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
      "ko": "烤甜不辣，口感Q彈紮實!",
      "ja": "烤甜不辣，口感Q彈紮實!",
      "th": "烤甜不辣，口感Q彈紮實!"
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
      "ko": "鯖甘魚下巴",
      "ja": "鯖甘魚下巴",
      "th": "鯖甘魚下巴"
    },
    "isNotSpicy": true,
    "description": {
      "zh": "炭火慢烤，特大號，每一口都是極致美味!",
      "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
      "ko": "炭火慢烤，特大號，每一口都是極致美味!",
      "ja": "炭火慢烤，特大號，每一口都是極致美味!",
      "th": "炭火慢烤，特大號，每一口都是極致美味!"
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
      "ko": "招牌泰式烤雞翅(4入)",
      "ja": "招牌泰式烤雞翅(4入)",
      "th": "招牌泰式烤雞翅(4入)"
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
      "ko": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
      "ja": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
      "th": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料"
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
      "ko": "泰式手工牛肉",
      "ja": "泰式手工牛肉",
      "th": "泰式手工牛肉"
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
      "ko": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
      "ja": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
      "th": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!"
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
      "ko": "噴水香腸",
      "ja": "噴水香腸",
      "th": "噴水香腸"
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
      "ko": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
      "ja": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
      "th": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表"
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
      "ko": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
      "ja": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
      "th": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!"
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
      "ko": "啃的雞皮",
      "ja": "啃的雞皮",
      "th": "啃的雞皮"
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
      "ko": "每日早市新鮮採買<去骨雞腿使用台灣放山雞><不添加嫩肉精>",
      "ja": "每日早市新鮮採買<去骨雞腿使用台灣放山雞><不添加嫩肉精>",
      "th": "每日早市新鮮採買<去骨雞腿使用台灣放山雞><不添加嫩肉精>"
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
      "th": "泰式去骨烤雞腿"
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
      "ko": "道地泰式海鮮乾拌mama麵（辣）",
      "ja": "道地泰式海鮮乾拌mama麵（辣）",
      "th": "道地泰式海鮮乾拌mama麵（辣）"
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
      "ko": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
      "ja": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
      "th": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!"
    },
    "orderIndex": 105,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
    "hasNoodlesOption": false,
    "customAddOns": [
      {
        "id": "addon-1784480168973-5",
        "name": "升級套餐(烤蔬菜+泰奶一杯)",
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
      "ko": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
      "ja": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
      "th": "美味多汁~揪c的口感~杏鮑菇口感似雞肉"
    },
    "isNotSpicy": false,
    "available": true,
    "name": {
      "zh": "爆汁杏鮑菇",
      "en": "Juicy King Oyster Mushroom Skewer",
      "ko": "爆汁杏鮑菇",
      "ja": "爆汁杏鮑菇",
      "th": "爆汁杏鮑菇"
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
      "ko": "去骨去刺秋刀魚，填入明太子，口感一流!",
      "ja": "去骨去刺秋刀魚，填入明太子，口感一流!",
      "th": "去骨去刺秋刀魚，填入明太子，口感一流!"
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
      "ko": "明太子秋刀魚(去刺)2p",
      "ja": "明太子秋刀魚(去刺)2p",
      "th": "明太子秋刀魚(去刺)2p"
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
      "ko": "炭火慢烤，嚴選肉厚的香菇~烤完香氣十足!",
      "ja": "炭火慢烤，嚴選肉厚的香菇~烤完香氣十足!",
      "th": "炭火慢烤，嚴選肉厚的香菇~烤完香氣十足!"
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
      "ko": "香菇",
      "ja": "香菇",
      "th": "香菇"
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
      "ko": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
      "ja": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
      "th": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "青椒",
      "en": "Charcoal Grilled Green Bell Pepper",
      "ko": "青椒",
      "ja": "青椒",
      "th": "青椒"
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
      "ko": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "ja": "炭火慢烤，香氣四溢，每一口都是極致美味",
      "th": "炭火慢烤，香氣四溢，每一口都是極致美味"
    },
    "isNotSpicy": false,
    "name": {
      "zh": "精選香酥肥腸",
      "en": "Crispy Charcoal Grilled Pork Intestine",
      "ko": "精選香酥肥腸",
      "ja": "精選香酥肥腸",
      "th": "精選香酥肥腸"
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
      "ko": "極炙原塊牛肋(澳牛)",
      "ja": "極炙原塊牛肋(澳牛)",
      "th": "極炙原塊牛肋(澳牛)"
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
      "ko": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
      "ja": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
      "th": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!"
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
      "ko": "肉雞七里香",
      "ja": "肉雞七里香",
      "th": "肉雞七里香"
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
      "ko": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
      "ja": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
      "th": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!"
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
      "ko": "獨家泰式烤肉必點，選用台灣本土豬肉~捲入新鮮香菜~炭烤至金黃焦香一口咬下還會噴汁!",
      "ja": "獨家泰式烤肉必點，選用台灣本土豬肉~捲入新鮮香菜~炭烤至金黃焦香一口咬下還會噴汁!",
      "th": "獨家泰式烤肉必點，選用台灣本土豬肉~捲入新鮮香菜~炭烤至金黃焦香一口咬下還會噴汁!"
    },
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
    "isNotSpicy": false,
    "name": {
      "zh": "香菜豬肉捲",
      "en": "Coriander Pork Roll Skewer",
      "ko": "香菜豬肉捲",
      "ja": "香菜豬肉捲",
      "th": "香菜豬肉捲"
    },
    "available": true,
    "hasNoodlesOption": false,
    "customAddOns": [],
    "recipe": []
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    "minThreshold": 15,
    "name": {
      "en": "Fresh Prawns",
      "ja": "新鮮なえび",
      "zh": "大鮮蝦",
      "ko": "생새우",
      "th": "กุ้งแชบ๊วย大"
    },
    "unit": "pcs",
    "id": "ig-01",
    "stock": 100
  },
  {
    "name": {
      "ko": "수제 소고기",
      "ja": "厳選牛肉串",
      "zh": "頂級牛肉串",
      "th": "เนื้อวัวพรีเมียม",
      "en": "USDA Beef"
    },
    "minThreshold": 20,
    "stock": 100,
    "id": "ig-02",
    "unit": "skewers"
  },
  {
    "stock": 100,
    "id": "ig-03",
    "unit": "kg",
    "minThreshold": 10,
    "name": {
      "th": "กะหล่ำปลีหวาน",
      "ja": "キャベツ",
      "zh": "鮮甜高麗菜",
      "ko": "유기농 양배추",
      "en": "Organic Cabbage"
    }
  },
  {
    "id": "ig-04",
    "unit": "pcs",
    "stock": 100,
    "name": {
      "th": "หอยนางรมยักษ์/หอยเชลล์",
      "ko": "석화 굴 및 가리비",
      "ja": "生牡蠣・干貝",
      "zh": "生食干貝/生蠔",
      "en": "Oysters / Scallops"
    },
    "minThreshold": 8
  },
  {
    "id": "ig-05",
    "unit": "packs",
    "stock": 120,
    "name": {
      "en": "Mama / Rice Noodles",
      "ko": "라면 사리",
      "zh": "冬蔭功泡麵/米粉",
      "ja": "ラーメン・フォー",
      "th": "บะหมี่มาม่า/ก๋วยเตี๋ยว"
    },
    "minThreshold": 25
  },
  {
    "id": "ig-06",
    "unit": "cans",
    "stock": 100,
    "name": {
      "en": "Rich Coconut Milk",
      "ja": "ココナッツミルク缶",
      "zh": "頂級椰奶罐",
      "ko": "코코넛 밀크",
      "th": "กะทิกระป๋องออร์แกนิก"
    },
    "minThreshold": 12
  },
  {
    "stock": 100,
    "id": "ig-07",
    "unit": "liters",
    "minThreshold": 20,
    "name": {
      "en": "Thai Red Tea Brew",
      "zh": "泰手標紅茶原料",
      "ja": "タイ茶葉",
      "ko": "홍차 베이스",
      "th": "ชาแดงตรามือเกรดส่งออก"
    }
  },
  {
    "name": {
      "zh": "爆香豬五花 / 金針菇",
      "ja": "豚バラ・えのき",
      "ko": "돼지 삼겹 및 팽이",
      "th": "หมูสามชั้น/เห็ดเข็มทอง",
      "en": "Pork Belly & Enoki"
    },
    "minThreshold": 15,
    "stock": 100,
    "unit": "skewers",
    "id": "ig-08"
  }
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
