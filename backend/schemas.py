from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class MenuItemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    category: str
    name: Dict[str, str]
    price: float
    image: str
    description: Dict[str, str]
    available: bool = True
    isSetMeal: Optional[bool] = False
    hasNoodlesOption: Optional[bool] = False
    hasCoconutsMilkOption: Optional[bool] = False
    containsBeef: Optional[bool] = False
    containsPork: Optional[bool] = False
    containsSeafood: Optional[bool] = False
    isNotSpicy: Optional[bool] = False
    orderIndex: Optional[int] = 0

class OrderItem(BaseModel):
    id: str
    menuItemId: str
    name: Dict[str, str]
    price: float
    qty: int
    customization: Dict[str, Any]
    isCompleted: Optional[bool] = False

class OrderBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    tableNumber: Optional[str] = ""
    subtotal: float
    serviceCharge: float
    total: float
    status: Optional[str] = "pending"
    customerName: Optional[str] = ""
    customerAvatar: Optional[str] = ""
    paymentMethod: Optional[str] = ""
    isMember: Optional[bool] = False
    isPaid: Optional[bool] = False
    discount: Optional[float] = 0.0
    guestCount: Optional[int] = None
    rating: Optional[int] = None
    feedback: Optional[str] = ""
    flagReason: Optional[str] = ""
    items: List[OrderItem]
    refundLogs: Optional[List[Any]] = None
    quickNotes: Optional[str] = ""
    isFlagged: Optional[bool] = False
    createdAt: Optional[datetime] = None

class IngredientBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: Dict[str, str]
    stock: float
    minThreshold: float
    unit: str

class TableConfigBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    qrCodeUrl: str
    status: Optional[str] = "available"
    preservedFor: Optional[str] = ""
    mergedWith: Optional[str] = ""
    positionX: Optional[float] = 0
    positionY: Optional[float] = 0

class ReservationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    customerName: str
    phone: str
    guestCount: int
    tableNumber: str
    date: str
    time: str
    status: str
    notes: Optional[str] = ""
    createdAt: Optional[datetime] = None
