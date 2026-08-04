@echo off
TITLE Sabay BBQ Windows Environment Backend
echo =======================================================
echo  Starting Sabay BBQ Windows Environment Backend POS Server
echo =======================================================
cd /d "%~dp0.."
npx tsx windows_backend/server.ts
pause
