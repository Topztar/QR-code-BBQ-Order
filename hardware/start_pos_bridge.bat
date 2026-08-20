@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title LOCAL-PRINTER-POS-BRIDGE (Windows POS 橋接器服務)

echo ===============================================================
echo  啟動 Windows POS 印表機與收銀錢箱本機橋接服務 (Port 8060)
echo ===============================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [✓] 偵測到 Python 環境，正在啟動橋接服務...
    python "%~dp0pos_bridge.py" 8060
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [✓] 偵測到 Python (py launcher)，正在啟動橋接服務...
    py "%~dp0pos_bridge.py" 8060
    goto end
)

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [!] 未偵測到 Python，嘗試以 Node.js 執行橋接服務...
    node "%~dp0pos_bridge.js"
    goto end
)

echo [❌ 錯誤] 系統未安裝 Python 或 Node.js，請先安裝 Python 3.x 或 Node.js 後再執行。
pause

:end
