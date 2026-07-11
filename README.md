# Money-Pro 日常记账系统

双人记账 + 关键词自动分类 + 收入/支出统计 + Excel可视化展示

## 架构

```
categories.yaml (分类规则)        # AI/人都可读的规则文件
       ↓
支付宝/微信账单 → import.py (导入+自动分类) → ledger.csv (数据源)
                                                   ↓
                                          generate_excel.py → 日常记账表格.xlsx (展示层)
                                                   ↑
                                          refresh_excel.py (一键刷新)
```

- **categories.yaml**: 分类规则，含关键词映射（AI 可读可写）
- **ledger.csv**: 唯一数据源，支持 Git 版本控制
- **日常记账表格.xlsx**: 含月度明细、按人汇总、收入/支出/结余统计、图表

## 快速开始

### 1. 导入账单

```bash
# 导入微信账单（自动按 categories.yaml 规则分类）
python import.py wechat "微信支付账单流水文件.xlsx" --person 李湘云

# 导入支付宝账单
python import.py alipay "支付宝交易明细.csv" --person 粟嘉明

# 批量导入目录下所有账单
python import.py batch ./bills/ --person 李湘云
```

### 2. 刷新 Excel

```bash
python refresh_excel.py
```

### 3. 手动记账

直接编辑 `ledger.csv` 文件，添加新行：

```csv
日期,类别,子类别,金额,收支类型,支付方式,记录人,备注,来源
2025-01-15,餐饮,午餐,35.00,支出,微信,李湘云,公司食堂,手动
```

然后运行 `python refresh_excel.py` 刷新 Excel。

## 分类规则

编辑 `categories.yaml` 自定义分类规则，支持三大类别：

| 类别 | 子类别 |
|------|--------|
| 车 | 过路费、能源费用、停车费、车贷月供、保险、车载用品购物、洗车美容、保养维修 |
| 宠物 | 主粮零食、玩具、医疗与洗护 |
| 日常生活 | 餐饮、购物、医疗、月供、其他 |

**匹配逻辑**：导入时根据关键词自动识别，优先级 车 > 宠物 > 日常生活（详见 `categories.yaml` 头部注释）。

```bash
# 如果导入后分类不准，可用手动分类工具修正
python reclassify.py
```

## 配置

编辑 `config.yaml` 修改记录人名称：

```yaml
persons:
  - 李湘云
  - 粟嘉明

default_person: 李湘云
```

## Excel 功能

| Sheet | 说明 |
|-------|------|
| 使用说明 | 操作指引 |
| 数据透视 | 全部数据，支持筛选 |
| 1月-12月 | 按月明细 + 按人汇总 + 收入/支出统计 + 月度结余 + 图表 |
| 按人汇总 | 两人支出表 + 收入表 + 年度结余 + 趋势图 |
| 年度汇总 | 全年类别对比 + 月度收入/支出/结余 + 图表 |

## 文件说明

| 文件 | 用途 |
|------|------|
| categories.yaml | 分类规则（关键词映射，AI 可读） |
| config.yaml | 人员配置 |
| import.py | 账单导入 + 自动分类脚本 |
| generate_excel.py | Excel 生成脚本 |
| refresh_excel.py | 一键刷新（导入后运行） |
| reclassify.py | 手动修正分类的工具 |
| ledger.csv | 数据源 |
| 日常记账表格.xlsx | Excel 展示层 |

## Git 使用

```bash
# 提交数据 + 规则 + 配置
git add ledger.csv categories.yaml config.yaml
git commit -m "更新账单数据"
```

`.gitignore` 已配置忽略原始账单文件和临时文件。
