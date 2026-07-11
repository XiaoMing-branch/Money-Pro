"""
Money-Pro 数据刷新脚本
从 ledger.csv 重新生成 Excel 展示文件

使用方法:
    python refresh_excel.py
"""

import subprocess
import sys
from pathlib import Path

def main():
    script_dir = Path(__file__).parent
    generate_script = script_dir / "generate_excel.py"
    
    if not generate_script.exists():
        print(f"错误: 找不到 {generate_script}")
        sys.exit(1)
    
    print("=" * 50)
    print("Money-Pro 数据刷新")
    print("=" * 50)
    print()
    print("正在从 ledger.csv 重新生成 Excel 文件...")
    print()
    
    # 运行 generate_excel.py
    result = subprocess.run(
        [sys.executable, str(generate_script)],
        cwd=str(script_dir),
        capture_output=False
    )
    
    if result.returncode == 0:
        print()
        print("=" * 50)
        print("刷新完成！")
        print()
        print("Excel 文件已更新: 日常记账表格.xlsx")
        print("现在可以打开 Excel 查看最新数据。")
        print("=" * 50)
    else:
        print()
        print("刷新失败，请检查错误信息。")
        sys.exit(1)


if __name__ == '__main__':
    main()
