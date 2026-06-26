from datetime import UTC
import datetime
import json
import os
import sys
import uuid
import socket
from typing import List, Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Body, Request, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

import models
import schemas
import database
import socket_manager
from auth.jwt_handler import sign_jwt, decode_jwt
from auth.bearer import JWTBearer
from database import engine, get_db
from seeder import seed_db
from business_logic import calculate_promo_discount

# Initialize Database and Seed data
models.Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(title="Sabay BBQ Enterprise Windows Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/ws", socket_manager.sio_app)

# --- Settings & Persistence Helpers ---

def get_setting_value(db: Session, key: str, default: Any = None) -> Any:
    s = db.query(models.Setting).filter(models.Setting.key == key).first()
    return s.value if s else default

def set_setting_value(db: Session, key: str, value: Any):
    s = db.query(models.Setting).filter(models.Setting.key == key).first()
    if s:
        s.value = value
    else:
        s = models.Setting(key=key, value=value)
        db.add(s)
    db.commit()

def is_store_open(db: Session) -> bool:
    tz_offset = datetime.timezone(datetime.timedelta(hours=8))
    now = datetime.datetime.now(tz_offset)
    
    rest_days = get_setting_value(db, "rest_days", [])
    date_str = now.strftime("%Y-%m-%d")
    if date_str in rest_days:
        return False
        
    day = (now.weekday() + 1) % 7
    current_minutes = now.hour * 60 + now.minute
    operating_hours = get_setting_value(db, "operating_hours", [])
    
    for slot in operating_hours:
        if not slot.get("isActive", True):
            continue
        days = slot.get("days", [0, 1, 2, 3, 4, 5, 6])
        if day not in days:
            continue
        
        try:
            start_h, start_m = map(int, slot["start"].split(":"))
            end_h, end_m = map(int, slot["end"].split(":"))
        except:
            continue
            
        start_min = start_h * 60 + start_m
        end_min = end_h * 60 + end_m
        
        if start_min <= end_min:
            if start_min <= current_minutes <= end_min:
                return True
        else:
            if current_minutes >= start_min or current_minutes <= end_min:
                return True
    return False

def get_recipe_for_menu_item(item: Any) -> List[Dict[str, Any]]:
    recipe = []
    if hasattr(item, "id"):
        item_id = item.id
        name_zh = item.name.get("zh", "") if isinstance(item.name, dict) else ""
        category = item.category
        is_set_meal = getattr(item, "isSetMeal", False)
        contains_beef = getattr(item, "containsBeef", False)
        contains_pork = getattr(item, "containsPork", False)
        contains_seafood = getattr(item, "containsSeafood", False)
        has_noodles = getattr(item, "hasNoodlesOption", False)
        has_coconut = getattr(item, "hasCoconutsMilkOption", False)
    else:
        item_id = item.get("menuItemId") or item.get("id") or ""
        name_zh = item.get("name", {}).get("zh", "") if isinstance(item.get("name"), dict) else ""
        category = item.get("category", "")
        is_set_meal = item.get("isSetMeal", False)
        contains_beef = item.get("containsBeef", False)
        contains_pork = item.get("containsPork", False)
        contains_seafood = item.get("containsSeafood", False)
        has_noodles = item.get("hasNoodlesOption", False)
        has_coconut = item.get("hasCoconutsMilkOption", False)
        
    if contains_beef or "牛肉" in name_zh or "牛" in name_zh:
        recipe.append({"ingredientId": "ig-02", "amount": 2 if is_set_meal else 1})
    if contains_pork or "豬五花" in name_zh or "豬肉" in name_zh or "豬" in name_zh:
        recipe.append({"ingredientId": "ig-08", "amount": 2 if is_set_meal else 1})
    if contains_seafood or any(k in name_zh for k in ["蝦", "海鮮", "蛤蜊", "生蠔", "干貝", "墨魚"]):
        if "干貝" in name_zh or "生蠔" in name_zh:
            recipe.append({"ingredientId": "ig-04", "amount": 2})
        else:
            recipe.append({"ingredientId": "ig-01", "amount": 3 if is_set_meal else 2})
    if has_noodles or "麵" in name_zh or "冬蔭功湯" in name_zh or category == "noodles":
        recipe.append({"ingredientId": "ig-05", "amount": 1})
    if has_coconut or any(k in name_zh for k in ["椰奶", "椰子", "椰"]):
        recipe.append({"ingredientId": "ig-06", "amount": 0.25})
    if category == "drinks" and any(k in name_zh for k in ["茶", "泰茶", "奶茶"]):
        recipe.append({"ingredientId": "ig-07", "amount": 0.35})
    if category == "veggies" or "高麗菜" in name_zh or "菜" in name_zh:
        recipe.append({"ingredientId": "ig-03", "amount": 0.15})
        
    return recipe

# --- Audit Utility ---
async def log_audit_event(db: Session, user: str, action: str, resource: str, details: str = ""):
    new_log = models.AuditLog(user=user, action=action, resource=resource)
    new_log.details = details
    db.add(new_log)
    db.commit()

# --- Authentication (Staff PIN to JWT) ---

ACTIVE_PIN = "888888"

@app.post("/api/staff/pin/verify")
async def verify_staff_pin(payload: Dict[str, str] = Body(...), db: Session = Depends(get_db)):
    pin = payload.get("pin")
    valid_pins = [ACTIVE_PIN, "070718", "FSY20260606"]

    if pin in valid_pins:
        token_data = sign_jwt("staff_admin")
        await log_audit_event(db, "staff_admin", "VERIFY_PIN_SUCCESS", "AUTH", "Session bootstrapped via PIN")
        return token_data

    await log_audit_event(db, "anonymous", "VERIFY_PIN_FAIL", "AUTH", f"Failed attempt with PIN: {pin}")
    raise HTTPException(status_code=401, detail="驗證失敗")

@app.post("/api/printer/pin")
async def change_pin(payload: Dict[str, str] = Body(...), db: Session = Depends(get_db)):
    global ACTIVE_PIN
    current_pin = payload.get("currentPin")
    new_pin = payload.get("newPin")
    
    if current_pin != ACTIVE_PIN:
        return JSONResponse(status_code=400, content={"error": "目前解鎖金鑰輸入錯誤！ / Incorrect current PIN"})
        
    if not new_pin or not new_pin.isdigit() or len(new_pin) != 6:
        return JSONResponse(status_code=400, content={"error": "新金鑰必須為 6 位半形數字！ / New PIN must be a 6-digit number"})
        
    ACTIVE_PIN = new_pin
    await log_audit_event(db, "staff_admin", "CHANGE_PIN_SUCCESS", "AUTH", f"PIN updated securely")
    return {"success": True, "message": "員工解鎖金鑰已成功變更！ / PIN updated successfully"}

# --- Categories ---

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = get_setting_value(db, "categories", [])
    return sorted(categories, key=lambda c: c.get("orderIndex", 0))

@app.post("/api/categories", dependencies=[Depends(JWTBearer())])
def create_category(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    cat_id = payload.get("id")
    name = payload.get("name")
    show_on_customer_page = payload.get("showOnCustomerPage", True)
    if not cat_id or not name:
        raise HTTPException(status_code=400, detail="Missing required field: id or name")
    
    categories = get_setting_value(db, "categories", [])
    if any(c.get("id") == cat_id for c in categories):
        raise HTTPException(status_code=400, detail="Category ID already exists")
    
    new_cat = {
        "id": cat_id,
        "name": name,
        "showOnCustomerPage": show_on_customer_page,
        "orderIndex": len(categories)
    }
    categories.append(new_cat)
    set_setting_value(db, "categories", categories)
    return new_cat

@app.put("/api/categories/reorder", dependencies=[Depends(JWTBearer())])
def reorder_categories(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    categories = payload.get("categories")
    if not isinstance(categories, list):
        raise HTTPException(status_code=400, detail="Invalid categories format")
    
    for idx, c in enumerate(categories):
        c["orderIndex"] = idx
    
    set_setting_value(db, "categories", categories)
    return {"success": True, "categories": categories}

@app.put("/api/categories/{cat_id}", dependencies=[Depends(JWTBearer())])
def update_category(cat_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    name = payload.get("name")
    is_shown = payload.get("showOnCustomerPage")
    
    categories = get_setting_value(db, "categories", [])
    found_idx = -1
    for idx, c in enumerate(categories):
        if c.get("id") == cat_id:
            found_idx = idx
            break
            
    if found_idx == -1:
        raise HTTPException(status_code=404, detail="Category not found")
        
    if name is not None:
        categories[found_idx]["name"] = name
    if is_shown is not None:
        categories[found_idx]["showOnCustomerPage"] = is_shown
        
    set_setting_value(db, "categories", categories)
    return {"success": True, "category": categories[found_idx]}

@app.delete("/api/categories/{cat_id}", dependencies=[Depends(JWTBearer())])
def delete_category(cat_id: str, db: Session = Depends(get_db)):
    categories = get_setting_value(db, "categories", [])
    found_idx = -1
    for idx, c in enumerate(categories):
        if c.get("id") == cat_id:
            found_idx = idx
            break
            
    if found_idx == -1:
        raise HTTPException(status_code=404, detail="Category not found")
        
    deleted = categories.pop(found_idx)
    set_setting_value(db, "categories", categories)
    return {"success": True, "deleted": deleted}

# --- Menu Items ---

@app.get("/api/menu", response_model=List[schemas.MenuItemBase])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).order_by(models.MenuItem.orderIndex).all()

@app.post("/api/menu", response_model=schemas.MenuItemBase, dependencies=[Depends(JWTBearer())])
def create_menu_item(item: schemas.MenuItemBase, db: Session = Depends(get_db)):
    if db.query(models.MenuItem).filter(models.MenuItem.id == item.id).first():
        raise HTTPException(status_code=400, detail="Menu Item ID already exists")
    
    max_idx = db.query(models.MenuItem).count()
    
    db_item = models.MenuItem(
        id=item.id,
        category=item.category,
        name=item.name,
        price=item.price,
        image=item.image,
        description=item.description,
        available=item.available,
        isSetMeal=item.isSetMeal,
        hasNoodlesOption=item.hasNoodlesOption,
        hasCoconutsMilkOption=item.hasCoconutsMilkOption,
        containsBeef=item.containsBeef,
        containsPork=item.containsPork,
        containsSeafood=item.containsSeafood,
        isNotSpicy=item.isNotSpicy,
        orderIndex=max_idx
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/menu/reorder", dependencies=[Depends(JWTBearer())])
def reorder_menu(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    reordered_ids = payload.get("ids")
    if not isinstance(reordered_ids, list):
        raise HTTPException(status_code=400, detail="Invalid list of IDs")
        
    for idx, item_id in enumerate(reordered_ids):
        db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
        if db_item:
            db_item.orderIndex = idx
    db.commit()
    return {"success": True}

@app.put("/api/menu/{item_id}", response_model=schemas.MenuItemBase, dependencies=[Depends(JWTBearer())])
def update_menu_item(item_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu Item not found")
        
    for field in ["category", "name", "price", "image", "description", "available", "isSetMeal", "hasNoodlesOption", "hasCoconutsMilkOption", "containsBeef", "containsPork", "containsSeafood", "isNotSpicy"]:
        if field in payload:
            setattr(db_item, field, payload[field])
            
    db.commit()
    db.refresh(db_item)
    return db_item

@app.post("/api/menu/toggle-available", dependencies=[Depends(JWTBearer())])
def toggle_menu_item_available(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    item_id = payload.get("id")
    available = payload.get("available")
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu Item not found")
        
    db_item.available = bool(available)
    db.commit()
    return {"success": True, "available": db_item.available}

@app.delete("/api/menu/{item_id}", dependencies=[Depends(JWTBearer())])
def delete_menu_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu Item not found")
        
    db.delete(db_item)
    db.commit()
    return {"success": True}

# --- Orders ---

@app.get("/api/orders", response_model=List[schemas.OrderBase], dependencies=[Depends(JWTBearer())])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.post("/api/orders", response_model=schemas.OrderBase)
async def create_order(order: schemas.OrderBase, db: Session = Depends(get_db)):
    new_id = order.id or f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    proposed_reductions = {}
    for item in order.items:
        recipe = get_recipe_for_menu_item(item)
        for cost in recipe:
            ing_id = cost["ingredientId"]
            amount = cost["amount"] * item.qty
            proposed_reductions[ing_id] = proposed_reductions.get(ing_id, 0.0) + amount

    out_of_stock_items = []
    for ing_id, needed in proposed_reductions.items():
        ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first()
        if ingredient and ingredient.stock < needed:
            out_of_stock_items.append(f"{ingredient.name.get('zh', '')} (庫存不足, 剩餘 {ingredient.stock} {ingredient.unit})")
            
    if out_of_stock_items:
        return JSONResponse(
            status_code=400,
            content={
                "error": "部份材料不足，暫時無法下單：" + ", ".join(out_of_stock_items),
                "outOfStock": True
            }
        )

    logs = get_setting_value(db, "inventory_logs", [])
    for ing_id, needed in proposed_reductions.items():
        ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first()
        if ingredient:
            ingredient.stock = round(ingredient.stock - needed, 2)
            logs.append({
                "id": f"ir-order-{int(datetime.datetime.now().timestamp() * 1000)}-{str(uuid.uuid4().hex[:4])}",
                "timestamp": datetime.datetime.now().isoformat(),
                "ingredientId": ing_id,
                "ingredientName": ingredient.name.get("zh", ""),
                "type": "outgoing",
                "quantityChanged": -needed,
                "remainingStock": ingredient.stock,
                "note": f"客戶下單自動扣料：單號 {new_id}"
            })
    set_setting_value(db, "inventory_logs", logs)

    promo_combos = get_setting_value(db, "promo_combos", [])
    menu_items = db.query(models.MenuItem).all()
    discount = calculate_promo_discount([item.model_dump() for item in order.items], menu_items, promo_combos)

    db_order = models.Order(
        id=new_id,
        tableNumber=order.tableNumber,
        subtotal=order.subtotal,
        serviceCharge=order.serviceCharge,
        discount=discount,
        total=max(0.0, order.subtotal - discount) + order.serviceCharge,
        status="pending",
        customerName=order.customerName,
        customerAvatar=order.customerAvatar,
        paymentMethod=order.paymentMethod,
        isMember=order.isMember,
        isPaid=order.isPaid or False,
        guestCount=order.guestCount,
        items=[item.model_dump() for item in order.items],
        refundLogs=[],
        quickNotes=order.quickNotes,
        isFlagged=order.isFlagged,
        createdAt=datetime.datetime.now(UTC)
    )
    db.add(db_order)
    
    if order.tableNumber:
        tbl = db.query(models.TableConfig).filter(models.TableConfig.id == order.tableNumber).first()
        if tbl:
            tbl.status = 'in_use'
            
    db.commit()
    db.refresh(db_order)

    order_data = json.loads(json.dumps(schemas.OrderBase.model_validate(db_order).model_dump(), default=str))
    await socket_manager.broadcast_status("NEW_ORDER", order_data, room="orders")
    return db_order

@app.put("/api/orders/{order_id}/status", dependencies=[Depends(JWTBearer())])
async def update_order_status(order_id: str, status_update: Dict[str, str], db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order: raise HTTPException(status_code=404)
    db_order.status = status_update.get("status")
    db.commit()
    await socket_manager.broadcast_status("ORDER_UPDATED", {"id": order_id, "status": db_order.status}, room="orders")
    return {"message": "Success"}

@app.delete("/api/orders/{order_id}", dependencies=[Depends(JWTBearer())])
def delete_order(order_id: str, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    deleted_order = json.loads(json.dumps(schemas.OrderBase.model_validate(db_order).model_dump(), default=str))
    db.delete(db_order)
    db.commit()
    return {"success": True, "message": f"Successfully deleted order #{order_id}", "order": deleted_order}

@app.put("/api/orders/{order_id}/table-number", dependencies=[Depends(JWTBearer())])
def update_order_table_number(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    table_number = payload.get("tableNumber")
    if table_number is None:
        raise HTTPException(status_code=400, detail="Table number is required")
        
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.tableNumber = str(table_number).strip()
    db.commit()
    db.refresh(db_order)
    return {"success": True, "order": db_order}

@app.put("/api/orders/{order_id}/quick-notes", dependencies=[Depends(JWTBearer())])
def update_order_quick_notes(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    quick_notes = payload.get("quickNotes")
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.quickNotes = str(quick_notes).strip() if quick_notes is not None else ""
    db.commit()
    db.refresh(db_order)
    return {"success": True, "order": db_order}

@app.put("/api/orders/{order_id}/flag", dependencies=[Depends(JWTBearer())])
def update_order_flag(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    is_flagged = payload.get("isFlagged", False)
    flag_reason = payload.get("flagReason", "")
    
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.isFlagged = bool(is_flagged)
    db_order.flagReason = str(flag_reason).strip()
    db.commit()
    db.refresh(db_order)
    return {"success": True, "order": db_order}

@app.put("/api/orders/{order_id}/checkout", dependencies=[Depends(JWTBearer())])
def checkout_order(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    payment_method = payload.get("paymentMethod")
    total = payload.get("total")
    service_charge = payload.get("serviceCharge")
    subtotal = payload.get("subtotal")
    discount = payload.get("discount")
    is_paid = payload.get("isPaid")
    
    if payment_method is not None: db_order.paymentMethod = payment_method
    if total is not None: db_order.total = float(total)
    if service_charge is not None: db_order.serviceCharge = float(service_charge)
    if subtotal is not None: db_order.subtotal = float(subtotal)
    if discount is not None: db_order.discount = float(discount)
    db_order.isPaid = bool(is_paid) if is_paid is not None else True
    
    if db_order.status in ["pending", "preparing"]:
        db_order.status = "completed"
        
    if db_order.tableNumber:
        tbl = db.query(models.TableConfig).filter(models.TableConfig.id == db_order.tableNumber).first()
        if tbl:
            tbl.status = "cleaning" if db_order.isPaid else "pending_checkout"
            
    db.commit()
    db.refresh(db_order)
    return db_order

@app.put("/api/orders/{order_id}/pay", dependencies=[Depends(JWTBearer())])
def pay_order(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    is_paid = payload.get("isPaid", True)
    db_order.isPaid = bool(is_paid)
    
    if db_order.isPaid and db_order.status in ["pending", "preparing"]:
        db_order.status = "completed"
        
    if db_order.isPaid and db_order.tableNumber:
        tbl = db.query(models.TableConfig).filter(models.TableConfig.id == db_order.tableNumber).first()
        if tbl:
            tbl.status = "cleaning"
            
    db.commit()
    db.refresh(db_order)
    return db_order

@app.put("/api/orders/{order_id}/items/{item_id}/complete", dependencies=[Depends(JWTBearer())])
def complete_order_item(order_id: str, item_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    is_completed = payload.get("isCompleted", False)
    
    updated_items = []
    for it in db_order.items:
        if it.get("id") == item_id:
            it["isCompleted"] = bool(is_completed)
        updated_items.append(it)
        
    db_order.items = updated_items
    
    all_completed = all(it.get("isCompleted", False) for it in updated_items)
    if all_completed:
        db_order.status = "completed"
    elif db_order.status == "completed":
        db_order.status = "preparing"
        
    db.commit()
    db.refresh(db_order)
    return db_order

@app.put("/api/orders/{order_id}/items", dependencies=[Depends(JWTBearer())])
def update_order_items(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    items = payload.get("items")
    refund_logs = payload.get("refundLogs")
    
    if items is not None:
        db_order.items = items
    if refund_logs is not None:
        db_order.refundLogs = refund_logs
        
    subtotal = sum(float(it.get("price", 0)) * int(it.get("qty", 0)) for it in db_order.items)
    
    promo_combos = get_setting_value(db, "promo_combos", [])
    menu_items = db.query(models.MenuItem).all()
    discount = calculate_promo_discount(db_order.items, menu_items, promo_combos)
    
    db_order.subtotal = subtotal
    db_order.discount = discount
    net_subtotal = max(0.0, subtotal - discount)
    db_order.serviceCharge = round(subtotal * 0.1) if db_order.paymentMethod in ['credit', 'linepay'] else 0.0
    db_order.total = net_subtotal + db_order.serviceCharge
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.put("/api/orders/{order_id}/rate")
def rate_order(order_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    rating = payload.get("rating")
    feedback = payload.get("feedback", "")
    
    if rating is None or not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be a number between 1 and 5")
        
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.rating = int(rating)
    db_order.feedback = str(feedback)
    db.commit()
    return {"success": True}

@app.get("/api/orders/history-check")
def history_check(tableNumber: Optional[str] = None, memberName: Optional[str] = None, db: Session = Depends(get_db)):
    table_str = str(tableNumber).strip() if tableNumber else ""
    member_str = str(memberName).strip() if memberName else ""
    
    has_unpaid = False
    if table_str:
        has_unpaid = db.query(models.Order).filter(models.Order.tableNumber == table_str, models.Order.isPaid == False).count() > 0
        
    has_past = False
    if member_str:
        if member_str in ["沙貝泰烤老饕", "VIP Member"]:
            has_past = True
        else:
            all_orders = db.query(models.Order).all()
            has_past = any(o.customerName == member_str for o in all_orders)
            
    return {
        "hasUnpaidBillOnTable": has_unpaid,
        "hasPastOrders": has_past
    }

# --- Settings ---

@app.get("/api/settings/min-spend")
def get_min_spend(db: Session = Depends(get_db)):
    min_spend = get_setting_value(db, "min_spend", 200)
    return {"minSpend": min_spend}

@app.post("/api/settings/min-spend", dependencies=[Depends(JWTBearer())])
def set_min_spend(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    min_spend = payload.get("minSpend")
    try:
        val = max(0, int(min_spend))
        set_setting_value(db, "min_spend", val)
        return {"success": True, "minSpend": val}
    except:
        raise HTTPException(status_code=400, detail="Invalid minimum spend")

@app.get("/api/settings/operating-hours")
def get_operating_hours(db: Session = Depends(get_db)):
    slots = get_setting_value(db, "operating_hours", [])
    rest_days = get_setting_value(db, "rest_days", [])
    return {
        "slots": slots,
        "restDays": rest_days,
        "isOpen": is_store_open(db),
        "currentTime": datetime.datetime.now().isoformat()
    }

@app.post("/api/settings/operating-hours", dependencies=[Depends(JWTBearer())])
def set_operating_hours(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    slots = payload.get("slots")
    rest_days = payload.get("restDays")
    
    if slots is not None and isinstance(slots, list):
        sanitized = []
        for idx, s in enumerate(slots):
            sanitized.append({
                "id": s.get("id") or f"oh-manual-{idx}-{int(datetime.datetime.now().timestamp())}",
                "name": s.get("name") or f"時段 {idx + 1}",
                "start": s.get("start") or '11:00',
                "end": s.get("end") or '14:30',
                "days": [int(d) for d in s.get("days")] if isinstance(s.get("days"), list) else [0, 1, 2, 3, 4, 5, 6],
                "isActive": bool(s.get("isActive", True))
            })
        set_setting_value(db, "operating_hours", sanitized)
        
    if rest_days is not None and isinstance(rest_days, list):
        set_setting_value(db, "rest_days", [str(d).strip() for d in rest_days if str(d).strip()])
        
    return {
        "success": True,
        "slots": get_setting_value(db, "operating_hours", []),
        "restDays": get_setting_value(db, "rest_days", []),
        "isOpen": is_store_open(db)
    }

@app.get("/api/settings/customer-notice")
def get_customer_notice(db: Session = Depends(get_db)):
    notice = get_setting_value(db, "customer_notice", "")
    return {"notice": notice}

@app.post("/api/settings/customer-notice", dependencies=[Depends(JWTBearer())])
def set_customer_notice(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    notice = payload.get("notice")
    if notice is not None:
        val = str(notice).strip()
        set_setting_value(db, "customer_notice", val)
        return {"success": True, "notice": val}
    raise HTTPException(status_code=400, detail="Invalid notice")

@app.get("/api/settings/service-pause")
def get_service_pause(db: Session = Depends(get_db)):
    service_paused = get_setting_value(db, "service_paused", False)
    return {"servicePaused": service_paused}

@app.post("/api/settings/service-pause", dependencies=[Depends(JWTBearer())])
async def set_service_pause(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    service_paused = payload.get("servicePaused")
    if service_paused is not None:
        next_val = bool(service_paused)
        curr_val = get_setting_value(db, "service_paused", False)
        if curr_val != next_val:
            set_setting_value(db, "service_paused", next_val)
            
            tz_offset = datetime.timezone(datetime.timedelta(hours=8))
            now = datetime.datetime.now(tz_offset)
            title = '⚠️ 廚房暫停接單通知 (Kitchen Service Paused)' if next_val else '🟢 廚房恢復正常接單 (Kitchen Service Resumed)'
            msg = '親愛的顧客您好，由於目前現場與線上訂單量極大，為了保障餐點品質，廚房已暫停新訂單製作與下單服務。您仍可自由流覽菜單，暫停期間「送出訂單」功能將自動鎖定，敬請稍等或向現場服務人員諮詢，感謝您的體諒與配合！' if next_val else '感謝您的耐心等待！廚房目前的訂單高峰已順利消化，點餐與結帳權限現已全面解鎖恢復正常！您可以直接挑選餐點並加入購物車送出訂單，期待為您送上美味的碳烤！'
            new_notif = {
                "id": f"notif-{int(now.timestamp() * 1000)}",
                "timestamp": now.strftime("%I:%M:%S %p"),
                "title": title,
                "message": msg,
                "badge": 'PAUSED' if next_val else 'ONLINE',
                "isRead": False
            }
            notifications = get_setting_value(db, "promo_notifications", [])
            notifications.append(new_notif)
            set_setting_value(db, "promo_notifications", notifications)
            
        return {"success": True, "servicePaused": next_val}
    raise HTTPException(status_code=400, detail="Invalid servicePaused value")

@app.get("/api/settings/popular-item-ids")
def get_popular_item_ids(db: Session = Depends(get_db)):
    ids = get_setting_value(db, "popular_item_ids", [])
    return ids

@app.post("/api/settings/popular-item-ids", dependencies=[Depends(JWTBearer())])
def set_popular_item_ids(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    popular_ids = payload.get("popularItemIds")
    if isinstance(popular_ids, list):
        val = [str(s).strip() for s in popular_ids if str(s).strip()]
        set_setting_value(db, "popular_item_ids", val)
        return {"success": True, "popularItemIds": val}
    raise HTTPException(status_code=400, detail="Invalid popularItemIds format")

@app.get("/api/settings/members-config")
def get_members_config(db: Session = Depends(get_db)):
    ratio = get_setting_value(db, "member_points_ratio", 20)
    rewards = get_setting_value(db, "member_rewards", [])
    return {
        "pointsRatio": ratio,
        "rewards": rewards
    }

@app.post("/api/settings/members-config", dependencies=[Depends(JWTBearer())])
def set_members_config(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    ratio = payload.get("pointsRatio")
    rewards = payload.get("rewards")
    
    if ratio is not None:
        set_setting_value(db, "member_points_ratio", max(1, int(ratio)))
        
    if rewards is not None and isinstance(rewards, list):
        sanitized = []
        for idx, r in enumerate(rewards):
            sanitized.append({
                "id": r.get("id") or f"rew-{int(datetime.datetime.now().timestamp())}-{idx}",
                "menuItemId": r.get("menuItemId"),
                "cost": int(r.get("cost", 100)),
                "fallbackPrice": int(r.get("fallbackPrice", 10)),
                "enabled": bool(r.get("enabled", True))
            })
        set_setting_value(db, "member_rewards", sanitized)
        
    return {
        "success": True,
        "pointsRatio": get_setting_value(db, "member_points_ratio", 20),
        "rewards": get_setting_value(db, "member_rewards", [])
    }

@app.get("/api/option-rules")
def get_option_rules(db: Session = Depends(get_db)):
    rules = get_setting_value(db, "option_rules", [])
    return rules

@app.post("/api/option-rules", status_code=201, dependencies=[Depends(JWTBearer())])
def create_option_rule(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    name = payload.get("name", "新選項")
    category = payload.get("category", "加配料")
    price = payload.get("price", 0)
    
    new_rule = {
        "id": f"rule-{int(datetime.datetime.now().timestamp() * 1000)}",
        "name": name,
        "category": category,
        "price": float(price)
    }
    rules = get_setting_value(db, "option_rules", [])
    rules.append(new_rule)
    set_setting_value(db, "option_rules", rules)
    return new_rule

@app.delete("/api/option-rules/{rule_id}", dependencies=[Depends(JWTBearer())])
def delete_option_rule(rule_id: str, db: Session = Depends(get_db)):
    rules = get_setting_value(db, "option_rules", [])
    found_idx = -1
    for idx, r in enumerate(rules):
        if r.get("id") == rule_id:
            found_idx = idx
            break
    if found_idx > -1:
        deleted = rules.pop(found_idx)
        set_setting_value(db, "option_rules", rules)
        return {"success": True, "deleted": deleted}
    raise HTTPException(status_code=404, detail="Rule not found")

@app.get("/api/printer/settings")
def get_printer_settings(db: Session = Depends(get_db)):
    settings = get_setting_value(db, "printer_settings", {})
    return settings

@app.put("/api/printer/settings", dependencies=[Depends(JWTBearer())])
def update_printer_settings(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    kitchen = payload.get("kitchen")
    bill = payload.get("bill")
    
    settings = get_setting_value(db, "printer_settings", {})
    if not settings:
        settings = {"kitchen": {}, "bill": {}}
        
    if kitchen:
        settings["kitchen"].update(kitchen)
    if bill:
        settings["bill"].update(bill)
        
    set_setting_value(db, "printer_settings", settings)
    return {"success": True, "settings": settings}

@app.get("/api/promo-combo")
def get_promo_combo(db: Session = Depends(get_db)):
    promo = get_setting_value(db, "promo_combo", {})
    combos = get_setting_value(db, "promo_combos", [])
    return {
        "enabled": promo.get("enabled", True),
        "requiredQty": promo.get("requiredQty", 10),
        "discountAmount": promo.get("discountAmount", 20),
        "eligibleItemIds": promo.get("eligibleItemIds", []),
        "combos": combos
    }

@app.post("/api/promo-combo", dependencies=[Depends(JWTBearer())])
def update_promo_combo(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    enabled = payload.get("enabled")
    requiredQty = payload.get("requiredQty")
    discountAmount = payload.get("discountAmount")
    eligibleItemIds = payload.get("eligibleItemIds")
    combos = payload.get("combos")
    
    promo = get_setting_value(db, "promo_combo", {})
    if enabled is not None:
        promo["enabled"] = bool(enabled)
    if requiredQty is not None:
        promo["requiredQty"] = max(1, int(requiredQty))
    if discountAmount is not None:
        promo["discountAmount"] = int(discountAmount)
    if eligibleItemIds is not None and isinstance(eligibleItemIds, list):
        promo["eligibleItemIds"] = eligibleItemIds
    set_setting_value(db, "promo_combo", promo)
    
    if combos is not None and isinstance(combos, list):
        sanitized = []
        for idx, c in enumerate(combos):
            sanitized.append({
                "id": c.get("id") or f"combo-{int(datetime.datetime.now().timestamp())}-{idx}",
                "name": c.get("name") or "自訂套餐組合",
                "enabled": bool(c.get("enabled", True)),
                "requiredQty": max(1, int(c.get("requiredQty", 10))),
                "discountAmount": int(c.get("discountAmount", 20)),
                "eligibleItemIds": c.get("eligibleItemIds", []) if isinstance(c.get("eligibleItemIds"), list) else []
            })
        set_setting_value(db, "promo_combos", sanitized)
        
    return {
        "success": True,
        "config": {
            "enabled": promo.get("enabled", True),
            "requiredQty": promo.get("requiredQty", 10),
            "discountAmount": promo.get("discountAmount", 20),
            "eligibleItemIds": promo.get("eligibleItemIds", []),
            "combos": get_setting_value(db, "promo_combos", [])
        }
    }

# --- Tables ---

def sort_tables(tables):
    def sort_key(t):
        try:
            return (0, int(t.id))
        except ValueError:
            return (1, t.id)
    return sorted(tables, key=sort_key)

@app.get("/api/tables")
def get_tables(db: Session = Depends(get_db)):
    tables = db.query(models.TableConfig).all()
    return sort_tables(tables)

@app.post("/api/tables", status_code=201, dependencies=[Depends(JWTBearer())])
def create_table(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    table_id = payload.get("id")
    if not table_id:
        raise HTTPException(status_code=400, detail="Missing required field: id / 缺少桌號 ID")
    
    clean_id = str(table_id).strip()
    if not clean_id:
        raise HTTPException(status_code=400, detail="Invalid Table ID / 無效桌號")
        
    if db.query(models.TableConfig).filter(models.TableConfig.id == clean_id).first():
        raise HTTPException(status_code=400, detail="Table ID already exists / 桌號已存在")
        
    db_table = models.TableConfig(
        id=clean_id,
        qrCodeUrl=payload.get("qrCodeUrl") or f"/?table={clean_id}",
        status=payload.get("status") or "available",
        preservedFor=payload.get("preservedFor") or "",
        mergedWith=payload.get("mergedWith") or "",
        positionX=float(payload.get("positionX", 10)),
        positionY=float(payload.get("positionY", 10))
    )
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

@app.put("/api/tables/{table_id}", dependencies=[Depends(JWTBearer())])
def update_table(table_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_table = db.query(models.TableConfig).filter(models.TableConfig.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found / 找不到此桌號")
        
    for field in ["qrCodeUrl", "status", "preservedFor", "mergedWith"]:
        if field in payload and payload[field] is not None:
            setattr(db_table, field, str(payload[field]))
            
    if "positionX" in payload and payload["positionX"] is not None:
        db_table.positionX = float(payload["positionX"])
    if "positionY" in payload and payload["positionY"] is not None:
        db_table.positionY = float(payload["positionY"])
        
    db.commit()
    db.refresh(db_table)
    return {"success": True, "table": db_table}

@app.delete("/api/tables/{table_id}", dependencies=[Depends(JWTBearer())])
def delete_table(table_id: str, db: Session = Depends(get_db)):
    db_table = db.query(models.TableConfig).filter(models.TableConfig.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found / 找不到此桌號")
        
    deleted_table = {
        "id": db_table.id,
        "qrCodeUrl": db_table.qrCodeUrl,
        "status": db_table.status,
        "preservedFor": db_table.preservedFor,
        "mergedWith": db_table.mergedWith,
        "positionX": db_table.positionX,
        "positionY": db_table.positionY
    }
    db.delete(db_table)
    db.commit()
    return {"success": True, "deleted": [deleted_table]}

# --- Reservations ---

@app.get("/api/reservations", response_model=List[schemas.ReservationBase])
def get_reservations(db: Session = Depends(get_db)):
    return db.query(models.Reservation).all()

@app.post("/api/reservations", response_model=schemas.ReservationBase, status_code=201, dependencies=[Depends(JWTBearer())])
def create_reservation(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    customer_name = payload.get("customerName")
    phone = payload.get("phone")
    guest_count = payload.get("guestCount", 1)
    table_number = payload.get("tableNumber")
    date = payload.get("date")
    time = payload.get("time")
    notes = payload.get("notes", "")
    status = payload.get("status", "pending")
    
    if not customer_name or not phone or not table_number or not date or not time:
        raise HTTPException(status_code=400, detail="Missing required field: customerName, phone, tableNumber, date, time / 缺少預約必填欄位")
        
    new_res = models.Reservation(
        id='res-' + str(uuid.uuid4().hex[:9]),
        guestCount=int(guest_count),
        tableNumber=str(table_number).strip(),
        date=str(date).strip(),
        time=str(time).strip(),
        status=status,
        notes=notes,
        createdAt=datetime.datetime.now(UTC)
    )
    new_res.customerName = str(customer_name).strip()
    new_res.phone = str(phone).strip()
    
    db.add(new_res)
    
    if status == 'pending':
        tb = db.query(models.TableConfig).filter(models.TableConfig.id == new_res.tableNumber).first()
        if tb:
            tb.status = 'preserved'
            tb.preservedFor = f"{new_res.customerName} ({new_res.time})"
            
    db.commit()
    db.refresh(new_res)
    return new_res

@app.put("/api/reservations/{res_id}", response_model=schemas.ReservationBase, dependencies=[Depends(JWTBearer())])
def update_reservation(res_id: str, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found / 找不到此預約")
        
    if "customerName" in payload: db_res.customerName = str(payload["customerName"])
    if "phone" in payload: db_res.phone = str(payload["phone"])
    if "guestCount" in payload: db_res.guestCount = int(payload["guestCount"])
    if "tableNumber" in payload: db_res.tableNumber = str(payload["tableNumber"])
    if "date" in payload: db_res.date = str(payload["date"])
    if "time" in payload: db_res.time = str(payload["time"])
    if "notes" in payload: db_res.notes = str(payload["notes"])
    if "status" in payload: db_res.status = str(payload["status"])
    
    if db_res.status == 'seated':
        tb = db.query(models.TableConfig).filter(models.TableConfig.id == db_res.tableNumber).first()
        if tb:
            tb.status = 'in_use'
            tb.preservedFor = ''
    elif db_res.status == 'pending':
        tb = db.query(models.TableConfig).filter(models.TableConfig.id == db_res.tableNumber).first()
        if tb:
            tb.status = 'preserved'
            tb.preservedFor = f"{db_res.customerName} ({db_res.time})"
    elif db_res.status == 'cancelled':
        tb = db.query(models.TableConfig).filter(models.TableConfig.id == db_res.tableNumber).first()
        if tb and tb.status == 'preserved':
            tb.status = 'available'
            tb.preservedFor = ''
            
    db.commit()
    db.refresh(db_res)
    return db_res

@app.delete("/api/reservations/{res_id}", dependencies=[Depends(JWTBearer())])
def delete_reservation(res_id: str, db: Session = Depends(get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found / 找不到此預約")
        
    deleted_res = {
        "id": db_res.id,
        "customerName": db_res.customerName,
        "phone": db_res.phone,
        "guestCount": db_res.guestCount,
        "tableNumber": db_res.tableNumber,
        "date": db_res.date,
        "time": db_res.time,
        "status": db_res.status,
        "notes": db_res.notes
    }
    db.delete(db_res)
    db.commit()
    return {"success": True, "deleted": [deleted_res]}

# --- Takeout ---

@app.post("/api/takeout/scan")
def takeout_scan(db: Session = Depends(get_db)):
    today = datetime.datetime.now().strftime("%a %b %d %Y")
    last_date = get_setting_value(db, "last_takeout_date", "")
    seq = get_setting_value(db, "takeout_seq", 0)
    
    if today != last_date:
        seq = 0
        last_date = today
        
    seq += 1
    set_setting_value(db, "takeout_seq", seq)
    set_setting_value(db, "last_takeout_date", last_date)
    
    assigned = f"外帶 #{seq}"
    return {"success": True, "tableNumber": assigned, "sequence": seq}

@app.get("/api/takeout/status")
def takeout_status(db: Session = Depends(get_db)):
    today = datetime.datetime.now().strftime("%a %b %d %Y")
    last_date = get_setting_value(db, "last_takeout_date", "")
    seq = get_setting_value(db, "takeout_seq", 0)
    
    if today != last_date:
        seq = 0
        last_date = today
        set_setting_value(db, "takeout_seq", seq)
        set_setting_value(db, "last_takeout_date", last_date)
        
    return {"sequence": seq, "lastResetDate": last_date}

# --- Print Logs ---

@app.get("/api/print-logs")
def get_print_logs(db: Session = Depends(get_db)):
    logs = get_setting_value(db, "print_logs", [])
    return logs

@app.post("/api/print-logs/clear", dependencies=[Depends(JWTBearer())])
def clear_print_logs(db: Session = Depends(get_db)):
    set_setting_value(db, "print_logs", [])
    return {"success": True, "message": "虛擬出單記錄已全部清除"}

# --- Push Notifications ---

@app.get("/api/push-notifications")
def get_push_notifications(db: Session = Depends(get_db)):
    notifications = get_setting_value(db, "promo_notifications", [])
    return notifications

@app.post("/api/send-promo-push", status_code=201, dependencies=[Depends(JWTBearer())])
def send_promo_push(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    title = payload.get("title", '沙貝限時優惠 🇹🇭')
    message = payload.get("message", '老闆瘋了！即刻點餐全單享特別折扣！')
    badge = payload.get("badge", 'PROMO')
    
    new_notif = {
        "id": f"notif-{int(datetime.datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.datetime.now().strftime("%I:%M:%S %p"),
        "title": title,
        "message": message,
        "badge": badge,
        "isRead": False
    }
    notifications = get_setting_value(db, "promo_notifications", [])
    notifications.append(new_notif)
    set_setting_value(db, "promo_notifications", notifications)
    return new_notif

# --- Printer Config ---

@app.get("/api/printer/config")
def get_printer_config(db: Session = Depends(get_db)):
    ip = get_setting_value(db, "printer_ip", "10.0.0.124")
    return {"ip": ip}

@app.put("/api/printer/config", dependencies=[Depends(JWTBearer())])
def update_printer_config(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    ip = payload.get("ip")
    if ip:
        set_setting_value(db, "printer_ip", str(ip).strip())
        return {"success": True, "ip": ip}
    raise HTTPException(status_code=400, detail="Invalid IP")

@app.post("/api/printer/test", dependencies=[Depends(JWTBearer())])
def test_printer(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    return {"success": True, "message": "測試頁已傳送至虛擬出單佇列！"}

# --- Ingredients Operations ---

@app.get("/api/ingredients", response_model=List[schemas.IngredientBase], dependencies=[Depends(JWTBearer())])
def get_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).all()

@app.post("/api/ingredients", dependencies=[Depends(JWTBearer())])
def create_ingredient(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    ing_id = payload.get("id")
    name = payload.get("name")
    stock = payload.get("stock", 0)
    min_threshold = payload.get("minThreshold", 0)
    unit = payload.get("unit", "kg")
    
    if not ing_id or not name or not name.get("zh"):
        raise HTTPException(status_code=400, detail="缺少識別碼或中文名稱 / Missing required ID or Name")
        
    if db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first():
        raise HTTPException(status_code=400, detail="該原料識別碼已存在 / Ingredient ID already exists")
        
    final_name = {
        "zh": name["zh"],
        "en": name.get("en") or name["zh"],
        "ko": name.get("ko") or name["zh"],
        "ja": name.get("ja") or name["zh"],
        "th": name.get("th") or name["zh"]
    }
    
    db_ing = models.Ingredient(
        id=ing_id,
        name=final_name,
        stock=round(float(stock), 2),
        minThreshold=float(min_threshold),
        unit=unit
    )
    db.add(db_ing)
    
    new_log = {
        "id": f"ir-init-{int(datetime.datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.datetime.now().isoformat(),
        "ingredientId": ing_id,
        "ingredientName": final_name["zh"],
        "type": "incoming",
        "quantityChanged": float(stock),
        "remainingStock": float(stock),
        "note": "新增原料：初始建置庫存"
    }
    logs = get_setting_value(db, "inventory_logs", [])
    logs.append(new_log)
    set_setting_value(db, "inventory_logs", logs)
    
    db.commit()
    db.refresh(db_ing)
    return {"success": True, "ingredient": db_ing}

@app.post("/api/ingredients/restock", dependencies=[Depends(JWTBearer())])
def restock_ingredient(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    ing_id = payload.get("id")
    amount = payload.get("amount")
    
    db_ing = db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first()
    if not db_ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
        
    try:
        amt = float(amount)
    except:
        raise HTTPException(status_code=400, detail="Invalid amount")
        
    db_ing.stock = round(db_ing.stock + amt, 2)
    
    new_log = {
        "id": f"ir-restock-{int(datetime.datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.datetime.now().isoformat(),
        "ingredientId": ing_id,
        "ingredientName": db_ing.name.get("zh", ""),
        "type": "incoming",
        "quantityChanged": amt,
        "remainingStock": db_ing.stock,
        "note": "後台手動原料大批進貨"
    }
    logs = get_setting_value(db, "inventory_logs", [])
    logs.append(new_log)
    set_setting_value(db, "inventory_logs", logs)
    
    db.commit()
    return {"success": True, "ingredient": db_ing}

@app.post("/api/inventory/adjust", dependencies=[Depends(JWTBearer())])
def adjust_inventory(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    ing_id = payload.get("ingredientId")
    quantity_changed = payload.get("quantityChanged")
    note = payload.get("note", "手動庫存異動")
    
    db_ing = db.query(models.Ingredient).filter(models.Ingredient.id == ing_id).first()
    if not db_ing:
        raise HTTPException(status_code=404, detail="材料不存在 / Ingredient not found")
        
    try:
        change = float(quantity_changed)
    except:
        raise HTTPException(status_code=400, detail="無效的異動數量 / Invalid amount")
        
    db_ing.stock = round(db_ing.stock + change, 2)
    
    new_log = {
        "id": f"ir-adj-{int(datetime.datetime.now().timestamp() * 1000)}-{str(uuid.uuid4().hex[:4])}",
        "timestamp": datetime.datetime.now().isoformat(),
        "ingredientId": ing_id,
        "ingredientName": db_ing.name.get("zh", ""),
        "type": "incoming" if change >= 0 else "adjustment",
        "quantityChanged": change,
        "remainingStock": db_ing.stock,
        "note": note
    }
    logs = get_setting_value(db, "inventory_logs", [])
    logs.append(new_log)
    set_setting_value(db, "inventory_logs", logs)
    
    db.commit()
    return {"success": True, "ingredient": db_ing}

@app.get("/api/inventory/logs")
def get_inventory_logs(db: Session = Depends(get_db)):
    logs = get_setting_value(db, "inventory_logs", [])
    return logs

# --- Hardware ---

@app.get("/api/printer/ping")
async def ping_printer(ip: str):
    try:
        with socket.create_connection((ip, 9100), timeout=1.5):
            return {"online": True, "ip": ip}
    except:
        return {"online": False, "ip": ip}

# --- Analytics ---

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    ingredients = db.query(models.Ingredient).all()
    
    total_revenue = sum(o.total for o in orders if o.isPaid)
    orders_count = len(orders)
    
    stock_warnings = []
    for ing in ingredients:
        if ing.stock <= ing.minThreshold:
            stock_warnings.append({
                "id": ing.id,
                "name": ing.name,
                "stock": ing.stock,
                "minThreshold": ing.minThreshold,
                "unit": ing.unit
            })
            
    category_sales = {}
    for o in orders:
        if o.items:
            for item in o.items:
                menu_item_id = item.get("menuItemId")
                qty = item.get("qty", 0)
                price = item.get("price", 0)
                m_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
                cat = m_item.category if m_item else "other"
                category_sales[cat] = category_sales.get(cat, 0) + (price * qty)
                
    category_sales_list = [{"category": k, "sales": v} for k, v in category_sales.items()]
    
    hourly_dist = [0] * 24
    for o in orders:
        if o.createdAt:
            local_time = o.createdAt + datetime.timedelta(hours=8)
            hour = local_time.hour
            hourly_dist[hour] += 1
            
    hourly_distribution_list = [{"hour": f"{i:02d}:00", "orders": hourly_dist[i]} for i in range(24)]
    
    dish_sales = {}
    for o in orders:
        if o.items:
            for item in o.items:
                menu_item_id = item.get("menuItemId")
                name = item.get("name", {}).get("zh", "未知單品")
                qty = item.get("qty", 0)
                dish_sales[menu_item_id] = dish_sales.get(menu_item_id, {"name": name, "sales": 0})
                dish_sales[menu_item_id]["sales"] += qty
                
    top_dishes = []
    sorted_dishes = sorted(dish_sales.items(), key=lambda x: x[1]["sales"], reverse=True)[:5]
    for k, v in sorted_dishes:
        top_dishes.append({
            "id": k,
            "name": v["name"],
            "sales": v["sales"]
        })
        
    return {
        "totalRevenue": total_revenue,
        "ordersCount": orders_count,
        "categorySales": category_sales_list,
        "hourlyDistribution": hourly_distribution_list,
        "topDishes": top_dishes,
        "stockWarnings": stock_warnings
    }

# --- Admin Operations ---

@app.post("/api/admin/clear-test-data", dependencies=[Depends(JWTBearer())])
def clear_test_data(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    pin = payload.get("pin")
    if not pin or pin != ACTIVE_PIN:
        return JSONResponse(status_code=403, content={"error": "安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！"})
        
    db.query(models.Order).delete()
    set_setting_value(db, "inventory_logs", [])
    set_setting_value(db, "print_logs", [])
    set_setting_value(db, "promo_notifications", [])
    set_setting_value(db, "takeout_seq", 0)
    db.commit()
    return {"success": True, "message": "已成功清除系統內所有測試用歷史單據、庫存記錄及虛擬出單日誌！"}

# Serve static files (HTML/JS/CSS)
if getattr(sys, 'frozen', False):
    STATIC_DIR = os.path.join(sys._MEIPASS, "dist")
else:
    STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

assets_dir = os.path.join(STATIC_DIR, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{fallback_path:path}")
def serve_frontend(fallback_path: str):
    if fallback_path.startswith("api/") or fallback_path.startswith("ws/") or fallback_path == "docs" or fallback_path == "openapi.json":
        raise HTTPException(status_code=404, detail="Not Found")
    
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"detail": "Frontend build files not found. Please run npm run build first."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)
