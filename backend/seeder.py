import os
import re
import json
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
    db = SessionLocal()
    models.Base.metadata.create_all(bind=engine)

    if db.query(models.MenuItem).first():
        db.close()
        return

    ts_path = os.path.join(os.path.dirname(__file__), "..", "src", "data.ts")
    if not os.path.exists(ts_path):
        db.close()
        return

    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()

    menu_items = extract_array(content, 'INITIAL_MENU')
    ingredients = extract_array(content, 'INITIAL_INGREDIENTS')

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
    db.close()

if __name__ == "__main__":
    seed_db()
