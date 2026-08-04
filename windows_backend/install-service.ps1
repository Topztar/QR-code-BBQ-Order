# PowerShell script to register Sabay BBQ Windows Backend as a Windows Startup Scheduled Task

$TaskName = "SabayBBQWindowsBackend"
$WorkDir = Split-Path -Parent $PSScriptRoot
$BatPath = Join-Path $PSScriptRoot "start-windows-backend.bat"

Write-Host "Registering Windows Backend Service Task: $TaskName" -ForegroundColor Green
Write-Host "Target Batch File: $BatPath"

$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$BatPath`"" -WorkingDirectory $WorkDir
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Sabay BBQ Windows Local Backend & Printer Service" -User $env:USERNAME -Force

Write-Host "Successfully installed Windows Backend service task!" -ForegroundColor Cyan
