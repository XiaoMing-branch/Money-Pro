@echo off
chcp 65001 >nul
echo ========================================
echo   Money-Pro 账单导入 - 粟嘉明
echo ========================================
echo.

if "%~1"=="" (
    echo 请将账单文件拖拽到此批处理文件上！
    echo.
    echo 支持的文件格式:
    echo   - 微信支付账单*.xlsx
    echo   - 支付宝交易明细*.csv
    echo.
    pause
    exit /b
)

set "FILE=%~1"
set "PERSON=粟嘉明"

echo 正在导入: %~nx1
echo 记录人: %PERSON%
echo.

cd /d "%~dp0"

python import.py wechat "%FILE%" --person "%PERSON%" 2>nul && goto :refresh
python import.py alipay "%FILE%" --person "%PERSON%" 2>nul && goto :refresh

echo.
echo 错误: 无法识别的文件格式！
echo 请确保文件名包含 "微信支付账单" 或 "支付宝交易明细"
echo.
pause
exit /b

:refresh
echo.
echo 正在刷新 Excel...
python refresh_excel.py
echo.
pause
