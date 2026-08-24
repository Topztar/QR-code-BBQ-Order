const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../public/data.json');
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

const newTranslations = {
  "orderSentSuccessTitle": {
    "zh": "🎉 訂單已成功送出！",
    "en": "🎉 Order Submitted Successfully!",
    "th": "🎉 ส่งออเดอร์เรียบร้อยแล้ว!",
    "ja": "🎉 注文が正常に送信されました！",
    "ko": "🎉 주문이 성공적으로 전송되었습니다!",
    "vi": "🎉 Đơn hàng đã gửi thành công!",
    "ru": "🎉 Заказ успешно отправлен!",
    "es": "🎉 ¡Pedido enviado con éxito!"
  },
  "combo": {
    "zh": "精選套餐",
    "en": "Combo Set",
    "th": "ชุดเซ็ตสุดคุ้ม",
    "ja": "おすすめセット",
    "ko": "추천 세트",
    "vi": "Combo đặc biệt",
    "ru": "Комбо-набор",
    "es": "Combo Especial"
  },
  "approxTime": {
    "zh": "約",
    "en": "Approx.",
    "th": "ประมาณ",
    "ja": "約",
    "ko": "약",
    "vi": "Khoảng",
    "ru": "Около",
    "es": "Aprox."
  },
  "spiciness": {
    "zh": "辣度",
    "en": "Spiciness",
    "th": "ระดับความเผ็ด",
    "ja": "辛さ",
    "ko": "매운맛",
    "vi": "Độ cay",
    "ru": "Острота",
    "es": "Picante"
  },
  "soupBase": {
    "zh": "湯底選擇",
    "en": "Soup Base",
    "th": "น้ำซุป",
    "ja": "スープベース",
    "ko": "육수 선택",
    "vi": "Nước dùng",
    "ru": "Основа для супа",
    "es": "Base de Sopa"
  },
  "noodleType": {
    "zh": "麵體選擇",
    "en": "Noodle Type",
    "th": "ประเภทเส้น",
    "ja": "麺の種類",
    "ko": "면 종류",
    "vi": "Loại mì",
    "ru": "Тип лапши",
    "es": "Tipo de Fideo"
  },
  "notes": {
    "zh": "備註密錄",
    "en": "Notes",
    "th": "หมายเหตุ",
    "ja": "特記事項",
    "ko": "메모",
    "vi": "Ghi chú",
    "ru": "Примечания",
    "es": "Notas"
  },
  "spicyPrefix": {
    "zh": "辣度",
    "en": "Spiciness: ",
    "th": "ความเผ็ด: ",
    "ja": "辛さ: ",
    "ko": "매운맛: ",
    "vi": "Độ cay: ",
    "ru": "Острота: ",
    "es": "Picante: "
  },
  "noodlePrefix": {
    "zh": "麵體",
    "en": "Noodles: ",
    "th": "เส้น: ",
    "ja": "麺: ",
    "ko": "면: ",
    "vi": "Mì: ",
    "ru": "Лапша: ",
    "es": "Fideos: "
  },
  "noNoodle": {
    "zh": "不加麵",
    "en": "No Noodles",
    "th": "ไม่ใส่เส้น",
    "ja": "麺なし",
    "ko": "면 없음",
    "vi": "Không mì",
    "ru": "Без лапши",
    "es": "Sin fideos"
  },
  "coconutMilkAdd": {
    "zh": "加椰奶",
    "en": "Add Coconut Milk",
    "th": "เพิ่มกะทิ",
    "ja": "ココナッツミルク追加",
    "ko": "코코넛 밀크 추가",
    "vi": "Thêm nước cốt dừa",
    "ru": "Добавить кокосовое молоко",
    "es": "Añadir leche de coco"
  },
  "notesLabel": {
    "zh": "客製備註",
    "en": "Custom Notes",
    "th": "หมายเหตุพิเศษ",
    "ja": "特記事項",
    "ko": "맞춤 메모",
    "vi": "Ghi chú tùy chỉnh",
    "ru": "Особые пожелания",
    "es": "Notas especiales"
  },
  "soupBaseLabel": {
    "zh": "湯底配方",
    "en": "Soup Base",
    "th": "ประเภทน้ำซุป",
    "ja": "スープの種類",
    "ko": "육수 베이스",
    "vi": "Nước súp",
    "ru": "Основа супа",
    "es": "Base de caldo"
  },
  "addOnsLabel": {
    "zh": "加選配料",
    "en": "Add-Ons",
    "th": "ท็อปปิ้งเพิ่มเติม",
    "ja": "トッピング",
    "ko": "추가 토핑",
    "vi": "Món thêm",
    "ru": "Добавки",
    "es": "Complementos"
  },
  "tableLabel": {
    "zh": "桌號",
    "en": "Table",
    "th": "โต๊ะ",
    "ja": "テーブル",
    "ko": "테이블",
    "vi": "Bàn",
    "ru": "Стол",
    "es": "Mesa"
  },
  "closingSoonRushAlert": {
    "zh": "⚠️ 即將打烊，請加速出餐！",
    "en": "⚠️ Closing Soon, Please Rush!",
    "th": "⚠️ ใกล้เวลาปิดร้าน เร่งทำอาหารด่วน!",
    "ja": "⚠️ 間もなく閉店、お急ぎください！",
    "ko": "⚠️ 마감 임박, 신속히 조리해 주세요!",
    "vi": "⚠️ Sắp đóng cửa, vui lòng ra món nhanh!",
    "ru": "⚠️ Скоро закрытие, ускорьте подачу!",
    "es": "⚠️ ¡Cierre próximo, por favor acelerar!"
  },
  "quickViewBtn": {
    "zh": "快速檢視",
    "en": "Quick View",
    "th": "ดูด่วน",
    "ja": "クイック表示",
    "ko": "빠른 보기",
    "vi": "Xem nhanh",
    "ru": "Быстрый просмотр",
    "es": "Vista rápida"
  },
  "printPreviewBtn": {
    "zh": "列印預覽",
    "en": "Print Preview",
    "th": "ดูตัวอย่างพิมพ์",
    "ja": "印刷プレビュー",
    "ko": "인쇄 미리보기",
    "vi": "Xem trước in",
    "ru": "Предпросмотр печати",
    "es": "Vista previa de impresión"
  },
  "pendingWaitState": {
    "zh": "等待接單",
    "en": "Pending",
    "th": "รอรับออเดอร์",
    "ja": "受付待ち",
    "ko": "접수 대기",
    "vi": "Chờ xác nhận",
    "ru": "Ожидание",
    "es": "Pendiente"
  },
  "prepState": {
    "zh": "製作出餐中",
    "en": "Preparing",
    "th": "กำลังเตรียมอาหาร",
    "ja": "調理中",
    "ko": "조리 중",
    "vi": "Đang chuẩn bị",
    "ru": "Готовится",
    "es": "En preparación"
  },
  "clickToZoom": {
    "zh": "🔍 點擊放大縮放",
    "en": "🔍 Click to Zoom",
    "th": "🔍 คลิกเพื่อขยายภาพ",
    "ja": "🔍 クリックして拡大",
    "ko": "🔍 클릭하여 확대",
    "vi": "🔍 Nhấn để phóng to",
    "ru": "🔍 Нажмите для увеличения",
    "es": "🔍 Clic para ampliar"
  },
  "noImageAssigned": {
    "zh": "無餐點照片",
    "en": "No Image Available",
    "th": "ไม่มีรูปภาพ",
    "ja": "画像なし",
    "ko": "사진 없음",
    "vi": "Chưa có ảnh",
    "ru": "Нет изображения",
    "es": "Sin imagen"
  },
  "comboAccumulating": {
    "zh": "活動累計中",
    "en": "Promo in progress",
    "th": "กำลังสะสมโปรโมชั่น",
    "ja": "キャンペーン対象集計中",
    "ko": "프로모션 누적 중",
    "vi": "Đang tích lũy khuyến mãi",
    "ru": "Промо-набор накапливается",
    "es": "Promoción en progreso"
  },
  "continueOrdering": {
    "zh": "繼續點餐",
    "en": "Continue Ordering",
    "th": "เลือกเมนูต่อ",
    "ja": "注文を続ける",
    "ko": "계속 주문",
    "vi": "Tiếp tục đặt món",
    "ru": "Продолжить заказ",
    "es": "Seguir pidiendo"
  },
  "confirmAndPlaceOrder": {
    "zh": "確認桌號並下單 (請至櫃台結帳)",
    "en": "Confirm Table & Order (Pay at Counter)",
    "th": "ยืนยันโต๊ะและสั่งอาหาร (ชำระเงินที่เคาน์เตอร์)",
    "ja": "テーブルを確認して注文確定 (レジで決済)",
    "ko": "테이블 확인 및 주문 완료 (카운터에서 결제)",
    "vi": "Xác nhận bàn & đặt món (Thanh toán tại quầy)",
    "ru": "Подтвердить стол и оформить (Оплата на кассе)",
    "es": "Confirmar mesa y pedir (Pagar en caja)"
  },
  "itemsUnit": {
    "zh": "件",
    "en": "item(s)",
    "th": "ชิ้น",
    "ja": "品",
    "ko": "개",
    "vi": "món",
    "ru": "шт.",
    "es": "ud(s)"
  },
  "discountUnit": {
    "zh": "元",
    "en": "NT$",
    "th": "บาท",
    "ja": "円",
    "ko": "원",
    "vi": "đ",
    "ru": "NT$",
    "es": "NT$"
  },
  "setMatched": {
    "zh": "符合 {count} 組",
    "en": "{count} Set(s) Matched",
    "th": "ตรงตามเงื่อนไข {count} ชุด",
    "ja": "{count} セット適用",
    "ko": "{count} 세트 적용",
    "vi": "Đạt {count} combo",
    "ru": "Применено наборов: {count}",
    "es": "{count} conjunto(s) aplicados"
  },
  "instantControls": {
    "zh": "🛡️ 店家管理控制",
    "en": "🛡️ Store Controls",
    "th": "🛡️ การควบคุมของร้านค้า",
    "ja": "🛡️ 店舗管理者設定",
    "ko": "🛡️ 매장 관리 제어",
    "vi": "🛡️ Quản lý cửa hàng",
    "ru": "🛡️ Управление магазином",
    "es": "🛡️ Control de Tienda"
  },
  "setSoldOut": {
    "zh": "✕ 設為沽清",
    "en": "✕ Mark Sold Out",
    "th": "✕ ตั้งเป็นหมด",
    "ja": "✕ 売り切れにする",
    "ko": "✕ 품절 설정",
    "vi": "✕ Đánh dấu hết hàng",
    "ru": "✕ Отметить как распродано",
    "es": "✕ Marcar Agotado"
  },
  "setAvailable": {
    "zh": "● 開放供應",
    "en": "● Make Available",
    "th": "● เปิดให้บริการ",
    "ja": "● 販売再開",
    "ko": "● 판매 재개",
    "vi": "● Mở bán lại",
    "ru": "● Открыть продажу",
    "es": "● Disponible"
  },
  "statusSupply": {
    "zh": "🟢 供應中",
    "en": "🟢 Available",
    "th": "🟢 มีจำหน่าย",
    "ja": "🟢 提供中",
    "ko": "🟢 공급 중",
    "vi": "🟢 Đang phục vụ",
    "ru": "🟢 В наличии",
    "es": "🟢 Disponible"
  },
  "statusSoldOut": {
    "zh": "🔴 沽清中",
    "en": "🔴 Sold Out",
    "th": "🔴 สินค้าหมด",
    "ja": "🔴 完売",
    "ko": "🔴 품절",
    "vi": "🔴 Hết hàng",
    "ru": "🔴 Распродано",
    "es": "🔴 Agotado"
  },
  "ingredientStockAdjust": {
    "zh": "📦 關聯原料庫存即時微調",
    "en": "📦 Live Ingredient Stock Adjustment",
    "th": "📦 ปรับสต็อกวัตถุดิบแบบเรียลไทม์",
    "ja": "📦 関連原材料在庫の即時調整",
    "ko": "📦 원재료 재고 실시간 조정",
    "vi": "📦 Điều chỉnh tồn kho nguyên liệu",
    "ru": "📦 Корректировка остатков ингредиентов",
    "es": "📦 Ajuste de stock de ingredientes"
  },
  "reserve": {
    "zh": "預約訂位",
    "en": "Table Reservation",
    "th": "จองโต๊ะล่วงหน้า",
    "ja": "席の予約",
    "ko": "테이블 예약",
    "vi": "Đặt bàn trước",
    "ru": "Бронирование стола",
    "es": "Reservar Mesa"
  },
  "mode": {
    "zh": "模式",
    "en": "Mode",
    "th": "โหมด",
    "ja": "モード",
    "ko": "모드",
    "vi": "Chế độ",
    "ru": "Режим",
    "es": "Modo"
  },
  "action": {
    "zh": "操作",
    "en": "Action",
    "th": "การดำเนินการ",
    "ja": "操作",
    "ko": "작업",
    "vi": "Thao tác",
    "ru": "Действие",
    "es": "Acción"
  },
  "dineInOnly": {
    "zh": "僅接受內用",
    "en": "Dine-in Only",
    "th": "สำหรับทานที่ร้านเท่านั้น",
    "ja": "店内飲食のみ",
    "ko": "매장 식사 전용",
    "vi": "Chỉ phục vụ tại chỗ",
    "ru": "Только в зале",
    "es": "Solo para comer aquí"
  }
};

Object.assign(data.TRANSLATIONS, newTranslations);
fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Updated public/data.json with all new translations. Total keys:', Object.keys(data.TRANSLATIONS).length);
