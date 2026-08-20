#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LOCAL-PRINTER-POS-BRIDGE (本機 Windows POS 印表機與錢箱橋接服務)
============================================================
專為 Windows 8 / 10 / 11 簡體中文版 (CP936/GBK) 及繁體中文版環境設計。
解決 Firefox / Chrome 跨來源 Private Network Access (PNA) 限制，
並以二進位模式 ('wb') 寫入硬體埠 (LPT1:/COM/USB) 與 TCP Socket (9100)，
徹底避免 Python 底層 CP936 轉碼崩潰 (UnicodeEncodeError) 及換行符號污染。
"""

import sys
import os
import json
import socket
import re
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

# ESC/POS 控制碼常數 (二進位位元組流)
ESC_POS_INIT = bytes([0x1B, 0x40, 0x1C, 0x26, 0x1C, 0x43, 0x01])  # ESC @ (Init), FS & (Kanji Mode), FS C 1 (Big5 Mode)
ESC_POS_CUT = bytes([0x1D, 0x56, 0x00])                           # GS V 0 (Full Cut)
ESC_POS_DRAWER_PULSE = bytes([0x1B, 0x70, 0x00, 0x19, 0xFA])       # ESC p m t1 t2 (25ms pulse to Pin 2)

DEFAULT_PORT = 8060
DEFAULT_HOST = '0.0.0.0'


def sanitize_text(text: str) -> str:
    """過濾 Unicode 特殊表情符號與 4-byte 字符，防止破壞印表機雙位元組漢字對齊"""
    if not text:
        return ''
    # 移除 Emoji 與符號區間
    cleaned = re.sub(
        r'[\U0001F300-\U0001F9FF]|[\U0001F600-\U0001F64F]|[\U0001F680-\U0001F6FF]|[\u2600-\u26FF]|[\u2700-\u27BF]',
        '',
        text
    )
    # 移除代理對與變體選擇符
    cleaned = re.sub(r'[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uFE00-\uFE0F]', '', cleaned)
    return cleaned


def encode_for_printer(text: str) -> bytes:
    """
    多重編碼容錯管道：
    1. 優先嘗試 Big5 (繁體中文熱感應機標準編碼)
    2. 次選 GB18030 / GBK (簡體中文相容且字集最廣)
    3. 備援 UTF-8 (以防極端罕見字)
    """
    cleaned = sanitize_text(text)
    try:
        return cleaned.encode('big5')
    except UnicodeEncodeError:
        pass

    try:
        return cleaned.encode('gb18030', errors='ignore')
    except Exception:
        pass

    return cleaned.encode('utf-8', errors='ignore')


def normalize_port_name(port_str: str) -> str:
    """標準化 Windows 埠口名稱 (如 LPT1 -> LPT1: 或 \\\\.\\LPT1)"""
    if not port_str or not port_str.strip():
        return 'LPT1:'
    p = port_str.strip().upper()
    if p.startswith('LPT') and not p.endswith(':'):
        return f"{p}:"
    return p


def write_to_hardware_port(port_name: str, data: bytes) -> tuple[bool, str]:
    """
    以嚴格二進位模式 ('wb') 寫入 Windows 硬體埠 (LPT1:, COMx, 或虛擬 USB 埠)
    阻絕 Python 預設 CP936 轉碼崩潰及 CRLF 自動轉換問題。
    """
    target_port = normalize_port_name(port_name)
    paths_to_try = [
        target_port,
        f"\\\\.\\{target_port.rstrip(':')}",
        target_port.rstrip(':')
    ]

    last_err = ""
    for path in paths_to_try:
        try:
            # 使用二進位模式無緩衝寫入
            with open(path, 'wb', buffering=0) as f:
                f.write(data)
                f.flush()
            return True, f"成功透過二進位模式寫入 {len(data)} 位元組至 {path}"
        except Exception as ex:
            last_err = str(ex)

    return False, f"無法開啟或寫入硬體埠 {target_port} ({last_err})"


def send_to_network_printer(ip: str, port: int, data: bytes, timeout: float = 3.0) -> tuple[bool, str]:
    """透過 TCP Socket (預設 Port 9100) 直連網路熱感應印表機 (KDS 廚房印表機)"""
    try:
        with socket.create_connection((ip, port), timeout=timeout) as sock:
            sock.sendall(data)
            sock.shutdown(socket.SHUT_RDWR)
        return True, f"成功傳送 {len(data)} 位元組至網路印表機 {ip}:{port}"
    except socket.timeout:
        return False, f"連線至網路印表機 {ip}:{port} 逾時 ({timeout}秒)"
    except Exception as ex:
        return False, f"網路印表機 {ip}:{port} Socket 通訊失敗: {str(ex)}"


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """支援多執行緒並行連線的 HTTP 伺服器"""
    daemon_threads = True


class POSBridgeRequestHandler(BaseHTTPRequestHandler):
    """處理 POS 橋接請求，具備完整的 CORS、Firefox PNA 支援及二進位分流"""

    def send_cors_headers(self):
        """注入標準 CORS 與 Firefox / Chrome Private Network Access (PNA) 標頭"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Access-Control-Request-Private-Network')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        """回應 Preflight 請求，確保 Firefox 跨網域存取 127.0.0.1 無阻"""
        self.send_response(204)
        self.send_cors_headers()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        """健康檢查與系統資訊端點"""
        if self.path.rstrip('/') in ('', '/health', '/status'):
            res_data = {
                "status": "online",
                "success": True,
                "service": "LOCAL-PRINTER-POS-BRIDGE",
                "version": "2.1.0",
                "system": sys.platform,
                "encoding": sys.getdefaultencoding(),
                "pna": True,
                "message": "Windows POS 印表機與錢箱橋接服務運作正常 (二進位安全模式)"
            }
            body = json.dumps(res_data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404, "Endpoint Not Found")

    def do_POST(self):
        """處理 /open-drawer 與 /print 指令"""
        path = self.path.rstrip('/')
        content_len = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_len) if content_len > 0 else b'{}'

        try:
            payload = json.loads(raw_body.decode('utf-8', errors='ignore'))
        except Exception:
            payload = {}

        if path in ('/open-drawer', '/api/printer/open-drawer'):
            self.handle_open_drawer(payload)
        elif path in ('/print', '/api/printer/test', '/api/printer/print'):
            self.handle_print(payload)
        else:
            self.send_error(404, "Endpoint Not Found")

    def handle_open_drawer(self, payload: dict):
        """開錢箱處理邏輯：純二進位脈衝發送"""
        port = payload.get('port', 'LPT1:')
        ip = payload.get('ip')
        conn_type = payload.get('connectionType', 'IP' if ip else 'LPT')

        if conn_type == 'IP' and ip:
            net_port = int(payload.get('netPort', 9100))
            success, log_msg = send_to_network_printer(ip, net_port, ESC_POS_DRAWER_PULSE)
        else:
            success, log_msg = write_to_hardware_port(port, ESC_POS_DRAWER_PULSE)

        res_payload = {
            "success": success,
            "message": "實體收銀抽屜開箱脈衝已送出" if success else log_msg,
            "log": log_msg,
            "port": port,
            "drawerOpened": success
        }
        self.send_json_response(200 if success else 500, res_payload)

    def handle_print(self, payload: dict):
        """列印處理邏輯：支援 Base64、Hex、多重編碼純文字、IP 及 LPT 二進位模式寫入"""
        raw_text = payload.get('text')
        raw_base64 = payload.get('base64')
        raw_hex = payload.get('hex')
        port = payload.get('port', 'LPT1:')
        ip = payload.get('ip')
        conn_type = payload.get('connectionType', 'IP' if ip else 'LPT')
        auto_open_drawer = bool(payload.get('autoOpenDrawer', False))

        buffer_to_send = bytearray()

        if raw_base64:
            try:
                buffer_to_send.extend(base64.b64decode(raw_base64))
            except Exception as e:
                return self.send_json_response(400, {"success": False, "message": f"Base64 解碼失敗: {e}"})
        elif raw_hex:
            try:
                clean_hex = re.sub(r'[^0-9A-Fa-f]', '', raw_hex)
                buffer_to_send.extend(bytes.fromhex(clean_hex))
            except Exception as e:
                return self.send_json_response(400, {"success": False, "message": f"Hex 解碼失敗: {e}"})
        elif raw_text:
            # 組裝 ESC/POS 單據
            buffer_to_send.extend(ESC_POS_INIT)
            buffer_to_send.extend(encode_for_printer(raw_text))
            buffer_to_send.extend(b"\n\n\n")
            buffer_to_send.extend(ESC_POS_CUT)
        else:
            return self.send_json_response(400, {"success": False, "message": "缺少列印內容 (text / base64 / hex)"})

        # 若需要連動開錢箱
        if auto_open_drawer:
            buffer_to_send.extend(ESC_POS_DRAWER_PULSE)

        # 根據連線型態分流發送
        if conn_type == 'IP' and ip:
            net_port = int(payload.get('netPort', 9100))
            success, log_msg = send_to_network_printer(ip, net_port, bytes(buffer_to_send))
        else:
            success, log_msg = write_to_hardware_port(port, bytes(buffer_to_send))

        res_payload = {
            "success": success,
            "message": "列印指令已成功發送至印表機" if success else log_msg,
            "log": log_msg,
            "bytesSent": len(buffer_to_send),
            "port": port,
            "drawerOpened": auto_open_drawer and success
        }
        self.send_json_response(200 if success else 500, res_payload)

    def send_json_response(self, status_code: int, data: dict):
        """發送 JSON 回應"""
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """精簡終端機日誌輸出"""
        sys.stdout.write(f"[POS-Bridge] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()


def run_server(host=DEFAULT_HOST, port=DEFAULT_PORT):
    server_address = (host, port)
    httpd = ThreadedHTTPServer(server_address, POSBridgeRequestHandler)
    print("=" * 65)
    print(" 🖨️  LOCAL-PRINTER-POS-BRIDGE (Windows POS 橋接服務 v2.1.0)")
    print("=" * 65)
    print(f" [*] 服務監聽位址: http://127.0.0.1:{port}")
    print(" [*] 二進位安全模式: 已啟用 ('wb' 模式，防 CP936 轉碼崩潰)")
    print(" [*] 多重字碼頁支援: Big5 (繁體) / GB18030 (簡體) / UTF-8 自動轉譯")
    print(" [*] Firefox PNA 標頭: Access-Control-Allow-Private-Network 已啟用")
    print(" [*] 支援硬體通道: LPT1:, COM1~COM9, USB 虛擬埠, TCP Socket 9100 (IP)")
    print("=" * 65)
    print(" 💡 請在瀏覽器點餐系統中確認 POS 橋接器位址為: http://127.0.0.1:8060")
    print(" 按下 Ctrl + C 可隨時停止服務\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n [!] 正在關閉 POS 橋接器服務...")
        httpd.server_close()
        print(" [✓] 服務已安全終止。")


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    run_server(port=port)
