# 欠款账单日历管理网页 — 功能说明书

## 1. 项目概述

欠款账单日历管理网页是一个纯前端单页应用，用于跟踪和管理个人欠款账单的还款进度。用户可以通过月历视图直观查看每日到期账单，记录还款状态，并通过统计功能掌握整体负债情况。

**技术栈：** Vite + React 19 + TypeScript + Tailwind CSS 4  
**数据存储：** 使用浏览器 localStorage 持久化数据，无后端服务  
**状态管理：** useReducer + useContext 模式，无外部状态库  
**测试框架：** Vitest + @testing-library/react

## 2. 核心功能

### 2.1 账单管理

**新建账单**

通过点击顶栏「新建账单」按钮打开模态框表单，支持两种账单类型：

- **单次账单：** 输入账单名称、金额、还款日期，一次性还款
- **分期账单：** 输入账单名称、总金额、分期月数（1–60期）、每月还款日（1–28日）、起始月份。系统自动按等额本息（末尾吸收余数）生成各期明细

新建时在表单顶部选择类型，不同类型展示不同的输入字段。

**编辑账单**

点击账单卡片上的「编辑」按钮，打开预填充已有数据的模态框。编辑时账单类型不可变更。对于分期账单，编辑时已还款的期次金额保持不变，剩余期次根据新的总金额和剩余期数重新计算。

**删除账单**

点击账单卡片上的「删除」按钮，弹出浏览器原生确认对话框（`window.confirm`），确认后永久删除该账单及其所有分期数据。

**还款标记**

- **单次账单：** 通过复选框直接标记「已还清」/「未还款」，状态切换后立即更新并持久化
- **分期账单：** 进入账单详情或点击日期后在右侧面板的 InstallmentTracker 组件中，逐期点击「标记已还」按钮切换还款状态。每期独立跟踪，已还期次显示绿色对勾

### 2.2 月历视图

**月份导航**

日历顶部显示当前年月，左侧「←」按钮切换到上个月，右侧「→」按钮切换到下个月。导航自动处理年份边界：1月切换到上一年12月，12月切换到下一年1月。

**日格显示**

日历采用自定义 CSS Grid 布局（7列），周一为每周第一天。每个日期格子（DayCell 组件）显示：

- 日期数字
- 该日到期的账单明细列表（每行显示账单名称和金额）
- **已还账单**以灰色文字加删除线显示
- **待还账单**以蓝色加粗文字显示
- 非当前月份的日期格子以淡灰色背景显示

**日期详情**

点击任意日期格子，在右侧面板显示该日全部账单的详细列表和还款操作入口。再次点击同一日期可关闭详情面板。详情面板包含：

- 单次账单：名称、金额、还款复选框
- 分期账单：名称、嵌入式 InstallmentTracker（显示还款进度条和逐期明细表格）

### 2.3 统计功能

**月度统计**

月历视图下方展示当月统计卡片，包含三项指标：

- **待还总额：** 当月所有未还款账单金额之和（蓝色）
- **已还总额：** 当月所有已还款账单金额之和（绿色）
- **日均待还金额：** 待还总额除以当月天数，四舍五入保留两位小数

当月度无账单时不显示统计数据，仅提示「本月暂无账单」。

**年度统计**

通过顶栏选项卡切换到「年度统计」视图，展示：

- **年度汇总行：** 年度待还总额、年度已还总额、有账单月份数/12
- **12个月份卡片网格：** 每个卡片显示月份名称、待还金额、已还金额，以及一条颜色指示条（待还多于已还显示蓝色，否则显示绿色）
- 无账单的月份显示「无账单」灰色提示
- 全年无账单时显示空状态提示

### 2.4 数据持久化

**自动保存**

每次账单数据变更（增、删、改、标记还款）后，useReducer 状态更新，通过 useEffect 自动将完整账单数组序列化为 JSON 写入 localStorage，键名为 `bill-calendar-v1`。

首次渲染跳过保存（通过 `useRef` 标记），避免初始空状态覆盖已有数据。

**自动加载**

应用启动时，useEffect 从 localStorage 读取数据并通过 `LOAD_BILLS` action 初始化 reducer 状态。

**跨标签同步**

监听 `window` 的 `storage` 事件，当其他浏览器标签页修改同一 localStorage 键值时，自动重新加载数据并更新界面，实现多标签页数据实时同步。

**存储可用性检测**

写入前通过探针检测 localStorage 是否可用（某些浏览器隐私模式下不可用）。存储空间不足时输出中文警告。

### 2.5 错误处理

**错误边界**

顶层使用 ErrorBoundary（React Class Component）包裹整个应用。当任意子组件抛出渲染异常时：

- 捕获错误并显示友好的错误提示页面
- 显示可折叠的错误详情（error.message）
- 提供「刷新页面」按钮执行 `window.location.reload()`
- 在控制台输出详细错误信息（`componentDidCatch`）

**数据恢复**

从 localStorage 读取数据时，若 JSON 解析失败或存储值不是数组格式，自动重置为空数组并在控制台输出警告。使用者无需手动处理数据损坏场景。

## 3. 数据模型

### OneTimeBill（单次账单）

```typescript
interface OneTimeBill {
  id: string          // UUID（crypto.randomUUID）
  type: "one-time"   // 类型标识
  name: string        // 账单名称
  amount: number      // 金额（元）
  dueDate: string     // 还款日期 "YYYY-MM-DD"
  paid: boolean       // 是否已还清
}
```

### RecurringBill（分期账单）

```typescript
interface RecurringBill {
  id: string              // UUID（crypto.randomUUID）
  type: "recurring"       // 类型标识
  name: string             // 账单名称
  totalAmount: number      // 总金额（元）
  installmentCount: number // 分期总期数（1–60）
  paymentDay: number       // 每月还款日（1–28）
  startMonth: string       // 起始月份 "YYYY-MM"
  installments: Installment[] // 各期明细数组
}
```

### Installment（分期明细）

```typescript
interface Installment {
  month: string     // 所属月份 "YYYY-MM"
  dueDate: string   // 还款日期 "YYYY-MM-DD"
  amount: number    // 该期金额（元）
  paid: boolean     // 该期是否已还
}
```

### Bill（联合类型）

```typescript
type Bill = OneTimeBill | RecurringBill
```

### BillFormData（表单提交数据）

```typescript
interface BillFormData {
  type: "one-time" | "recurring"
  name: string
  amount?: number           // 单次：金额
  dueDate?: string          // 单次：还款日期
  totalAmount?: number      // 分期：总金额
  installmentCount?: number // 分期：期数
  paymentDay?: number       // 分期：每月还款日
  startMonth?: string      // 分期：起始月份
}
```

### BillStore（持久化结构）

```typescript
interface BillStore {
  bills: Bill[]
}
```

## 4. 技术实现

### 4.1 项目结构

```
src/
├── components/            # UI 组件
│   ├── Calendar.tsx       # 月历组件（导航 + 网格）
│   ├── DayCell.tsx        # 单日格子组件
│   ├── BillForm.tsx       # 账单表单模态框
│   ├── BillList.tsx       # 账单列表（右侧面板）
│   ├── InstallmentTracker.tsx  # 分期还款跟踪器
│   ├── MonthlyStats.tsx   # 月度统计卡片
│   ├── YearStats.tsx      # 年度统计视图
│   ├── EmptyState.tsx     # 空状态提示
│   └── ErrorBoundary.tsx  # 错误边界
├── hooks/
│   └── useBills.ts        # 账单数据管理 Hook
├── types/
│   └── bill.ts            # TypeScript 类型定义
├── utils/
│   ├── storage.ts         # localStorage 读写封装
│   └── calculate.ts       # 统计计算函数
├── test/
│   └── setup.ts           # 测试环境配置
├── App.tsx                # 应用根组件
├── main.tsx               # 入口文件
└── index.css              # 全局样式
```

### 4.2 关键技术决策

**状态管理：useReducer + useContext**

使用 React useReducer 管理全部账单状态，避免引入 Redux 等外部状态库。reducer 处理 6 种 action 类型：LOAD_BILLS、ADD_BILL、UPDATE_BILL、DELETE_BILL、TOGGLE_PAID、TOGGLE_INSTALLMENT。账单数据的增删改查逻辑全部集中在 reducer 中，便于测试和维护。

**视图切换：状态驱动**

通过 `activeTab` 状态（'calendar' | 'yearStats'）控制日历视图和年度统计视图的切换，未使用路由库。整个应用为单页无路由结构。

**自定义 CSS Grid 日历**

日历组件从零实现，未使用任何第三方日历库。核心计算逻辑包括：

- 根据年、月计算当月天数和首日星期偏移
- 转换为周一为起始的偏移量（中国习惯）
- 补全上月末尾和下月开头的填充日期
- 使用 `grid-cols-7` 实现 7 列网格布局

**分币计算避免浮点误差**

分期金额计算时，先将金额转换为分（`Math.round(amount * 100)`），使用整数运算。每期金额取整（`Math.floor(totalCents / count)`），最后一期吸收所有余数（`totalCents - usedCents`），确保各期金额之和精确等于总金额，避免 JavaScript 浮点数精度问题。

**编辑分期账单的智能计算**

编辑分期账单时，已还款期次的金额和数据保持不变。剩余待还金额按照新的参数重新计算分期，起始月份从最后一期已还期次的下一个月开始。若剩余金额为 0 或剩余期数为 0，则仅保留已还期次。

## 5. 界面说明

### 顶栏

- 左侧：应用标题「欠款账单日历」（蓝色加粗）
- 中间：选项卡切换器（日历视图 / 年度统计），当前激活选项卡为蓝色背景
- 右侧：「新建账单」蓝色按钮

### 主区域（日历视图）

左侧占主要内容区域（flex-1），包含：

- 日历组件：月份标题 + ← → 导航 + 星期头 + 日期网格
- 月度统计卡片：三项指标横向排列

右侧固定宽度面板（w-80），包含：

- 账单列表：单次账单和分期账单分组显示，每张卡片含编辑/删除按钮和还款操作
- 日期详情面板：点击日期后出现，展示该日全部账单明细

### 主区域（年度统计视图）

居中布局（max-w-4xl），包含：

- 年度标题
- 年度汇总行
- 3列/4列响应式月份卡片网格
- 「返回日历视图」链接按钮

### 模态框

新建/编辑账单使用模态框表单：

- 半透明黑色遮罩背景
- 居中白色卡片（max-w-md）
- 表单包含类型选择、名称、金额/总金额、日期/月份等字段
- 前端验证：名称非空、金额大于0、分期月数1–60、还款日1–28
- 底部「取消」和「保存」按钮

## 6. 局限与注意事项

- **仅支持桌面浏览器：** 当前界面未做移动端适配，在手机或平板等小屏幕设备上可能出现布局错乱
- **数据存储限制：** 所有数据仅存储在浏览器 localStorage 中，清除浏览器缓存、 cookies 或使用隐私模式可能导致数据丢失。localStorage 容量上限通常为 5–10MB
- **无多用户支持：** 数据绑定在单个浏览器中，不支持多用户登录、数据隔离或账号体系
- **无数据导出功能：** 目前不支持将账单数据导出为 CSV、JSON 或其他格式文件
- **无后端服务：** 所有数据仅在本地存储，更换设备或浏览器后数据不可迁移
- **单次账单不支持跨月：** 分期功能仅适用于 RecurringBill 类型，OneTimeBill 为单日到期
