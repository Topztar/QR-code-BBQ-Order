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
    tableNumber: str
    subtotal: float
    serviceCharge: float
    total: float
    status: str
    customerName: str
    customerAvatar: str
    paymentMethod: str
    isMember: bool
    items: List[OrderItem]
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
    positionX: Optional[float] = 0
    positionY: Optional[float] = 0
