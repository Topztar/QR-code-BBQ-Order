import json
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed():
    # This is a simplified seeder. In a real scenario, we'd parse the actual src/data.ts
    # or use the generate_data_ts.py logic.
    # For now, let's assume we have a JSON export or we hardcode some defaults
    # based on what we've seen in the codebase.

    db = SessionLocal()
    models.Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(models.MenuItem).first():
        print("Database already seeded.")
        return

    # Mock Initial Data (derived from server.ts and src/data.ts analysis)
    # In a real task, I would extract this precisely.

    # Categories
    categories = [
        {"id": "combos", "name": {"zh": "優惠折扣 🍱", "en": "Discounts & Combos", "ko": "할인 및 세트", "ja": "割引・セット", "th": "ส่วนลดและคอมโบ"}},
        {"id": "skewers", "name": {"zh": "原味碳烤肉類 🍢", "en": "Charcoal BBQ Skewers", "ko": "오리지널 숯불 꼬치", "ja": "タイ風肉串炭火焼き", "th": "บาร์บีคิวเสียบไม้ย่าง"}},
    ]
    # We store categories in Settings or a separate Table. Let's use Settings for flexibility.
    db.add(models.Setting(key="categories", value=categories))

    # Menu Items - Just a few for testing
    menu_items = [
        models.MenuItem(
            id="dish-2696007842576",
            category="drinks",
            name={"zh": "Vitamilk豆奶", "en": "Vitamilk Soy Milk", "ko": "비타밀크 두유", "ja": "ビタミルク豆乳", "th": "นมถั่วเหลืองไวตามิ้ลค์"},
            price=60.0,
            image="https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
            description={"zh": "沁涼消暑，口感清爽，搭配燒烤絕配", "en": "Refreshing and cool, a perfect match for BBQ", "ko": "시원하고 상쾌한 음료로 바베큐와 완벽한 조화", "ja": "冷たくさわやか、BBQに最高の組み合わせ", "th": "เย็นชื่นใจ รสสดชื่น เข้ากับบาร์บีคิวได้อย่าง論ตัว"},
            available=True,
            orderIndex=0
        )
    ]
    db.add_all(menu_items)

    # Tables
    for i in range(1, 13):
        if i == 4 or i == 7 or i == 9 or i == 11: continue
        db.add(models.TableConfig(id=str(i), qrCodeUrl=f"/?table={i}", status="available", positionX=10*i, positionY=20))

    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
