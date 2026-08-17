import { Language } from '../types';

/**
 * Built-in translation dictionary for standard dish names, descriptions, categories, and add-ons.
 * Provides fallback translations for all 8 supported languages.
 */
const TRANSLATION_DICTIONARY: Record<string, Partial<Record<Language, string>>> = {
  "Vitamilk豆奶": {
    "ja": "ビタミルク豆乳",
    "zh": "Vitamilk豆奶",
    "en": "Vitamilk Soy Milk",
    "vi": "Sữa đậu nành Vitamilk",
    "ko": "비타밀크 두유",
    "th": "ไวตามิ้ลค์ นมถั่วเหลือง",
    "ru": "Соевое молоко Vitamilk",
    "es": "Leche de Soja Vitamilk"
  },
  "(泰國知名豆奶)眾多口味:原味/黑芝麻/草莓/香蕉/泰式奶茶/巧克力/麥芽\n香濃順口 宵夜早餐無負擔 大人小孩都愛": {
    "ja": "（タイの有名豆乳）多数のフレーバー：オリジナル/黒ごま/イチゴ/バナナ/タイティー/チョコレート/麦芽。濃厚で滑らか、夜食や朝食にぴったり。大人も子供も大好き。",
    "en": "(Famous Thai Soy Milk) Many flavors: Original/Black Sesame/Strawberry/Banana/Thai Tea/Chocolate/Malt. Rich and smooth, perfect for late-night snacks or breakfast. Loved by adults and kids.",
    "zh": "(泰國知名豆奶)眾多口味:原味/黑芝麻/草莓/香蕉/泰式奶茶/巧克力/麥芽\n香濃順口 宵夜早餐無負擔 大人小孩都愛",
    "th": "(นมถั่วเหลืองชื่อดังของไทย) มีหลายรสชาติ: ออริจินัล/งาดำ/สตรอว์เบอร์รี/กล้วย/ชาไทย/ช็อกโกแลต/มอลต์ เข้มข้นนุ่มนวล ทานเป็นมื้อดึกหรือมื้อเช้าก็อร่อย ถูกใจทั้งเด็กและผู้ใหญ่",
    "ko": "(태국 유명 두유) 다양한 맛: 오리지널/검은깨/딸기/바나나/타이티/초콜릿/맥아. 진하고 부드러우며 야식이나 아침으로 부담이 없습니다. 남녀노소 누구나 좋아합니다.",
    "vi": "(Sữa đậu nành nổi tiếng Thái Lan) Nhiều hương vị: Nguyên bản/Mè đen/Dâu tây/Chuối/Trà sữa Thái/Socola/Mạch nha. Thơm ngon đậm đà, thích hợp cho bữa đêm hoặc bữa sáng. Người lớn và trẻ em đều thích.",
    "ru": "(Знаменитое тайское соевое молоко) Различные вкусы: Оригинальный/Черный кунжут/Клубника/Банан/Тайский чай/Шоколад/Солод. Насыщенное и мягкое, идеально для ночного перекуса или завтрака. Любят и взрослые, и дети.",
    "es": "(Famosa leche de soja tailandesa) Varios sabores: Original/Sésamo negro/Fresa/Plátano/Té tailandés/Chocolate/Malta. Rica y suave, ideal para la cena tardía o el desayuno. Apta para niños y adultos."
  },
  "麒麟啤酒": {
    "ja": "キリンビール",
    "vi": "bia kirin",
    "th": "เบียร์คิริน",
    "ko": "기린맥주",
    "zh": "麒麟啤酒",
    "en": "Kirin Beer",
    "ru": "Пиво Kirin",
    "es": "Cerveza Kirin"
  },
  "沁涼消暑，口感清爽，搭配燒烤絕配": {
    "ja": "冷たくてさわやか、バーベキューに最高の組み合わせ。",
    "en": "Refreshing and cool, a perfect match for delicious BBQ.",
    "zh": "沁涼消暑，口感清爽，搭配燒烤絕配",
    "ko": "시원하고 상쾌하여 바베큐와 완벽한 조화를 이룹니다.",
    "th": "เย็นชื่นใจ รสชาติสดชื่น เข้ากันได้ดีเยี่ยมกับเมนูปิ้งย่าง",
    "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng.",
    "ru": "Свежее золотое разливное пиво с мягкой хмелевой горчинкой.",
    "es": "Cerveza de barril ligera y espumosa con un refrescante sabor a malta."
  },
  "SPY泰國雞尾酒": {
    "ko": "SPY 타이 칵테일",
    "th": "สปายไทยค็อกเทล",
    "vi": "Cocktail Thái SPY",
    "en": "SPY Thai Wine Cooler",
    "zh": "SPY泰國雞尾酒",
    "ja": "スパイタイカクテル",
    "ru": "Тайский винный коктейль SPY",
    "es": "Cóctel de Vino Tailandés SPY"
  },
  "奶酪組合價": {
    "ja": "パンナコッタコンボ",
    "th": "ชุดคอมโบพานาคอตต้า",
    "ko": "판나코타 콤보",
    "vi": "Combo Panna Cotta",
    "en": "Panna Cotta Combo",
    "zh": "奶酪組合價",
    "ru": "Сет панна-котты (комбо)",
    "es": "Combo de Panna Cotta"
  },
  "超值優惠組合，物超所值，限時享用": {
    "ko": "슈퍼 가치 할인 패키지, 가격 대비 훌륭한 가치, 제한된 시간 동안만 제공",
    "th": "แพ็คเกจส่วนลดสุดคุ้ม คุ้มสุดๆ ระยะเวลาจำกัดเท่านั้น",
    "vi": "Gói giảm giá siêu giá trị, giá trị đồng tiền, thời gian có hạn",
    "en": "Great value combo package, high cost-performance deal for a limited time.",
    "zh": "超值優惠組合，物超所值，限時享用",
    "ja": "期間限定の超お得な割引パッケージ",
    "ru": "Специальная скидка и подарок для наших постоянных друзей и гостей.",
    "es": "Cupón de beneficio exclusivo para clientes frecuentes y amigos de la casa."
  },
  "桂花奶茶奶酪": {
    "zh": "桂花奶茶奶酪",
    "en": "Osmanthus Milk Tea Panna Cotta",
    "vi": "Panna Cotta Trà Sữa Hoa Mộc Tê",
    "th": "พานาคอตต้าชานมดอกหอมหมื่นลี้",
    "ko": "계화 밀크티 판나코타",
    "ja": "キンモクセイミルクティープリン",
    "ru": "Панна-котта с османтусом и молочным чаем",
    "es": "Panna Cotta de Té con Leche y Osmanto"
  },
  "香濃奶酪融合桂花與奶茶的迷人香氣，口感滑順，甜而不膩。": {
    "ja": "濃厚なプリンにキンモクセイとミルクティーの魅惑的な香りが溶け込み、なめらかで上品な甘さ。",
    "th": "พานาคอตต้าเนื้อเนียนนุ่มผสมผสานกลิ่นหอมของดอกหอมหมื่นลี้และชานม หวานพอดีคำ",
    "ko": "진한 판나코타에 계화와 밀크티의 매혹적인 향이 어우러져 부드럽고 적당히 달콤한 디저트입니다.",
    "vi": "Panna cotta thơm béo kết hợp hương hoa mộc tê và trà sữa quyến rũ, kết cấu mềm mịn, ngọt thanh không ngấy.",
    "en": "Rich panna cotta infused with the charming aroma of osmanthus and milk tea, smooth and perfectly sweet.",
    "zh": "香濃奶酪融合桂花與奶茶的迷人香氣，口感滑順，甜而不膩。",
    "ru": "Нежная сливочная панна-котта с чарующим ароматом цветов османтуса и тайского молочного чая, в меру сладкая и шелковистая.",
    "es": "Suave panna cotta que fusiona el delicado aroma del osmanto con el té con leche tailandés, textura sedosa y dulzor equilibrado."
  },
  "原肉板腱牛5oz": {
    "ja": "トップブレードステーキ (5oz)",
    "zh": "原肉板腱牛5oz",
    "en": "Top Blade Steak (5oz)",
    "vi": "Bít tết thăn vai bò (5oz)",
    "ko": "탑블레이드 스테이크 (5oz)",
    "th": "สเต็กเนื้อใบพาย (5oz)",
    "ru": "Стейк из говяжьей лопатки (Топ-блейд) 5 унций",
    "es": "Bife de Paleta de Res Top Blade (5 oz)"
  },
  "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味": {
    "ja": "炭火でじっくり焼いたCHOICEトップブレード原肉ステーキ、香り高く一口ごとに至高の美味しさ。",
    "ko": "숯불에 천천히 구워낸 CHOICE 부채살 원육 스테이크, 풍미가 가득하여 한 입마다 극상의 맛을 선사합니다.",
    "th": "สเต็กเนื้อใบพายเกรด CHOICE ย่างถ่านช้าๆ หอมฟุ้ง อร่อยเข้มข้นทุกคำ",
    "vi": "Bít tết thăn vai bò CHOICE nướng chậm trên than hoa, thơm nức nát, mỗi cắn đều là hương vị tuyệt hảo.",
    "en": "Slow-grilled CHOICE top blade steak over charcoal, bursting with rich aroma and delicious flavor in every bite.",
    "zh": "炭火慢烤CHOICE嫩煎里肌原肉牛排，香氣四溢，每一口都是極致美味",
    "ru": "Стейк категории CHOICE, приготовленный на углях. Сочное, ароматное мясо с насыщенным говяжьим вкусом.",
    "es": "Corte entero de res CHOICE asado lentamente al carbón, rebosante de aroma y jugosidad en cada bocado."
  },
  "香斕奶酪": {
    "zh": "香斕奶酪",
    "en": "Pandan Panna Cotta",
    "vi": "Panna Cotta Lá Dứa",
    "ko": "판단 판나코타",
    "th": "พานาคอตต้าใบเตย",
    "ja": "パンダンプリン",
    "ru": "Панна-котта с панданом",
    "es": "Panna Cotta de Pandan"
  },
  "獨特香斕葉的清香與濃郁鮮奶完美調配，滑嫩可口。": {
    "zh": "獨特香斕葉的清香與濃郁鮮奶完美調配，滑嫩可口。",
    "en": "Fresh pandan aroma perfectly blended with rich milk, smooth and delicious.",
    "vi": "Hương lá dứa thơm mát hòa quyện cùng sữa tươi béo ngậy, kết cấu mềm mịn thơm ngon.",
    "ko": "독특한 판단 잎의 은은한 향과 진한 우유가 어우러진 부드럽고 촉촉한 디저트.",
    "th": "กลิ่นหอมอันเป็นเอกลักษณ์ของใบเตยผสมผสานกับรสนมเข้มข้นอย่างลงตัว เนื้อเนียนนุ่มละมุนลิ้น",
    "ja": "独特なパンダンの香りと濃厚なミルクが絶妙にマッチした、なめらかで美味しいプリン。",
    "ru": "Уникальное сочетание свежего аромата листьев пандана и густого молока. Нежный и тающий во рту десерт.",
    "es": "La refrescante fragancia de las hojas de pandán combinada a la perfección con crema de leche fresca, suave y deliciosa."
  },
  "鮮奶奶酪": {
    "ja": "ミルクプリン",
    "vi": "Panna Cotta Sữa Tươi",
    "ko": "우유 판나코타",
    "th": "พานาคอตต้านมสด",
    "zh": "鮮奶奶酪",
    "en": "Fresh Milk Panna Cotta",
    "ru": "Классическая сливочная панна-котта",
    "es": "Panna Cotta Clásica de Leche Fresca"
  },
  "純鮮乳製作，散發香純濃郁的奶香，入口即化。": {
    "en": "Made with pure fresh milk, releasing a rich and natural milky aroma that melts in your mouth.",
    "zh": "純鮮乳製作，散發香純濃郁的奶香，入口即化。",
    "ko": "순수 우유로 만들어 입안 가득 고소하고 진한 우유 향이 퍼지며 사르르 녹아내립니다.",
    "th": "ทำจากนมสดแท้ 100% ให้กลิ่นหอมนมเข้มข้น หอมมัน ละลายในปาก",
    "vi": "Làm từ sữa tươi nguyên chất, lan tỏa hương sữa thơm béo đặc trưng, tan ngay trong miệng.",
    "ja": "純粋な牛乳を使用し、濃厚なコクのある風味が口の中でとろけます。",
    "ru": "Приготовлена из натурального свежего молока, обладает чистым сливочным вкусом и шелковистой текстурой.",
    "es": "Elaborada con leche fresca 100% natural, con un aroma puro a crema láctea que se derrite en el paladar."
  },
  "泰式奶茶奶酪": {
    "ja": "タイティーパンナコッタ",
    "vi": "Panna Cotta Trà Thái",
    "ko": "타이 밀크티 판나코타",
    "th": "พานาคอตต้าชาไทย",
    "zh": "泰式奶茶奶酪",
    "en": "Thai Tea Panna Cotta",
    "ru": "Панна-котта с тайским молочным чаем",
    "es": "Panna Cotta de Té Tailandés"
  },
  "選用泰國經典手標紅茶葉，完美呈現泰奶的獨特風味與乳香。": {
    "vi": "Sử dụng lá trà đen ChaTraMue cổ điển của Thái Lan, thể hiện hoàn hảo hương vị độc đáo và vị sữa của trà sữa Thái.",
    "th": "ใช้ใบชาแดงตรามือยอดฮิตของไทย ถ่ายทอดรสชาติและกลิ่นนมอันเป็นเอกลักษณ์ของชาไทยได้อย่างสมบูรณ์แบบ",
    "ko": "태국 클래식 차트라뮤 홍차 잎을 사용하여 타이 밀크티의 독특한 풍미와 우유향을 완벽하게 재현했습니다.",
    "zh": "選用泰國經典手標紅茶葉，完美呈現泰奶的獨特風味與乳香。",
    "en": "Made with classic Thai ChaTraMue black tea leaves, perfectly presenting the unique flavor and milkiness of Thai milk tea.",
    "ja": "タイの定番チャトラムー紅茶葉を使用し、タイティーの独特の風味とミルクの香りを完璧に再現しました。",
    "ru": "Используются фирменные тайские чайные листья ChaTraMue, передающие аутентичный вкус тайского чая с молоком.",
    "es": "Preparada con auténticas hojas de té ChaTraMue de Tailandia, logrando el sabor clásico del té tailandés y una cremosidad irresistible."
  },
  "分解茶": {
    "ja": "ブレイクダウンティー",
    "en": "Oolong Tea (Decomposing)",
    "zh": "分解茶",
    "th": "ชาสลาย",
    "ko": "고장차",
    "vi": "Trà suy sụp",
    "ru": "Освежающий чай улун (для пищеварения)",
    "es": "Té Oolong Digestivo Desintoxicante"
  },
  "泰鮮大魷魚(碳烤)": {
    "ja": "タイ風炭火焼き大イカ (Lサイズ)",
    "zh": "泰鮮大魷魚(碳烤)",
    "en": "Thai BBQ Giant Squid (L-Size)",
    "vi": "Mực ống khổng lồ nướng than Thái (Size L)",
    "ko": "태국식 숯불 王오징어 구이 (L)",
    "th": "หมึกยักษ์ย่างถ่านสไตล์ไทย (ไซส์ L)",
    "ru": "Тайский гигантский кальмар на углях (размер L)",
    "es": "Calamar Gigante Tailandés a las Brasas (Talla L)"
  },
  "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充": {
    "ja": "厳選された台湾深海Lサイズ大イカ！香ばしく柔らかでジューシー、低脂質・低カロリーの高品質タンパク質。",
    "ko": "엄선된 대만 심해 L사이즈 왕오징어! 짭조름하고 신선하며 육즙이 가득한 저지방 고단백 건강식.",
    "th": "คัดสรรหมึกยักษ์ไซส์ L จากทะเลลึกไต้หวัน รสชาติเค็มหอม นุ่มชุ่มฉ่ำ โปรตีนสูง ไขมันต่ำ",
    "vi": "Mực ống khổng lồ size L đại dương Đài Loan được tuyển chọn kỹ lượng, mặn mà tươi ngon mọng nước, bổ sung protein chất lượng cao ít béo.",
    "en": "Strictly selected Taiwan deep-sea L-size giant squid! Savory, tender and juicy, low-fat & low-calorie quality protein.",
    "zh": "嚴選台灣深海L號大魷魚~非一般店家m號的尺寸！鹹香鮮嫩又多汁~低脂低熱量優質蛋白質補充",
    "ru": "Отборный глубоководный кальмар размера L (больше стандартного M). Сочный, нежный, низкокалорийный и богатый белком.",
    "es": "Calamar gigante talla L de aguas profundas seleccionado. Tierno, jugoso, bajo en grasa y alto en proteínas de calidad."
  },
  "道地泰式大魷魚海鮮乾拌mama麵（辣）": {
    "vi": "Mỳ khô mực lớn và hải sản Thái chính gốc (cay)",
    "ko": "정통 태국식 대오징어와 해산물 건어물 마마면(매운맛)",
    "th": "มาม่าปลาหมึกเส้นใหญ่และทะเลแห้งสูตรดั้งเดิมของไทย (รสเผ็ด)",
    "zh": "道地泰式大魷魚海鮮乾拌mama麵（辣）",
    "en": "Spicy Thai Seafood MAMA Noodles w/ Giant Squid",
    "ja": "本場タイの大イカと海鮮のドライママヌードル（辛口）",
    "ru": "Тайская лапша MAMA с морепродуктами и гигантским кальмаром (острая)",
    "es": "Fideos MAMA Secos con Calamar Gigante y Mariscos al Estilo Tailandés (Picante)"
  },
  "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜": {
    "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸辣湯前菜 ＜苦手な方はご遠慮ください＞ 材料：厳選深海イカLサイズ、活海老、いか（リング）、たらね、貢ぎ玉、国産魚盛り、玉ねぎ、人参千切り、キュウリ、キャベツ",
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:嚴選深海L號大魷魚 鮮蝦 魷魚(圈) 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜",
    "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료 : 엄선한 심해 L사이즈 오징어, 생새우, 오징어(링), 대구볼, 공물볼, 생선살, 양파, 당근채, 오이, 양배추",
    "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยเผ็ดร้อน <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: ปลาหมึกทะเลน้ำลึกไซส์ L คัดมาอย่างดี กุ้งสด ปลาหมึก(วงแหวน) ลูกชิ้นปลาคอด ลูกชิ้น ปลาญี่ปุ่น หัวหอม แครอทฝอย แตงกวา กะหล่ำปลี",
    "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua nóng <Đừng gọi nếu bạn không thích> Thành phần: Mực biển cỡ L được lựa chọn cẩn thận, tôm tươi, mực (vòng), cá tuyết viên, bi cống, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột, bắp cải",
    "ru": "Аутентичная лапша MAMA в фирменном кисло-остром соусе со свежим лаймом. В комплекте: кальмар размера L, креветки, рыбные шарики, капуста и овощи. Остро!",
    "es": "Clásicos fideos MAMA tailandeses mezclados con salsa secreta agripicante y jugo de lima fresco. Incluye calamar gigante talla L, camarones frescos, albóndigas de pescado, verduras y col. ¡Nivel picante!"
  },
  "升級套餐(烤蔬菜+泰奶一杯)": {
    "ja": "グレードアップ定食（焼き野菜＋タイミルク1杯）",
    "en": "Upgraded set meal (roasted vegetables + a cup of Thai milk)",
    "zh": "升級套餐(烤蔬菜+泰奶一杯)",
    "th": "ชุดอาหารอัพเกรด (ผักย่าง + นมไทย 1 แก้ว)",
    "ko": "업그레이드된 정식 (구운 야채 + 태국 우유 1잔)",
    "vi": "Set ăn nâng cấp (rau nướng + 1 cốc sữa Thái)",
    "ru": "Улучшить до комбо (овощи гриль + стакан тайского чая)",
    "es": "Mejorar a combo (verduras asadas + 1 té tailandés)"
  },
  "雞皮10串": {
    "zh": "雞皮10串",
    "en": "Grilled Chicken Skin (10 Skewers)",
    "vi": "10 xiên da gà",
    "th": "หนังไก่เสียบไม้ 10 ชิ้น",
    "ko": "닭 껍질 꼬치 10개",
    "ja": "鶏皮串 10本",
    "ru": "Хрустящая куриная кожа на углях (10 шпажек)",
    "es": "Piel de Pollo Crujiente a las Brasas (10 brochetas)"
  },
  "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感": {
    "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂分が減り、カリッとした食感が魅力です",
    "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than hồng, mỡ được giảm bớt ~ chuyển thành kết cấu giòn hấp dẫn",
    "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันจะลดลง~กลายเป็นเนื้อกรอบที่น่าดึงดูด",
    "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 감소~바삭한 식감이 매력",
    "ru": "Кто сказал, что куриную кожу можно только жарить во фритюре? Запеченная на углях, она избавляется от лишнего жира и становится невероятно хрустящей.",
    "es": "¿Quién dijo que la piel de pollo solo se fríe? Asada al carbón pierde el exceso de grasa y se transforma en una textura crujiente e irresistible."
  },
  "牛5羊5串": {
    "th": "เซตเนื้อ 5 ไม้ & แกะ 5 ไม้",
    "ko": "소고기 5 & 양고기 5 꼬치 세트",
    "vi": "Set 5 xiên bò & 5 xiên cừu",
    "en": "Beef 5 & Lamb 5 Skewers Combo",
    "zh": "牛5羊5串",
    "ja": "牛5本・羊5本 串セット",
    "ru": "Ассорти: говяжьи (5 шт.) и бараньи (5 шт.) шашлычки",
    "es": "Combo 5 Brochetas de Res + 5 Brochetas de Cordero"
  },
  "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味": {
    "en": "Beef rib skewers x5 + Lamb chop skewers x5. Slowly grilled over charcoal, rich in aroma and flavors.",
    "zh": "原塊牛肋5串+小羔羊肉5串\n炭火慢烤，香氣四溢，每一口都是極致美味",
    "ko": "소갈비꼬치 5개 + 어린양고기꼬치 5개. 숯불에 천천히 구워 향긋함이 가득하며 매 한 입마다 극상의 맛.",
    "th": "เนื้อซี่โครง 5 ไม้ + เนื้อแกะ 5 ไม้ ย่างถ่านช้าๆ หอมฟุ้ง อร่อยฟินทุกคำ",
    "vi": "Xiên sườn bò x5 + Xiên thịt cừu x5. Nướng chậm trên than hoa, thơm nức nát, ngon tuyệt hảo từng miếng.",
    "ja": "牛カルビ串5本＋子羊肉串5本。炭火でじっくり焼き上げ、香り高く一口ごとに至高の美味しさ。",
    "ru": "5 шпажек говяжьих ребрышек + 5 шпажек нежного ягненка на углях. Насыщенный мясной аромат в каждом кусочке.",
    "es": "5 brochetas de costilla de res + 5 brochetas de cordero tierno asadas al carbón. Puro sabor y aroma a la parrilla."
  },
  "真。小羔羊肉10串": {
    "vi": "Đúng. 10 xiên thịt cừu",
    "th": "จริง. เนื้อแกะเสียบไม้ 10 ชิ้น",
    "ko": "사실이다. 양꼬치 10개",
    "zh": "真。小羔羊肉10串",
    "en": "Australian Lamb Skewers (10 Skewers)",
    "ja": "そうです。子羊串 10本",
    "ru": "Шашлычки из австралийского ягненка (10 шпажек)",
    "es": "Brochetas de Cordero Australiano Auténtico (10 brochetas)"
  },
  "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉": {
    "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi chín vàng, chắt bớt mỡ thừa rồi rắc bột thì là",
    "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีทอง บีบไขมันส่วนเกินออก แล้วโรยด้วยผงยี่หร่า",
    "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주산) 숯불에 노릇노릇해질 때까지 굽고, 여분의 지방을 짜내고 큐민가루를 뿌려준다",
    "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 放炭火上烤至金黃 逼出多餘油脂 撒上孜然粉",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリア産） 炭火で焼き色がつくまで焼き、余分な脂を絞り、クミンパウダーをふりかける",
    "ru": "Отборное мясо ягненка моложе 6 месяцев (импорт из Австралии). Обжарено на углях до золотистой корочки с ароматным зирой (кумином).",
    "es": "Carne de cordero lechal menor a 6 meses importada de Australia. Asada a fuego de carbón hasta dorar con comino aromático."
  },
  "極炙牛肋10串": {
    "ja": "極上牛カルビ串 (10本)",
    "zh": "極炙牛肋10串",
    "en": "Beef Rib Skewers (10 Skewers)",
    "vi": "Xiên sườn bò nướng thượng hạng (10 xiên)",
    "ko": "극상 소갈비꼬치 (10꼬치)",
    "th": "บาร์บีคิวเนื้อซี่โครงย่าง (10 ไม้)",
    "ru": "Шашлычки из говяжьих ребрышек на гриле (10 шпажек)",
    "es": "Brochetas de Costilla de Res a las Brasas (10 brochetas)"
  },
  "黃金比例 of 牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受": {
    "ja": "黄金比率の牛カルビ串。外は香ばしく炙り、中はやわらかピンク色。一口食べれば至福の味わい。",
    "en": "Golden ratio beef rib cubes, charcoal-grilled to crispy perfection outside and tender pink inside, an ultimate treat for your tastebuds.",
    "zh": "黃金比例 of 牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受",
    "ko": "황금 비율의 소갈비살, 겉은 바삭하고 속은 촉촉한 핑크빛으로 구워내 한 입 베어물면 미각의 극치를 경험할 수 있습니다.",
    "th": "เนื้อซี่โครงสัดส่วนทองคำ ย่างจนข้างนอกหอมกรอบ ข้างในนุ่มสีชมพู อร่อยฟินทุกคำ",
    "vi": "Thịt sườn bò tỉ lệ vàng, nướng xém cạnh bên ngoài, bên trong mềm hồng, một miếng cắn là trải nghiệm vị giác tuyệt vời.",
    "ru": "Идеальное соотношение мяса и жира. Хрустящая корочка снаружи, сочная и розовая серединка внутри. Настоящий праздник вкуса.",
    "es": "Proporción dorada de carne de costilla de res, tostada por fuera y tierna por dentro. Una experiencia gourmet inigualable."
  },
  "恐龍美祿": {
    "ja": "マイロ・ダイナソー",
    "en": "Milo Dinosaur",
    "zh": "恐龍美祿",
    "th": "ไมโลไดโนเสาร์",
    "ko": "마일로 다이노소어",
    "vi": "Milo Khủng Long",
    "ru": "Динозавр Майло (Milo Dinosaur)",
    "es": "Milo Dinosaurio Helado"
  },
  "經典美祿可可飲品，冰鎮後撒上滿滿的可可粉，濃郁香甜的雙重享受。": {
    "ko": "아이스 마일로 초콜릿 음료 위에 마일로 가루를 듬뿍 올려 더욱 진하고 달콤한 초코 풍미를 즐길 수 있는 음료.",
    "th": "เครื่องดื่มโกโก้ไมโลคลาสสิก เสิร์ฟเย็นพร้อมโรยผงโกโก้พูนๆ ให้ความอร่อยเข้มข้นเป็นสองเท่า",
    "vi": "Thức uống cacao Milo cổ điển, ướp lạnh và phủ đầy bột cacao cho trải nghiệm ngọt ngào đậm đà nhân đôi.",
    "en": "Classic Milo chocolate drink, iced and topped with a generous amount of Milo powder for double the chocolate experience.",
    "zh": "經典美祿可可飲品，冰鎮後撒上滿滿的可可粉，濃郁香甜的雙重享受。",
    "ja": "冷たいマイロのココアドリンクに、たっぷりのココアパウダーをトッピングした濃厚で甘いダブルの味わい。",
    "ru": "Легендарный напиток какао Майло со льдом, щедро посыпанный горкой шоколадного порошка. Двойное шоколадное удовольствие!",
    "es": "Clásica bebida de cacao Milo con hielo, coronada con abundante polvo de cacao. ¡Doble placer dulce y cremoso!"
  },
  "泰式可可冰奶": {
    "th": "ชาไทยโกโก้เย็น",
    "ko": "타이 아이스 코코아 밀크티",
    "vi": "Trà Sữa Thái Cacao Đá",
    "en": "Thai Iced Cocoa Milk Tea",
    "zh": "泰式可可冰奶",
    "ja": "タイアイスココアミルクティー",
    "ru": "Тайский ледяной какао-чай",
    "es": "Té Helado Tailandés con Cacao Dulce"
  },
  "基底手標泰式奶茶~撒上大量香濃美祿可可粉!!!一杯飲品雙重享受": {
    "ja": "チャトラムータイティーをベースに、濃厚なミロココアパウダーをたっぷりトッピング！！！一杯で二つの味を楽しめます。",
    "en": "Base of ChaTraMue Thai Milk Tea sprinkled with plenty of rich Milo cocoa powder!!! Double enjoyment in one cup.",
    "zh": "基底手標泰式奶茶~撒上大量香濃美祿可可粉!!!一杯飲品雙重享受",
    "th": "ชาไทยตรามือสุดคลาสสิกโรยหน้าด้วยผงโกโก้ไมโลหอมกรุ่นแบบจัดเต็ม!!! อร่อยฟินสองต่อในแก้วเดียว",
    "ko": "차트라뮤 타이 밀크티 베이스에 진한 마일로 코코아 가루를 듬뿍 뿌렸습니다!!! 한 잔으로 두 가지 맛을 즐기세요.",
    "vi": "Trà sữa Thái ChaTraMue làm nền, rắc thêm nhiều bột cacao Milo thơm ngon!!! Một ly đồ uống mang đến niềm vui nhân đôi.",
    "ru": "Основа из знаменитого тайского молочного чая ChaTraMue, посыпанная густым слоем какао Milo. Двойной вкус в одном стакане!",
    "es": "Base de té tailandés tradicional espolvoreada con abundante cacao cremoso Milo. ¡Dos delicias en una sola copa!"
  },
  "爆漿泰奶包": {
    "vi": "Bánh Mì Nướng Trà Thái Chảy",
    "th": "ขนมปังปิ้งไส้ชาไทยลาวา",
    "ko": "용암 타이티 번",
    "zh": "爆漿泰奶包",
    "en": "Lava Thai Tea Bun",
    "ja": "とろけるタイティーパン",
    "ru": "Булочка с жидкой начинкой из тайского чая",
    "es": "Pan Tostado Relleno de Crema de Té Tailandés (Lava Bun)"
  },
  "泰國國民小吃!碳烤過的香甜麵包~搭配流心泰奶醬!一吃會上癮!每日少量供應": {
    "en": "A popular Thai street food! Charcoal-grilled sweet bun paired with molten Thai tea sauce! Highly addictive! Limited daily supply.",
    "zh": "泰國國民小吃!碳烤過的香甜麵包~搭配流心泰奶醬!一吃會上癮!每日少量供應",
    "th": "สตรีทฟู้ดยอดฮิตของไทย! ขนมปังปิ้งเตาถ่านหอมหวาน ทานคู่กับซอสชาไทยเยิ้มๆ! กินแล้วติดใจแน่นอน! มีจำนวนจำกัดต่อวัน",
    "ko": "태국 국민 간식! 숯불에 구운 달콤한 빵과 흘러내리는 타이티 소스의 조화! 중독성 강한 맛! 매일 소량 한정 판매.",
    "vi": "Món ăn vặt quốc dân của Thái Lan! Bánh mì nướng than hoa ngọt ngào kết hợp với sốt trà Thái tan chảy! Ăn một lần là ghiền! Số lượng có hạn mỗi ngày.",
    "ja": "タイの国民的おやつ！炭火焼きの甘いパンにとろとろのタイティーソース！やみつきになる美味しさ！毎日数量限定。",
    "ru": "Популярный тайский стрит-фуд! Поджаренная на углях сладкая булочка с горячей текучей начинкой из тайского чая. Лимитированная подача каждый день.",
    "es": "¡Bocadillo callejero tailandés por excelencia! Pan asado al carbón relleno de crema volcánica de té tailandés. Suministro limitado diario."
  },
  "人氣D餐": {
    "ja": "人気Dセット",
    "zh": "人氣D餐",
    "en": "Popular Set D Combo",
    "vi": "Combo D Phổ Biến",
    "ko": "인기 D 세트",
    "th": "เซ็ต D ยอดนิยม",
    "ru": "Популярный сет D",
    "es": "Set D Popular Sabay"
  },
  "招牌海鮮乾拌mama麵1份、椰碳牛小排三重奏（佐麵包蔬菜）1份、 碳烤手工月亮蝦餅1份、明太子秋刀魚（去刺）2P🧉 贈手標泰奶2杯": {
    "ja": "看板シーフードまぜMAMA麺 1人前、ココナッツ炭火牛カルビ三重奏（パン・野菜添え） 1人前、炭火焼き手作りムーンエビ餅 1人前、明太子秋刀魚（骨なし） 2P 🧉 タイミルクティー 2杯無料サービス",
    "th": "บะหมี่มาม่าแห้งทะเลซิกเนเจอร์ 1 ที่, ซี่โครงเนื้อย่างถ่านมะพร้าวทริโอ (เสิร์ฟพร้อมขนมปังและผัก) 1 ที่, ทอดมันกุ้งพระจันทร์ย่างถ่านทำมือ 1 ที่, ปลาซันมะราดซอสไข่ปลาค็อด (ไร้ก้าง) 2 ชิ้น 🧉 ฟรีชาไทยตรามือ 2 แก้ว",
    "ko": "시그니처 해물 비빔 MAMA 누들 1인분, 코코넛 숯불 우갈비 삼중주(빵, 야채 곁들임) 1인분, 숯불 수제 월량샤빙(새우전) 1인분, 명란 꽁치구이(가시 제거) 2P 🧉 타이 밀크티 2잔 무료 증정",
    "vi": "1 phần Mì MAMA trộn khô Hải sản Đặc trưng, 1 phần Bò nướng than dừa Trio (kèm bánh mì & rau), 1 phần Chả tôm trăng nướng than thủ công, 2 phần Cá thu đao sốt trứng cá tuyết Mentaiko (đã rút xương) 🧉 Tặng 2 ly trà sữa Thái",
    "en": "1 serving of Signature Seafood dry mix MAMA noodles, 1 serving of Charcoal Grilled Beef Short Rib Trio (with bread and vegetables), 1 serving of Charcoal Grilled Handmade Moon Shrimp Cake, 2 pieces of Mentaiko Saury (deboned) 🧉 Free 2 cups of Thai milk tea",
    "zh": "招牌海鮮乾拌mama麵1份、椰碳牛小排三重奏（佐麵包蔬菜）1份、 碳烤手工月亮蝦餅1份、明太子秋刀魚（去刺）2P🧉 贈手標泰奶2杯",
    "ru": "1 порция фирменной лапши MAMA с морепродуктами, 1 порция трио говяжьих ребрышек на углях с хлебом и овощами, 1 хрустящий тайский креветочный блинчик, 2 сайры с икрой минтая + 2 тайских молочных чая в подарок.",
    "es": "1 fideos MAMA secos con mariscos, 1 trío de costilla de res al carbón con pan y verduras, 1 pastel artesanal de camarón 'Moon Shrimp Cake', 2 pescados saury rellenos de mentaiko + 2 tés tailandeses de regalo."
  },
  "奢華C餐": {
    "en": "Luxury Combo C",
    "zh": "奢華C餐",
    "th": "ชุดคอมโบ C สุดหรู",
    "ko": "럭셔리 콤보 C",
    "vi": "Combo C Sang Trọng",
    "ja": "豪華Cセット",
    "ru": "Роскошный сет морепродуктов C",
    "es": "Set C Lujoso de Mariscos"
  },
  "嚴選海味，聚餐首選🥳 炙燒生食級干貝×4 椰碳烤大草蝦×6 泰式大生蠔×3 手撕魷魚干1份 日本鯖甘魚下巴1份": {
    "ko": "엄선된 해산물, 모임에 최고🥳 직화구이 생식용 관자×4, 코코넛 숯불구이 대하×6, 타이식 대형 굴×3, 수제 오징어채 1개, 일본산 방어 턱살 1개",
    "th": "คัดสรรซีฟู้ดชั้นยอด ตัวเลือกอันดับหนึ่งสำหรับงานสังสรรค์🥳 หอยเชลล์เกรดซาชิมิย่าง 4 ตัว, กุ้งลายเสือย่างเตาถ่านกะลามะพร้าว 6 ตัว, หอยนางรมไทยไซส์ใหญ่ 3 ตัว, ปลาหมึกฉีก 1 ที่, คางปลาหางเหลืองญี่ปุ่น 1 ที่",
    "vi": "Hải sản tuyển chọn, lựa chọn hàng đầu cho các buổi tiệc🥳 Sò điệp nướng cháy cạnh ăn sống×4, Tôm sú nướng than gáo dừa×6, Hàu Thái lớn×3, Khô mực xé tay 1 phần, Má cá cam Nhật Bản 1 phần",
    "en": "Carefully selected seafood, top choice for gatherings 🥳 Seared sashimi-grade scallops×4, Coconut-charcoal grilled giant tiger prawns×6, Thai large oysters×3, Shredded dried squid×1, Japanese amberjack collar×1",
    "zh": "嚴選海味，聚餐首選🥳 炙燒生食級干貝×4 椰碳烤大草蝦×6 泰式大生蠔×3 手撕魷魚干1份 日本鯖甘魚下巴1份",
    "ja": "厳選海鮮、集まりに最適🥳 炙り生食用ホタテ×4、ココナッツ炭焼き大エビ×6、タイ風大粒生牡蠣×3、手裂きスルメ1つ、日本産ブリカマ1つ",
    "ru": "Идеально для застолья: 4 морских гребешка сашими, 6 гигантских тигровых креветок на углях, 3 тайские устрицы, 1 порция сушеного кальмара, 1 запеченный воротничок хамачи (лакедры).",
    "es": "Selección prémium del mar: 4 vieiras grado sashimi a las brasas, 6 langostinos tigre gigantes, 3 ostras tailandesas, 1 calamar seco deshebrado y 1 quijada de pez cola amarilla hamachi a la parrilla."
  },
  "泰奶空桶": {
    "ja": "タイミルクの空バケツ",
    "ko": "태국 우유 빈 양동이",
    "th": "ถังเปล่านมไทย",
    "vi": "Xô sữa Thái rỗng",
    "en": "Empty Thai Milk Tea Bucket (1L)",
    "zh": "泰奶空桶",
    "ru": "Фирменное ведерко для тайского чая (1 л)",
    "es": "Cubo Vacío de Té Tailandés (1L)"
  },
  "娃娃菜2p": {
    "ko": "베이비 배추 구이 (2개)",
    "th": "ผักกาดขาวเบบี้แรพย่าง (2 ชิ้น)",
    "vi": "Cải baby nướng (2 phần)",
    "en": "Baby Chinese Cabbage (2pcs)",
    "zh": "娃娃菜2p",
    "ja": "ベビー白菜の炭火焼き (2個)",
    "ru": "Мини-пекинская капуста на углях (2 шт.)",
    "es": "Col China Baby a las Brasas (2 pzas)"
  },
  "炭烤清脆香甜娃娃菜~低熱量高纖維~含多種維生素": {
    "ja": "炭火で焼いたシャキシャキ甘いベビー白菜。低カロリー・高食物繊維でビタミン豊富。",
    "th": "ผักกาดขาวเบบี้แรพย่างถ่าน กรอบหวาน แคลอรีต่ำ ไฟเบอร์สูง อุดมด้วยวิตามิน",
    "ko": "숯불에 구워 아삭하고 달콤한  베이비 배추~ 저칼로리 고섬유질, 풍부한 비타민 함유.",
    "vi": "Cải baby nướng than giòn ngọt, ít calo giàu chất xơ, chứa nhiều vitamin.",
    "en": "Charcoal-grilled crisp and sweet baby cabbage, low calorie, high fiber, rich in vitamins.",
    "zh": "炭烤清脆香甜娃娃菜~低熱量高纖維~含多種維生素",
    "ru": "Хрустящая и сладковатая мини-капуста на углях. Мало калорий, много клетчатки и витаминов.",
    "es": "Tierna col china asada al carbón, dulce, crujiente, baja en calorías y rica en fibra y vitaminas."
  },
  "爆汁金針菇豬肉": {
    "ja": "ジューシーえのき豚肉巻き",
    "zh": "爆汁金針菇豬肉",
    "en": "Juicy Pork Wrapped Enoki Mushroom",
    "vi": "Ba chỉ heo cuộn nấm kim châm mọng nước",
    "th": "หมูสามชั้นพันเห็ดเข็มทองน้ำฉ่ำ",
    "ko": "육즙 가득 팽이버섯 삼겹살말이",
    "ru": "Свинина с грибами эноки на углях",
    "es": "Rollos de Cerdo Rellenos de Hongos Enoki"
  },
  "嫩滑豬肉包裹鮮甜金針菇，炭火慢烤鎖住滿滿湯汁，每一口都爆汁。": {
    "zh": "嫩滑豬肉包裹鮮甜金針菇，炭火慢烤鎖住滿滿湯汁，每一口都爆汁。",
    "en": "Tender pork wrapped around sweet enoki mushrooms, slow-grilled over charcoal to lock in the juices for a burst of flavor in every bite.",
    "vi": "Thịt heo mềm ngọt cuộn nấm kim châm tươi ngon, nướng chậm trên than hoa khóa chặt nước sốt đậm đà, mọng nước trong từng miếng cắn.",
    "ko": "부드러운 삼겹살로 달콤한 팽이버섯을 감싸 숯불에 천천히 구워 육즙을 꽉 잡아냈습니다. 한 입 씹을 때마다 육즙이 터집니다.",
    "th": "เนื้อหมูนุ่มๆ พันเห็ดเข็มทองรสหวาน ย่างถ่านช้าๆ เพื่อล็อคน้ำซุปเข้มข้น ชุ่มฉ่ำทุกคำที่กัด",
    "ja": "柔らかい豚肉で甘みのあるえのき茸を巻き、炭火でじっくり焼いて旨味を閉じ込めました。一口ごとにジューシーな味わいが広がります。",
    "ru": "Нежные ломтики свинины, обернутые вокруг сочных грибов эноки. При запекании на углях сок запечатывается внутри, создавая взрыв вкуса.",
    "es": "Finas láminas de cerdo enrolladas con hongos enoki frescos, asadas al carbón para retener todos sus jugos naturales."
  },
  "客家幣刷卡": {
    "ja": "客家通貨カードのスワイプ",
    "th": "การรูดบัตรสกุลเงินฮากกา",
    "ko": "객가 화폐 카드 스와이프",
    "vi": "Quẹt thẻ tiền tệ Hakka",
    "en": "Hakka Coin Card Payment",
    "zh": "客家幣刷卡",
    "ru": "Оплата картой Hakka Coin",
    "es": "Pago con Tarjeta Moneda Hakka"
  },
  "招牌A餐": {
    "th": "ลายเซ็นมื้ออาหาร",
    "ko": "시그니처A 한끼",
    "vi": "Chữ ký Một bữa ăn",
    "en": "Signature Set A Combo",
    "zh": "招牌A餐",
    "ja": "シグネチャーAのお食事",
    "ru": "Фирменный сет A",
    "es": "Set A Especial de la Casa"
  },
  "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!": {
    "ja": "初めて入りますか？何を選べばいいのか分からない？ここに最高のものがあります。お店の看板商品が一気に手に入る！タイ手打ちビーフ1串/ジューシーえのき茸ポーク1串/タイ北部の酸っぱい肉とビーフンソーセージ1串/タイ風手羽先グリル4本/タイ風パリパリ湯葉1食分/甘辛1食分/タイミルクティー1杯！",
    "zh": "第一次進來?不知道選啥 精華都在這了 店內招牌商品一次擁有! 泰式手工牛肉1串/爆汁金針菇豬肉1串/泰北酸肉冬粉腸1串/泰式烤雞翅4隻/泰酥豆皮1份/甜不辣1份/泰式奶茶1杯!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Lần đầu tiên vào? Bạn không biết nên chọn gì? Dưới đây là những cái tốt nhất. Bạn có thể nhận được các sản phẩm đặc trưng của cửa hàng ngay lập tức! 1 xiên thịt bò thủ công kiểu Thái/1 xiên thịt lợn nấm kim châm ngon ngọt/1 xiên thịt chua miền Bắc Thái và xúc xích bún/4 miếng cánh gà nướng kiểu Thái/1 phần da đậu hũ chiên giòn kiểu Thái/1 phần cay ngọt ngọt/1 cốc trà sữa Thái!",
    "th": "เข้ามาครั้งแรก? ไม่รู้จะเลือกอะไร? นี่คือสิ่งที่ดีที่สุด คุณสามารถรับสินค้าซิกเนเจอร์ของร้านได้ในคราวเดียว! เนื้อไทยทำมือ 1 ไม้/หมูเห็ดเข็มทอง 1 ไม้/เนื้อเปรี้ยวและไส้กรอกเส้นก๋วยเตี๋ยว 1 ไม้/ปีกไก่ย่าง 4 ชิ้น/ผิวเต้าหู้กรอบ 1 ส่วน/เผ็ดร้อน 1 ส่วน/ชานมไทย 1 ถ้วย!",
    "ko": "처음 들어오시나요? 무엇을 선택해야 할지 모르시나요? 여기에 최고의 것들이 있습니다. 매장의 시그니처 제품을 한번에 만나보실 수 있어요! 태국산 수제 쇠고기 꼬치 / 육즙이 풍부한 팽이버섯 돼지고기 1개 / 태국 북부 신맛이 나는 고기와 쌀국수 소시지 1개 / 태국식 구운 닭날개 4조각 / 태국식 바삭한 두부껍질 1인분 / 매콤달콤한 태국식 두부껍질 1인분 / 태국식 밀크티 1컵!",
    "ru": "Впервые у нас? Все бестселлеры в одном сете: 1 шашлычок из тайской рубленой говядины, 1 свинина с эноки, 1 тайская колбаска с фунчозой, 4 куриных крылышка, 1 хрустящий тофу, 1 порция темпуры и 1 тайский молочный чай!",
    "es": "¿Primera vez aquí? ¡Todos los favoritos en un combo!: 1 brocheta de res tailandesa, 1 cerdo con enoki, 1 salchicha fermentada con fideos, 4 alitas de pollo asadas, 1 piel de tofu crujiente, 1 tempura y 1 té con leche tailandés."
  },
  "雪山": {
    "th": "น้ำแข็งไสภูเขาหิมะ",
    "ko": "스노우 마운틴 팥빙수",
    "vi": "Bá đá bào núi tuyết",
    "en": "Snow Mountain Shaved Ice",
    "zh": "雪山",
    "ja": "かき氷（スノーマウンテン）",
    "ru": "Снежная гора (Снежный десерт)",
    "es": "Montaña Nevada (Hielo Raspado Dulce)"
  },
  "金芬黛葡萄酒": {
    "zh": "金芬黛葡萄酒",
    "en": "Zinfandel Red Wine",
    "vi": "rượu Zinfandel",
    "th": "ไวน์ซินฟานเดล",
    "ko": "진판델 와인",
    "ja": "ジンファンデルワイン",
    "ru": "Красное вино Зинфандель (Zinfandel)",
    "es": "Vino Tinto Zinfandel"
  },
  "紅醬外帶瓶": {
    "ja": "レッドソースの持ち帰り用ボトル",
    "en": "Signature Spicy Red Sauce Bottle",
    "zh": "紅醬外帶瓶",
    "th": "ขวดซอสแดงสำหรับพกพา",
    "ko": "레드 소스 테이크아웃 병",
    "vi": "Chai nước sốt đỏ mang theo",
    "ru": "Фирменный острый красный тайский соус (бутылка)",
    "es": "Botella de Salsa Roja Picante Tailandesa (Para Llevar)"
  },
  "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃": {
    "en": "Carefully crafted with rich flavors to complement your meal",
    "zh": "店內的大辣紅醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
    "ko": "매장에 있는 매콤한 빨간 소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
    "th": "น้ำจิ้มรสเด็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อนำไปจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
    "vi": "Nước sốt đỏ cay ở cửa hàng~tự làm độc quyền~rất ngon khi chấm cùng thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
    "ja": "店内の特製赤辛だれは、焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいです",
    "ru": "Фирменный острый красный соус домашнего приготовления. Идеален для мяса на гриле, жареных закусок и лапши с морепродуктами.",
    "es": "Nuestra salsa roja picante casera. Excelente para carnes asadas, fritos y fideos secos con mariscos."
  },
  "綠醬外帶瓶": {
    "ja": "グリーンソースの持ち帰り用ボトル",
    "ko": "그린 소스 테이크아웃 병",
    "th": "ขวดซอสเขียวสำหรับพกพา",
    "vi": "Chai nước sốt xanh mang theo",
    "en": "Signature Thai Green Chili Sauce Bottle",
    "zh": "綠醬外帶瓶",
    "ru": "Фирменный зеленый соус с чили и лаймом (бутылка)",
    "es": "Botella de Salsa Verde Tailandesa de Chiles y Lima (Para Llevar)"
  },
  "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃": {
    "th": "ซอสเขียวรสเผ็ดในร้าน~ทำเองโดยเฉพาะ~อร่อยเมื่อจิ้มกับเนื้อบาร์บีคิวหรืออาหารทอดแล้วเติมลงในบะหมี่ทะเลแห้ง",
    "ko": "매장에 있는 매콤한 그린소스~직접 직접 만든~바비큐나 튀김에 찍어서 건어물 국수에 넣어먹으면 맛있어요",
    "vi": "Nước sốt xanh cay của cửa hàng ~ độc quyền tự làm ~ rất ngon khi chấm với thịt nướng hoặc đồ chiên và thêm vào mì hải sản khô",
    "en": "Carefully crafted with rich flavors to complement your meal",
    "zh": "店內的小辣綠醬~獨家自製~沾烤肉沾炸物加在海鮮乾拌麵都很好吃",
    "ja": "店内の特製グリーンソースは焼き肉や揚げ物につけたり、海鮮麺に添えると美味しいですよ～自家製です～",
    "ru": "Фирменный пикантный зеленый соус со свежим чили, чесноком и лаймом. Идеально для морепродуктов и барбекю.",
    "es": "Nuestra salsa verde picante tailandesa casera con lima y chiles verdes, compañera perfecta para mariscos y carnes."
  },
  "爆汁櫛瓜": {
    "ko": "즙이 터지는 애호박 구이",
    "th": "ซูชินีย่างน้ำฉ่ำ",
    "vi": "Bí ngòi nướng mọng nước",
    "en": "Juicy Grilled Zucchini",
    "zh": "爆汁櫛瓜",
    "ja": "ジューシー焼きズッキーニ",
    "ru": "Сочный цукини на углях",
    "es": "Calabacín Zucchini Jugoso a las Brasas"
  },
  "新鮮櫛瓜炭火烤至表皮微焦，內部依然飽滿多汁，清甜爽口。": {
    "ja": "新鮮なズッキーニを炭火で香ばしく焼き上げ、中は驚くほどジューシーでみずみずしい甘みが楽しめます。",
    "th": "ซูชินีสดใหม่ย่างถ่านจนผิวเกรียมเล็กน้อย แต่ด้านในยังชุ่มฉ่ำและหวานกรอบสดชื่น",
    "ko": "신선한 쥬키니 호박을 숯불에 겉은 노릇하게 굽고 속은 촉촉하게 채워 시원하고 달콤한 맛.",
    "vi": "Bí ngòi tươi nướng than hoa xém nhẹ bên ngoài, bên trong vẫn giữ được nước ngọt tự nhiên thanh mát.",
    "en": "Fresh zucchini grilled over charcoal until lightly charred, locking in sweet, refreshing juices.",
    "zh": "新鮮櫛瓜炭火烤至表皮微焦，內部依然飽滿多汁，清甜爽口。",
    "ru": "Свежий кабачок цукини, обжаренный на углях до легкой корочки. Внутри остается сочным, сладким и нежным.",
    "es": "Calabacín fresco asado a fuego vivo, ligeramente dorado por fuera y rebosante de dulzor y jugosidad en su interior."
  },
  "泰式豬肉.米線": {
    "vi": "Bún Thịt Heo Kiểu Thái",
    "th": "ขนมจีนหมูสไตล์ไทย",
    "ko": "타이 돼지고기 쌀국수",
    "zh": "泰式豬肉.米線",
    "en": "Thai Pork Rice Noodles",
    "ja": "タイ風豚肉ライスヌードル",
    "ru": "Рисовая вермишель со свининой по-тайски",
    "es": "Fideos de Arroz Finos con Cerdo al Estilo Tailandés"
  },
  "經典泰式冬蔭功湯底 配料:台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜": {
    "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ、もやし。",
    "en": "Classic Tom Yum soup base. Ingredients: Taiwanese pork belly slices, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage, bean sprouts.",
    "zh": "經典泰式冬蔭功湯底 配料:台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜",
    "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추, 숙주.",
    "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี, ถั่วงอก",
    "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải, giá đỗ.",
    "ru": "Классический тайский суп Том Ям с тонкой рисовой вермишелью, свиной грудинкой, рыбными шариками, базиликом и свежими овощами.",
    "es": "Sopa Tom Yum tradicional con fideos finos de arroz, panceta de cerdo taiwanesa, albóndigas de pescado, albahaca y verduras frescas."
  },
  "加河粉": {
    "zh": "加河粉",
    "en": "Add pho",
    "vi": "Thêm phở",
    "ko": "사진 추가",
    "th": "เพิ่มโพธิ์",
    "ja": "フォーを追加",
    "ru": "Добавить лапшу фо",
    "es": "Añadir fideos pho"
  },
  "加米線": {
    "ja": "ビーフンを加えます",
    "ko": "쌀국수 추가",
    "th": "ใส่เส้นก๋วยเตี๋ยว",
    "vi": "Thêm bún",
    "en": "Add rice noodles",
    "zh": "加米線",
    "ru": "Добавить рисовую вермишель",
    "es": "Añadir fideos de arroz"
  },
  "泰式豬肉.河粉": {
    "ja": "タイ風豚肉フォー",
    "zh": "泰式豬肉.河粉",
    "en": "Thai Pork Flat Noodles",
    "vi": "Phở Thịt Heo Kiểu Thái",
    "th": "เส้นเล็กหมูสไตล์ไทย",
    "ko": "타이 돼지고기 넙적 쌀국수",
    "ru": "Плоская рисовая лапша (Фо) со свининой по-тайски",
    "es": "Fideos Planos de Arroz con Cerdo al Estilo Tailandés"
  },
  "經典泰式冬蔭功湯底 配料台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜": {
    "zh": "經典泰式冬蔭功湯底 配料台灣豬五花肉片、鱈魚丸 貢丸、日本魚板、大陸妹、洋蔥 紅蘿蔔、九層塔、高麗菜 豆芽菜",
    "en": "Classic Tom Yum soup base. Ingredients: Taiwanese pork belly slices, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage, bean sprouts.",
    "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải, giá đỗ.",
    "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추, 숙주.",
    "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี, ถั่วงอก",
    "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ、もやし。",
    "ru": "Ароматный бульон Том Ям с широкой рисовой лапшой, нежной свининой, рыбными котлетками, тайским базиликом и капустой.",
    "es": "Caldo Tom Yum tailandés con fideos planos de arroz, láminas de cerdo, albóndigas de pescado, verduras y brotes de soja."
  },
  "街頭泰奶1L": {
    "th": "ชาไทยสตรีท 1 ลิตร",
    "ko": "스트리트 타이 밀크티 1L",
    "vi": "Trà Sữa Thái Đường Phố 1L",
    "en": "Street Thai Milk Tea 1L",
    "zh": "街頭泰奶1L",
    "ja": "屋台のタイティー1L",
    "ru": "Уличный тайский молочный чай (1 л)",
    "es": "Té con Leche Callejero Tailandés (1L)"
  },
  "網紅網帥拍照必備~茶香濃郁的經典泰奶~1000CC空桶回店回購再折30元!": {
    "th": "ไอเท็มเด็ดสำหรับสายคอนเทนต์~ ชาไทยสูตรดั้งเดิมเข้มข้น~ นำถังเปล่า 1,000 ซีซี กลับมาซื้อซ้ำ รับส่วนลดทันที 30 บาท!",
    "ko": "인플루언서 사진 필수템~ 진한 풍미의 클래식 타이 밀크티~ 1000cc 빈 통을 다시 가져오시면 다음 구매 시 30달러 할인!",
    "vi": "Vật dụng chụp ảnh không thể thiếu của các hot boy, hot girl~ Trà sữa Thái cổ điển đậm đà~ Mang vỏ xô 1000CC quay lại quán mua lần sau sẽ được giảm 30 Đài tệ!",
    "en": "A must-have for influencers~ Rich classic Thai milk tea~ Bring back the 1000CC empty bucket for a 30 NTD discount on your next purchase!",
    "zh": "網紅網帥拍照必備~茶香濃郁的經典泰奶~1000CC空桶回店回購再折30元!",
    "ja": "インフルエンサー必見～香り豊かな定番タイティー～1000CCの空容器をお店に持ってくると、次回購入時に30元割引！",
    "ru": "Знаменитый уличный тайский молочный чай в большом литровом ведерке! Густой, ароматный, с насыщенным вкусом черного чая и сгущенного молока.",
    "es": "El auténtico té con leche callejero de Bangkok en cubo de 1000cc. ¡Aroma intenso y sabor dulce y cremoso irresistible!"
  },
  "泰滿足海陸牛冬蔭功": {
    "ja": "大満足 海鮮＆牛肉 トムヤムクン",
    "vi": "Tom Yum Bò Trộn Hải Sản Thỏa Mãn",
    "ko": "만족스러운 해물 육류 소고기 똠얌꿍",
    "th": "ต้มยำเซิร์ฟแอนด์เทิร์ฟเนื้อวัวสุดคุ้ม",
    "zh": "泰滿足海陸牛冬蔭功",
    "en": "Satisfying Surf & Turf Beef Tom Yum",
    "ru": "Суп Том Ям «Морской и мясной» с говядиной",
    "es": "Sopa Tom Yum 'Mar y Tierra' con Res Choice"
  },
  "經典泰式冬蔭功湯底 配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜": {
    "ja": "定番トムヤムクンスープ。具材：アメリカ産チョイスグレードの肩ロース牛肉、エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
    "en": "Classic Tom Yum soup. Ingredients: US Choice chuck eye roll beef slices, shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
    "zh": "經典泰式冬蔭功湯底 配料: 美國嫩肩里肌choice牛肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
    "ko": "클래식 똠얌꿍 육수. 재료: 미국산 초이스 등급 척 아이 롤 소고기 슬라이스, 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
    "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: เนื้อวัวสันคอเกรดชอยส์จากสหรัฐฯ, กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
    "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt bò lõi vai Mỹ hạng Choice, tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải.",
    "ru": "Насыщенный бульон Том Ям с говядиной Choice, креветками, кольцами кальмара, моллюсками, рыбными шариками и овощами.",
    "es": "Sopa Tom Yum completa con láminas de res estadounidense Choice, camarones, calamares, almejas, albóndigas de pescado y vegetales mixtos."
  },
  "泰澎湃海陸豬冬蔭功": {
    "ko": "푸짐한 해물 육류 돼지고기 똠얌꿍",
    "th": "ต้มยำเซิร์ฟแอนด์เทิร์ฟหมูสุดอลังการ",
    "vi": "Tom Yum Heo Trộn Hải Sản Phong Phú",
    "en": "Abundant Surf & Turf Pork Tom Yum",
    "zh": "泰澎湃海陸豬冬蔭功",
    "ja": "豪華 海鮮＆豚肉 トムヤムクン",
    "ru": "Суп Том Ям «Морской и мясной» со свининой",
    "es": "Sopa Tom Yum 'Mar y Tierra' con Cerdo"
  },
  "經典泰式冬蔭功湯底 配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜": {
    "en": "Classic Tom Yum soup. Ingredients: Taiwanese pork belly slices, shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
    "zh": "經典泰式冬蔭功湯底 配料:台灣豬五花肉片 蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
    "th": "น้ำซุปต้มยำกุ้งสูตรต้นตำรับ ส่วนผสม: หมูสามชั้นไต้หวัน, กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
    "ko": "클래식 똠얌꿍 육수. 재료: 대만산 대패 삼겹살, 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
    "vi": "Nước súp Tom Yum cổ điển. Thành phần: Thịt ba chỉ Đài Loan, tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải.",
    "ja": "定番トムヤムクンスープ。具材：台湾産豚バラ肉、エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
    "ru": "Наваристый кисло-острый суп Том Ям со свиной грудинкой, креветками, кальмарами, моллюсками, рыбными слайсами и свежими травами.",
    "es": "Abundante sopa Tom Yum con panceta de cerdo fresca, camarones, aros de calamar, almejas, albóndigas de pescado y verduras de temporada."
  },
  "蔬菜拼盤": {
    "ja": "野菜の盛り合わせ",
    "vi": "Mâm Rau Củ Nướng",
    "ko": "채소 모둠",
    "th": "ชุดผักรวมย่าง",
    "zh": "蔬菜拼盤",
    "en": "Vegetable Platter",
    "ru": "Ассорти овощей на углях",
    "es": "Platón Variado de Vegetales a las Brasas"
  },
  "店家隨機出4種不同80元的碳烤蔬菜": {
    "en": "Chef's random selection of 4 different charcoal-grilled vegetables worth 80 NTD.",
    "zh": "店家隨機出4種不同80元的碳烤蔬菜",
    "th": "ทางร้านจะสุ่มเลือกผักย่างเตาถ่าน 4 ชนิด มูลค่า 80 บาท",
    "ko": "셰프가 랜덤으로 제공하는 4가지 숯불구이 채소 (80대만달러 상당).",
    "vi": "Quán chọn ngẫu nhiên 4 loại rau củ nướng than hoa trị giá 80 Đài tệ.",
    "ja": "シェフがお任せで選ぶ4種類の炭火焼き野菜（80元相当）。",
    "ru": "Ассорти из 4 видов сезонных овощей, запеченных на углях со специальным соусом.",
    "es": "Selección especial del chef con 4 tipos de verduras frescas asadas a las brasas con salsa aromática."
  },
  "澳洲小羊肩排2P": {
    "ja": "オーストラリア産ラム肩ロースステーキ 2P",
    "ko": "호주산 양어깨갈비 2P",
    "th": "ซี่โครงไหล่แกะออสเตรเลียย่าง 2 ชิ้น",
    "vi": "Sườn vai cừu Úc 2P",
    "en": "Australian Lamb Shoulder Chops 2P",
    "zh": "澳洲小羊肩排2P",
    "ru": "Австралийские бараньи ребрышки на кости (2 шт.)",
    "es": "Chuletas de Cordero Australiano a la Parrilla (2 pzas)"
  },
  "嚴選澳洲小羊肩排，炭火慢烤，撒上孜然，香氣四溢，每一口都是極致鮮美味": {
    "zh": "嚴選澳洲小羊肩排，炭火慢烤，撒上孜然，香氣四溢，每一口都是極致鮮美味",
    "en": "Strictly selected Australian lamb shoulder chops, slowly grilled over charcoal and sprinkled with cumin. Rich in aroma, every bite is an ultimate delicious experience.",
    "vi": "Sườn vai cừu Úc tuyển chọn, nướng chậm trên bếp than, rắc thêm bột thì là thơm phức, mỗi miếng cắn đều mang lại vị tươi ngon cực đỉnh.",
    "ko": "엄선된 호주산 양어깨갈비를 숯불에 천천히 구워 큐민을 뿌렸습니다. 향긋함이 가득하여 한 입마다 극상의 신선하고 맛있는 풍미를 선사합니다.",
    "th": "คัดสรรซี่โครงไหล่แกะออสเตรเลียอย่างดี ย่างถ่านอย่างช้าๆ โรยด้วยยี่หร่า กลิ่นหอมกรุ่น ทุกคำคือความอร่อยระดับสุดยอด",
    "ja": "厳選されたオーストラリア産ラム肩ロースを炭火でじっくり焼き上げ、クミンを散らしました。豊かな香りが広がり、一口ごとに極上の美味しさをお楽しみいただけます。",
    "ru": "Отборные бараньи ребрышки на гриле с ароматным зирой. Сочное, мягкое мясо без неприятного запаха.",
    "es": "Chuletas de cordero lechal australiano asadas a fuego lento con comino y especias aromáticas, tiernas y jugosas."
  },
  "泰式生蠔11p": {
    "zh": "泰式生蠔11p",
    "en": "Thai Oysters (11 pcs)",
    "vi": "Hàu Thái (11 con)",
    "th": "หอยนางรมไทย 11 ตัว",
    "ko": "타이식 굴 (11조각)",
    "ja": "タイ風生牡蠣11個",
    "ru": "Свежие тайские устрицы (11 шт. — 10 + 1 в подарок)",
    "es": "Ostras Frescas al Estilo Tailandés (11 pzas - Promo 10+1)"
  },
  "(買十送一)嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤": {
    "vi": "(Mua 10 tặng 1) Hàu Miyagi size L tuyển chọn! Vị biển sữa! Món tủ của quán! Có thể ăn sống hoặc nướng than hoa.",
    "ko": "(10+1 이벤트) 엄선된 L사이즈 미야기현 굴! 우유처럼 부드러운 바다의 맛! 시그니처 메뉴! 생으로 먹거나 숯불에 구워 드실 수 있습니다.",
    "th": "(ซื้อ 10 แถม 1) หอยนางรมมิยางิไซส์ L คัดพิเศษ รสชาติน้ำนมทะเล! เมนูเด็ดประจำร้าน! ทานดิบหรือย่างเตาถ่านก็ได้",
    "zh": "(買十送一)嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
    "en": "(Buy 10 get 1 free) Premium L-size Miyagi oysters! Milky ocean flavor! Signature dish! Can be eaten raw or charcoal-grilled.",
    "ja": "（10個買うと1個無料）厳選されたLサイズの宮城産牡蠣！ミルキーな海の味！看板メニュー！生食も炭火焼きも可能。",
    "ru": "Отборные крупные устрицы размера L из префектуры Мияги со сливочным вкусом моря. Можно есть свежими или запечь на углях!",
    "es": "Ostras gigantes talla L importadas de Miyagi con sabor lechoso a mar. Se pueden disfrutar crudas con salsa thai o asadas al carbón."
  },
  "客家幣": {
    "vi": "tiền Khách Gia",
    "th": "สกุลเงินฮากกา",
    "ko": "하카화폐",
    "zh": "客家幣",
    "en": "Hakka Coin Coupon",
    "ja": "客家の通貨",
    "ru": "Купон Hakka Coin",
    "es": "Cupón de Descuento Moneda Hakka"
  },
  "多肉B餐": {
    "ja": "肉づくし Bセット",
    "zh": "多肉B餐",
    "en": "Meat Lover's Set B Combo",
    "vi": "Set Thịt Đầy Đặn B",
    "th": "เซตคนรักเนื้อ B",
    "ko": "고기 가득 B세트",
    "ru": "Мясной сет B «Любитель мяса»",
    "es": "Set B 'Amantes de la Carne'"
  },
  "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了": {
    "th": "เนื้อวัวแฮนด์เมดไทย x1, เนื้อซี่โครง x1, ซี่โครงแกะ x1, ตูดไก่ x1, ไส้ใหญ่ย่าง x1, ไส้กรอกชีส x1, หนังไก่กรอบ x1 เซตนี้จบสำหรับคนเลือกไม่ถูก!",
    "ko": "태국 수제 소고기×1, 소갈비꼬치×1, 어린양갈비꼬치×1, 닭꼬리꼬치×1, 엄선 대창꼬치×1, 육즙 소세지꼬치×1, 바삭 닭껍질×1. 결정 장애가 있을 땐 이 세트!",
    "vi": "Bò thủ công Thái x1, Xiên sườn bò x1, Xiên sườn cừu x1, Xiên phao câu gà x1, Xiên dồi trường x1, Xiên xúc xích mọng nước x1, Da gà giòn x1. Sự lựa chọn hoàn hảo khi không biết ăn gì!",
    "en": "Thai Handmade Beef x1, Beef Rib Skewer x1, Lamb Chop Skewer x1, Chicken Butt Skewer x1, Crispy Pork Intestine Skewer x1, Juicy Sausage Skewer x1, Crispy Chicken Skin x1. The ultimate combo for undecided eaters!",
    "zh": "泰式手工牛×1原塊牛肋串×1 小羔羊肋串×1\n肉雞七里香串×1精選肥腸串×1噴水香腸串×1啃的雞皮×1 選擇障礙的點它就是了",
    "ja": "タイ風手作り牛肉×1、牛カルビ串×1、子羊カルビ串×1、ぼんじり串×1、厳選肥腸串×1、ジューシーソーセージ串×1、パリパリ鶏皮×1。迷ったらこれ！",
    "ru": "Идеальный выбор: 1 тайский шашлык из рубленой говядины, 1 говяжьи ребрышки, 1 шашлык из ягненка, 1 хрустящие куриные хвостики, 1 пряные свиные потрошки, 1 сочная тайская сосиска и 1 хрустящая куриная кожа.",
    "es": "El combo definitivo para carnívoros: 1 brocheta de res thai, 1 costilla de res, 1 cordero, 1 colita de pollo, 1 tripa crujiente, 1 salchicha jugosa y 1 piel de pollo asada."
  },
  "大摩12年": {
    "ja": "ダルモア 12年",
    "zh": "大摩12年",
    "en": "The Dalmore 12 Years Whisky",
    "vi": "Rượu Dalmore 12 Năm",
    "ko": "달모어 12년",
    "th": "ดาลมอร์ 12 ปี",
    "ru": "Виски The Dalmore 12 лет",
    "es": "Whisky The Dalmore 12 Años"
  },
  "蘇格登13年": {
    "ja": "シングルトン 13年",
    "zh": "蘇格登13年",
    "en": "The Singleton 13 Years Whisky",
    "vi": "Rượu Singleton 13 Năm",
    "ko": "싱글톤 13년",
    "th": "เดอะ ซิงเกิลตัน 13 ปี",
    "ru": "Виски The Singleton 13 лет",
    "es": "Whisky The Singleton 13 Años"
  },
  "蘇格登12年": {
    "ko": "싱글톤 12년 위스키",
    "th": "เดอะ ซิงเกิลตัน 12 ปี",
    "vi": "Rượu Singleton 12 Năm",
    "en": "The Singleton 12 Years Whisky",
    "zh": "蘇格登12年",
    "ja": "ザ・シングルトン 12年",
    "ru": "Виски The Singleton 12 лет",
    "es": "Whisky The Singleton 12 Años"
  },
  "有機玉米筍": {
    "en": "Organic Baby Corn",
    "zh": "有機玉米筍",
    "ko": "유기농 옥수수순",
    "th": "หน่อข้าวโพดออร์แกนิก",
    "vi": "Măng ngô hữu cơ",
    "ja": "有機トウモロコシの芽",
    "ru": "Органическая мини-кукуруза на углях",
    "es": "Mazorquitas de Maíz Tierno Orgánico a las Brasas"
  },
  "<非基改>不油不膩~香甜可口~營養價高": {
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "<非基改>不油不膩~香甜可口~營養價高",
    "th": "<Non-GMO> ไม่มันเยิ้ม ~ หวานอร่อย ~ มีคุณค่าทางโภชนาการสูง",
    "ko": "<Non-GMO> 느끼하지도 기름지지도 않은 ~ 달콤하고 맛있는 ~ 영양가 높은",
    "vi": "<Non-GMO> Không béo ngậy ~ ngọt ngào thơm ngon ~ giá trị dinh dưỡng cao",
    "ja": "＜非遺伝子組み換え＞脂っこくない～甘くて美味しい～栄養価が高い",
    "ru": "Не ГМО. Сочная, сладкая, легкая и полезная закуска с высоким содержанием питательных веществ.",
    "es": "Maíz baby orgánico no transgénico, crujiente, naturalmente dulce y lleno de nutrientes."
  },
  "澎湖花枝丸": {
    "ja": "澎湖華志湾",
    "zh": "澎湖花枝丸",
    "en": "Penghu Cuttlefish Balls",
    "vi": "Bành Hồ Huazhiwan",
    "ko": "펑후 화지완",
    "th": "เผิงหู หัวจือวาน",
    "ru": "Шарики из каракатицы по-пэнхусски",
    "es": "Albóndigas de Sepia Artesanales de Penghu"
  },
  "嚴選澎湖海味~吃得到塊狀花枝": {
    "zh": "嚴選澎湖海味~吃得到塊狀花枝",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Hải sản được lựa chọn cẩn thận từ Bành Hồ ~ bạn có thể ăn thành từng miếng",
    "th": "อาหารทะเลที่คัดสรรอย่างพิถีพิถันจากเผิงหู~ ทานเป็นชิ้นๆ ได้เลย",
    "ko": "펑후에서 엄선한 해산물~ 덩어리째 드실 수 있어요",
    "ja": "澎湖産の厳選海鮮～塊で食べられる",
    "ru": "Знаменитые шарики с островов Пэнху с кусочками настоящей каракатицы, упругие и сочные.",
    "es": "Albóndigas marinas de Penghu elaboradas con trozos auténticos de sepia/calamar, elásticas y sabrosas."
  },
  "碳烤爽脆高麗菜": {
    "ja": "炭焼きシャキシャキキャベツ",
    "th": "กะหล่ำปลีย่างเตาถ่านกรุบกรอบ",
    "ko": "숯불구이 아삭 양배추",
    "vi": "Bắp Cải Nướng Than Hoa Giòn Rụm",
    "en": "Charcoal-Grilled Crispy Cabbage",
    "zh": "碳烤爽脆高麗菜",
    "ru": "Хрустящая высокогорная капуста на углях",
    "es": "Col Crujiente de Alta Montaña a las Brasas"
  },
  "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?": {
    "zh": "炭烤高山高麗菜~烤好清脆香甜~別家應該沒有賣~不吃看看?",
    "en": "Charcoal-grilled high-mountain cabbage~ Crispy and sweet~ You won't find this anywhere else~ Want to give it a try?",
    "vi": "Bắp cải vùng cao nướng than hoa~ Nướng xong giòn ngọt~ Chắc quán khác không có đâu~ Thử một chút nhé?",
    "th": "กะหล่ำปลีภูเขาย่างเตาถ่าน~ กรุบกรอบหวานอร่อย~ ร้านอื่นไม่มีขายแน่นอน~ ลองชิมดูไหม?",
    "ko": "숯불에 구운 고산지대 양배추~ 아삭하고 달콤합니다~ 다른 곳에는 없는 특별한 메뉴~ 한 번 드셔보시겠어요?",
    "ja": "炭火焼きの高山キャベツ～シャキシャキで甘い～他のお店ではなかなか売っていません～食べてみませんか？",
    "ru": "Сладкая и хрустящая капуста, запеченная на углях с фирменным соусом. Уникальное блюдо, которое стоит попробовать!",
    "es": "Col dulce de alta montaña asada al carbón, crujiente y aromática. ¡Una delicia vegetal única de la casa!"
  },
  "炭燒奶茶(壺)": {
    "zh": "炭燒奶茶(壺)",
    "en": "Charcoal Smoked Thai Tea (Pot)",
    "vi": "Trà sữa Thái rang than (Ấm)",
    "th": "ชานมไทยคั่วเตาถ่าน (หม้อ)",
    "ko": "숯불 타이 밀크티 (포트)",
    "ja": "炭火焙煎タイミルクティー（ポット）",
    "ru": "Тайский чай с дымком на углях (чайник)",
    "es": "Té con Leche Ahumado al Carbón (Tetera)"
  },
  "泰式奶茶使用碳火慢燒! 風味獨特 值得一試": {
    "en": "Refreshing and cool, a perfect match for BBQ",
    "zh": "泰式奶茶使用碳火慢燒! 風味獨特 值得一試",
    "ko": "숯불에 천천히 끓여낸 태국식 밀크티! 독특한 맛은 시도해 볼 가치가 있습니다",
    "th": "ชานมไทยปรุงช้าๆด้วยไฟถ่าน! รสชาติที่เป็นเอกลักษณ์คุ้มค่าแก่การลอง",
    "vi": "Trà sữa Thái nấu chậm trên lửa than! Hương vị độc đáo đáng để thử",
    "ja": "炭火でじっくり煮込んだタイミルクティー！独特の風味は試してみる価値あり",
    "ru": "Фирменный тайский молочный чай, прогретый на медленных углях для получения неповторимого дымного аромата.",
    "es": "Té tailandés preparado a fuego lento sobre brasas de carbón, con un toque ahumado distintivo y reconfortante."
  },
  "泰辣醬": {
    "vi": "Sốt Cay Thái",
    "th": "น้ำจิ้มเผ็ดสไตล์ไทย",
    "ko": "타이 매운 소스",
    "zh": "泰辣醬",
    "en": "Thai Spicy Sauce",
    "ja": "タイ風チリソース",
    "ru": "Тайский суперострый соус",
    "es": "Salsa Extra Picante Tailandesa"
  },
  "嚴選3種辣椒精心炒製，口感層次豐富，嗜辣者必嚐": {
    "ja": "厳選された3種類の唐辛子を丁寧に炒め、豊かな風味を実現。辛いもの好きにはたまりません。",
    "zh": "嚴選3種辣椒精心炒製，口感層次豐富，嗜辣者必嚐",
    "en": "Carefully stir-fried with 3 types of selected chili peppers, offering a rich layered taste. A must-try for spicy food lovers.",
    "vi": "Rang tỉ mỉ với 3 loại ớt được lựa chọn kỹ càng, hương vị phong phú. Người thích ăn cay nhất định phải thử.",
    "ko": "엄선된 3가지 고추를 볶아 만든 풍부한 맛. 매운맛 애호가라면 꼭 맛보세요.",
    "th": "ผัดคลุกเคล้ากับพริก 3 ชนิดที่คัดสรรมาอย่างดี รสชาติเข้มข้นกลมกล่อม สายกินเผ็ดต้องลอง",
    "ru": "Приготовлен из 3 сортов отборного перца чили. Насыщенный многослойный вкус для настоящих любителей острого.",
    "es": "Elaborada con 3 variedades de chiles selectos salteados a fuego vivo. Compleja y picante para amantes del fuego."
  },
  "手撕大魷魚干": {
    "ja": "大スルメ手切り",
    "zh": "手撕大魷魚干",
    "en": "Shredded Dried Giant Squid",
    "vi": "Mực khô lớn xé tay",
    "th": "ปลาหมึกแห้งขนาดใหญ่ฉีกด้วยมือ",
    "ko": "손으로 잘게 썬 대형 말린 오징어",
    "ru": "Вяленый рваный кальмар к пиву",
    "es": "Calamar Seco Deshebrado a Mano"
  },
  "下酒必點!老饕最愛!": {
    "ja": "ドリンクと一緒に注文必須！食通の間で大人気！",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "下酒必點!老饕最愛!",
    "th": "ต้องสั่งพร้อมเครื่องดื่ม! ของโปรดในหมู่นักชิม!",
    "ko": "음료와 함께 꼭 주문해야해요! 미식가들 사이에서 가장 인기 있는 곳!",
    "vi": "Phải đặt hàng với đồ uống! Một yêu thích của những người sành ăn!",
    "ru": "Идеальная закуска к пиву и напиткам, любимое лакомство гурманов.",
    "es": "La botana perfecta para acompañar la cerveza fría, sabor concentrado a mar y textura masticable inigualable."
  },
  "炙燒生食級干貝3P": {
    "zh": "炙燒生食級干貝3P",
    "en": "Seared Sashimi Grade Scallops (3pcs)",
    "vi": "Sò điệp ăn sống khò lửa (3 con)",
    "th": "หอยเชลล์เกรดซาซิมิเบิร์นไฟ (3 ชิ้น)",
    "ko": "직화 아부리 생식용 가리비 관자 (3개)",
    "ja": "炙り生食可能ホタテ (3個)",
    "ru": "Обожженные морские гребешки сашими (3 шт.)",
    "es": "Vieiras Grado Sashimi Selladas a la Flama (3 pzas)"
  },
  "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味": {
    "ja": "海鮮好き必見！タイ風レモンソース付き、炙り立ての香ばしい香りと絶品の味わい。",
    "zh": "愛吃海味必點!搭配檸檬泰式醬汁\n炙燒過後香氣四溢，每一口都是極致美味",
    "en": "Must-try for seafood lovers! Served with Thai lemon sauce, seared to perfection with mouthwatering aroma in every bite.",
    "vi": "Món nướng hải sản không thể bỏ qua! Kèm sốt chanh Thái, khò lửa thơm nức nát, ngon tuyệt hảo từng miếng.",
    "ko": "해산물 마니아 필수 주문! 태국식 레몬 소스와 함께 직화로 구워 향긋함이 가득한 극상의 맛.",
    "th": "สายอาหารทะเลต้องสั่ง! ทานคู่ซอสมะนาวสไตล์ไทย เบิร์นไฟหอมฟุ้ง อร่อยละมุนทุกคำ",
    "ru": "Обожженные на открытом огне гребешки высшего качества, подаются с тайским лаймовым соусом. Нежные, сладкие и тающие во рту.",
    "es": "Vieiras gigantes grado sashimi braseadas a fuego vivo, acompañadas de salsa tailandesa de lima. Dulces y tiernas."
  },
  "泰辣扇貝9P": {
    "zh": "泰辣扇貝9P",
    "en": "Spicy Thai Scallops (9pcs)",
    "vi": "Sò điệp cay Thái 9P",
    "ko": "태국식 매운 가리비 9P",
    "th": "หอยเชลล์เผ็ดไทย 9P",
    "ja": "タイ産スパイシーホタテ貝柱 9P",
    "ru": "Острые тайские морские гребешки без раковин (9 шт.)",
    "es": "Vieiras Picantes al Estilo Tailandés Desconchadas (9 pzas)"
  },
  "嗜辣者必嚐!下酒必備 已去殼": {
    "ja": "辛いもの好きな方はぜひ試してみてください！お酒を飲む際の必需品。すでに殻をむいています",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "嗜辣者必嚐!下酒必備 已去殼",
    "th": "สำหรับผู้ที่ชอบอาหารรสเผ็ดต้องลอง! เป็นสิ่งที่ต้องมีสำหรับการดื่ม ปอกเปลือกแล้ว",
    "ko": "매운음식 좋아하시는 분들 꼭 드셔보세요! 술을 마실 때 꼭 필요한 것. 이미 껍질이 벗겨졌어",
    "vi": "Món ăn nhất định phải thử dành cho những ai thích ăn cay! Phải có để uống. Đã bóc vỏ",
    "ru": "Очищенные гребешки в пикантном тайском соусе. Острая и ароматная закуска к пиву.",
    "es": "Vieiras sin concha salteadas en salsa picante tailandesa. Una botana llena de sabor y toque picante."
  },
  "椰碳烤大草蝦6P": {
    "vi": "Tôm nướng than dừa 6P",
    "ko": "코코넛 숯불 새우구이 6P",
    "th": "กุ้งเผาถ่านมะพร้าว6P",
    "zh": "椰碳烤大草蝦6P",
    "en": "Coconut Charcoal Grilled Tiger Prawns (6pcs)",
    "ja": "エビのココナッツ炭火焼き 6P",
    "ru": "Тигровые креветки на кокосовых углях (6 шт.)",
    "es": "Camarones Tigre Gigantes al Carbón de Coco (6 pzas)"
  },
  "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心": {
    "ja": "大海老のグリル6尾～ひげと鋭い棘はカットしてあります～殻を剥くときは注意してください",
    "ko": "큰새우구이 6개~수염과 날카로운 가시는 잘랐지만 껍질벗길때 조심하세요",
    "th": "กุ้งเผาตัวใหญ่ 6 ตัว ~ หนวดและหนามแหลมถูกตัด ~ แต่ต้องระวังตอนปอกเปลือก",
    "vi": "6 con tôm lớn nướng ~ râu và gai nhọn đã được cắt bỏ ~ nhưng hãy cẩn thận khi bóc vỏ",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "烤大草蝦6支~已經剪掉鬚鬚跟尖尖的刺~但剝殼一樣要小心",
    "ru": "6 крупных тигровых креветок, запеченных на кокосовых углях. Усы и шипы аккуратно удалены перед подачей.",
    "es": "6 camarones tigre gigantes asados al carbón de cáscara de coco, preparados y recortados para fácil pelado."
  },
  "泰醇奶酒5.6%": {
    "zh": "泰醇奶酒5.6%",
    "en": "Thai Cream Liqueur 5.6%",
    "vi": "Rượu sữa Đài Xuân 5,6%",
    "ko": "타이춘 밀크와인 5.6%",
    "th": "ไวน์นมไท่ชุน 5.6%",
    "ja": "台中ミルクワイン 5.6%",
    "ru": "Тайский сливочный ликер 5.6%",
    "es": "Licor de Crema Tailandés 5.6%"
  },
  "泰式風味奶酒!妹酒 微醺最佳選擇": {
    "en": "Refreshing and cool, a perfect match for BBQ",
    "zh": "泰式風味奶酒!妹酒 微醺最佳選擇",
    "ko": "태국맛 밀크와인! 자매 와인은 취한 사람들에게 최고의 선택입니다",
    "th": "ไวน์นมรสไทย! ซิสเตอร์ไวน์คือตัวเลือกที่ดีที่สุดสำหรับคนขี้เมา",
    "vi": "Rượu sữa hương vị Thái! Rượu chị là sự lựa chọn tốt nhất cho người say",
    "ja": "タイ風味のミルクワイン！ほろ酔いには姉妹ワインが最適",
    "ru": "Слабоалкогольный сливочный напиток с шелковистым вкусом для легкого расслабления.",
    "es": "Bebida láctea ligeramente espirituosa con 1.4% de alcohol, fresca y aterciopelada."
  },
  "泰醇奶酒1.4%": {
    "ja": "台中ミルクワイン 1.4%",
    "en": "Thai Cream Liqueur 1.4%",
    "zh": "泰醇奶酒1.4%",
    "th": "ไวน์นมไท่ชุน 1.4%",
    "ko": "타이춘 밀크와인 1.4%",
    "vi": "Rượu sữa Đài Xuân 1,4%",
    "ru": "Тайский сливочный ликер 1.4% (слабоалкогольный)",
    "es": "Licor de Crema Tailandés Suave 1.4%"
  },
  "果汁氣泡水": {
    "ja": "ジュース・スパークリングウォーター",
    "zh": "果汁氣泡水",
    "en": "Fruit Juice Sparkling Water",
    "vi": "Nước ép có ga",
    "ko": "주스 탄산수",
    "th": "น้ำผลไม้เป็นประกาย",
    "ru": "Газированная фруктовая вода",
    "es": "Agua con Gas de Jugo de Frutas"
  },
  "海尼根": {
    "ja": "ハイネケン",
    "th": "ไฮเนเก้น",
    "ko": "하이네켄",
    "vi": "Heineken",
    "en": "Heineken Beer",
    "zh": "海尼根",
    "ru": "Пиво Heineken",
    "es": "Cerveza Heineken"
  },
  "邪惡熱狗豬血糕": {
    "ja": "邪悪なホットドッグの豚血ケーキ",
    "vi": "Bánh huyết heo xúc xích ác quỷ",
    "ko": "사악한 핫도그 돼지 혈액 케이크",
    "th": "เค้กเลือดหมูฮอทด็อกชั่วร้าย",
    "zh": "邪惡熱狗豬血糕",
    "en": "Hot Dog & Pork Blood Cake Skewer",
    "ru": "Шпажка с хот-догом и тайваньским свиным кровяным рисом",
    "es": "Brocheta Mixta de Pastel de Arroz con Sangre de Cerdo y Salchicha"
  },
  "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!": {
    "zh": "豬血糕+熱狗組合 大人小孩都愛♥️今天就別管熱量了吧!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Sự kết hợp bánh tiết heo + xúc xích được cả người lớn và trẻ em yêu thích♥️Đừng lo lắng về lượng calo hôm nay nhé!",
    "th": "เค้กเลือดหมู + ฮอทด็อกเป็นที่ชื่นชอบของทั้งเด็กและผู้ใหญ่ ♥️วันนี้ไม่ต้องกังวลเรื่องแคลอรี่!",
    "ko": "돼지피케이크+핫도그 조합은 어른도 아이도 모두 좋아하는 조합♥️오늘은 칼로리 걱정하지 마세요!",
    "ja": "豚の血ケーキ＋ホットドッグの組み合わせは大人も子供も大好き♥️今日はカロリーを気にせず！",
    "ru": "Популярное тайваньское лакомство: рисовый пирог на крови со свиной сосиской на углях под пряным соусом.",
    "es": "Famoso aperitivo nocturno taiwanés: pastel de arroz glutinoso con sangre de cerdo y salchicha asada a las brasas."
  },
  "可樂娜": {
    "zh": "可樂娜",
    "en": "Corona Extra Beer",
    "vi": "Corona",
    "ko": "코로나",
    "th": "โคโรนา",
    "ja": "コロナ",
    "ru": "Пиво Corona Extra",
    "es": "Cerveza Corona Extra"
  },
  "tip": {
    "zh": "tip",
    "en": "Staff Tip / Service Gratitude",
    "vi": "tiền boa",
    "th": "ทิป",
    "ko": "팁",
    "ja": "ヒント",
    "ru": "Чаевые персоналу (Благодарность)",
    "es": "Propina para el Personal / Agradecimiento"
  },
  "白鶴清酒": {
    "vi": "Rượu Sake Hakutsuru",
    "ko": "하쿠츠루 사케",
    "th": "สาเก ฮาคุรุ",
    "zh": "白鶴清酒",
    "en": "Hakutsuru Japanese Sake",
    "ja": "白鶴 清酒",
    "ru": "Японское саке Hakutsuru",
    "es": "Sake Japonés Hakutsuru"
  },
  "加熱": {
    "ja": "暖房",
    "zh": "加熱",
    "en": "heating",
    "vi": "sưởi ấm",
    "ko": "난방",
    "th": "เครื่องทำความร้อน",
    "ru": "Подогреть",
    "es": "Calentar"
  },
  "愛之味麥茶": {
    "ja": "恋の麦茶の味",
    "vi": "Hương trà lúa mạch tình yêu",
    "ko": "사랑의 맛 보리차",
    "th": "รสชาติของชาข้าวบาร์เลย์แห่งความรัก",
    "zh": "愛之味麥茶",
    "en": "AGV Barley Tea",
    "ru": "Ячменный чай AGV (без кофеина)",
    "es": "Té de Cebada Tostada AGV"
  },
  "百威": {
    "ja": "バドワイザー",
    "zh": "百威",
    "en": "Budweiser Beer",
    "vi": "Budweiser",
    "ko": "버드와이저",
    "th": "บัดไวเซอร์",
    "ru": "Пиво Budweiser",
    "es": "Cerveza Budweiser"
  },
  "牛小排冬蔭功湯": {
    "ja": "牛カルビ トムヤムクン",
    "zh": "牛小排冬蔭功湯",
    "en": "Beef Short Rib Tom Yum Soup",
    "vi": "Súp Tom Yum Sườn Bò",
    "ko": "소갈비 똠얌꿍 수프",
    "th": "ต้มยำซี่โครงวัว",
    "ru": "Суп Том Ям с говяжьими ребрышками (5.2 унции)",
    "es": "Sopa Tom Yum con Costilla de Res Choice (5.2 oz)"
  },
  "5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底": {
    "ja": "5.2オンスのチョイスグレード牛カルビ（水注入や成型肉ではありません）を炭火で焼いてからスープに投入！食通の定番♥️本格的な濃厚タイ風スープ。",
    "vi": "Sườn bò Choice 5.2 oz (không bơm nước, không phải thịt tái tổ hợp) được nướng than hoa trước khi cho vào súp! Món ăn yêu thích của những người sành ăn♥️ Nước dùng đậm đà hương vị Thái Lan.",
    "th": "ซี่โครงวัวเกรดชอยส์ 5.2 ออนซ์ (ไม่ฉีดน้ำ ไม่ใช่เนื้อดัดแปลง) นำไปย่างเตาถ่านก่อนใส่ลงในซุป! เมนูโปรดของสายกิน♥️ น้ำซุปเข้มข้นสไตล์ไทยแท้",
    "ko": "5.2온스 초이스 등급 소갈비(물 주입 및 가공육 아님)를 숯불에 구워 육수에 넣었습니다! 미식가들의 최애 ♥️ 정통 타이식 진한 국물.",
    "zh": "5.2盎司牛小排 (無灌水非重組肉choice等級)炭烤過在入湯！饕客的最愛♥️道地泰式濃郁湯底",
    "en": "5.2 oz Choice-grade beef short ribs (no water injection, non-reconstituted meat), charcoal-grilled then added to the soup! A foodie's favorite ♥️ Authentic rich Thai broth.",
    "ru": "5.2 унции отборных говяжьих ребрышек Choice, запеченных на углях и добавленных в насыщенный бульон Том Ям.",
    "es": "5.2 onzas de costilla de res Choice asada al carbón sumergida en auténtico caldo Tom Yum tailandés aromático y reconfortante."
  },
  "泰式牛小排.米線": {
    "zh": "泰式牛小排.米線",
    "en": "Thai Beef Short Rib Rice Noodles",
    "vi": "Bún Sườn Bò Kiểu Thái",
    "th": "ขนมจีนซี่โครงวัวสไตล์ไทย",
    "ko": "타이 소갈비 쌀국수",
    "ja": "タイ風牛カルビライスヌードル",
    "ru": "Рисовая вермишель с говяжьими ребрышками по-тайски",
    "es": "Fideos Finos de Arroz con Costilla de Res al Estilo Tailandés"
  },
  "5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃": {
    "en": "5.2 oz Choice-grade beef short ribs (no water injection, non-reconstituted meat), charcoal-grilled then added to the soup! A foodie's favorite ♥️ Authentic Thai noodle soup, rich broth to warm your heart and stomach.",
    "zh": "5.2盎司牛小排 (無灌水非重組肉choice等級)碳烤過在入湯！饕客的最愛♥️道地泰式風味湯麵，濃郁湯底暖心暖胃",
    "th": "ซี่โครงวัวเกรดชอยส์ 5.2 ออนซ์ (ไม่ฉีดน้ำ ไม่ใช่เนื้อดัดแปลง) นำไปย่างเตาถ่านก่อนใส่ลงในซุป! เมนูโปรดของสายกิน♥️ ก๋วยเตี๋ยวน้ำใสสไตล์ไทยแท้ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
    "ko": "5.2온스 초이스 등급 소갈비(물 주입 및 가공육 아님)를 숯불에 구워 육수에 넣었습니다! 미식가들의 최애 ♥️ 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
    "vi": "Sườn bò Choice 5.2 oz (không bơm nước, không phải thịt tái tổ hợp) được nướng than hoa trước khi cho vào súp! Món ăn yêu thích của những người sành ăn♥️ Phở nước kiểu Thái chính tông, nước dùng đậm đà làm ấm lòng người.",
    "ja": "5.2オンスのチョイスグレード牛カルビ（水注入や成型肉ではありません）を炭火で焼いてからスープに投入！食通の定番♥️本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
    "ru": "5.2 унции говяжьих ребрышек Choice с широкой лапшой в согревающем кисло-пряном бульоне.",
    "es": "Fideos de arroz planos con 5.2 oz de jugosa costilla de res a las brasas y caldo tradicional tailandés."
  },
  "泰式牛小排.河粉": {
    "ja": "タイ風牛カルビフォー",
    "en": "Thai Beef Short Rib Flat Noodles",
    "zh": "泰式牛小排.河粉",
    "th": "เส้นเล็กซี่โครงวัวสไตล์ไทย",
    "ko": "타이 소갈비 넙적 쌀국수",
    "vi": "Phở Sườn Bò Kiểu Thái",
    "ru": "Плоская рисовая лапша с говяжьими ребрышками по-тайски",
    "es": "Fideos Planos de Arroz con Costilla de Res al Estilo Tailandés"
  },
  "泰式生蠔3p": {
    "zh": "泰式生蠔3p",
    "en": "Thai Style Fresh Oysters (3pcs Combo)",
    "vi": "Hàu Thái 3p",
    "th": "หอยนางรมไทย3p",
    "ko": "태국 굴 3p",
    "ja": "タイオイスター3P",
    "ru": "Тайские свежие устрицы (сет из 3 шт.)",
    "es": "Ostras Frescas al Estilo Tailandés (Set de 3 pzas)"
  },
  "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤": {
    "ja": "＜お得な3点セット＞Lサイズの宮城産牡蠣・牛乳・魚介類を厳選！お店のサインも！\n生でも焼いても食べられる",
    "ko": "<3종 할인세트> 엄선된 L 사이즈 미야기현 굴과 우유, 해산물! 매장의 시그니처!\n생으로 먹어도 되고 구워서 먹어도 된다",
    "th": "<ชุดลดราคาสามชิ้น> หอยนางรมมิยากิ นม และอาหารทะเลขนาด L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน!\nสามารถรับประทานดิบหรือย่างได้",
    "vi": "<Bộ giảm giá ba món> Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng!\nCó thể ăn sống hoặc nướng",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "<三顆優惠組>嚴選L號宮城生蠔 牛奶海味!店內招牌! \n可生食 可碳烤",
    "ru": "Сет из 3 крупных японских устриц размера L из Мияги с морским вкусом. Подаются свежими или запеченными на гриле.",
    "es": "Paquete de 3 ostras gigantes de Miyagi talla L con salsa tailandesa cítrica picante. Listas para consumir crudas o a la parrilla."
  },
  "冰水(大)": {
    "ja": "氷水（大）",
    "vi": "Nước đá (lớn)",
    "ko": "얼음물(대)",
    "th": "น้ำแข็งใส (ใหญ่)",
    "zh": "冰水(大)",
    "en": "Large Ice Water",
    "ru": "Ледяная вода (Большая)",
    "es": "Agua Helada (Grande)"
  },
  "開瓶費1支": {
    "vi": "Phí đóng chai 1 chai",
    "ko": "코르키지 요금 1병",
    "th": "ค่าเปิดขวด 1 ขวด",
    "zh": "開瓶費1支",
    "en": "Corkage Fee (Per Bottle)",
    "ja": "持ち込み料金 1本",
    "ru": "Пробковый сбор (за 1 бутылку)",
    "es": "Descorche de Botella (Por unidad)"
  },
  "自備酒水之開瓶服務費（按瓶計費）。": {
    "ja": "お持ち込み飲料のボトルごとの抜栓料（コーケージ）です。",
    "en": "Corkage fee for bringing your own beverage (charged per bottle).",
    "zh": "自備酒水之開瓶服務費（按瓶計費）。",
    "th": "ค่าบริการเปิดขวดสำหรับเครื่องดื่มที่นำมาเอง (คิดราคาต่อขวด)",
    "ko": "주류 반입 시 적용되는 병당 코키지 서비스 요금입니다.",
    "vi": "Phí phục vụ khui chai đối với thức uống tự mang vào (tính theo chai).",
    "ru": "Сервисный сбор за распитие собственного алкоголя в заведении (за каждую бутылку).",
    "es": "Tarifa por servicio de descorche para bebidas alcohólicas traídas por el cliente (por botella)."
  },
  "泰北酸肉冬粉腸": {
    "ja": "タイ北部のサワーポークとウィンターヌードルソーセージ",
    "zh": "泰北酸肉冬粉腸",
    "en": "Northern Thai Fermented Pork Sausage w/ Glass Noodles",
    "vi": "Bún chua mùa đông và thịt chua miền Bắc Thái",
    "th": "หมูยอภาคเหนือและไส้กรอกหมี่ฤดูหนาว",
    "ko": "북부 태국 신 돼지고기와 겨울 국수 소시지",
    "ru": "Северотайская колбаска с фунчозой (Сай Крок Исан)",
    "es": "Salchicha Fermentada del Norte de Tailandia con Fideos Celofán"
  },
  "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知": {
    "vi": "Xúc xích heo chua Thái chính hãng với bún xanh <Không phải đồ ăn bị chua hay hư> Khách hàng đặt mua sản phẩm này phải hiểu rõ điều này",
    "th": "ไส้กรอกอีสานเส้นหมี่เขียวแท้ <ไม่ใช่ว่าอาหารเปรี้ยวหรือบูด> ลูกค้าที่สั่งสินค้าต้องมีความเข้าใจดังนี้",
    "ko": "정통 태국식 신 돼지고기 소시지 녹색면 <음식이 신맛이 나거나 상한 것이 아닙니다> 본 상품을 주문하시는 고객께서는 이 점을 숙지하시기 바랍니다.",
    "zh": "正宗泰國酸肉腸包冬粉<不是食物酸掉壞掉喔>下單此商品的顧客一定要有此認知",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ja": "本格タイ風サワーポークソーセージ グリーンヌードル入り ＜酸っぱい・傷むわけではありません＞ この商品をご注文いただくお客様は、この点をご理解いただいた上でご注文ください",
    "ru": "Аутентичная тайская ферментированная пряная колбаска с фунчозой с приятной фирменной кислинкой. Традиционный тайский вкус!",
    "es": "Auténtica salchicha tailandesa fermentada rellena de fideos de cristal, con el característico sabor ligeramente ácido tradicional del norte de Tailandia."
  },
  "好友折扣": {
    "en": "Friend Discount Coupon",
    "zh": "好友折扣",
    "ko": "친구할인",
    "th": "ส่วนลดเพื่อน",
    "vi": "Giảm giá cho bạn bè",
    "ja": "友達割引",
    "ru": "Скидка для друзей",
    "es": "Descuento Especial Amigos Sabay"
  },
  "小羔羊肋": {
    "ja": "ラムリブ",
    "zh": "小羔羊肋",
    "en": "Cumin Lamb Rib Skewers",
    "vi": "sườn cừu",
    "ko": "양갈비",
    "th": "ซี่โครงแกะ",
    "ru": "Шашлычки из бараньих ребрышек с зирой",
    "es": "Brochetas de Costilla de Cordero al Comino"
  },
  "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.": {
    "vi": "Thịt cừu được lựa chọn cẩn thận trong vòng 6 tháng. (Nhập khẩu từ Úc) Nướng trên lửa than cho đến khi vàng nâu và rắc bột thì là! NO2 bán chạy nhất tại cửa hàng.",
    "th": "คัดสรรเนื้อแกะอย่างพิถีพิถันภายใน 6 เดือน (นำเข้าจากออสเตรเลีย) อบบนไฟถ่านจนเป็นสีเหลืองทองโรยผงยี่หร่า! NO2 ที่ขายดีที่สุดในร้าน",
    "ko": "6개월 이내의 엄선된 양고기를 사용합니다. (호주수입) 숯불에 노릇노릇해질 때까지 구운 후 커민가루를 뿌려주세요! 매장에서 가장 많이 팔리는 NO2입니다.",
    "zh": "嚴選6個月內小羔羊肉。(澳洲進口) 炭火上烤至金黃 撒上孜然粉!店內熱銷NO2.",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ja": "生後6ヶ月以内の子羊を厳選。 （オーストラリアから輸入） 炭火できつね色になるまで焼き、クミンパウダーをふりかける！当店の売れ筋NO2。",
    "ru": "Отборная баранина моложе 6 месяцев из Австралии, обжаренная на углях до хрустящей корочки с зирой. Хит продаж №2 в заведении!",
    "es": "Costillitas de cordero australiano asadas a las brasas hasta quedar doradas con comino. ¡El plato más vendido #2 de la casa!"
  },
  "果肉椰子水": {
    "ja": "パルプココナッツウォーター",
    "zh": "果肉椰子水",
    "en": "Fresh Coconut Water w/ Pulp",
    "vi": "Nước cốt dừa",
    "th": "น้ำมะพร้าวเนื้อ",
    "ko": "펄프 코코넛 워터",
    "ru": "Натуральная кокосовая вода с мякотью",
    "es": "Agua de Coco Tailandesa con Pulpa Natural"
  },
  "泰式生蠔1P": {
    "ja": "タイオイスター 1P",
    "en": "Thai Style Fresh Oyster (1pc)",
    "zh": "泰式生蠔1P",
    "th": "หอยนางรมไทย 1P",
    "ko": "타이 굴 1P",
    "vi": "Hàu Thái 1P",
    "ru": "Тайская свежая устрица (1 шт.)",
    "es": "Ostra Fresca al Estilo Tailandés (1 pza)"
  },
  "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤": {
    "zh": "嚴選L號宮城生蠔 牛奶海味!店內招牌! 可生食 可碳烤",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Hàu, sữa và hải sản Miyagi cỡ L được lựa chọn cẩn thận! Chữ ký của cửa hàng! Có thể ăn sống hoặc nướng",
    "th": "หอยนางรม มิยากิ นม และอาหารทะเลไซส์ L คัดสรรมาอย่างดี! ซิกเนเจอร์ของร้าน! สามารถรับประทานดิบหรือย่างได้",
    "ko": "엄선된 L 사이즈 미야기 굴, 우유, 해산물! 매장의 시그니처! 생으로 먹어도 되고 구워서 먹어도 된다",
    "ja": "宮城産の牡蠣・牛乳・魚介類をLサイズで厳選！お店のサインも！生でも焼いても食べられる",
    "ru": "Отборная японская устрица размера L со сливочным вкусом моря. Фирменное блюдо!",
    "es": "Una ostra gigante talla L de Miyagi, jugosa y cremosa, servida fresca con salsa tailandesa o asada al carbón."
  },
  "勝獅": {
    "vi": "singapore",
    "ko": "싱가포르",
    "th": "สิงคโปร์",
    "zh": "勝獅",
    "en": "Singha Beer",
    "ja": "シンガポール",
    "ru": "Пиво Singha",
    "es": "Cerveza Singha"
  },
  "泰象": {
    "ja": "太祥",
    "en": "Chang Beer",
    "zh": "泰象",
    "th": "ไท่เซียง",
    "ko": "타이샹",
    "vi": "Thái Tường",
    "ru": "Пиво Chang",
    "es": "Cerveza Chang"
  },
  "秋葵(季節限定)": {
    "ja": "オクラ炭火焼き (季節限定)",
    "en": "Charcoal Grilled Okra (Seasonal)",
    "zh": "秋葵(季節限定)",
    "ko": "오크라 구이 (계절 한정)",
    "th": "กระเจี๊ยบเขียวสไตล์ไทย (ตามฤดูกาล)",
    "vi": "Đậu bắp nướng than (Theo mùa)",
    "ru": "Бамия на углях (сезонное предложение)",
    "es": "Ocra a las Brasas (Especial de Temporada)"
  },
  "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇": {
    "th": "กระเจี๊ยบเขียวมีประโยชน์สูง แคลอรีต่ำ แคลเซียมใกล้เคียงนมสด! ทางเลือกที่ดีสำหรับกระเพาะอาหาร",
    "ko": "영양 만점~ 저칼로리~ 우유에 맞먹는 칼슘 함량! 위 건강에 좋은 탁월한 선택.",
    "vi": "Giàu dinh dưỡng, ít calo, hàm lượng canxi tiệm cận sữa tươi! Lựa chọn tuyệt vời cho dạ dày.",
    "en": "Nutritious, low calories, calcium content close to milk! Excellent choice for stomach health.",
    "zh": "營養多~熱量低~含鈣量又直逼牛奶! 是顧胃健康好選擇",
    "ja": "栄養豊富・低カロリー！牛乳並みのカルシウムで胃に優しい健康的な選択。",
    "ru": "Богата витаминами, кальцием и клетчаткой, благотворно влияет на пищеварение.",
    "es": "Ocra tierna asada al carbón, rica en calcio, fibra y baja en calorías, excelente para la salud digestiva."
  },
  "泰式海鮮.米線": {
    "ja": "タイ風海鮮ライスヌードル",
    "vi": "Bún Hải Sản Kiểu Thái",
    "ko": "타이 해산물 쌀국수",
    "th": "ขนมจีนซีฟู้ดสไตล์ไทย",
    "zh": "泰式海鮮.米線",
    "en": "Thai Seafood Rice Noodles",
    "ru": "Рисовая вермишель с морепродуктами Том Ям",
    "es": "Fideos Finos de Arroz con Mariscos al Estilo Tailandés"
  },
  "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃": {
    "en": "You haven't truly had Thai food if you haven't tried Tom Yum! Classic authentic Thai noodle soup, rich broth to warm your heart and stomach.",
    "zh": "沒吃過冬蔭功就不能說吃過泰式! 經典口味道地風味湯麵，濃郁湯底暖心暖胃",
    "ko": "똠얌꿍을 안 먹어봤다면 타이 음식을 먹어봤다고 할 수 없죠! 정통 타이식 풍미의 탕면, 진한 국물이 몸과 마음을 따뜻하게 해줍니다.",
    "th": "ถ้าไม่เคยกินต้มยำกุ้งก็ถือว่ายังไม่เคยกินอาหารไทย! ก๋วยเตี๋ยวน้ำใสรสชาติต้นตำรับ น้ำซุปเข้มข้นอุ่นทั้งกายและใจ",
    "vi": "Chưa ăn Tom Yum thì chưa thể nói là đã ăn món Thái! Món phở nước mang hương vị Thái Lan đích thực, nước dùng đậm đà sưởi ấm lòng người.",
    "ja": "トムヤムクンを食べずしてタイ料理は語れない！本格タイ風味のスープ麺、濃厚なスープが心も体も温めます。",
    "ru": "Широкая рисовая лапша в аутентичном супе Том Ям со свежими морепродуктами и пряными травами.",
    "es": "Fideos de arroz anchos sumergidos en sopa Tom Yum tradicional con mariscos selectos y hierbas thai."
  },
  "Choice牛小排-5oz": {
    "ja": "特選ビーフショートリブ-5オンス",
    "zh": "Choice牛小排-5oz",
    "en": "USDA Choice Beef Short Rib Steak (5oz)",
    "vi": "Sườn Bò Choice-5oz",
    "th": "ซี่โครงเนื้อทางเลือก-5oz",
    "ko": "초이스 소갈비-5oz",
    "ru": "Стейк из говяжьих ребрышек USDA Choice (5 унций)",
    "es": "Bife de Costilla de Res USDA Choice (5 oz)"
  },
  "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!": {
    "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
    "zh": "原肉精修後，炭火慢烤，香氣四溢，每一口都是極致美味!",
    "th": "หลังจากที่เนื้อดิบได้รับการตัดแต่งอย่างระมัดระวังและย่างอย่างช้าๆบนไฟถ่าน กลิ่นหอมก็ล้นออกมา และทุกคำที่กัดก็อร่อยมาก!",
    "ko": "생고기를 정성스럽게 손질하여 숯불에 천천히 구워내면 고소한 향이 가득하고, 한입 먹을 때마다 정말 맛있습니다!",
    "vi": "Sau khi thịt sống được cắt tỉa cẩn thận và nướng từ từ trên lửa than, mùi thơm tràn ngập, mỗi miếng cắn đều vô cùng thơm ngon!",
    "ja": "丁寧にそぎ落とした生肉を炭火でじっくり焼き上げると、香ばしさが溢れ、一口食べるごとにとても美味しいです！",
    "ru": "Мясо высшей категории Choice, бережно запеченное на углях до совершенного аромата и сочности.",
    "es": "Corte de costilla deshuesada USDA Choice asado a las brasas, suculento, tierno y lleno de sabor."
  },
  "特大土雞七里香": {
    "ko": "특대형 토종닭 Qilixiang",
    "th": "ไก่ท้องถิ่น Qilixiang ขนาดใหญ่พิเศษ",
    "vi": "Gà địa phương cực lớn Qiilixiang",
    "en": "Extra Large Chicken Butt Skewers",
    "zh": "特大土雞七里香",
    "ja": "特大地鶏七里香",
    "ru": "Крупные куриные хвостики домашней птицы на углях",
    "es": "Brochetas de Colitas de Pollo Campero a las Brasas"
  },
  "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘": {
    "ja": "朝市場に行って、むしりとマリネを付けて持ち帰ってきました（鶏のお尻好きな人は必ず頼む！）まだ揚げていないので、15分ほど焼きます。",
    "vi": "Sáng đi chợ mang về cùng với cả tuốt và ướp (món phải gọi của ai thích mông gà!) Vì chưa chiên nên nướng khoảng 15 phút.",
    "ko": "아침에 시장에 갔다가 따기와 양념장을 가지고 가지고 왔습니다. (닭꽁초 좋아하시는 분들은 필수!) 아직 튀겨지지 않았기 때문에 15분 정도 구워주세요.",
    "th": "เมื่อเช้าผมไปตลาดก็เอากลับมาแบบถอนขนและหมักด้วย (คนชอบก้นไก่ต้องสั่ง!) เนื่องจากยังไม่ได้ทอดจึงอบประมาณ 15 นาที",
    "zh": "早上去市場拿回來拔毛+醃料(喜歡雞屁屁的人必點啊!)由於沒有炸過再烤約烤15分鐘",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ru": "Свежее мясо с утреннего рынка в фирменном маринаде. Запекается на углях без фритюра около 15 минут до золотистой корочки.",
    "es": "Deliciosas colitas de pollo campero marinadas y asadas lentamente al carbón por 15 minutos sin freír, crujientes por fuera y jugosas por dentro."
  },
  "辣椒粉": {
    "ja": "パプリカ",
    "th": "พริกหยวก",
    "ko": "파프리카",
    "vi": "ớt bột",
    "en": "Chili Powder Dip",
    "zh": "辣椒粉",
    "ru": "Тайский порошок чили со специями",
    "es": "Polvo de Chile Tailandés con Especias"
  },
  "精心調製，口感層次豐富，為您的餐點添彩": {
    "ja": "丁寧に仕上げた豊かな味わいで、お食事を彩ります。",
    "ko": "정성껏 준비한 풍부한 맛으로 식사에 색을 더해줍니다",
    "th": "ปรุงอย่างพิถีพิถันด้วยรสชาติเข้มข้น เพิ่มสีสันให้กับมื้ออาหารของคุณ",
    "vi": "Được chế biến kỹ lưỡng với hương vị đậm đà, thêm màu sắc cho bữa ăn của bạn",
    "en": "Meticulously crafted with rich layers of flavor to complement your meal.",
    "zh": "精心調製，口感層次豐富，為您的餐點添彩",
    "ru": "Насыщенный и пряный красный соус для мяса на гриле и закусок.",
    "es": "Salsa roja tradicional con toques picantes y especiados, ideal para realzar carnes a las brasas."
  },
  "泰式海鮮.河粉": {
    "ja": "タイ風海鮮フォー",
    "en": "Thai Seafood Flat Noodles",
    "zh": "泰式海鮮.河粉",
    "th": "เส้นเล็กซีฟู้ดสไตล์ไทย",
    "ko": "타이 해산물 넙적 쌀국수",
    "vi": "Phở Hải Sản Kiểu Thái",
    "ru": "Плоская рисовая лапша с морепродуктами Том Ям",
    "es": "Fideos Planos de Arroz con Mariscos al Estilo Tailandés"
  },
  "泰酥豆皮": {
    "ja": "タイのパリパリ豆腐皮",
    "vi": "Da đậu hủ chiên giòn kiểu Thái",
    "ko": "태국식 바삭한 두부 스킨",
    "th": "หนังเต้าหู้กรอบ",
    "zh": "泰酥豆皮",
    "en": "Crispy Tofu Skin Skewer",
    "ru": "Хрустящая тайская соевая спаржа (тофу-скин)",
    "es": "Brocheta Crujiente de Piel de Tofu al Estilo Tailandés"
  },
  "外酥內嫩的口感，店內人氣商品!": {
    "ja": "外はカリッと中はふわっとしたお店の人気商品です！",
    "vi": "Giòn bên ngoài và mềm bên trong, một mặt hàng phổ biến trong cửa hàng!",
    "ko": "겉은 바삭하고 속은 부드러운 이 매장의 인기상품!",
    "th": "กรอบนอกนุ่มในเป็นสินค้ายอดนิยมของร้าน!",
    "zh": "外酥內嫩的口感，店內人氣商品!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ru": "Хрустящая снаружи и нежная внутри запеченная соевая пенка на шпажке. Хит среди гостей!",
    "es": "Piel de tofu asada a las brasas, crujiente por fuera y tierna por dentro. ¡Favorita de los clientes!"
  },
  "碳烤手工月亮蝦餅": {
    "th": "ขนมไหว้พระจันทร์ทำมือย่างถ่าน",
    "ko": "숯불구이 수제 달새우떡",
    "vi": "Bánh trung thu nướng than thủ công",
    "en": "Charcoal Grilled Handmade Moon Shrimp Cake",
    "zh": "碳烤手工月亮蝦餅",
    "ja": "手作り月海老ケーキの炭火焼き",
    "ru": "Тайский хрустящий креветочный блинчик на углях (Moon Shrimp Cake)",
    "es": "Pastel Artesanal de Camarón 'Moon Shrimp Cake' a las Brasas"
  },
  "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流": {
    "ja": "炭火焼月海老餅をまだ食べたことがない方はぜひお試しください！つけだれもついてきます → エビケーキ（手作り）はエビ、魚介餡、かまぼこが入っており、一級品の味わいです",
    "zh": "沒吃過碳烤月亮蝦餅的一定要試試!沾醬會另外附->蝦餅是（手工製作）內含蝦仁、海鮮內餡及魚漿，口感一流",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Nếu bạn chưa từng thử bánh tôm trung thu nướng than thì nhất định phải thử nhé! Nước chấm sẽ được bao gồm -> bánh tôm được làm thủ công gồm có tôm, nhân hải sản và chả cá, có hương vị hảo hạng",
    "th": "ใครยังไม่เคยลองขนมไหว้พระจันทร์ย่างเตาถ่านต้องลอง! น้ำจิ้มจะรวมอยู่ด้วย -> ทอดมันกุ้ง (ทำมือ) ประกอบด้วยกุ้ง ไส้ทะเล และกะปิ และมีรสชาติชั้นหนึ่ง",
    "ko": "아직 숯불구이 달새우떡을 먹어본 적이 없다면 꼭 드셔보세요! 디핑 소스가 포함됩니다 -> 새우 케이크는 새우, 해산물 충전재 및 어묵이 들어 있으며 (수제) 맛이 일품입니다.",
    "ru": "Приготовлен вручную из свежих креветок, морепродуктов и рыбной пасты. Запекается на углях, подается со сладким сливовым соусом.",
    "es": "Elaborado a mano con camarones frescos, relleno de mariscos y pasta de pescado. Asado al carbón y servido con salsa dulce de ciruela."
  },
  "奶香火腿玉米濃湯": {
    "ja": "ハムとコーンのクリーミースープ",
    "vi": "Súp kem ngô và giăm bông",
    "ko": "크림 햄과 옥수수 수프",
    "th": "ครีมแฮมและซุปข้าวโพด",
    "zh": "奶香火腿玉米濃湯",
    "en": "Creamy Ham & Sweet Corn Soup",
    "ru": "Сливочный кукурузный суп с ветчиной",
    "es": "Sopa Cremosa de Maíz Dulce con Jamón"
  },
  "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成": {
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "zh": "嚴選2顆雞蛋+綠巨人玉米粒->慢火煮熟->撒上現磨黑胡椒粒->一碗奶香四溢的濃湯完成",
    "th": "เลือกไข่ 2 ฟองอย่างระมัดระวัง + เมล็ดข้าวโพด Hulk -> ปรุงโดยใช้ไฟอ่อน -> โรยด้วยพริกไทยดำบดสด -> เติมซุปเข้มข้นที่มีกลิ่นหอมของน้ำนมลงในชาม",
    "ko": "계란 2개 + 헐크옥수수 알갱이를 잘 골라서 -> 약불로 익히기 -> 갓 간 흑후추를 뿌리고 -> 우유향이 가득한 진한 국물 한 그릇 완성",
    "vi": "Cẩn thận chọn 2 quả trứng + hạt ngô Hulk -> Nấu trên lửa chậm -> Rắc hạt tiêu đen mới xay -> Hoàn thành một bát súp đậm đà thơm mùi sữa",
    "ja": "卵2個＋ハルクコーン粒を厳選 → 弱火でじっくり煮込む → 挽きたての黒胡椒を振る → ミルキーな香りが広がる濃厚なスープの完成",
    "ru": "2 свежих яйца, сладкая кукуруза, сливочный бульон на медленном огне со свежемолотым черным перцем.",
    "es": "Elaborada con 2 huevos frescos, granos de maíz dulce, cocida a fuego lento y espolvoreada con pimienta negra recién molida."
  },
  "海鮮冬蔭功湯": {
    "en": "Seafood Tom Yum Soup",
    "zh": "海鮮冬蔭功湯",
    "ko": "해산물 똠얌꿍",
    "th": "ต้มยำทะเล",
    "vi": "Súp Tom Yum Hải Sản",
    "ja": "海鮮 トムヤムクン",
    "ru": "Классический суп Том Ям с морепродуктами",
    "es": "Sopa Tom Yum Tradicional de Mariscos"
  },
  "道地泰式風味湯，濃郁湯底暖心暖胃 \n配料:蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜": {
    "ja": "本格タイ風スープ、濃厚なスープが心も体も温めます。具材：エビ、イカリング、アサリ、タラ団子、肉団子、日本の魚肉練り製品、レタス、玉ねぎ、人参、バジル、キャベツ。",
    "zh": "道地泰式風味湯，濃郁湯底暖心暖胃 \n配料:蝦子 魷魚圈 蛤蠣 鱈魚丸 貢丸 日本魚板 大陸妹 洋蔥 紅蘿蔔 九層塔 高麗菜",
    "en": "Authentic Thai soup, rich broth to warm your heart and stomach. Ingredients: shrimp, squid rings, clams, cod meatballs, pork meatballs, Japanese fish cake, lettuce, onion, carrot, basil, cabbage.",
    "vi": "Món súp chuẩn vị Thái, nước dùng đậm đà làm ấm lòng người. Thành phần: tôm, mực vòng, nghêu, cá viên tuyết, bò viên, chả cá Nhật Bản, rau xà lách, hành tây, cà rốt, húng quế, bắp cải.",
    "th": "ต้มยำรสต้นตำรับไทย น้ำซุปเข้มข้นอุ่นทั้งกายและใจ ส่วนผสม: กุ้ง, ปลาหมึกวง, หอยลาย, ลูกชิ้นปลาค็อด, ลูกชิ้นหมู, ลูกชิ้นปลาญี่ปุ่น, ผักกาดหอม, หัวหอม, แครอท, โหระพา, กะหล่ำปลี",
    "ko": "정통 타이식 수프, 진한 국물이 몸과 마음을 따뜻하게 해줍니다. 재료: 새우, 오징어 링, 조개, 대구 어묵, 고기 완자, 일본 어묵, 상추, 양파, 당근, 바질, 양배추.",
    "ru": "Традиционный тайский кисло-острый суп. Ингредиенты: креветки, кольца кальмара, моллюски, рыбные шарики, капуста, базилик и лемонграсс.",
    "es": "Auténtico caldo tailandés Tom Yum. Contiene camarones, aros de calamar, almejas, albóndigas de pescado, verduras, albahaca y col china."
  },
  "越南鮮牛肉河粉": {
    "ja": "ベトナムの新鮮な牛肉のフォー",
    "vi": "Phở bò tươi Việt Nam",
    "th": "เฝอเนื้อสดเวียดนาม",
    "ko": "베트남산 신선한 쇠고기 포",
    "zh": "越南鮮牛肉河粉",
    "en": "Vietnamese Fresh Beef Pho Noodle Soup",
    "ru": "Вьетнамский суп Фо Бо со свежей говядиной",
    "es": "Sopa de Fideos Pho Bo Vietnamita con Res Fresca"
  },
  "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。": {
    "ja": "スープは甘めの甘め（骨と野菜を3時間煮込んでいます。MSGスープではありません。1日14食限定、売り切れ次第終了です。） 肉スライスはアメリカ産の柔らかい肩ヒレ肉特選グレードを使用！材料:中国大陸の女の子、玉ねぎ、ねぎ、九重塔、黒胡椒、もやし、ビーフン。",
    "th": "ซุปมีรสหวานอมหวาน (ต้มกระดูกและผักเป็นเวลา 3 ชั่วโมง ไม่ใช่ซุปผงชูรส จำกัดเพียง 14 มื้อต่อวันและจะขายหมด) เนื้อชิ้นทำจากเนื้อสันในอเมริกาเกรดคัดสรร! ส่วนผสม: เด็กหญิงจีนแผ่นดินใหญ่ หัวหอม ต้นหอม เจดีย์เก้าชั้น พริกไทยดำ ถั่วงอก และเส้นหมี่",
    "ko": "국물은 달큰하고 (뼈와 야채를 3시간 끓여서 만든 국물입니다. MSG 국물이 아닙니다. 하루 14인분 한정이며 품절됩니다.) 고기조각은 미국산 안심 안심 쇠고기 초이스 등급으로 만듭니다! 재료: 중국 본토녀, 양파, 쪽파, 구층탑, 후추, 콩나물, 쌀국수.",
    "vi": "Nước súp ngọt ngọt (xương và rau được luộc trong 3 giờ. Không phải súp bột ngọt. Số lượng giới hạn 14 suất mỗi ngày và sẽ bán hết.) Các lát thịt được làm từ loại thịt thăn vai mềm của Mỹ tuyển chọn! Nguyên liệu: Cô gái Hoa lục, hành tây, hành lá, chùa chín tầng, tiêu đen, giá đỗ và bún.",
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "zh": "湯頭清甜（大骨跟蔬菜熬煮3小時，不是味精湯，每天限量供應14份賣完就沒了）肉片是採用美國嫩肩里肌牛肉choice等級！配料：大陸妹、洋蔥、蔥、九層塔、黑胡椒，豆芽菜、河粉主食。",
    "ru": "Насыщенный и сладковатый бульон из мозговых костей и овощей, варится 3 часа (без глутамата, лимит 14 порций в день!). Нежная говядина Choice, рисовая лапша, зелень и лайм.",
    "es": "Caldo casero cocido 3 horas con huesos y verduras frescas (sin glutamato, ¡solo 14 raciones diarias!). Con carne de res Choice tierna, fideos pho, albahaca, cebollino y brotes de soja."
  },
  "紫菜蛋花湯": {
    "vi": "Súp Rong Biển Trứng",
    "th": "ซุปสาหร่ายไข่นุ่ม",
    "ko": "김 계란국",
    "zh": "紫菜蛋花湯",
    "en": "Seaweed & Egg Drop Soup",
    "ja": "海苔とたまごのスープ",
    "ru": "Суп из морской капусты с яйцом",
    "es": "Sopa Ligera de Algas Marinas y Huevo"
  },
  "洗選雞蛋2顆+海帶芽~外食族補充膳食纖維白質的好選擇": {
    "zh": "洗選雞蛋2顆+海帶芽~外食族補充膳食纖維白質的好選擇",
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "vi": "Authentic Thai-style soup noodles with rich, warming broth",
    "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
    "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
    "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
    "ru": "2 свежих куриных яйца и отборные морские водоросли. Легкий, полезный и богатый клетчаткой и белком суп.",
    "es": "Preparada con 2 huevos frescos y algas tiernas. Excelente opción ligera y nutritiva rica en fibra y proteínas."
  },
  "鮮味蛤蜊湯": {
    "en": "Fresh Clam Soup w/ Ginger",
    "zh": "鮮味蛤蜊湯",
    "ko": "신선한 바지락 생강 조개탕",
    "th": "ซุปหอยตลับสดใส่ขิงและโหระพา",
    "vi": "Canh Nghêu Tươi Nấu Gừng Húng Quế",
    "ja": "新鮮アサリと生姜のクリアスープ",
    "ru": "Суп из свежих моллюсков с имбирем",
    "es": "Sopa de Almejas Frescas con Jengibre y Albahaca"
  },
  "每日早市新鮮採買~新鮮蛤蠣搭配蔥薑絲九層塔!越簡單越耐人尋味": {
    "th": "ก๋วยเตี๋ยวแบบไทยแท้ น้ำซุปข้นอร่อยอุ่นท้อง",
    "ko": "정통 태국식 국수, 진하고 따뜻한 육수가 몸을 녹입니다",
    "vi": "Authentic Thai-style soup noodles with rich, warming broth",
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "zh": "每日早市新鮮採買~新鮮蛤蠣搭配蔥薑絲九層塔!越簡單越耐人尋味",
    "ja": "本格タイ風スープ麺、濃厚なスープで体が温まる",
    "ru": "Свежие утренние моллюски в чистом бульоне с молодым имбирем, зеленым луком и тайским базиликом. Натуральный вкус моря.",
    "es": "Almejas frescas compradas a diario en el mercado, cocidas con tiras de jengibre fresco, cebollín y albahaca tailandesa."
  },
  "金牌": {
    "ja": "金メダル",
    "zh": "金牌",
    "en": "Taiwan Gold Medal Beer",
    "vi": "huy chương vàng",
    "th": "เหรียญทอง",
    "ko": "금메달",
    "ru": "Тайваньское пиво Gold Medal",
    "es": "Cerveza Taiwanesa Gold Medal"
  },
  "金樽": {
    "vi": "cúp vàng",
    "th": "ถ้วยทอง",
    "ko": "황금 컵",
    "zh": "金樽",
    "en": "Gold Draft Beer",
    "ja": "黄金の杯",
    "ru": "Пиво Gold Draft (Разливное золотое)",
    "es": "Cerveza de Barril Gold Draft"
  },
  "可口可樂": {
    "ja": "コカ・コーラ",
    "zh": "可口可樂",
    "en": "Coca-Cola",
    "vi": "Coca-Cola",
    "ko": "코카콜라",
    "th": "โคคา-โคล่า",
    "ru": "Кока-Кола (Coca-Cola)",
    "es": "Coca-Cola"
  },
  "肥仔的快樂水~搭配燒烤絕配!": {
    "vi": "Giải nhiệt sảng khoái, hương vị tươi mát, sự kết hợp hoàn hảo với món nướng",
    "ko": "시원하고 상쾌한 음료로 바베큐와 완벽한 조화",
    "th": "เย็นชื่นใจ รสสดชื่น เข้ากับบาร์บีคิวได้อย่างลงตัว",
    "zh": "肥仔的快樂水~搭配燒烤絕配!",
    "en": "Refreshing and cool, a perfect match for BBQ",
    "ja": "冷たくさわやか、BBQに最高の組み合わせ",
    "ru": "Классическая ледяная газировка, идеальное дополнение к барбекю.",
    "es": "El refresco clásico por excelencia, servido bien frío para acompañar las carnes asadas."
  },
  "泰式奶茶400ml": {
    "ko": "타이 밀크티 400ml",
    "th": "ชานมไทย 400มล",
    "vi": "Trà sữa Thái 400ml",
    "en": "Signature Thai Iced Milk Tea (400ml)",
    "zh": "泰式奶茶400ml",
    "ja": "タイミルクティー 400ml",
    "ru": "Тайский молочный чай со льдом (400 мл)",
    "es": "Té con Leche Helado Tailandés Tradicional (400ml)"
  },
  "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!": {
    "th": "นมไทยฉลากมือสุดคลาสสิค กลิ่นหอมชาเข้มข้น ~ สดชื่น สดชื่น ~ ซิกเนเจอร์!",
    "ko": "진한 차 향이 나는 클래식 핸드라벨 태국 우유~ 상큼하고 상큼한~ 시그니처!",
    "vi": "Sữa Thái được dán nhãn thủ công cổ điển với hương trà đậm đà ~ sảng khoái và sảng khoái ~ đặc trưng!",
    "en": "Refreshing and cool, a perfect match for delicious BBQ.",
    "zh": "茶香濃郁的經典手標泰奶~沁涼消暑~招牌!",
    "ja": "紅茶の香りが強い定番の手ラベルタイミルク～爽やかさわやか～の代表作！",
    "ru": "Знаменитый тайский молочный чай ChaTraMue с ярким ароматом и сладким сливочным вкусом.",
    "es": "El auténtico té helado tailandés con té negro de marca ChaTraMue y leche condensada. ¡El sello de la casa!"
  },
  "特製辣椒醬(外帶)": {
    "vi": "Tương ớt đặc biệt (mang đi)",
    "ko": "특제 칠리소스(테이크아웃)",
    "th": "น้ำพริกสูตรพิเศษ (ทูโก)",
    "zh": "特製辣椒醬(外帶)",
    "en": "House Special Chili Sauce (Takeout Jar)",
    "ja": "特製チリソース（持ち帰り）",
    "ru": "Фирменный соус чили (в банке на вынос)",
    "es": "Frasco de Salsa de Chile Especial de la Casa (Para Llevar)"
  },
  "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏": {
    "zh": "爆炒朝天椒 薑絲 蒜 ~好吃不添加防腐劑！購買回家需冷藏",
    "en": "Carefully crafted with rich flavors to complement your meal",
    "vi": "Xào tiêu Chaotian, gừng và tỏi băm nhỏ ~ thơm ngon và không thêm chất bảo quản! Cần bảo quản tủ lạnh khi mua nhà",
    "th": "ผัดพริกเผาขิงและกระเทียมฝอย ~ อร่อยไม่ใส่สารกันบูด! ต้องแช่เย็นเมื่อซื้อกลับบ้าน",
    "ko": "차오티안 고추와 다진 생강, 마늘을 볶은 요리~ 맛있고 방부제도 넣지 않았습니다! 집 구입시 냉장보관 필수",
    "ja": "朝天山椒、生姜、ニンニクの千切りを炒めました～保存料無添加で美味しいです！住宅購入時は要冷蔵",
    "ru": "Обжаренный перец чили, имбирь и чеснок без консервантов! Хранить в холодильнике.",
    "es": "Chiles picantes salteados con tiras de jengibre y ajo fresco, ¡sin conservantes artificiales! Mantener refrigerado tras abrir."
  },
  "泰式綠醬": {
    "th": "ซอสเขียวไทย",
    "ko": "태국 그린 소스",
    "vi": "Nước sốt xanh Thái",
    "en": "Thai Seafood Green Chili Sauce",
    "zh": "泰式綠醬",
    "ja": "タイのグリーンソース",
    "ru": "Тайский зеленый соус для морепродуктов",
    "es": "Salsa Verde Tailandesa de Lima y Chiles para Mariscos"
  },
  "泰式紅醬": {
    "ja": "タイのレッドソース",
    "vi": "Nước sốt đỏ Thái",
    "ko": "태국식 빨간 소스",
    "th": "น้ำแดงไทย",
    "zh": "泰式紅醬",
    "en": "Thai BBQ Red Chili Sauce",
    "ru": "Тайский красный соус для барбекю",
    "es": "Salsa Roja Tailandesa de Chiles para BBQ"
  },
  "四季豆": {
    "zh": "四季豆",
    "en": "Charcoal Grilled Green Beans",
    "vi": "Đậu pháp",
    "th": "ถั่วฝรั่งเศส",
    "ko": "프랑스산 콩",
    "ja": "フランス豆",
    "ru": "Стручковая зеленая фасоль на углях",
    "es": "Ejotes / Judías Verdes a las Brasas"
  },
  "又稱作敏豆，口感清甜、富含營養且低熱量": {
    "ja": "敏感豆とも呼ばれ、甘くて栄養が豊富でカロリーが低いです。",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "又稱作敏豆，口感清甜、富含營養且低熱量",
    "ko": "민감한 콩이라고도 알려진 이 콩은 맛이 달콤하고 영양분이 풍부하며 칼로리가 낮습니다.",
    "th": "เรียกอีกอย่างว่าถั่วที่ละเอียดอ่อน มีรสหวาน อุดมไปด้วยสารอาหารและมีแคลอรีต่ำ",
    "vi": "Còn được gọi là đậu nhạy cảm, chúng có vị ngọt, giàu chất dinh dưỡng và ít calo.",
    "ru": "Сладкая и хрустящая зеленая фасоль, богатая полезными микроэлементами и низкокалорийная.",
    "es": "Judías verdes frescas asadas al carbón, dulces, crujientes, ricas en nutrientes y bajas en calorías."
  },
  "新竹貢丸": {
    "ja": "新竹公湾",
    "th": "ซินจู๋ กงวาน",
    "ko": "신주공완",
    "vi": "Tân Trúc Gongwan",
    "en": "Hsinchu Pork Meatballs",
    "zh": "新竹貢丸",
    "ru": "Свиные фрикадельки по-синьчжусски",
    "es": "Albóndigas de Cerdo Tradicionales de Hsinchu"
  },
  "新竹人氣丸子~大人小孩都愛": {
    "ja": "新竹で人気のミートボール ～大人も子供も大好き",
    "zh": "新竹人氣丸子~大人小孩都愛",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Món thịt viên nổi tiếng ở Tân Trúc ~ được cả người lớn và trẻ em yêu thích",
    "th": "ลูกชิ้นยอดนิยมในซินจู๋ ~ ถูกใจทั้งเด็กและผู้ใหญ่",
    "ko": "신주의 인기 미트볼~어른도 아이도 좋아하는",
    "ru": "Знаменитые упругие свиные фрикадельки из города Синьчжу. Любимое блюдо взрослых и детей.",
    "es": "Famosas albóndigas de carne de cerdo de Hsinchu, firmes, jugosas y muy populares entre grandes y chicos."
  },
  "澎澎甜不辣": {
    "ja": "ペンペンは甘いですか、それとも辛いですか?",
    "vi": "Peng Peng ngọt hay cay?",
    "th": "เป้งเป้งหวานหรือเผ็ดคะ?",
    "ko": "펭펭은 달달한가요, 아니면 매운가요?",
    "zh": "澎澎甜不辣",
    "en": "Chewy Charcoal Grilled Fish Cakes",
    "ru": "Тайваньская темпура из рыбы (Тянбура)",
    "es": "Pastel de Pescado Tianbura Asado al Carbón"
  },
  "烤甜不辣，口感Q彈紮實!": {
    "ja": "炙ってあり、甘いけど辛くなく、モチモチとした食感！",
    "vi": "Rang, ngọt nhưng không cay, dai dai!",
    "th": "คั่วหวานแต่ไม่เผ็ด เนื้อเคี้ยวหนึบ!",
    "ko": "구워서 달콤하면서도 맵지 않고 쫄깃한 식감!",
    "zh": "烤甜不辣，口感Q彈紮實!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ru": "Запеченная на углях тайваньская рыбная лепешка с упругой и насыщенной текстурой.",
    "es": "Pastel de pescado taiwanés asado a la parrilla, con textura elástica y sabor marino concentrado."
  },
  "鯖甘魚下巴": {
    "vi": "Má đùi cá cam Nhật nướng (Hamachi Kama)",
    "ko": "일본산 방어 턱밑살 구이 (하마치 카마)",
    "th": "คางปลาฮามาจิญี่ปุ่นย่างเกลือ",
    "zh": "鯖甘魚下巴",
    "en": "Japanese Yellowtail Collar (Hamachi Kama)",
    "ja": "ブリカマ塩焼き",
    "ru": "Запеченный воротничок рыбы хамачи (лакедра)",
    "es": "Quijada de Pez Cola Amarilla Hamachi a la Sal"
  },
  "嚴選日本鯖甘魚下巴，炭火鹽烤，油脂豐厚，肉質細嫩極富彈性。": {
    "ja": "厳選された日本産ブリカマを炭火で塩焼きに。脂がたっぷりのっており、身は引き締まって柔らかくジューシーです。",
    "ko": "엄선된 일본식 방어 턱밑살을 숯불에 소금구이했습니다. 풍부한 기름기와 부드럽고 탄력 있는 살코기가 일품입니다.",
    "th": "คางปลาฮามาจิญี่ปุ่นย่างเกลือด้วยเตาถ่าน เนื้อปลานุ่มแน่นและชุ่มฉ่ำด้วยไขมันปลาชั้นดี",
    "vi": "Má đùi cá cam Nhật tuyển chọn nướng muối than hoa, lớp mỡ béo ngậy cùng thịt cá mềm ngọt thơm ngon.",
    "en": "Strictly selected Japanese yellowtail collar, salt-grilled over charcoal. Rich in healthy oils with tender and bouncy meat.",
    "zh": "嚴選日本鯖甘魚下巴，炭火鹽烤，油脂豐厚，肉質細嫩極富彈性。",
    "ru": "Отборный японский воротничок желтохвоста, запеченный на углях с морской солью. Нежнейшее, тающее и сочное мясо.",
    "es": "Corte prémium de quijada de hamachi japonés asado con sal marina, con carne sumamente tierna, jugosa y rica en ácidos grasos saludables."
  },
  "招牌泰式烤雞翅(4入)": {
    "vi": "Cánh gà nướng kiểu Thái đặc trưng (4 miếng)\n--​-\nThịt bò thủ công Thái Lan",
    "ko": "시그니처 타이 그릴드 치킨 윙(4개)\n--​​-\n태국산 수제 쇠고기",
    "th": "ปีกไก่ย่างซิกเนเจอร์ (4 ชิ้น)\n---​​-\nเนื้อไทยทำมือ",
    "zh": "招牌泰式烤雞翅(4入)",
    "en": "Signature Thai BBQ Chicken Wings (4pcs)",
    "ja": "タイ風手羽先のグリル（4本）\n-- -\nタイの手作り牛肉",
    "ru": "Фирменные тайские куриные крылышки на углях (4 шт.)",
    "es": "Alitas de Pollo al Estilo Tailandés a las Brasas (4 pzas)"
  },
  "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料": {
    "ja": "必ず注文してください！必ず注文してください！必ず注文してください！朝市場から仕入れた新鮮→洗って特製タイソースに漬け込む",
    "vi": "Phải đặt hàng! Phải đặt hàng! Phải đặt hàng! Mới mua ngoài chợ lúc sáng -> Rửa sạch và ướp với sốt Thái độc quyền",
    "th": "ต้องสั่ง! ต้องสั่ง! ต้องสั่ง! ซื้อสดๆจากตลาดตอนเช้า -> ล้างและหมักด้วยน้ำจิ้มสูตรเฉพาะของไทย",
    "ko": "주문해야합니다! 주문해야합니다! 주문해야합니다! 아침에 마트에서 구매한 신선한 재료 -> 씻어서 태국 전용 소스에 재워둡니다",
    "zh": "必點!必點!必點! 早上市場新鮮採買->洗淨醃製獨家泰式醬料",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ru": "Обязательно к заказу! Свежие куриные крылья в секретном тайском маринаде, запеченные до хрустящей золотистой корочки.",
    "es": "¡Imperdible de la casa! Alitas frescas marinadas en salsa secreta tailandesa y asadas al carbón hasta dorar."
  },
  "泰式手工牛肉": {
    "ja": "潮吹きソーセージ",
    "vi": "xúc xích mực",
    "ko": "스쿼트 소시지",
    "th": "ไส้กรอกฉีด",
    "zh": "泰式手工牛肉",
    "en": "Handmade Thai Spiced Beef Skewer",
    "ru": "Шашлычок из рубленой говядины по-тайски с арахисом",
    "es": "Brocheta Artesanal de Res con Cacahuate al Estilo Tailandés"
  },
  "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!": {
    "ja": "特製串！毎日の手作り限定版〜地元の牛肉を使用し、さまざまなタイのスパイスで漬け込みます -> 肉を粘りが出るまで刻み、雲林ピーナッツを混ぜます、テクノロジーは使用せず、非常に生き生きとした、すべて天然の手作りです！",
    "th": "สเต๊กพิเศษ!!! สินค้าทำมือรายวัน รุ่นลิมิเต็ด อิดิชั่น ~ ใช้เนื้อท้องถิ่นหมักด้วยเครื่องเทศไทยนานาชนิด -> สับเนื้อให้เหนียวแล้วผสมถั่วลิสงหยุนลิน ไม่ใช้เทคโนโลยี มีชีวิตชีวามาก เป็นงานฝีมือจากธรรมชาติทั้งหมด!",
    "ko": "전용 꼬치!!! 일일 수제 한정판~ 국내산 쇠고기를 사용하고 각종 태국 향신료에 절인 후 -> 고기를 쫄깃쫄깃해질 때까지 다진 뒤 윤린땅콩을 섞어 무기술, 아주 생기 넘치는 천연수공예품!",
    "vi": "Xiên độc quyền!!! Phiên bản giới hạn thủ công hàng ngày ~ Sử dụng thịt bò địa phương và ngâm với nhiều loại gia vị Thái -> Cắt thịt cho đến khi dẻo rồi trộn vào đậu phộng Yunlin, không cần công nghệ, rất sống động, tất cả đều là thủ công tự nhiên!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "獨家串物!!! 每日手工限量~使用本土牛肉及多種泰國香料醃製而成->肉剁到有黏性再拌入雲林落花生，沒有科技很活，全天然手工!",
    "ru": "Эксклюзивное блюдо ручной работы! Свежая говядина с тайскими травами и юньлиньским арахисом. Натуральный вкус без искусственных добавок.",
    "es": "¡Brocheta exclusiva hecha a mano! Carne de res local picada a mano con especias tailandesas y cacahuates de Yunlin. 100% artesanal y natural."
  },
  "噴水香腸": {
    "zh": "噴水香腸",
    "en": "Juicy Taiwanese Pork Sausage",
    "vi": "da gà gặm",
    "ko": "갉아먹힌 닭 껍질",
    "th": "หนังไก่แทะ",
    "ja": "鶏の皮をかじった",
    "ru": "Сочная тайваньская свиная сосиска на углях",
    "es": "Salchicha Jugosa Tradicional de Cerdo a la Parrilla"
  },
  "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表": {
    "th": "ไม่มีคำคุณศัพท์ที่สูงส่ง ~ มีแต่ความอร่อยที่ตรงที่สุดเท่านั้น ~ เป็นตัวแทนของขนมไต้หวัน",
    "ko": "고상한 형용사는 없다~가장 직접적인 맛만~대만과자 대표",
    "vi": "Không có tính từ cao cả nào ~ chỉ có độ ngon trực tiếp nhất ~ đại diện cho món ăn nhẹ của Đài Loan",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "沒有什麼高大上的形容詞~只有最直接的美味~台灣小吃代表",
    "ja": "高尚な形容詞は一切ない ～ただストレートな美味しさだけ～ 台湾スナックの代表格",
    "ru": "Классическая тайваньская сладковатая сосиска на углях с сочным и взрывным вкусом.",
    "es": "El clásico aperitivo callejero de Taiwán: salchicha de cerdo asada al carbón, rebosante de jugo y sabor dulce-salado."
  },
  "啃的雞皮": {
    "ja": "タイ風骨なし鶏もも肉のグリル",
    "en": "Crispy Charcoal Grilled Chicken Skin",
    "zh": "啃的雞皮",
    "ko": "태국식 뼈없는 구운 닭다리살",
    "th": "สะโพกไก่ย่างไร้กระดูกแบบไทย",
    "vi": "Đùi gà nướng không xương kiểu Thái",
    "ru": "Хрустящая куриная кожа на шпажке",
    "es": "Piel de Pollo Tostada al Carbón"
  },
  "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!": {
    "vi": "Ai nói da gà chỉ có thể chiên? Dưới ngọn lửa than củi, chất béo được giảm bớt ~ và chuyển thành kết cấu giòn hấp dẫn!",
    "th": "ใครว่าหนังไก่ทอดได้อย่างเดียว? ภายใต้อ้อมกอดของไฟถ่าน ไขมันก็ลดลง~ และกลายเป็นเนื้อกรอบที่น่าหลงใหล!",
    "ko": "누가 닭껍질은 튀겨야 한다고 했나요? 숯불의 품에 안겨 지방은 줄어들고~ 바삭바삭한 식감이 매력으로 변신!",
    "zh": "誰說雞皮只能炸?在炭火擁抱下收斂了油脂~蛻變成誘人酥脆口感!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ja": "鶏の皮は揚げるしかないなんて誰が言ったのでしょう？炭火の包み込みで脂が減り、カリッとした食感が魅力的！",
    "ru": "Запеченная на медленных углях куриная кожа до потрясающей хрустящей текстуры.",
    "es": "Piel de pollo asada al fuego del carbón para reducir grasa y maximizar su textura crujiente y aroma tostado."
  },
  "泰式去骨烤雞腿": {
    "ja": "タイ風骨なしローストチキンレッグ",
    "th": "น่องไก่ย่างไร้กระดูกสไตล์ไทย",
    "ko": "타이 순살 구운 닭다리",
    "vi": "Đùi Gà Nướng Rút Xương Kiểu Thái",
    "en": "Thai Boneless Grilled Chicken Leg",
    "zh": "泰式去骨烤雞腿",
    "ru": "Тайское бескостное куриное бедро на гриле",
    "es": "Muslo de Pollo Deshuesado a la Parrilla Tailandesa"
  },
  "去骨雞腿排以泰式香料醃製，外皮烤至金黃，肉質鮮嫩多汁，香氣十足。": {
    "vi": "Đùi gà rút xương ướp gia vị Thái Lan, nướng chín vàng, thịt mềm ngọt mọng nước, thơm lừng.",
    "th": "สะโพกไก่เลาะกระดูกหมักเครื่องเทศไทย ย่างจนเหลืองกรอบ เนื้อนุ่มชุ่มฉ่ำ หอมกรุ่น",
    "ko": "타이 향신료로 재운 순살 닭다리살을 노릇노릇하게 구워냈습니다. 부드럽고 육즙이 가득하며 향긋합니다.",
    "zh": "去骨雞腿排以泰式香料醃製，外皮烤至金黃，肉質鮮嫩多汁，香氣十足。",
    "en": "Boneless chicken leg marinated with Thai spices, grilled to a golden brown. Tender, juicy, and full of flavor.",
    "ja": "タイのスパイスでマリネした骨なし鶏もも肉を黄金色に焼き上げました。柔らかくジューシーで香り豊かです。",
    "ru": "Куриное филе бедра без кости, замаринованное в тайских специях. Золотистая хрустящая корочка и невероятно нежное мясо внутри.",
    "es": "Filete de muslo de pollo deshuesado marinado con especias tailandesas, asado hasta dorar la piel, jugoso y tierno."
  },
  "道地泰式海鮮乾拌mama麵（辣）": {
    "ja": "本格タイシーフードドライママヌードル（辛口）",
    "en": "Seafood MAMA Noodles",
    "zh": "道地泰式海鮮乾拌mama麵（辣）",
    "ko": "정통 태국 해산물 드라이마마 누들(매운맛)",
    "th": "บะหมี่แห้งมาม่าทะเลไทยแท้ (เผ็ด)",
    "vi": "Mì khô mama hải sản Thái Lan chính hãng (cay)",
    "ru": "Тайская лапша MAMA с морепродуктами (сухая подача, острая)",
    "es": "Fideos Secos MAMA con Mariscos al Estilo Tailandés (Picante)"
  },
  "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!": {
    "ja": "タイの定番ママヌードル～専用ソースと絡めて～フレッシュレモンを絞って！酸っぱい前菜 ＜苦手な方はご遠慮ください＞ 材料：新鮮なエビ、イカリング、タラ団子、豚団子、魚の盛り合わせ、玉ねぎ、人参の千切り、キュウリ、キャベツ！",
    "en": "Authentic Thai-style soup noodles with rich, warming broth",
    "zh": "經典泰式mama麵~拌入獨家醬汁~擠上新鮮檸檬! 酸辣開胃 <一點辣都沒吃的不要點喔>配料:鮮蝦 魷魚圈 鱈魚丸 貢丸 日本魚板 洋蔥 紅蘿蔔絲 小黃瓜 高麗菜!",
    "ko": "클래식 타이 마마 누들~특제 소스를 섞은~상큼한 레몬을 짜낸 맛! 매콤새콤 전채 <별로 좋아하지 않으면 주문하지 마세요> 재료: 신선한 새우, 오징어 링, 대구 완자, 돼지 고기 완자, 일본식 생선 접시, 양파, 채 썬 당근, 오이, 양배추!",
    "th": "มาม่าไทยสุดคลาสสิค ~ คลุกน้ำจิ้มสูตรพิเศษ ~ คั้นมะนาวสด! อาหารเรียกน้ำย่อยร้อนๆ <อย่าสั่งถ้าไม่ชอบเลย> ส่วนผสม: กุ้งสด, ปลาหมึกแหวน, ลูกชิ้นปลาคอด, ลูกชิ้นหมู, ปลาญี่ปุ่น, หัวหอม, แครอทฝอย, แตงกวา และกะหล่ำปลี!",
    "vi": "Mì Thái cổ điển ~ trộn với nước sốt độc quyền ~ vắt chanh tươi! Món khai vị chua cay <Không thích thì không gọi> Thành phần: tôm tươi, mực khoanh, cá tuyết viên, thịt heo viên, đĩa cá Nhật, hành tây, cà rốt thái sợi, dưa chuột và bắp cải!",
    "ru": "Классическая лапша MAMA со свежими креветками, кольцами кальмара, рыбными шариками, лаймом и овощами в кисло-остром соусе.",
    "es": "Fideos MAMA tailandeses mezclados con salsa especial agripicante, jugo de lima fresco, camarones, calamares, albóndigas de pescado y verduras."
  },
  "爆汁杏鮑菇": {
    "ja": "爆裂キングヒラタケ",
    "th": "เห็ดนางรมราชาระเบิด",
    "ko": "터진 새송이버섯",
    "vi": "Nấm Sò Vua Nổ",
    "en": "Juicy King Oyster Mushroom Skewer",
    "zh": "爆汁杏鮑菇",
    "ru": "Сочный гриб эринги (королевская вешенка) на углях",
    "es": "Brocheta de Hongo Rey Ostra (Eryngii) Jugoso a las Brasas"
  },
  "美味多汁~揪c的口感~杏鮑菇口感似雞肉": {
    "ja": "ジューシーで美味しい〜エリンギの食感〜エリンギの味は鶏肉に似ています",
    "zh": "美味多汁~揪c的口感~杏鮑菇口感似雞肉",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "vi": "Ngon và ngon ngọt ~ Kết cấu của nấm sò ~ Hương vị của nấm sò vua giống như thịt gà",
    "th": "อร่อยและชุ่มฉ่ำ ~ เนื้อสัมผัสของเห็ดนางรม ~ รสชาติของเห็ดนางรมหลวงก็เหมือนไก่",
    "ko": "맛있고 육즙이 풍부해요~ 느타리버섯의 식감~ 새송이버섯의 맛은 닭고기와 비슷해요",
    "ru": "Мясистый и сочный гриб эринги, запеченный на углях. По плотной текстуре и вкусу напоминает нежное куриное мясо.",
    "es": "Hongo rey ostra asado con salsa especial, sumamente jugoso y con una textura tierna similar a la pechuga de pollo."
  },
  "明太子秋刀魚(去刺)2p": {
    "zh": "明太子秋刀魚(去刺)2p",
    "en": "Deboned Pacific Saury Stuffed w/ Mentaiko (2pcs)",
    "vi": "Cá thu đao Mentaiko (đã bỏ xương) 2p",
    "ko": "멘타이코 꽁치(뼈제거) 2p",
    "th": "Mentaiko saury (เอากระดูกออก) 2p",
    "ja": "明太子さんま（骨抜き）2p",
    "ru": "Тихоокеанская сайра без костей с икрой минтая (2 шт.)",
    "es": "Pescado Saury Deshuesado Relleno de Mentaiko (2 pzas)"
  },
  "去骨去刺秋刀魚，填入明太子，口感一流!": {
    "vi": "Cá thu đao không xương và không xương, nhồi mentaiko, có vị rất ngon!",
    "ko": "뼈도 없고 가시도 없는 꽁치를 멘타이코로 채워 맛이 좋습니다!",
    "th": "ปลาซันไรย์ไม่มีกระดูกและไร้กระดูกสันหลังสอดไส้เมนไทโกะ รสชาติเยี่ยมมาก!",
    "zh": "去骨去刺秋刀魚，填入明太子，口感一流!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ja": "骨と背骨のないさんまに明太子を詰めて食べると美味しいですよ！",
    "ru": "Очищенная от костей сайра, фаршированная пикантной японской икрой минтая, запеченная на гриле до хрустящей корочки.",
    "es": "Pescado saury sin espinas relleno de deliciosa hueva de bacalao mentaiko y asado a las brasas. ¡Textura y sabor extraordinarios!"
  },
  "香菇": {
    "vi": "Nấm hương nướng than hoa",
    "th": "เห็ดหอมย่าง",
    "ko": "표고버섯 구い",
    "zh": "香菇",
    "en": "Charcoal Grilled Shiitake Mushrooms",
    "ja": "しいたけ焼き",
    "ru": "Грибы шиитаке на углях",
    "es": "Hongos Shiitake Frescos a las Brasas"
  },
  "新鮮大香菇刷上特製醬汁炭烤，鎖住香菇鮮甜多汁的原始美味。": {
    "th": "เห็ดหอมสดดอกโตทาซอสสูตรพิเศษย่างเตาถ่าน รสชาติหวานชุ่มฉ่ำตามธรรมชาติ",
    "ko": "신선하고 커다란 표고버섯에 특제 소스를 발라 숯불에 구워, 버섯 고유의 촉촉하고 달콤한 풍미를 가두었습니다.",
    "vi": "Nấm hương tươi cỡ lớn phết sốt đặc chế nướng than hoa, giữ trọn vị ngọt thanh mọng nước tự nhiên của nấm.",
    "en": "Fresh large shiitake mushrooms brushed with special sauce and charcoal grilled to retain their sweet, juicy natural taste.",
    "zh": "新鮮大香菇刷上特製醬汁炭烤，鎖住香菇鮮甜多汁的原始美味。",
    "ja": "新鮮な大ぶり椎茸に特製タレを塗って炭火焼きに。椎茸のみずみずしい甘みと旨味をぎゅっと閉じ込めました。",
    "ru": "Свежие крупные шляпки грибов шиитаке в специальном маринаде на углях. Сохраняют естественную сладость и сок грибов.",
    "es": "Hongos shiitake grandes barnizados con salsa especial y asados a fuego de carbón, reteniendo todo su aroma y jugo natural."
  },
  "青椒": {
    "vi": "tiêu xanh",
    "ko": "피망",
    "th": "พริกเขียว",
    "zh": "青椒",
    "en": "Charcoal Grilled Green Bell Pepper",
    "ja": "ピーマン",
    "ru": "Зеленый сладкий перец на углях",
    "es": "Pimiento Verde a las Brasas"
  },
  "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!": {
    "ja": "ピーマンはビタミンCが豊富な野菜で、同じ重量のオレンジや角切りのヤナギよりも多く含まれています。",
    "vi": "Ớt xanh là loại rau có hàm lượng vitamin C cao, cao hơn cả cam và liễu thái hạt lựu ở cùng trọng lượng!",
    "th": "พริกเขียวเป็นผักที่มีวิตามินซีสูง สูงกว่าส้ม และหลิวหั่นเต๋าในน้ำหนักเท่ากัน!",
    "ko": "풋고추는 같은 무게의 오렌지와 버드나무보다 비타민C 함량이 높은 채소입니다!",
    "zh": "青椒是維生素C很高的蔬菜，同重量之下比橘子、柳丁都還高!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "ru": "Зеленый перец на углях богат витамином C (его содержание на единицу веса выше, чем в апельсинах!). Сочный и сладкий.",
    "es": "Pimiento verde dulce asado al carbón, con un altísimo contenido de vitamina C, jugoso y saludable."
  },
  "精選香酥肥腸": {
    "ja": "厳選クリスピーソーセージ",
    "th": "ไส้กรอกกรอบคัดพิเศษ",
    "ko": "엄선된 크리스피 소시지",
    "vi": "Xúc Xích Giòn Tuyển Chọn",
    "en": "Crispy Charcoal Grilled Pork Intestine",
    "zh": "精選香酥肥腸",
    "ru": "Хрустящие пряные свиные потрошки (рубец/кишечник) на углях",
    "es": "Brochetas de Tripa de Cerdo Crujiente al Carbón"
  },
  "炭火慢烤，香氣四溢，每一口都是極致美味": {
    "ja": "炭火でじっくり焼き上げると香ばしさが溢れ、一口食べるごとに最高の美味しさです",
    "vi": "Được nướng từ từ trên lửa than, hương thơm tràn ngập, mỗi miếng cắn là vị ngon tuyệt đỉnh",
    "ko": "숯불에 천천히 구워서 향이 넘치고, 한입 먹을 때마다 최고의 맛이 난다",
    "th": "ค่อยๆ ย่างบนไฟถ่าน กลิ่นหอมฟุ้งฟุ้ง และทุกคำคือความอร่อยขั้นสุด",
    "zh": "炭火慢烤，香氣四溢，每一口都是極致美味",
    "en": "Slowly grilled over charcoal, bursting with rich aroma and delicious flavor in every bite.",
    "ru": "Отборные свиные потрошки, медленно запеченные на углях до хрустящей корочки снаружи и нежности внутри.",
    "es": "Tripa de cerdo selecta asada a fuego lento sobre carbón ardiente hasta lograr un acabado crujiente y aromático."
  },
  "極炙原塊牛肋(澳牛)": {
    "ja": "ビーフリブのグリル（オーストラリア産牛肉）",
    "zh": "極炙原塊牛肋(澳牛)",
    "en": "Prime Australian Beef Rib Skewer",
    "vi": "Sườn bò nướng (bò Úc)",
    "th": "ซี่โครงเนื้อย่าง (เนื้อออสเตรเลีย)",
    "ko": "구운 쇠고기 갈비(호주산 쇠고기)",
    "ru": "Австралийские говяжьи ребрышки прайм на углях",
    "es": "Brochetas de Costilla de Res Australiana Prémium a las Brasas"
  },
  "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!": {
    "th": "ซี่โครงเนื้อที่ได้สัดส่วนกำลังดีจะถูกย่างด้านนอกและด้านในเป็นสีชมพู การได้กัดสักคำถือเป็นความเพลิดเพลินสูงสุดสำหรับต่อมรับรสของคุณ!",
    "ko": "완벽한 비율의 소갈비살은 겉은 그을리고 속은 핑크빛을 띕니다. 한입 먹는 것이 입맛을 돋우는 최고의 즐거움입니다!",
    "vi": "Những miếng sườn bò có tỷ lệ hoàn hảo được nướng chín bên ngoài và hồng hào bên trong. Cắn một miếng là cảm giác thích thú tột cùng dành cho vị giác của bạn!",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "金比例的牛肋肉塊,烤炙外表焦香,內裡粉嫩,一口咬下,是味蕾的極致享受!",
    "ja": "絶妙なバランスの牛カルビは、外は炙り、中はピンク色に焼き上げられています。一口食べると、味覚にとって最高の楽しみが得られます。",
    "ru": "Идеальные кусочки говяжьих ребрышек, поджаренные снаружи и сочные внутри. Истинное наслаждение для рецепторов!",
    "es": "Trozos de costilla de res australiana en proporción perfecta de carne y grasa, dorados por fuera y tiernos por dentro."
  },
  "肉雞七里香": {
    "en": "Marinated Chicken Tail Skewers (5pcs)",
    "zh": "肉雞七里香",
    "th": "ไก่เนื้อ Qilixiang",
    "ko": "육계 치킨 Qilixiang",
    "vi": "Gà thịt Qilixiang",
    "ja": "ブロイラーチキン キリシャン",
    "ru": "Куриные хвостики в маринаде на углях (5 шт./шпажка)",
    "es": "Brocheta de Colitas de Pollo Marinadas a las Brasas (5 pzas)"
  },
  "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!": {
    "ja": "七里香入りブロイラー串5本～半分には切れません！毎日朝市で仕入れた新鮮〜摘み取って洗って専用マリネに漬け込んで帰ってきます！",
    "en": "Slowly grilled over charcoal, bursting with aroma and flavor",
    "zh": "五顆一串肉雞七里香 ~沒有剖半喔! 每日早市新鮮採買~回來拔毛洗淨醃製獨家醃料!",
    "th": "ไก่เนื้อห้าเสียบไม้กับ Qilixiang ~ ไม่ผ่าครึ่ง! ซื้อสดใหม่ที่ตลาดเช้าทุกวัน ~ กลับมาถอน ล้าง และหมักด้วยน้ำดองสุดพิเศษ!",
    "ko": "칠리샹을 곁들인 육계 꼬치 5개~ 반으로 쪼개지지 않아요! 매일 아침시장에서 갓 구매한~ 직접 따서 씻어서 전용 양념장에 재워두세요!",
    "vi": "Năm xiên gà thịt với Qilixiang ~ không cắt làm đôi! Mới mua ở chợ buổi sáng hàng ngày ~ quay lại hái, rửa sạch và ướp với nước xốt độc quyền!",
    "ru": "5 цельных куриных хвостиков на одной шпажке. Свежее мясо с утреннего рынка, тщательно очищенное и замаринованное по фирменному рецепту.",
    "es": "5 colitas de pollo enteras por brocheta, compradas a diario en el mercado matutino, limpias y marinadas con receta secreta."
  },
  "香菜豬肉捲": {
    "en": "Pork Roll with Cilantro",
    "zh": "香菜豬肉捲",
    "th": "หมูสามชั้นพันผักชี",
    "ko": "고수 삼겹살말이",
    "vi": "Ba chỉ heo cuộn rau mùi (ngò rí)",
    "ja": "パクチー豚肉巻き",
    "ru": "Рулетики из свинины со свежей кинзой",
    "es": "Rollitos de Panceta de Cerdo Rellenos de Cilantro Fresco"
  },
  "精選豬五花包裹新鮮香菜，炭火烤出油脂香氣，喜愛香菜者的必點美味。": {
    "ja": "厳選された豚バラ肉で新鮮なパクチーを包み、炭火で香ばしく焼き上げました。パクチー好きにはたまらない一品です。",
    "zh": "精選豬五花包裹新鮮香菜，炭火烤出油脂香氣，喜愛香菜者的必點美味。",
    "en": "Premium pork belly wrapped around fresh cilantro (coriander), grilled over charcoal to aromatic perfection. A must-try for cilantro lovers.",
    "vi": "Thịt ba chỉ tuyển chọn cuộn rau mùi tươi, nướng than hoa thơm lừng hòa quyện cùng vị béo của thịt. Món ngon không thể bỏ qua cho tín đồ mê rau mùi.",
    "ko": "엄선된 삼겹살로 신선한 고수를 감싸 숯불에 구워 고소한 고기 기름과 향긋한 고수 향이 어우러집니다. 고수 마니아라면 반드시 맛봐야 할 메뉴.",
    "th": "หมูสามชั้นคัดพิเศษพันผักชีสด ย่างเตาถ่านจนส่งกลิ่นหอมละมุน เมนูที่คนรักผักชีห้ามพลาด",
    "ru": "Отборная свиная грудинка со свежей ароматной кинзой, запеченная на углях. Настоящая находка для любителей кинзы!",
    "es": "Panceta de cerdo selecta enrollada con abundante cilantro fresco, asada a la parrilla para fundir la grasa y resaltar el aroma verde."
  },
  "小費及折扣": {
    "ja": "チップ・割引",
    "ko": "팁 및 할인",
    "th": "ทิปและส่วนลด",
    "vi": "Tiền tip & Giảm giá",
    "en": "Tips & Discounts",
    "zh": "小費及折扣",
    "ru": "Чаевые и скидки",
    "es": "Propinas y Descuentos"
  },
  "冰櫃酒水 🧊": {
    "ja": "冷蔵ドリンク・お酒 🍺",
    "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
    "ko": "냉장 음료 및 주류 🍺",
    "vi": "Đồ uống & Rượu lạnh 🍺",
    "en": "Refrigerated Drinks & Alcohol 🍺",
    "zh": "冰櫃酒水 🧊",
    "ru": "Холодные напитки и алкоголь 🍺",
    "es": "Bebidas Frías y Alcohol 🍺"
  },
  "冬蔭功系列 🍜": {
    "vi": "Dòng súp Tom Yum 🍜",
    "ko": "똠얌 수프 시리즈 🍜",
    "th": "ชุดต้มยำสุดแซ่บ 🍜",
    "zh": "冬蔭功系列 🍜",
    "en": "Tom Yum Series 🍜",
    "ja": "トムヤムシリーズ 🍜",
    "ru": "Супы Том Ям",
    "es": "Sopas Tom Yum"
  },
  "熱湯 🥢越南牛肉河粉": {
    "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
    "zh": "熱湯 🥢越南牛肉河粉",
    "en": "Hot Soups & Beef Pho 🥢",
    "vi": "Súp nóng & Phở bò Việt Nam 🥢",
    "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢",
    "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
    "ru": "Горячие супы и суп Фо 🥢",
    "es": "Sopas Calientes y Fideos Pho 🥢"
  },
  "精選套餐 🍱優惠": {
    "vi": "Combo đặc biệt 🍱",
    "ko": "셰프 추천 특선 세트 🍱",
    "th": "เซตเมนูสุดคุ้ม 🍱",
    "zh": "精選套餐 🍱優惠",
    "en": "Chef's Special Combos 🍱",
    "ja": "主理人厳選お得セット 🍱",
    "ru": "Фирменные комбо-сеты 🍱",
    "es": "Combos y Sets Especiales 🍱"
  },
  "招牌泰式海鮮 🦐": {
    "vi": "Hải sản nướng Thái Lan 🦐",
    "ko": "시그니처 태국식 해산물 🦐",
    "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
    "zh": "招牌泰式海鮮 🦐",
    "en": "Signature Thai Seafood 🦐",
    "ja": "本格タイ風炭火焼きシーフード 🦐",
    "ru": "Тайские морепродукты 🦐",
    "es": "Mariscos Tailandeses 🦐"
  },
  "小農鮮蔬菜 🥬": {
    "ja": "地元新鮮野菜焼き 🥬",
    "en": "Farm Fresh Vegetables 🥬",
    "zh": "小農鮮蔬菜 🥬",
    "ko": "신선한 채소 구이 🥬",
    "th": "ผักสดฟาร์มย่าง 🥬",
    "vi": "Rau củ tươi sạch 🥬",
    "ru": "Свежие овощи на гриле 🥬",
    "es": "Vegetales Frescos de Granja 🥬"
  },
  "碳烤肉類 🍢其他": {
    "zh": "碳烤肉類 🍢其他",
    "en": "Charcoal BBQ Skewers & Others 🍢",
    "vi": "Thịt nướng xiên & Khác 🍢",
    "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢",
    "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
    "ja": "タイ風肉串炭火焼き・その他 🍢",
    "ru": "Шашлычки на углях",
    "es": "Brochetas a las Brasas"
  },
  "泰式特色甜品 🍰": {
    "ko": "태국식 달콤 디저트 🍰",
    "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
    "vi": "Tráng miệng kiểu Thái 🍰",
    "en": "Thai Desserts & Sweets 🍰",
    "zh": "泰式特色甜品 🍰",
    "ja": "タイ風特製デザート 🍰",
    "ru": "Тайские десерты и сладости 🍰",
    "es": "Postres y Dulces Tailandeses 🍰"
  },
  "泰特色沁涼飲品 🍹": {
    "en": "Refreshing Thai Cold Drinks 🍹",
    "zh": "泰特色沁涼飲品 🍹",
    "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
    "ko": "태국식 청량 음료 🍹",
    "vi": "Đồ uống lạnh kiểu Thái 🍹",
    "ja": "タイ風さわやかドリンク 🍹",
    "ru": "Напитки",
    "es": "Bebidas"
  },
  "獨家醬料 🥫": {
    "ja": "秘伝の特製タレ・ソース 🥫",
    "en": "Exclusive Secret Sauces 🥫",
    "zh": "獨家醬料 🥫",
    "th": "ซอสสูตรลับพิเศษ 🥫",
    "ko": "단독 수제 특제 소스 🥫",
    "vi": "Nước sốt độc quyền 🥫",
    "ru": "Фирменные соусы 🥫",
    "es": "Salsas Secretas Exclusivas 🥫"
  },
  "成人酒品專區 🔞": {
    "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
    "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
    "ko": "성인 주류 전용 구역 (18+) 🔞",
    "zh": "成人酒品專區 🔞",
    "en": "Adult Alcoholic Beverages (18+) 🔞",
    "ja": "成人向けお酒エリア (18+) 🔞",
    "ru": "Алкоголь для взрослых (18+) 🔞",
    "es": "Bebidas Alcohólicas (18+) 🔞"
  },
  "餐點食用完畢後結帳": {
    "zh": "餐點食用完畢後結帳",
    "en": "Please pay after finishing your meal",
    "th": "ชำระเงินหลังจากรับประทานอาหารเสร็จสิ้น",
    "ja": "お食事後にお会計をお願いいたします",
    "ko": "식사를 마치신 후 결제해 주세요",
    "vi": "Vui lòng thanh toán sau khi dùng bữa xong",
    "ru": "Пожалуйста, оплатите после завершения трапезы",
    "es": "Por favor pague al finalizar su comida"
  },
  "（餐點食用完畢後結帳）": {
    "zh": "（餐點食用完畢後結帳）",
    "en": "(Please pay after finishing your meal)",
    "th": "(ชำระเงินหลังจากรับประทานอาหารเสร็จสิ้น)",
    "ja": "(お食事後にお会計をお願いいたします)",
    "ko": "(식사를 마치신 후 결制해 주세요)",
    "vi": "(Vui lòng thanh toán sau khi dùng bữa xong)",
    "ru": "(Пожалуйста, оплатите после завершения трапезы)",
    "es": "(Por favor pague al finalizar su comida)"
  }
};

/**
 * Safely resolves localized text from a potentially malformed or string-only object.
 * Intelligently falls back to dictionary translation or alternative languages if current language is unavailable or identical to Chinese.
 */
export const getLocalizedText = (
  textObj: { [key in Language]?: string } | string | undefined | null,
  currentLang: Language
): string => {
  if (!textObj) return '';

  let parsedObj: { [key in Language]?: string } | null = null;
  let rawStr = '';

  if (typeof textObj === 'string') {
    const trimmed = textObj.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsedObj = JSON.parse(trimmed);
      } catch {
        rawStr = textObj;
      }
    } else {
      rawStr = textObj;
    }
  } else if (typeof textObj === 'object') {
    parsedObj = textObj;
  }

  // 1. Direct match if parsedObj exists
  if (parsedObj) {
    const directVal = parsedObj[currentLang]?.trim();
    const zhVal = parsedObj['zh']?.trim() || '';

    // If directVal exists and is NOT identical to zhVal (or if currentLang is zh), return it!
    if (directVal && (currentLang === 'zh' || directVal !== zhVal)) {
      return directVal;
    }

    // Check dictionary using zhVal or any available value
    const lookupKey = zhVal || parsedObj['en'] || '';
    if (lookupKey && TRANSLATION_DICTIONARY[lookupKey]?.[currentLang]) {
      return TRANSLATION_DICTIONARY[lookupKey]![currentLang]!;
    }

    // Fallback to English if currentLang is not zh/en and en is distinct from zh
    if (currentLang !== 'en' && parsedObj['en'] && parsedObj['en'] !== zhVal) {
      return parsedObj['en'];
    }

    // Fallback to zh or first non-empty value
    return zhVal || parsedObj['en'] || parsedObj['ru'] || parsedObj['es'] || parsedObj['th'] || parsedObj['ja'] || parsedObj['ko'] || parsedObj['vi'] || '';
  }

  // 2. If textObj was a raw string
  if (rawStr) {
    // Check dictionary
    if (TRANSLATION_DICTIONARY[rawStr]?.[currentLang]) {
      return TRANSLATION_DICTIONARY[rawStr]![currentLang]!;
    }

    // Check for "Chinese / English" split format
    if (rawStr.includes('/')) {
      const parts = rawStr.split('/').map(s => s.trim());
      if (parts.length >= 2) {
        if (currentLang === 'zh') return parts[0];
        return parts[1] || parts[0];
      }
    }

    // Check for "Chinese (English)" format
    const match = rawStr.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      if (currentLang === 'zh') return match[1].trim();
      return match[2].trim();
    }

    return rawStr;
  }

  return '';
};
