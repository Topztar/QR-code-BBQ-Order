# -*- coding: utf-8 -*-
from django.test import TestCase
from .models import Customer, Category, MenuItem, Order, OrderItem, InventoryTransaction

class InventoryAndOrderTests(TestCase):
    def setUp(self):
        # 建立顧客
        self.customer = Customer.objects.create(
            email="test@example.com",
            username="Test User",
            password_hash="dummyhash"
        )
        
        # 建立分類
        self.category = Category.objects.create(name="主食")
        
        # 建立菜單項目 (初始庫存 20, 警示線 5)
        self.menu_item = MenuItem.objects.create(
            category=self.category,
            name="招牌烤肉飯",
            price=150.00,
            stock_quantity=20,
            low_stock_threshold=5,
            is_active=True
        )

    def test_menu_item_creation_and_stock(self):
        """測試菜單項目建立與庫存屬性"""
        self.assertEqual(self.menu_item.stock_quantity, 20)
        self.assertEqual(self.menu_item.low_stock_threshold, 5)

    def test_order_creation_deducts_inventory(self):
        """測試：建立訂單項目時，應自動扣除庫存並產生異動紀錄"""
        # 建立訂單
        order = Order.objects.create(
            customer=self.customer,
            order_type='DINE_IN',
            table_number="1"
        )
        
        # 建立訂單項目 (購買 3 份)
        order_item = OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=3,
            price_at_time=150.00
        )
        
        # 重新從資料庫取得 menu_item 確認庫存
        self.menu_item.refresh_from_db()
        self.assertEqual(self.menu_item.stock_quantity, 17) # 20 - 3 = 17
        
        # 檢查異動紀錄 (應有一筆 OUT 紀錄)
        transactions = InventoryTransaction.objects.filter(menu_item=self.menu_item, order_reference=order)
        self.assertEqual(transactions.count(), 1)
        self.assertEqual(transactions.first().transaction_type, 'OUT')
        self.assertEqual(transactions.first().quantity, 3)

    def test_order_deletion_restores_inventory(self):
        """測試：刪除訂單項目時，應自動恢復庫存並產生異動紀錄"""
        order = Order.objects.create(customer=self.customer, order_type='TAKEOUT', takeout_number=101)
        order_item = OrderItem.objects.create(
            order=order,
            menu_item=self.menu_item,
            quantity=5,
            price_at_time=150.00
        )
        
        # 預扣後庫存剩 15
        self.menu_item.refresh_from_db()
        self.assertEqual(self.menu_item.stock_quantity, 15)
        
        # 刪除訂單項目
        order_item.delete()
        
        # 刪除後庫存應恢復至 20
        self.menu_item.refresh_from_db()
        self.assertEqual(self.menu_item.stock_quantity, 20)
        
        # 檢查是否有退回紀錄 (IN)
        restores = InventoryTransaction.objects.filter(menu_item=self.menu_item, transaction_type='IN')
        self.assertEqual(restores.count(), 1)
        self.assertEqual(restores.first().quantity, 5)
