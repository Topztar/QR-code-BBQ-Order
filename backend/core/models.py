# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User # 使用內建 User 作為後台管理員/員工 (Admin/User)
from django.utils import timezone
import uuid

# --- 使用者系統 ---

class Customer(models.Model):
    """
    手機端顧客帳號 (Member System)
    獨立於 Django 內建 User 系統，確保高安全性，顧客無法登入後台 API。
    """
    email = models.EmailField(unique=True, verbose_name="電子郵件")
    password_hash = models.CharField(max_length=255, verbose_name="密碼雜湊") # 將由後端加密儲存
    username = models.CharField(max_length=50, verbose_name="使用者名稱")
    total_points = models.IntegerField(default=0, verbose_name="總點數")
    last_checkin_time = models.DateTimeField(null=True, blank=True, verbose_name="最後簽到時間")
    current_streak = models.IntegerField(default=0, verbose_name="連續簽到天數")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")

    class Meta:
        verbose_name = "顧客"
        verbose_name_plural = "顧客列表"

    def __str__(self):
        return f"{self.username} ({self.email})"

# --- 菜單管理系統 ---

class Category(models.Model):
    """
    餐點分類 (父子樹狀結構)
    """
    name = models.CharField(max_length=100, verbose_name="分類名稱")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children', verbose_name="父分類")

    class Meta:
        verbose_name = "分類"
        verbose_name_plural = "分類列表"

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    """
    餐點項目
    """
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items', verbose_name="分類")
    name = models.CharField(max_length=200, verbose_name="餐點名稱")
    description = models.TextField(blank=True, verbose_name="描述")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="價格")
    photo = models.ImageField(upload_to='menu_photos/', null=True, blank=True, verbose_name="照片")
    is_active = models.BooleanField(default=True, verbose_name="是否上架")
    
    # 進銷存欄位
    stock_quantity = models.IntegerField(default=0, verbose_name="庫存數量")
    low_stock_threshold = models.IntegerField(default=10, verbose_name="低庫存警示線")

    class Meta:
        verbose_name = "餐點"
        verbose_name_plural = "餐點列表"

    def __str__(self):
        return self.name

# --- 訂單系統 ---

class Order(models.Model):
    """
    訂單 (支援內用與外帶)
    """
    ORDER_TYPES = (
        ('DINE_IN', '內用'),
        ('TAKEOUT', '外帶'),
    )
    STATUS_CHOICES = (
        ('PENDING', '等待確認中'),
        ('CONFIRMED', '已確認/製作中'),
        ('COMPLETED', '已完成'),
        ('CANCELLED', '已取消'),
    )
    order_number = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="顧客")
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES, verbose_name="訂單類型")
    
    # 內用桌號 或 外帶號碼
    table_number = models.CharField(max_length=20, null=True, blank=True, verbose_name="內用桌號")
    takeout_number = models.IntegerField(null=True, blank=True, verbose_name="外帶號碼")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="訂單狀態")
    
    # 結帳邏輯
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="小計")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="折扣(%)")
    service_charge_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="服務費(%)")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="總計")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="建立時間")
    confirmed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="確認員工")

    class Meta:
        verbose_name = "訂單"
        verbose_name_plural = "訂單列表"

    def __str__(self):
        identifier = f"桌號 {self.table_number}" if self.order_type == 'DINE_IN' else f"外帶 {self.takeout_number}"
        return f"Order #{self.id} - {identifier}"

class OrderItem(models.Model):
    """
    訂單項目
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1, verbose_name="數量")
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="當時價格")

    class Meta:
        verbose_name = "訂單項目"
        verbose_name_plural = "訂單項目列表"

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name if self.menu_item else '已刪除項目'}"

# --- 印表機與系統設定 ---

class PrinterSetting(models.Model):
    """
    印表機設定 (熱感式)
    """
    PRINTER_WIDTHS = (
        (58, '58mm'),
        (80, '80mm'),
    )
    name = models.CharField(max_length=50, default="預設印表機", verbose_name="名稱")
    width = models.IntegerField(choices=PRINTER_WIDTHS, default=58, verbose_name="紙張寬度")
    font_size = models.IntegerField(default=1, verbose_name="字體大小")
    ip_address = models.CharField(max_length=50, blank=True, null=True, help_text="網路印表機 IP。若使用 USB 則留空。", verbose_name="IP 位址")
    is_active = models.BooleanField(default=True, verbose_name="啟用")

    class Meta:
        verbose_name = "印表機設定"
        verbose_name_plural = "印表機設定列表"

    def __str__(self):
        return f"{self.name} ({self.width}mm)"

class PrintTemplate(models.Model):
    """
    收據列印範本
    """
    name = models.CharField(max_length=50, default="預設收據範本")
    content = models.TextField(help_text="支援變數: {{ table_number }}, {{ order_type }}, {{ items }}, {{ subtotal }}, {{ discount }}, {{ service_charge }}, {{ total }}", verbose_name="範本內容")
    is_active = models.BooleanField(default=True, verbose_name="啟用")

    class Meta:
        verbose_name = "列印範本"
        verbose_name_plural = "列印範本列表"

    def __str__(self):
        return self.name


# --- 進銷存系統 ---

class InventoryTransaction(models.Model):
    """
    庫存異動紀錄 (進貨、報廢、訂單扣除)
    """
    TRANSACTION_TYPES = (
        ('IN', '進貨/增加'),
        ('OUT', '銷貨/扣除'),
        ('ADJUST', '手動校正'),
        ('WASTE', '報廢'),
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='inventory_transactions', verbose_name="餐點項目")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, verbose_name="異動類型")
    quantity = models.IntegerField(verbose_name="異動數量", help_text="增加為正數，減少(如銷貨、報廢)也填寫正數，系統會依類型處理")
    order_reference = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="關聯訂單")
    operator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="操作人員")
    remarks = models.CharField(max_length=255, blank=True, verbose_name="備註")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="異動時間")

    class Meta:
        verbose_name = "庫存異動紀錄"
        verbose_name_plural = "庫存異動紀錄列表"
        ordering = ['-created_at']

    def __str__(self):
        sign = "+" if self.transaction_type in ['IN', 'ADJUST'] and self.quantity >= 0 else "-"
        return f"[{self.get_transaction_type_display()}] {self.menu_item.name}: {sign}{abs(self.quantity)}"

# --- 操作日誌 ---


class ActionLog(models.Model):
    """
    管理員操作日誌 (Action Logging)
    """
    admin_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="管理員")
    action = models.CharField(max_length=255, verbose_name="操作內容")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="時間")

    class Meta:
        verbose_name = "操作日誌"
        verbose_name_plural = "操作日誌列表"
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.admin_user.username if self.admin_user else "系統"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {user_str}: {self.action}"
