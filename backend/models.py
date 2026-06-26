from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
import datetime
from security import encrypt_data, decrypt_data

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(String, primary_key=True, index=True)
    category = Column(String)
    name = Column(JSON)
    price = Column(Float)
    image = Column(String)
    description = Column(JSON)
    available = Column(Boolean, default=True)
    isSetMeal = Column(Boolean, default=False)
    hasNoodlesOption = Column(Boolean, default=False)
    hasCoconutsMilkOption = Column(Boolean, default=False)
    containsBeef = Column(Boolean, default=False)
    containsPork = Column(Boolean, default=False)
    containsSeafood = Column(Boolean, default=False)
    isNotSpicy = Column(Boolean, default=False)
    orderIndex = Column(Integer)

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(String, primary_key=True, index=True)
    name = Column(JSON)
    stock = Column(Float)
    minThreshold = Column(Float)
    unit = Column(String)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    tableNumber = Column(String)
    subtotal = Column(Float)
    serviceCharge = Column(Float)
    total = Column(Float)
    status = Column(String)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    # 加密欄位
    _customerName = Column("customerName", String)
    _quickNotes = Column("quickNotes", String)
    _feedback = Column("feedback", String)

    customerAvatar = Column(String)
    paymentMethod = Column(String)
    isMember = Column(Boolean, default=False)
    isPaid = Column(Boolean, default=False)
    discount = Column(Float, default=0.0)
    guestCount = Column(Integer, nullable=True)
    items = Column(JSON)
    refundLogs = Column(JSON, nullable=True)
    isFlagged = Column(Boolean, default=False)
    flagReason = Column(String)
    rating = Column(Integer)

    @property
    def customerName(self): return decrypt_data(self._customerName)
    @customerName.setter
    def customerName(self, v): self._customerName = encrypt_data(v)

    @property
    def quickNotes(self): return decrypt_data(self._quickNotes)
    @quickNotes.setter
    def quickNotes(self, v): self._quickNotes = encrypt_data(v)

    @property
    def feedback(self): return decrypt_data(self._feedback)
    @feedback.setter
    def feedback(self, v): self._feedback = encrypt_data(v)

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(String, primary_key=True, index=True)
    _customerName = Column("customerName", String)
    _phone = Column("phone", String)
    guestCount = Column(Integer)
    tableNumber = Column(String)
    date = Column(String)
    time = Column(String)
    status = Column(String)
    notes = Column(String)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def customerName(self): return decrypt_data(self._customerName)
    @customerName.setter
    def customerName(self, v): self._customerName = encrypt_data(v)

    @property
    def phone(self): return decrypt_data(self._phone)
    @phone.setter
    def phone(self, v): self._phone = encrypt_data(v)

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True, index=True)
    value = Column(JSON)

class TableConfig(Base):
    __tablename__ = "tables"
    id = Column(String, primary_key=True, index=True)
    qrCodeUrl = Column(String)
    status = Column(String)
    preservedFor = Column(String)
    mergedWith = Column(String, default="")
    positionX = Column(Float)
    positionY = Column(Float)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user = Column(String)
    action = Column(String)
    resource = Column(String)
    _details = Column("details", String)

    @property
    def details(self): return decrypt_data(self._details)
    @details.setter
    def details(self, v): self._details = encrypt_data(v)
