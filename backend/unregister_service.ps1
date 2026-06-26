$ServiceName = "SabayBBQBackend"
Write-Host "Stopping and Unregistering $ServiceName..."
try {
    Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue
    Remove-Service -Name $ServiceName
    Write-Host "Service removed successfully."
} catch {
    Write-Host "Error: Failed to remove service."
}
