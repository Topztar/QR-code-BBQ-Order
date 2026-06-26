from datetime import UTC
import datetime
import json
import os
import uuid
import socket
from typing import List, Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Body, Request, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import database
import socket_manager
from auth.jwt_handler import sign_jwt, decode_jwt
from auth.bearer import JWTBearer
from database import engine, get_db
from seeder import seed_db

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

# --- Audit Utility ---
async def log_audit_event(db: Session, user: str, action: str, resource: str, details: str = ""):
    new_log = models.AuditLog(user=user, action=action, resource=resource, details=details)
    db.add(new_log)
    db.commit()

# --- Authentication (Staff PIN to JWT) ---

@app.post("/api/staff/pin/verify")
async def verify_staff_pin(payload: Dict[str, str] = Body(...), db: Session = Depends(get_db)):
    pin = payload.get("pin")
    # Enterprise Hardened PINs (Matches App.tsx logic)
    valid_pins = ["888888", "070718", "FSY20260606"]

    if pin in valid_pins:
        token_data = sign_jwt("staff_admin")
        await log_audit_event(db, "staff_admin", "VERIFY_PIN_SUCCESS", "AUTH", "Session bootstrapped via PIN")
        return token_data # Frontend will store this as access_token

    await log_audit_event(db, "anonymous", "VERIFY_PIN_FAIL", "AUTH", f"Failed attempt with PIN: {pin}")
    raise HTTPException(status_code=401, detail="驗證失敗")

# --- Menu & Categories ---

@app.get("/api/menu", response_model=List[schemas.MenuItemBase])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).order_by(models.MenuItem.orderIndex).all()

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == "categories").first()
    return setting.value if setting else []

# --- Orders ---

@app.get("/api/orders", response_model=List[schemas.OrderBase], dependencies=[Depends(JWTBearer())])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.post("/api/orders", response_model=schemas.OrderBase)
async def create_order(order: schemas.OrderBase, db: Session = Depends(get_db)):
    new_id = order.id or f"ORD-{uuid.uuid4().hex[:8].upper()}"
    db_order = models.Order(
        id=new_id,
        tableNumber=order.tableNumber,
        subtotal=order.subtotal,
        serviceCharge=order.serviceCharge,
        total=order.total,
        status="pending",
        customerName=order.customerName,
        customerAvatar=order.customerAvatar,
        paymentMethod=order.paymentMethod,
        isMember=order.isMember,
        items=[item.model_dump() for item in order.items],
        quickNotes=order.quickNotes,
        isFlagged=order.isFlagged,
        createdAt=datetime.datetime.now(UTC)
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    order_data = json.loads(json.dumps(schemas.OrderBase.model_validate(db_order).model_dump(), default=str))
    # Broadcast to orders room
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

# --- Ingredients ---

@app.get("/api/ingredients", response_model=List[schemas.IngredientBase], dependencies=[Depends(JWTBearer())])
def get_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).all()

# --- Hardware ---

@app.get("/api/printer/ping")
async def ping_printer(ip: str):
    try:
        with socket.create_connection((ip, 9100), timeout=1.5):
            return {"online": True, "ip": ip}
    except:
        return {"online": False, "ip": ip}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)
