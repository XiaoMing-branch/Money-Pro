@echo off
title 欠款账单日历
cd /d "%~dp0"
echo ===================================
echo  欠款账单日历 - 正在启动...
echo ===================================
echo.
echo 浏览器将自动打开，请稍候...
echo 关闭此窗口即可停止服务器。
echo.
start http://localhost:5173
npm run dev
pause
