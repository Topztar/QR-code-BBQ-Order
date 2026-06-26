import os
import re
import json
import sys
from database import SessionLocal, engine
import models

def clean_to_json(raw_array):
    protected = []
    def protect(m):
        protected.append(m.group(0))
        return f"__STR{len(protected)-1}__"

    res = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', protect, raw_array)
    res = res.replace("'", '"')
    res = re.sub(r'(\w+):', r'"\1":', res)
    for i, s in enumerate(protected):
        res = res.replace(f"__STR{i}__", s)
    res = re.sub(r',(\s*[\]\}])', r'\1', res)
    return res

def extract_array(content, variable_name):
    pattern = rf'export const {variable_name}: \w+\[\] = (\[[\s\S]*?\]);'
    match = re.search(pattern, content)
    if not match:
        return []

    raw_array = match.group(1)
    try:
        try:
            return json.loads(re.sub(r',(\s*[\]\}])', r'\1', raw_array))
        except:
            json_str = clean_to_json(raw_array)
            return json.loads(json_str)
    except Exception as e:
        print(f"[Seeder] Failed to parse {variable_name}: {e}")
        return []

def seed_db():
    import datetime
    db = SessionLocal()
    models.Base.metadata.create_all(bind=engine)

    # Migration check for missing columns
    from sqlalchemy import inspect
    inspector = inspect(engine)
    if "tables" in inspector.get_table_names():
        table_cols = [col["name"] for col in inspector.get_columns("tables")]
        if "mergedWith" not in table_cols:
            print("[Migration] Adding mergedWith column to tables table", flush=True)
            with engine.begin() as conn:
                conn.execute("ALTER TABLE tables ADD COLUMN mergedWith TEXT DEFAULT ''")
                
    if "orders" in inspector.get_table_names():
        order_cols = [col["name"] for col in inspector.get_columns("orders")]
        with engine.begin() as conn:
            if "discount" not in order_cols:
                print("[Migration] Adding discount column to orders table", flush=True)
                conn.execute("ALTER TABLE orders ADD COLUMN discount FLOAT DEFAULT 0.0")
            if "guestCount" not in order_cols:
                print("[Migration] Adding guestCount column to orders table", flush=True)
                conn.execute("ALTER TABLE orders ADD COLUMN guestCount INTEGER")
            if "refundLogs" not in order_cols:
                print("[Migration] Adding refundLogs column to orders table", flush=True)
                conn.execute("ALTER TABLE orders ADD COLUMN refundLogs JSON")

    print(f"[Seeder] Starting seed_db...", flush=True)
    
    # 1. Seed Menu Items and Ingredients
    if not db.query(models.MenuItem).first():
        if getattr(sys, 'frozen', False):
            ts_path = os.path.join(sys._MEIPASS, "src", "data.ts")
        else:
            ts_path = os.path.join(os.path.dirname(__file__), "..", "src", "data.ts")
        
        print(f"[Seeder] Resolved ts_path: {ts_path}", flush=True)
        print(f"[Seeder] ts_path exists: {os.path.exists(ts_path)}", flush=True)
        if os.path.exists(ts_path):
            with open(ts_path, 'r', encoding='utf-8') as f:
                content = f.read()

            menu_items = extract_array(content, 'INITIAL_MENU')
            ingredients = extract_array(content, 'INITIAL_INGREDIENTS')
            print(f"[Seeder] Extracted {len(menu_items)} menu items and {len(ingredients)} ingredients.", flush=True)

            for item in menu_items:
                db_item = models.MenuItem(
                    id=item.get('id'),
                    category=item.get('category'),
                    name=item.get('name'),
                    price=item.get('price'),
                    image=item.get('image'),
                    description=item.get('description'),
                    available=item.get('available', True),
                    isSetMeal=item.get('isSetMeal', False),
                    hasNoodlesOption=item.get('hasNoodlesOption', False),
                    hasCoconutsMilkOption=item.get('hasCoconutsMilkOption', False),
                    containsBeef=item.get('containsBeef', False),
                    containsPork=item.get('containsPork', False),
                    containsSeafood=item.get('containsSeafood', False),
                    isNotSpicy=item.get('isNotSpicy', False),
                    orderIndex=item.get('orderIndex', 0)
                )
                db.add(db_item)

            for ing in ingredients:
                db_ing = models.Ingredient(
                    id=ing.get('id'),
                    name=ing.get('name'),
                    stock=ing.get('stock'),
                    minThreshold=ing.get('minThreshold'),
                    unit=ing.get('unit')
                )
                db.add(db_ing)
            db.commit()

    # 2. Seed Tables
    if not db.query(models.TableConfig).first():
        tables = [
            { "id": '1', "qrCodeUrl": '/?table=1', "status": 'available', "positionX": 10, "positionY": 15 },
            { "id": '2', "qrCodeUrl": '//?table=2', "status": 'available', "positionX": 35, "positionY": 15 },
            { "id": '3', "qrCodeUrl": '/?table=3', "status": 'preserved', "preservedFor": '張經理 (預約 18:30)', "positionX": 60, "positionY": 15 },
            { "id": '5', "qrCodeUrl": '/?table=5', "status": 'available', "positionX": 10, "positionY": 45 },
            { "id": '6', "qrCodeUrl": '/?table=6', "status": 'available', "positionX": 35, "positionY": 45 },
            { "id": '8', "qrCodeUrl": '/?table=8', "status": 'available', "positionX": 60, "positionY": 45 },
            { "id": '10', "qrCodeUrl": '/?table=10', "status": 'available', "positionX": 10, "positionY": 75 },
            { "id": '12', "qrCodeUrl": '/?table=12', "status": 'available', "positionX": 35, "positionY": 75 },
        ]
        for t in tables:
            db.add(models.TableConfig(
                id=t["id"],
                qrCodeUrl=t["qrCodeUrl"],
                status=t["status"],
                preservedFor=t.get("preservedFor", ""),
                positionX=t["positionX"],
                positionY=t["positionY"]
            ))
        db.commit()

    # 3. Seed Reservations
    if not db.query(models.Reservation).first():
        reservations = [
            {
                "id": 'res-1',
                "customerName": '張經理',
                "phone": '0912-345-678',
                "guestCount": 4,
                "tableNumber": '3',
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": '18:30',
                "status": 'pending',
                "notes": '預約靠窗桌席，保留至18:45',
            },
            {
                "id": 'res-2',
                "customerName": '陳小姐',
                "phone": '0987-654-321',
                "guestCount": 2,
                "tableNumber": '5',
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": '19:00',
                "status": 'pending',
                "notes": '需要嬰兒椅 / 不要牛肉',
            }
        ]
        for r in reservations:
            db_res = models.Reservation(
                id=r["id"],
                guestCount=r["guestCount"],
                tableNumber=r["tableNumber"],
                date=r["date"],
                time=r["time"],
                status=r["status"],
                notes=r["notes"]
            )
            # Use property setters for encrypted columns
            db_res.customerName = r["customerName"]
            db_res.phone = r["phone"]
            db.add(db_res)
        db.commit()

    # 4. Seed Settings
    default_settings = {
        "categories": [
            { "id": 'tomyum', "name": { "zh": '多隆功系列 🍜', "en": 'Tom Yum Soups', "ko": '똠얌 수프 시리즈', "ja": 'トムヤムスープ類', "th": 'ชุดต้มยำสุดแซ่บ' } },
            { "id": 'noodles', "name": { "zh": '單人熱麵食 🥢', "en": 'Single Noodles', "ko": '단품 매운 면 요리', "ja": 'お一人様用麺類', "th": 'บะหมี่และก๋วยเตี๋ยวจานเดี่ยว' } },
            { "id": 'combos', "name": { "zh": '主廚精選套餐 🍱', "en": 'Signature Meals', "ko": '시그니처 세트 요리', "ja": '主理人お得セット', "th": 'เซตเมนูยอดนิยม Sabay' } },
            { "id": 'veggies', "name": { "zh": '小農鮮蔬菜 🥬', "en": 'Fresh Veggies', "ko": '신선한 채소 구이', "ja": '地元新鮮野菜焼き', "th": 'ผักสดฟาร์มย่าง' } },
            { "id": 'skewers', "name": { "zh": '原味碳烤肉類 🍢', "en": 'Charcoal BBQ Skewers', "ko": '오리지널 숯불 꼬치', "ja": 'タイ風肉串炭火焼き', "th": 'บาร์บีคิวเสียบไม้ย่าง' } },
            { "id": 'seafood', "name": { "zh": '招牌泰式海鮮 🦐', "en": 'Thai Seafood BBQ', "ko": '시그니처 태국式 해산물 구이', "ja": '本格タイ風炭火焼きシーフード', "th": 'อาหารทะเลเผาสูตรเด็ด' } },
            { "id": 'sweets', "name": { "zh": '泰式特色甜品 🍰', "en": 'Desserts & Sweets', "ko": '태국식 달콤 디저트', "ja": 'タイ風特製デザート', "th": 'ขนมหวานและพุดดิ้งสูตรพิเศษ' } },
            { "id": 'drinks', "name": { "zh": '泰特色沁涼飲品 🍹', "en": 'Thai Cold Drinks', "ko": '태국식 야외 청涼 飲料', "ja": 'タイ風さわやかドリンク', "th": 'เครื่องดื่มดับร้อนรสสดชื่น' } },
        ],
        "min_spend": 200,
        "operating_hours": [
            { "id": 'oh-1', "name": '午餐時段 Lunch Session', "start": '11:00', "end": '14:30', "days": [0, 1, 2, 3, 4, 5, 6], "isActive": True },
            { "id": 'oh-2', "name": '晚餐時段 Dinner Session', "start": '17:00', "end": '22:00', "days": [0, 1, 2, 3, 4, 5, 6], "isActive": True }
        ],
        "rest_days": [],
        "customer_notice": '📣 歡迎來到沙貝泰式炭烤！我們提供正宗的泰南冬蔭功 and 頂級碳烤串燒。內用低消每人 200 元，用餐限時 60 分鐘。祝您用餐愉快！Sabay Thai BBQ wishes you a delicious meal!',
        "service_paused": False,
        "option_rules": [],
        "promo_combo": { "enabled": True, "requiredQty": 10, "discountAmount": 20, "eligibleItemIds": [] },
        "promo_combos": [ { "id": 'default-combo-1', "name": '限時特惠套餐折抵', "enabled": True, "requiredQty": 10, "discountAmount": 20, "eligibleItemIds": [] } ],
        "printer_settings": {
            "kitchen": {
                "connectionType": 'IP',
                "ip": '192.168.1.101',
                "usbPort": 'USB001',
                "width": '80mm',
                "fontSizeFactor": 1.0,
                "restaurantName": '沙貝燒烤 泰式廚房',
                "printTelephone": '02-1234-5678',
                "printAddress": '台北市信義區泰式一番街8號',
                "printTimeEnabled": True,
                "headerPrefix": '★★★ 廚房工作備餐單 ★★★',
                "footerSuffix": '請主廚盡速配餐出餐！'
            },
            "bill": {
                "connectionType": 'USB',
                "ip": '192.168.1.102',
                "usbPort": 'USB002',
                "width": '58mm',
                "fontSizeFactor": 0.8,
                "restaurantName": '沙貝燒烤 SABAY BBQ',
                "printTelephone": '02-1234-5678',
                "printAddress": '台北市信義區泰式一番街8號',
                "printTimeEnabled": True,
                "headerPrefix": '★★★ 顧客結帳明細單 ★★★',
                "footerSuffix": '謝謝光臨，歡迎再度光臨！'
            }
        },
        "popular_item_ids": ['ty-01', 'nd-01', 'sk-02', 'sk-01'],
        "member_points_ratio": 20,
        "member_rewards": [
            { "id": 'rew-01', "menuItemId": 'sk-02', "cost": 900, "fallbackPrice": 90, "enabled": True },
            { "id": 'rew-02', "menuItemId": 'vg-01', "cost": 800, "fallbackPrice": 80, "enabled": True },
            { "id": 'rew-03', "menuItemId": 'dr-01', "cost": 1800, "fallbackPrice": 180, "enabled": True },
            { "id": 'rew-04', "menuItemId": 'sw-01', "cost": 900, "fallbackPrice": 90, "enabled": True },
            { "id": 'rew-05', "menuItemId": 'ty-01', "cost": 2600, "fallbackPrice": 260, "enabled": True }
        ],
        "print_logs": [],
        "promo_notifications": [
            {
                "id": 'notif-seed-1',
                "timestamp": datetime.datetime.now().strftime("%I:%M:%S %p"),
                "title": '沙貝招牌推薦 🌟',
                "message": '熱門！特盛大鮮蝦拼盤與泰式手工牛肉串現正熱賣中，會員再享積點優惠！',
                "badge": 'PROMO',
                "isRead": False
            }
        ],
        "printer_ip": "10.0.0.124",
        "inventory_logs": [
            {
                "id": 'ir-seed-1',
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
                "ingredientId": 'ig-01',
                "ingredientName": '特選五花豬肉片',
                "type": 'incoming',
                "quantityChanged": 50,
                "remainingStock": 50,
                "note": '手動初始原料進貨'
            }
        ],
        "takeout_seq": 0,
        "last_takeout_date": datetime.datetime.now().strftime("%a %b %d %Y")
    }

    # Add default orderIndex to categories
    for idx, c in enumerate(default_settings["categories"]):
        c["orderIndex"] = idx

    for key, val in default_settings.items():
        if not db.query(models.Setting).filter(models.Setting.key == key).first():
            db.add(models.Setting(key=key, value=val))
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_db()
