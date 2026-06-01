# -*- coding: utf-8 -*-
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.properties import StringProperty, NumericProperty, ObjectProperty
from kivy.clock import Clock
import time
import requests # 後續用於連接 Django REST API

# 模擬的後端 API URL
API_BASE_URL = "http://127.0.0.1:8000/api"

class LoginScreen(Screen):
    """
    登入/註冊畫面
    """
    def do_login(self, email, password):
        # 這裡未來將串接登入 API
        print(f"嘗試登入: {email}")
        # 假設登入成功，切換到 Dashboard
        self.manager.current = 'dashboard'

class DashboardScreen(Screen):
    """
    會員儀表板
    顯示 Username, Total Points, Last Check-in Time, System Time
    提供 Check-in 按鈕與 Order 按鈕
    """
    username = StringProperty("顧客_測試")
    total_points = NumericProperty(0)
    last_checkin = StringProperty("尚未簽到")
    system_time = StringProperty("")
    
    def on_enter(self):
        # 啟動系統時間更新
        self.time_event = Clock.schedule_interval(self.update_time, 1)

    def on_leave(self):
        # 離開畫面時停止更新時間
        if self.time_event:
            self.time_event.cancel()
            
    def update_time(self, dt):
        self.system_time = time.strftime("%Y-%m-%d %H:%M:%S")
        
    def do_checkin(self):
        # 這裡未來將串接簽到 API
        print("執行每日簽到...")
        # 模擬簽到成功
        self.total_points += 1
        self.last_checkin = self.system_time
        # 實際應用中這裡應顯示 Popup

    def start_order(self):
        self.manager.current = 'qr_scan'

class QRScanScreen(Screen):
    """
    QR Code 掃描模擬畫面 (實際上將呼叫相機或輸入號碼)
    掃描後會提示「內用」或「外帶」或直接綁定
    """
    def simulate_scan(self, table_or_takeout_id):
        # 模擬取得 QR code 內容
        print(f"掃描結果: {table_or_takeout_id}")
        self.manager.current = 'menu'

class MenuScreen(Screen):
    """
    菜單清單
    顯示分類、餐點 (名稱, 照片, 描述, 價格)
    加入購物車
    """
    def go_to_cart(self):
        self.manager.current = 'cart'

class CartScreen(Screen):
    """
    購物車與訂單狀態畫面
    提交給後端
    """
    def submit_order(self):
        # 這裡未來將串接提交訂單 API
        print("送出訂單到後台...")
        self.manager.current = 'order_status'

class OrderStatusScreen(Screen):
    """
    顯示訂單狀態 (等待確認中、已確認/製作中 等)
    """
    def back_to_dashboard(self):
        self.manager.current = 'dashboard'


class BBQOrderApp(App):
    def build(self):
        # 確保支援 UTF-8 (Kivy 預設支援，但若是字型問題，需指定中文字型)
        # 此處先建立基本的 ScreenManager
        sm = ScreenManager()
        sm.add_widget(LoginScreen(name='login'))
        sm.add_widget(DashboardScreen(name='dashboard'))
        sm.add_widget(QRScanScreen(name='qr_scan'))
        sm.add_widget(MenuScreen(name='menu'))
        sm.add_widget(CartScreen(name='cart'))
        sm.add_widget(OrderStatusScreen(name='order_status'))
        return sm

if __name__ == '__main__':
    BBQOrderApp().run()
