"""
Money-Pro 账单导入脚本
支持导入微信支付账单(.xlsx)和支付宝交易明细(.csv)
"""

import csv
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("错误: 请先安装 openpyxl: pip install openpyxl")
    sys.exit(1)

try:
    import yaml
except ImportError:
    print("错误: 请先安装 pyyaml: pip install pyyaml")
    sys.exit(1)


# ============================================================
# 配置加载
# ============================================================

def load_config():
    """加载配置文件"""
    config_path = Path(__file__).parent / "config.yaml"
    if not config_path.exists():
        print(f"错误: 找不到配置文件 {config_path}")
        sys.exit(1)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def load_categories():
    """加载分类规则文件"""
    categories_path = Path(__file__).parent / "categories.yaml"
    if not categories_path.exists():
        print(f"警告: 找不到分类规则文件 {categories_path}，使用默认分类")
        return None

    with open(categories_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


# ============================================================
# 微信账单解析
# ============================================================

def parse_wechat_bill(file_path, person, config, categories_config=None):
    """
    解析微信支付账单(.xlsx)

    微信账单格式：
    - 前18行是元数据
    - 第19行是表头
    - 第20行起是数据
    """
    print(f"正在解析微信账单: {file_path}")

    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    ws = wb.active

    records = []
    
    # 从第20行开始读取数据（索引19）
    for row_idx, row in enumerate(ws.iter_rows(min_row=20, values_only=True), start=20):
        if not row or not row[0]:
            continue
        
        try:
            # 列索引：0=交易时间, 1=交易类型, 2=交易对方, 3=商品, 
            #         4=收/支, 5=金额(元), 6=支付方式, 7=当前状态
            trans_time = row[0]
            trans_type = row[1] or ""
            counterparty = row[2] or ""
            product = row[3] or ""
            direction = row[4] or ""
            amount = row[5] or 0
            payment_method = row[6] or ""
            status = row[7] or ""
            
            # 跳过非成功交易
            if status not in ['支付成功', '已转账']:
                continue
            
            # 跳过中性交易（充值/提现等）
            if direction not in ['支出', '收入']:
                continue
            
            # 处理日期
            if isinstance(trans_time, datetime):
                date_str = trans_time.strftime('%Y-%m-%d')
            else:
                date_str = str(trans_time)[:10]
            
            # 标准化支付方式
            payment_method = normalize_payment_method(payment_method)
            
            # 标准化收支类型
            direction = '支出' if direction == '支出' else '收入'

            # 收入记录统一归类为"收入"
            if direction == '收入':
                category = '收入'
                subcategory = '收入'
            else:
                # 尝试从交易对方/商品映射类别
                category, subcategory = guess_category(
                    counterparty, product, trans_type, categories_config
                )
            
            # 清理备注（取商品描述的前50个字符）
            note = product[:50] if product else counterparty
            if note and len(note) > 50:
                note = note[:47] + "..."
            
            records.append({
                'date': date_str,
                'category': category,
                'subcategory': subcategory,
                'amount': float(amount),
                'direction': direction,
                'payment': payment_method,
                'person': person,
                'note': note,
                'source': '微信导入'
            })
            
        except Exception as e:
            print(f"  跳过第{row_idx}行: {e}")
            continue
    
    wb.close()
    print(f"  解析完成，共 {len(records)} 条有效记录")
    return records


# ============================================================
# 支付宝账单解析
# ============================================================

def parse_alipay_bill(file_path, person, config, categories_config=None):
    """
    解析支付宝交易明细(.csv)

    支付宝账单格式：
    - 前23行是元数据
    - 第24行是表头
    - 第25行起是数据
    - 编码：GBK
    """
    print(f"正在解析支付宝账单: {file_path}")

    records = []
    
    # 尝试不同编码
    encodings = ['gbk', 'utf-8-sig', 'utf-8', 'gb18030']
    content = None
    
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.readlines()
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        print("  错误: 无法识别文件编码")
        return []
    
    # 从第24行开始（索引23）
    for line_idx, line in enumerate(content[23:], start=24):
        line = line.strip()
        if not line:
            continue
        
        try:
            # 使用 csv reader 解析行
            row = next(csv.reader([line]))
            
            if len(row) < 11:
                continue
            
            # 列索引：0=交易时间, 1=交易分类, 2=交易对方, 3=对方账号,
            #         4=商品说明, 5=收/支, 6=金额, 7=收/付款方式, 
            #         8=交易状态, 9=交易订单号, 10=商家订单号
            trans_time = row[0]
            trans_category = row[1] or ""
            counterparty = row[2] or ""
            product = row[4] or ""
            direction = row[5] or ""
            amount_str = row[6] or "0"
            payment_method = row[7] or ""
            status = row[8] or ""
            
            # 跳过非成功交易
            if status not in ['交易成功']:
                continue
            
            # 跳过不计收支
            if direction == '不计收支':
                continue
            
            # 处理日期
            date_str = trans_time[:10] if trans_time else ""
            
            # 处理金额（去除可能的\t和空格）
            amount_str = amount_str.replace('\t', '').strip()
            amount = float(amount_str)
            
            # 标准化支付方式
            payment_method = normalize_payment_method(payment_method)
            
            # 标准化收支类型
            direction = '支出' if direction == '支出' else '收入'

            # 收入记录统一归类为"收入"
            if direction == '收入':
                category = '收入'
                subcategory = '收入'
            else:
                # 使用关键词规则匹配类别
                category, subcategory = guess_category(
                    counterparty, product, trans_category, categories_config
                )
            
            # 清理备注
            note = product[:50] if product else counterparty
            if note and len(note) > 50:
                note = note[:47] + "..."
            
            records.append({
                'date': date_str,
                'category': category,
                'subcategory': subcategory,
                'amount': amount,
                'direction': direction,
                'payment': payment_method,
                'person': person,
                'note': note,
                'source': '支付宝导入'
            })
            
        except Exception as e:
            print(f"  跳过第{line_idx}行: {e}")
            continue
    
    print(f"  解析完成，共 {len(records)} 条有效记录")
    return records


# ============================================================
# 辅助函数
# ============================================================

def normalize_payment_method(method):
    """标准化支付方式名称"""
    if not method:
        return '其他'
    
    method = method.strip()
    
    if '微信' in method or '零钱' in method:
        return '微信'
    elif '支付宝' in method or '余额宝' in method or '花呗' in method:
        return '支付宝'
    elif '信用卡' in method:
        return '信用卡'
    elif '银行卡' in method or '储蓄卡' in method:
        return '银行卡'
    else:
        return '其他'


def guess_category(counterparty, product, trans_type, categories_config):
    """根据交易对方/商品说明猜测类别"""
    text = f"{counterparty} {product} {trans_type}".lower()

    # 如果有自定义分类规则，使用规则文件
    if categories_config and 'keywords' in categories_config:
        keywords = categories_config['keywords']
        categories = categories_config.get('categories', {})

        # 按顺序匹配，优先匹配前面的类别
        for category_name, subcategories in categories.items():
            for subcat in subcategories:
                if subcat in keywords:
                    for kw in keywords[subcat]:
                        if kw.lower() in text:
                            return category_name, subcat

    # 默认分类（如果规则文件不存在或未匹配）
    default_rules = [
        (['餐', '食', '吃', '饭', '美团', '饿了么', '外卖', '奶茶', '咖啡'], '日常生活', '餐饮'),
        (['商', '超市', '淘宝', '京东', '拼多多', '服装', '鞋', '衣'], '日常生活', '购物'),
        (['医', '药', '诊所', '医院', '体检'], '日常生活', '医疗'),
        (['房租', '话费', '水费', '电费', '燃气', '物业', '宽带'], '日常生活', '月供'),
        (['加油', '油费', '充电', '停车', '过路费', 'ETC', '车险', '保养', '维修'], '车', '能源费用'),
        (['猫粮', '狗粮', '猫条', '宠物'], '宠物', '主粮零食'),
    ]

    for keywords_list, category, subcategory in default_rules:
        for kw in keywords_list:
            if kw in text:
                return category, subcategory

    return '日常生活', '其他'


def guess_subcategory(counterparty, product, category):
    """猜测子类别"""
    text = f"{counterparty} {product}".lower()
    
    subcategory_rules = {
        '餐饮': [
            (['早餐', '早茶', '包子', '豆浆'], '早餐'),
            (['午餐', '午饭', '中餐'], '午餐'),
            (['晚餐', '晚饭', '夜宵', '烧烤'], '晚餐'),
            (['外卖', '美团', '饿了么'], '外卖'),
            (['奶茶', '咖啡', '茶', '饮料', '果汁'], '零食饮料'),
        ],
        '交通': [
            (['打车', '滴滴', '出租'], '打车'),
            (['地铁', '公交', '高铁', '火车', '飞机'], '公交地铁'),
            (['加油', '油费'], '加油'),
            (['停车'], '停车费'),
        ],
        '购物': [
            (['服装', '衣服', '鞋', '裤'], '服装'),
            (['日用', '超市', '百货', '洗'], '日用品'),
            (['手机', '电脑', '电子'], '电子产品'),
            (['家居', '家具', '装修'], '家居用品'),
        ],
        '居住': [
            (['房租', '租金', '房贷'], '房租/房贷'),
            (['水', '电', '燃气', '煤气'], '水电燃气'),
            (['物业'], '物业费'),
            (['维修'], '维修'),
        ],
        '娱乐': [
            (['电影', '影院', '演出'], '电影演出'),
            (['游戏', '充值'], '游戏'),
            (['旅游', '酒店', '景点'], '旅游'),
            (['会员', '订阅', 'VIP'], '会员订阅'),
        ],
        '医疗': [
            (['门诊', '挂号', '看病'], '看病'),
            (['药', '药店'], '药品'),
            (['体检'], '体检'),
            (['保险'], '保险'),
        ],
        '教育': [
            (['书', '图书'], '书籍'),
            (['课程', '网课'], '课程'),
            (['培训'], '培训'),
        ],
        '社交': [
            (['红包'], '红包'),
            (['转账'], '红包'),
            (['请客'], '请客'),
            (['礼物'], '礼物'),
        ],
    }
    
    rules = subcategory_rules.get(category, [])
    for keywords, subcategory in rules:
        for kw in keywords:
            if kw in text:
                return subcategory
    
    # 默认子类别
    defaults = {
        '餐饮': '午餐',
        '交通': '其他',
        '购物': '日用品',
        '居住': '其他',
        '娱乐': '其他',
        '医疗': '看病',
        '教育': '书籍',
        '社交': '红包',
    }
    
    return defaults.get(category, '未分类')


# ============================================================
# CSV 写入
# ============================================================

def append_to_csv(records, csv_path):
    """追加记录到 ledger.csv"""
    if not records:
        print("没有需要导入的记录")
        return
    
    file_exists = csv_path.exists() and csv_path.stat().st_size > 0
    
    # CSV 表头
    headers = ['日期', '类别', '子类别', '金额', '收支类型', '支付方式', '记录人', '备注', '来源']
    
    # 英文键到中文表头的映射
    key_map = {
        'date': '日期',
        'category': '类别',
        'subcategory': '子类别',
        'amount': '金额',
        'direction': '收支类型',
        'payment': '支付方式',
        'person': '记录人',
        'note': '备注',
        'source': '来源'
    }
    
    with open(csv_path, 'a', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        
        # 如果文件不存在或为空，写入表头
        if not file_exists:
            writer.writeheader()
        
        for record in records:
            # 将英文键转换为中文键
            cn_record = {key_map.get(k, k): v for k, v in record.items()}
            writer.writerow(cn_record)
    
    print(f"成功追加 {len(records)} 条记录到 {csv_path}")


# ============================================================
# 批量导入
# ============================================================

def batch_import(directory, person, config, categories_config=None):
    """批量导入目录下的所有账单"""
    directory = Path(directory)

    if not directory.exists():
        print(f"错误: 目录不存在 {directory}")
        return

    all_records = []

    # 查找所有微信账单
    for xlsx_file in directory.glob("微信支付账单*.xlsx"):
        records = parse_wechat_bill(xlsx_file, person, config, categories_config)
        all_records.extend(records)

    # 查找所有支付宝账单
    for csv_file in directory.glob("支付宝交易明细*.csv"):
        records = parse_alipay_bill(csv_file, person, config, categories_config)
        all_records.extend(records)
    
    if all_records:
        csv_path = Path(__file__).parent / "ledger.csv"
        append_to_csv(all_records, csv_path)
    else:
        print("未找到任何账单文件或没有有效记录")


# ============================================================
# 主函数
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description='Money-Pro 账单导入工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python import.py wechat "微信支付账单流水文件.xlsx" --person 李湘云
  python import.py alipay "支付宝交易明细.csv" --person 粟嘉明
  python import.py batch ./bills/ --person 李湘云
        """
    )
    
    parser.add_argument('type', choices=['wechat', 'alipay', 'batch'],
                        help='账单类型: wechat(微信), alipay(支付宝), batch(批量)')
    parser.add_argument('file', help='账单文件路径或目录路径(batch模式)')
    parser.add_argument('--person', '-p', 
                        help='记录人名称 (默认使用配置文件中的 default_person)')
    
    args = parser.parse_args()

    # 加载配置
    config = load_config()
    categories_config = load_categories()

    # 确定记录人
    person = args.person or config.get('default_person', '李湘云')

    # 验证记录人
    valid_persons = config.get('persons', [])
    if person not in valid_persons:
        print(f"警告: 记录人 '{person}' 不在配置文件中")
        print(f"有效记录人: {', '.join(valid_persons)}")
        response = input("是否继续? (y/N): ")
        if response.lower() != 'y':
            return

    csv_path = Path(__file__).parent / "ledger.csv"

    if args.type == 'batch':
        batch_import(args.file, person, config, categories_config)
    elif args.type == 'wechat':
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"错误: 文件不存在 {file_path}")
            return
        records = parse_wechat_bill(file_path, person, config, categories_config)
        append_to_csv(records, csv_path)
    elif args.type == 'alipay':
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"错误: 文件不存在 {file_path}")
            return
        records = parse_alipay_bill(file_path, person, config, categories_config)
        append_to_csv(records, csv_path)


if __name__ == '__main__':
    main()
