# -*- coding: utf-8 -*-
from django.contrib import admin
from .models import Customer, Category, MenuItem, Order, OrderItem, PrinterSetting, PrintTemplate, ActionLog

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'total_points', 'current_streak', 'last_checkin_time')
    search_fields = ('username', 'email')
    readonly_fields = ('password_hash',) # 密碼雜湊不應被直接編輯

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    list_filter = ('parent',)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_time',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'table_number', 'takeout_number', 'status', 'total_amount', 'created_at')
    list_filter = ('order_type', 'status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('order_number', 'created_at')

@admin.register(PrinterSetting)
class PrinterSettingAdmin(admin.ModelAdmin):
    list_display = ('name', 'width', 'ip_address', 'is_active')

@admin.register(PrintTemplate)
class PrintTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')

@admin.register(ActionLog)
class ActionLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'admin_user', 'action')
    readonly_fields = ('timestamp', 'admin_user', 'action') # 日誌應為唯讀

    def has_add_permission(self, request):
        return False
