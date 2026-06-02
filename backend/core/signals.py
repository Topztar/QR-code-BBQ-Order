# -*- coding: utf-8 -*-
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.db import transaction
from .models import OrderItem, InventoryTransaction

@receiver(post_save, sender=OrderItem)
def deduct_inventory_on_order(sender, instance, created, **kwargs):
    """
    當訂單項目(OrderItem)被建立時，預扣對應 MenuItem 的庫存，
    並自動產生一筆 InventoryTransaction (銷貨/扣除)。
    """
    if created and instance.menu_item:
        with transaction.atomic():
            menu_item = instance.menu_item
            quantity_ordered = instance.quantity
            
            # 扣除庫存
            menu_item.stock_quantity -= quantity_ordered
            menu_item.save(update_fields=['stock_quantity'])
            
            # 記錄異動
            InventoryTransaction.objects.create(
                menu_item=menu_item,
                transaction_type='OUT',
                quantity=quantity_ordered,
                order_reference=instance.order,
                remarks=f"訂單 #{instance.order.id} 自動扣除"
            )

@receiver(pre_delete, sender=OrderItem)
def restore_inventory_on_order_cancel(sender, instance, **kwargs):
    """
    如果訂單項目被刪除（或訂單被取消導致連帶刪除），將預扣的庫存加回去
    """
    if instance.menu_item:
        with transaction.atomic():
            menu_item = instance.menu_item
            quantity_ordered = instance.quantity
            
            # 加回庫存
            menu_item.stock_quantity += quantity_ordered
            menu_item.save(update_fields=['stock_quantity'])
            
            # 記錄異動
            InventoryTransaction.objects.create(
                menu_item=menu_item,
                transaction_type='IN',
                quantity=quantity_ordered,
                order_reference=instance.order,
                remarks=f"訂單 #{instance.order.id} 項目刪除/取消，退回庫存"
            )
