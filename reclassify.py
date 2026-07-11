"""
Money-Pro 手动分类工具
用于将 ledger.csv 中"其他"类记录重新分类

使用方法:
    python reclassify.py
"""

import csv
import sys
from pathlib import Path


# 分类配置
CATEGORIES = {
    "车": ["过路费", "能源费用", "停车费", "车贷月供", "保险", "车载用品购物", "洗车美容", "保养维修"],
    "宠物": ["主粮零食", "玩具", "医疗与洗护"],
    "日常生活": ["餐饮", "购物", "医疗", "月供", "其他"],
}

CATEGORY_LIST = list(CATEGORIES.keys())


def load_csv(csv_path):
    """加载 CSV 文件"""
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        return list(reader), reader.fieldnames


def save_csv(csv_path, rows, fieldnames):
    """保存 CSV 文件"""
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def show_record(record, index, total):
    """显示单条记录"""
    print(f"\n[{index}/{total}] {record.get('日期', '未知')} | ¥{record.get('金额', '0')} | {record.get('备注', '无')}")
    print(f"  当前类别: {record.get('类别', '其他')} > {record.get('子类别', '未分类')}")


def show_categories():
    """显示可选类别"""
    print("  可选类别:")
    for i, cat in enumerate(CATEGORY_LIST, 1):
        subs = ", ".join(CATEGORIES[cat][:4])
        print(f"    {i}. {cat} ({subs})")


def main():
    csv_path = Path(__file__).parent / "ledger.csv"

    if not csv_path.exists():
        print(f"错误: 找不到 {csv_path}")
        return

    rows, fieldnames = load_csv(csv_path)

    # 筛选"其他"类记录
    other_rows = [(i, row) for i, row in enumerate(rows) if row.get('类别') == '其他']

    if not other_rows:
        print("没有找到'其他'类记录，无需分类。")
        return

    print("=" * 60)
    print("Money-Pro 手动分类工具")
    print("=" * 60)
    print(f"\n找到 {len(other_rows)} 条'其他'类记录")
    print("\n操作说明:")
    print("  - 输入数字 (1-9) 选择新类别")
    print("  - 直接回车 = 跳过不修改")
    print("  - 输入 s = 跳过剩余全部")
    print("  - 输入 q = 保存并退出")

    modified = 0

    for idx, (row_idx, record) in enumerate(other_rows, 1):
        show_record(record, idx, len(other_rows))
        show_categories()

        while True:
            try:
                user_input = input("\n  输入新类别 (回车跳过): ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n\n保存中...")
                save_csv(csv_path, rows, fieldnames)
                print(f"已保存 {modified} 条修改。")
                return

            if user_input == '':
                # 跳过
                break
            elif user_input.lower() == 'q':
                # 保存退出
                save_csv(csv_path, rows, fieldnames)
                print(f"\n已保存 {modified} 条修改。")
                return
            elif user_input.lower() == 's':
                # 跳过剩余
                print("跳过剩余记录。")
                save_csv(csv_path, rows, fieldnames)
                print(f"已保存 {modified} 条修改。")
                return
            elif user_input.isdigit() and 1 <= int(user_input) <= len(CATEGORY_LIST):
                # 选择新类别
                new_cat = CATEGORY_LIST[int(user_input) - 1]
                subs = CATEGORIES[new_cat]

                print(f"  已选择: {new_cat}")
                print(f"  子类别: {', '.join(subs)}")

                try:
                    sub_input = input(f"  输入子类别序号 (1-{len(subs)}, 回车选第一个): ").strip()
                except (EOFError, KeyboardInterrupt):
                    sub_input = ''

                if sub_input.isdigit() and 1 <= int(sub_input) <= len(subs):
                    new_sub = subs[int(sub_input) - 1]
                else:
                    new_sub = subs[0]

                # 修改记录
                rows[row_idx]['类别'] = new_cat
                rows[row_idx]['子类别'] = new_sub
                modified += 1
                print(f"  ✓ 已修改为: {new_cat} > {new_sub}")
                break
            else:
                print("  无效输入，请重新选择。")

    # 保存
    save_csv(csv_path, rows, fieldnames)
    print(f"\n处理完成，共修改 {modified} 条记录。")


if __name__ == '__main__':
    main()
