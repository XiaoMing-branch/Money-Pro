Write-Host "===================================" -ForegroundColor Cyan
Write-Host " 欠款账单日历 - 正在启动..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "浏览器将自动打开，请稍候..." -ForegroundColor Yellow
Write-Host "按 Ctrl+C 即可停止服务器。" -ForegroundColor Yellow
Write-Host ""
Set-Location -LiteralPath $PSScriptRoot
Start-Process "http://localhost:5173"
npm run dev
