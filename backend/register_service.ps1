# Sabay BBQ Windows Service Registration Script (PowerShell)
# This script registers the SabayBackend.exe as a Windows Service.

$ServiceName = "SabayBBQBackend"
$ExecutablePath = Join-Path $PSScriptRoot "dist\SabayBackend.exe"
$Description = "Sabay BBQ Thai Barbecue System Headless API Service"

if (-not (Test-Path $ExecutablePath)) {
    Write-Host "Error: Backend executable not found at $ExecutablePath. Please run build_exe.py first."
    return
}

Write-Host "Registering $ServiceName as a Windows Service..."

# Using New-Service (requires Admin privileges)
try {
    New-Service -Name $ServiceName `
                -BinaryPathName "`"$ExecutablePath`"" `
                -DisplayName "Sabay BBQ Backend Service" `
                -Description $Description `
                -StartupType Automatic

    Write-Host "Service $ServiceName registered successfully."
    Write-Host "Starting service..."
    Start-Service -Name $ServiceName
    Write-Host "Service started."
} catch {
    Write-Host "Error: Failed to register service. Please ensure you are running as Administrator."
}
