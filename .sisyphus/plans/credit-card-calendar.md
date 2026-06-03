# 欠款账单日历管理网页 - 工作计划

## TL;DR

> **核心目标**：构建一个本地运行的 React 日历网页，管理两种类型账单（单次/分期），支持逐期追踪还款状态，并在月历和年度统计中直观展示待还金额。
> 
> **交付物**：
> - 完整的 Vite + React + TypeScript + Tailwind CSS 单页应用
> - 账单 CRUD（创建/读取/编辑/删除）
> - 月历视图（还款日标注金额，区分已还/未还）
> - 年度统计页面（月度总览 + 日均待还）
> - localStorage 数据持久化
> - `doc/requirements.md`（需求文档）
> - `doc/functional.md`（功能文档）
> 
> **预估工作量**：Medium（18 个实现任务 + 4 个审核任务）
> **并行执行**：YES - 4 波（Wave 1-4）+ 最终审核波
> **关键路径**：Task 1 → Task 2 → Task 6 → Task 12 → Task 18 → F1-F4

---

## Context

### 原始需求
用户需要一款日历网页工具来管理欠款账单：
1. 录入账单信息（金额、分期、还款日），数据以文本形式保存在本地
2. 统计每月/每年/日均待还金额
3. 日历上标注还款日和待还金额
4. 生成需求文档和功能文档在 `doc/` 目录

### 访谈摘要

**核心决策**：
- **技术栈**：Vite + React 19 + TypeScript + Tailwind CSS（零路由库，状态驱动导航）
- **数据存储**：localStorage（JSON 格式），每次打开自动读取
- **账单模型**：两种类型 —— 单次账单（日期+金额）和 分期账单（总金额+月数+还款日+起始月）
- **分期追踪**：每期独立 paid/unpaid 状态，可逐期标记已还/未还
- **余数处理**：末月吸收余数（￥100/3期 = [￥33, ￥33, ￥34]）
- **编辑策略**：编辑分期账单时，已还期数不变，仅重算剩余期数
- **还款日范围**：1-28 日（避免月末日期问题）
- **日历视图**：月视图（默认）+ 年度统计页面
- **UI**：中文界面，现代简洁风，浅色主题，Tailwind CSS
- **测试**：完成后补充核心逻辑单元测试（vitest）
- **日历组件**：DIY React 组件（CSS Grid 月历网格），不使用第三方日历库

### 调研发现
- **FullCalendar React** (~500KB+) — 功能全面但过重
- **react-big-calendar** (~150KB) — 中等，适合复杂场景
- **DIY React 日历** (~5KB) — 对本项目最优：完全可控、零依赖、轻松在日格内显示金额
- **localStorage**：5MB 限制（账单数据绰绰有余），需通过 localhost 访问（file:// 协议在某些浏览器有存储问题）
- **工作区状态**：空白项目，仅有空的 `doc/` 目录

### Metis 审核
**已解决的缺口**：
- ✅ **账单生命周期**：采用分期逐期追踪（每期独立 paid/unpaid）
- ✅ **分期编辑策略**：已还期数锁定，剩余期数重算
- ✅ **余数处理**：末月吸收除法余数
- ✅ **UI 语言**：中文（用户全程中文交流）
- ✅ **空状态处理**：首屏无数据时显示引导信息
- ✅ **localStorage 异常处理**：损坏/不可用时显示友好错误
- ✅ **跨标签同步**：监听 storage 事件同步数据

**已应用的护栏**：
- 🚫 不添加外部状态管理库（useContext + useReducer）
- 🚫 不添加路由库（状态驱动条件渲染）
- 🚫 不添加图表库（纯数值统计）
- 🚫 不添加搜索/筛选功能
- 🚫 不添加通知/提醒功能
- 🚫 不添加导入/导出功能
- 🚫 不添加撤销/回收站
- 🚫 不添加暗色模式

---

## Work Objectives

### 核心目标
构建一个本地 React 欠款账单日历管理应用，支持单次和分期两种账单类型的完整 CRUD、逐期还款追踪、日历可视化展示和统计汇总。

### 具体交付物
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/types/bill.ts` — 数据模型类型定义
- `src/utils/storage.ts` — localStorage 读写封装
- `src/utils/calculate.ts` — 统计计算工具函数
- `src/hooks/useBills.ts` — 账单状态管理 Hook
- `src/components/Calendar.tsx` — 月历网格组件
- `src/components/DayCell.tsx` — 日格渲染组件
- `src/components/BillForm.tsx` — 账单录入/编辑表单
- `src/components/BillList.tsx` — 日期账单列表
- `src/components/InstallmentTracker.tsx` — 分期逐期追踪
- `src/components/MonthlyStats.tsx` — 月度统计面板
- `src/components/YearStats.tsx` — 年度统计页面
- `src/components/EmptyState.tsx` — 空状态引导
- `doc/requirements.md` — 需求文档
- `doc/functional.md` — 功能文档

### Definition of Done
- [ ] `npm run dev` 启动成功，浏览器访问 localhost 正常
- [ ] `npm run build` 构建成功
- [ ] 可创建/编辑/删除单次账单和分期账单
- [ ] 月历正确显示每个还款日的待还金额（已还用灰色，未还用主题色）
- [ ] 点击日期可查看当天所有账单
- [ ] 分期账单每期可独立标记已还/未还
- [ ] 年度统计页面显示每月总待还和月均每天待还
- [ ] 刷新浏览器后数据不丢失
- [ ] `vitest run` 核心逻辑测试通过
- [ ] `doc/requirements.md` 和 `doc/functional.md` 存在且完整

### Must Have
- 两种账单类型的完整 CRUD
- 月历视图（还款日标注金额、颜色区分已还/未还）
- 分期逐期已还/未还标记
- 月度/年度/日均统计
- localStorage 数据持久化
- 中文 UI
- 需求文档 + 功能文档

### Must NOT Have（护栏）
- 后端服务、数据库、云同步
- 用户登录/多用户
- 实际支付功能
- 外部状态管理库（Redux/Zustand）
- 路由库（react-router）
- 图表库（Chart.js/ECharts）
- 搜索/筛选/排序
- 浏览器通知/提醒
- JSON 导入/导出
- 撤销/回收站
- 暗色模式切换
- 移动端响应式布局（桌面优先）
- 任何外部日历库（FullCalendar/react-big-calendar）
- 任何日期处理库（date-fns/dayjs）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — 所有验证均由执行代理自动完成。

### 测试决策
- **基础设施存在**：NO（需新建 vitest 配置）
- **自动化测试**：Tests-after（先实现后补测）
- **框架**：vitest（Vite 原生集成）
- **测试范围**：仅核心逻辑（`storage.ts` 读写、`calculate.ts` 统计计算）

### QA 策略
每个任务必须包含代理执行的 QA 场景。证据保存至 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`。

- **前端/UI**：Playwright — 导航、交互、DOM 断言、截图
- **API/逻辑**：Bash（bun/node REPL）— 导入模块、调用函数、验证输出
- **存储验证**：Bash — 检查 localStorage 数据

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (启动即并行 — 基础设施 + 类型):
├── Task 1: 项目脚手架 [quick]
├── Task 2: 类型定义 [quick]
├── Task 3: localStorage 存储服务 [quick]
├── Task 4: 统计计算工具函数 [quick]
└── Task 5: 需求文档 [writing]

Wave 2 (依赖 Wave 1 — 核心组件，最大并行):
├── Task 6: useBills 状态管理 Hook [unspecified-high] (depends: 2, 3)
├── Task 7: Calendar 月历组件 [visual-engineering] (depends: 2)
├── Task 8: DayCell 日格组件 [visual-engineering] (depends: 2, 7)
├── Task 9: BillForm 表单组件 [visual-engineering] (depends: 2, 6)
├── Task 10: BillList 账单列表 [visual-engineering] (depends: 2, 6)
└── Task 11: InstallmentTracker 分期追踪 [visual-engineering] (depends: 2, 6)

Wave 3 (依赖 Wave 2 — 集成 + 统计):
├── Task 12: App 布局 + 导航 [visual-engineering] (depends: 6-11)
├── Task 13: MonthlyStats 月度统计 [visual-engineering] (depends: 4, 6)
├── Task 14: YearStats 年度统计 [visual-engineering] (depends: 4, 13)
├── Task 15: EmptyState 空状态 [visual-engineering] (depends: 12)
└── Task 16: 错误处理 + 边界情况 [unspecified-high] (depends: 3, 6, 12)

Wave 4 (依赖 Wave 3 — 测试 + 文档):
├── Task 17: 单元测试 [quick] (depends: 3, 4)
└── Task 18: 功能文档 [writing] (depends: 12-16)

Wave FINAL (依赖全部 — 4 并行审核):
├── Task F1: Plan Compliance Audit [oracle]
├── Task F2: Code Quality Review [unspecified-high]
├── Task F3: Real Manual QA [unspecified-high + playwright]
└── Task F4: Scope Fidelity Check [deep]
```

### 依赖矩阵

| 任务 | 依赖 | 被依赖 | 并行组 |
|------|------|--------|--------|
| 1 | - | 2-18, F1-F4 | Wave 1 |
| 2 | 1 | 6-11, 17 | Wave 1 |
| 3 | 1 | 6, 16, 17 | Wave 1 |
| 4 | 1 | 13, 14, 17 | Wave 1 |
| 5 | - | - | Wave 1 |
| 6 | 2, 3 | 9, 10, 11, 12, 13, 15, 16 | Wave 2 |
| 7 | 2 | 8, 12 | Wave 2 |
| 8 | 2, 7 | 12 | Wave 2 |
| 9 | 2, 6 | 12 | Wave 2 |
| 10 | 2, 6 | 12 | Wave 2 |
| 11 | 2, 6 | 12 | Wave 2 |
| 12 | 6-11 | 15, 16, 18 | Wave 3 |
| 13 | 4, 6 | 14 | Wave 3 |
| 14 | 4, 13 | 18 | Wave 3 |
| 15 | 12 | - | Wave 3 |
| 16 | 3, 6, 12 | 18 | Wave 3 |
| 17 | 3, 4 | - | Wave 4 |
| 18 | 12-16 | - | Wave 4 |

**关键路径**：Task 1 → Task 2 → Task 6 → Task 12 → Task 18 → F1-F4
**最大并发数**：6（Wave 2）
**并行加速比**：约 65% 快于串行执行

### 代理调度摘要

| 波次 | 任务数 | 代理类型 |
|------|--------|----------|
| Wave 1 | 5 | 4× quick, 1× writing |
| Wave 2 | 6 | 1× unspecified-high, 5× visual-engineering |
| Wave 3 | 5 | 4× visual-engineering, 1× unspecified-high |
| Wave 4 | 2 | 1× quick, 1× writing |
| FINAL | 4 | oracle, unspecified-high, unspecified-high+playwright, deep |

---

## TODOs

- [ ] 1. 项目脚手架（Vite + React + Tailwind）

  **What to do**：
  - 使用 Vite 创建 React + TypeScript 项目（`npm create vite@latest . --template react-ts`）
  - 安装并配置 Tailwind CSS v3（`tailwindcss`, `postcss`, `autoprefixer`）
  - 配置 `tailwind.config.js`：content 路径、主题扩展
  - 安装 vitest（`vitest`, `@testing-library/react`, `jsdom`）
  - 创建 `src/index.css`：Tailwind 指令（@tailwind base/components/utilities）
  - 清理 Vite 默认模板：删除 App.css 中的默认样式、移除 logo SVG
  - 创建 `src/main.tsx`：ReactDOM.createRoot 入口
  - 创建占位 `src/App.tsx`：简单 "Hello" 组件验证脚手架可用
  - 验证：`npm run dev` 启动成功，浏览器显示正常

  **Must NOT do**：
  - 不安装 react-router、zustand、redux 等额外库
  - 不安装任何日历库
  - 不安装日期处理库

  **Recommended Agent Profile**：
  - **Category**：`quick`
    - Reason：标准 Vite 脚手架搭建，模式固定，无复杂逻辑
  - **Skills**：`[]`
  - **Skills Evaluated but Omitted**：
    - `git-master`：本任务不涉及 git 操作

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 1（与 Tasks 2, 3, 4, 5 并行）
  - **Blocks**：Tasks 2-18, F1-F4
  - **Blocked By**：None

  **References**：
  - Vite 官方文档：`https://vite.dev/guide/#scaffolding-your-first-vite-project` — 创建项目的标准命令
  - Tailwind CSS 安装指南：`https://tailwindcss.com/docs/guides/vite` — Vite + Tailwind 配置步骤
  - Vitest 配置：`https://vitest.dev/guide/` — 测试框架配置

  **Acceptance Criteria**：
  - [ ] `npm run dev` 启动成功，浏览器访问 `http://localhost:5173` 看到页面
  - [ ] `npm run build` 构建成功，生成 `dist/` 目录
  - [ ] `npx tsc --noEmit` 无类型错误
  - [ ] Tailwind CSS 类名在页面生效（如 `className="text-red-500"` 显示红色文字）

  **QA Scenarios**：

  ```
  Scenario: 项目启动验证
    Tool: Bash（ctrl+b 模式启动 dev server）
    Preconditions：项目目录下有 package.json
    Steps：
      1. 运行 `npm run dev`，确认输出包含 "Local: http://localhost:5173"
      2. 运行 `npm run build`，确认输出 "✓ built in Xms" 且 `dist/` 目录存在
      3. 运行 `npx tsc --noEmit`，确认无错误输出
    Expected Result：三项命令全部成功，无错误
    Evidence：.sisyphus/evidence/task-1-build-success.txt（命令输出）
  ```

  **Commit**：YES
  - Message：`feat(init): scaffold Vite + React + TypeScript + Tailwind project`
  - Files：`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
  - Pre-commit：`npx tsc --noEmit && npm run build`

- [ ] 2. 类型定义（src/types/bill.ts）

  **What to do**：
  - 定义 `OneTimeBill` 接口：id, type, name, amount, dueDate, paid
  - 定义 `Installment` 接口：month, dueDate, amount, paid
  - 定义 `RecurringBill` 接口：id, type, name, totalAmount, installmentCount, paymentDay, startMonth, installments
  - 定义联合类型 `Bill = OneTimeBill | RecurringBill`
  - 定义 `BillStore` 接口：bills: Bill[]
  - 导出 `isOneTime(bill)` 和 `isRecurring(bill)` 类型守卫函数
  - 定义表单数据类型 `BillFormData`：用于创建/编辑表单的统一类型

  **Must NOT do**：
  - 不定义超出数据模型范围的类型（如分类、标签、用户）
  - 不引入 zod、yup 等验证库

  **Recommended Agent Profile**：
  - **Category**：`quick`
    - Reason：纯类型定义文件，无运行时逻辑
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 1（与 Tasks 1, 3, 4, 5 并行）
  - **Blocks**：Tasks 6-11, 17
  - **Blocked By**：Task 1（需要项目结构就绪）

  **References**：
  - 草稿数据模型：`.sisyphus/drafts/credit-card-calendar.md` — 已确认的接口结构

  **Acceptance Criteria**：
  - [ ] `OneTimeBill` 和 `RecurringBill` 接口定义完整（含所有必需字段）
  - [ ] `Installment` 接口包含 month, dueDate, amount, paid
  - [ ] `Bill` 联合类型可正确区分两种账单
  - [ ] `isOneTime()` 和 `isRecurring()` 类型守卫编译通过
  - [ ] `npx tsc --noEmit` 无类型错误

  **QA Scenarios**：

  ```
  Scenario: 类型编译检查
    Tool: Bash
    Preconditions：src/types/bill.ts 已创建
    Steps：
      1. 运行 `npx tsc --noEmit` 
    Expected Result：无类型错误输出
    Evidence：.sisyphus/evidence/task-2-types-check.txt
  ```

  **Commit**：YES
  - Message：`feat(types): add bill data model type definitions`
  - Files：`src/types/bill.ts`

- [ ] 3. localStorage 存储服务（src/utils/storage.ts）

  **What to do**：
  - 实现 `loadBills(): Bill[]` — 从 localStorage 读取并 JSON.parse，处理空/损坏数据返回 `[]`
  - 实现 `saveBills(bills: Bill[]): void` — JSON.stringify 存入 localStorage，捕获 QuotaExceededError
  - 实现 `STORAGE_KEY = 'bill-calendar-v1'` 常量
  - 添加 try/catch 保护：损坏的 JSON 返回空数组并 console.warn
  - 添加 localStorage 可用性检查：`isStorageAvailable(): boolean`
  - 导出所有函数

  **Must NOT do**：
  - 不添加数据迁移/版本管理逻辑
  - 不添加加密/压缩

  **Recommended Agent Profile**：
  - **Category**：`quick`
    - Reason：简单工具函数，标准 try/catch + JSON + localStorage 模式
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 1（与 Tasks 1, 2, 4, 5 并行）
  - **Blocks**：Tasks 6, 16, 17
  - **Blocked By**：Task 1

  **References**：
  - MDN localStorage API：`https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage`
  - 草稿存储策略：`.sisyphus/drafts/credit-card-calendar.md` — localStorage + JSON 格式

  **Acceptance Criteria**：
  - [ ] `loadBills()` 在无数据时返回 `[]`
  - [ ] `loadBills()` 在数据损坏时返回 `[]`（不崩溃）
  - [ ] `saveBills([...])` 成功写入 localStorage
  - [ ] `saveBills()` 在 localStorage 满时捕获 QuotaExceededError
  - [ ] `isStorageAvailable()` 正确检测 localStorage 可用性

  **QA Scenarios**：

  ```
  Scenario: 正常读写流程
    Tool: Bash（Node REPL 模拟）
    Preconditions：src/utils/storage.ts 已创建，localStorage 可用
    Steps：
      1. 模拟调用 saveBills([{ id: '1', type: 'one-time', name: '测试', amount: 100, dueDate: '2026-06-15', paid: false }])
      2. 模拟调用 loadBills()
      3. 断言返回数组中包含 name='测试' 的账单
    Expected Result：loadBills 返回与 saveBills 相同的数据
    Evidence：.sisyphus/evidence/task-3-storage-readwrite.txt

  Scenario: 损坏数据处理
    Tool: Bash
    Preconditions：localStorage 中 bill-calendar-v1 的值为非法 JSON 字符串
    Steps：
      1. 手动设置 localStorage['bill-calendar-v1'] = 'not-valid-json'
      2. 调用 loadBills()
    Expected Result：返回 []，console 输出警告，不抛出异常
    Evidence：.sisyphus/evidence/task-3-corrupt-data.txt
  ```

  **Commit**：YES
  - Message：`feat(storage): add localStorage read/write with error handling`
  - Files：`src/utils/storage.ts`

- [ ] 4. 统计计算工具函数（src/utils/calculate.ts）

  **What to do**：
  - 实现 `calculateInstallments(totalAmount: number, count: number, paymentDay: number, startMonth: string): Installment[]`
    - 每期金额 = floor(totalAmount / count, 2位小数)
    - 最后一个月 = totalAmount - sum(前面所有期)【余数吸收】
    - 每月还款日匹配 paymentDay，生成 YYYY-MM-DD
    - 所有期初始状态 paid = false
  - 实现 `getMonthlyTotal(bills: Bill[], yearMonth: string): { pending: number, paid: number }`
    - 汇总指定月份所有账单的待还/已还金额
    - 分期账单检查 installment.month === yearMonth
    - 单次账单检查 dueDate 属于该月
  - 实现 `getYearStats(bills: Bill[], year: number): MonthStat[]`
    - 返回 12 个月每月的 pending/paid 总计
  - 实现 `getDailyAverage(bills: Bill[], yearMonth: string): number`
    - 当月 pending 总额 / 当月天数
  - 实现 `getBillsForDate(bills: Bill[], date: string): Bill[]`
    - 返回指定日期的所有账单（单次账单匹配 dueDate，分期账单计算 dueDate）

  **Must NOT do**：
  - 不引入 date-fns、dayjs 等日期库（使用原生 Date API）
  - 不添加图表数据处理

  **Recommended Agent Profile**：
  - **Category**：`quick`
    - Reason：纯函数计算逻辑，无 UI 依赖，输入输出明确
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 1（与 Tasks 1, 2, 3, 5 并行）
  - **Blocks**：Tasks 13, 14, 17
  - **Blocked By**：Task 1

  **References**：
  - 草稿数据模型：`.sisyphus/drafts/credit-card-calendar.md` — Installment 接口和余数处理策略
  - MDN Date API：`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date`

  **Acceptance Criteria**：
  - [ ] `calculateInstallments(100, 3, 15, '2026-06')` 返回 3 期：[{month:'2026-06', amount:33}, {month:'2026-07', amount:33}, {month:'2026-08', amount:34}]
  - [ ] `calculateInstallments(1000, 12, 1, '2026-01')` 返回 12 期，总金额精确等于 1000
  - [ ] `getMonthlyTotal(bills, '2026-06')` 正确区分 pending 和 paid
  - [ ] `getBillsForDate(bills, '2026-06-15')` 返回所有该日到期的账单（包括分期账单的该日）
  - [ ] `getDailyAverage(bills, '2026-06')` 返回正确的小数（保留2位）

  **QA Scenarios**：

  ```
  Scenario: 分期计算 + 余数吸收
    Tool: Bash（Node REPL）
    Preconditions：src/utils/calculate.ts 已导出 calculateInstallments
    Steps：
      1. const result = calculateInstallments(100, 3, 15, '2026-06')
      2. 断言 result.length === 3
      3. 断言 result[0].amount === 33, result[1].amount === 33, result[2].amount === 34
      4. 断言 result.reduce((s, i) => s + i.amount, 0) === 100
      5. 断言 result[2].dueDate === '2026-08-15'
    Expected Result：所有断言通过
    Evidence：.sisyphus/evidence/task-4-installment-calc.txt

  Scenario: 月度统计
    Tool: Bash（Node REPL）
    Preconditions：src/utils/calculate.ts 已导出 getMonthlyTotal
    Steps：
      1. 创建测试数据：1笔单次(500, '2026-06-15', paid=false) + 1笔分期(100/2期, 6月15日, paid=false)
      2. const result = getMonthlyTotal(bills, '2026-06')
      3. 断言 result.pending === 550（500+50）
      4. 断言 result.paid === 0
    Expected Result：统计正确
    Evidence：.sisyphus/evidence/task-4-monthly-total.txt
  ```

  **Commit**：YES
  - Message：`feat(calculate): add installment calculator and statistics utilities`
  - Files：`src/utils/calculate.ts`

- [ ] 5. 需求文档（doc/requirements.md）

  **What to do**：
  - 编写完整的需求规格文档，包含以下章节：
    1. **项目概述**：欠款账单日历管理网页的目标和定位
    2. **功能需求**：
       - FR-01：单次账单录入（名称、金额、还款日期）
       - FR-02：分期账单录入（名称、总金额、分期月数、还款日、起始月）
       - FR-03：账单编辑和删除（含确认对话框）
       - FR-04：分期逐期追踪（每期独立标记已还/未还）
       - FR-05：月历视图（按天显示还款金额，颜色区分已还/未还）
       - FR-06：日期点击查看当天所有账单
       - FR-07：月度统计（当月待还/已还总额）
       - FR-08：年度统计（12 个月每月汇总 + 日均待还）
       - FR-09：localStorage 数据持久化
       - FR-10：空状态引导
    3. **非功能需求**：性能（首屏<1s）、可靠性（数据损坏不崩溃）、可用性
    4. **数据模型**：OneTimeBill, RecurringBill, Installment 接口定义
    5. **UI 规范**：中文界面、浅色主题、卡片布局
    6. **约束与排除**：明确列出不做的功能

  **Must NOT do**：
  - 不写实现细节（那是功能文档的事）

  **Recommended Agent Profile**：
  - **Category**：`writing`
    - Reason：纯文档编写，需结构化和清晰表达
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 1（与 Tasks 1-4 完全并行）
  - **Blocks**：None
  - **Blocked By**：None

  **References**：
  - 草稿所有需求：`.sisyphus/drafts/credit-card-calendar.md`

  **Acceptance Criteria**：
  - [ ] 文档包含项目概述、功能需求（10 条 FR）、非功能需求、数据模型、UI 规范、约束排除
  - [ ] 每个 FR 有清晰的编号和描述
  - [ ] 数据模型包含完整的接口定义和字段说明
  - [ ] 文档以中文编写

  **QA Scenarios**：

  ```
  Scenario: 文档完整性检查
    Tool: Bash
    Preconditions：doc/requirements.md 已创建
    Steps：
      1. 检查文件存在：Test-Path doc/requirements.md
      2. 检查文件大小 > 2KB
      3. 检查包含关键字："项目概述"、"功能需求"、"数据模型"、"约束"
    Expected Result：文件存在且包含所有必要章节
    Evidence：.sisyphus/evidence/task-5-requirements-doc.txt
  ```

  **Commit**：YES
  - Message：`docs: add requirements specification document`
  - Files：`doc/requirements.md`

- [ ] 6. useBills 状态管理 Hook（src/hooks/useBills.ts）

  **What to do**：
  - 使用 `useReducer` 创建 `useBills` 自定义 Hook
  - 实现 action types：`ADD_BILL`, `UPDATE_BILL`, `DELETE_BILL`, `TOGGLE_PAID`, `TOGGLE_INSTALLMENT`, `LOAD_BILLS`
  - `ADD_BILL`：为分期账单自动调用 `calculateInstallments` 生成 installments 数组
  - `UPDATE_BILL`：编辑账单；分期账单则仅重算 paid===false 的剩余期数
  - `DELETE_BILL`：删除（需确认逻辑由调用方处理）
  - `TOGGLE_PAID`：切换单次账单的 paid 状态
  - `TOGGLE_INSTALLMENT`：切换分期账单指定月份的 paid 状态
  - 每次状态变更后自动调用 `saveBills()`
  - 使用 `useEffect` 在组件挂载时调用 `loadBills()` 初始化
  - 使用 `useEffect` 监听 `window.addEventListener('storage', ...)` 跨标签同步
  - 导出 `{ bills, addBill, updateBill, deleteBill, togglePaid, toggleInstallment }`

  **Must NOT do**：
  - 不使用外部状态管理库
  - 不在 Hook 中处理 UI 逻辑（表单验证、模态框状态）

  **Recommended Agent Profile**：
  - **Category**：`unspecified-high`
    - Reason：核心业务逻辑 Hook，涉及 reducer 模式、副作用处理、跨标签同步，复杂度较高
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 7, 8, 9, 10, 11 并行——但因 8 依赖 7，实际 9-11 可充分并行）
  - **Blocks**：Tasks 9, 10, 11, 12, 13, 15, 16
  - **Blocked By**：Tasks 2（types）, 3（storage）

  **References**：
  - React useReducer 文档：`https://react.dev/reference/react/useReducer`
  - MDN storage event：`https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event`

  **Acceptance Criteria**：
  - [ ] `addBill()` 创建单次/分期账单后状态更新且数据持久化
  - [ ] `addBill()` 为分期账单自动生成 installments（含余数吸收）
  - [ ] `togglePaid()` 切换单次账单 paid 状态
  - [ ] `toggleInstallment()` 切换分期账单指定月份的 paid 状态
  - [ ] `deleteBill()` 删除账单
  - [ ] 另一标签页修改 localStorage 后当前页自动同步
  - [ ] 首次加载时从 localStorage 恢复数据

  **QA Scenarios**：

  ```
  Scenario: 完整 CRUD 流程
    Tool: Bash（bun test 或 vitest 运行）
    Preconditions：src/hooks/useBills.ts, src/utils/storage.ts, src/utils/calculate.ts 就绪
    Steps：
      1. 创建单次账单 addBill({ name:'花呗', amount:3500, dueDate:'2026-06-15' })
      2. 创建分期账单 addBill({ name:'车贷', totalAmount:120000, installmentCount:12, paymentDay:15, startMonth:'2026-06' })
      3. 断言 bills.length === 2
      4. 调用 togglePaid(bills[0].id)，断言 bills[0].paid === true
      5. 调用 toggleInstallment(bills[1].id, '2026-06')，断言该期 paid === true
      6. 调用 deleteBill(bills[0].id)，断言 bills.length === 1
      7. 验证 localStorage 中数据同步更新
    Expected Result：所有操作成功，状态和 localStorage 一致
    Evidence：.sisyphus/evidence/task-6-usebills-crud.txt

  Scenario: 跨标签同步
    Tool: Playwright
    Preconditions：应用在标签1打开
    Steps：
      1. 在标签1中添加账单
      2. 新标签2打开应用
      3. 验证标签2中看到标签1添加的账单
    Expected Result：新标签自动加载最新数据
    Evidence：.sisyphus/evidence/task-6-cross-tab.png
  ```

  **Commit**：YES
  - Message：`feat(hook): add useBills state management with CRUD and cross-tab sync`
  - Files：`src/hooks/useBills.ts`

- [ ] 7. Calendar 月历网格组件（src/components/Calendar.tsx）

  **What to do**：
  - 创建 `Calendar` 组件，接收 `year`, `month`, `bills`, `onDateClick` props
  - 使用 CSS Grid（7 列）渲染月历网格
  - 计算当月第一天是周几（偏移空白天数）
  - 计算当月总天数（处理闰年 2 月）
  - 顶部显示月份名称（格式："2026年6月"）和左右翻月按钮
  - 周标题行：一/二/三/四/五/六/日
  - 每个日期渲染 `DayCell` 子组件（Task 8）
  - 使用 Tailwind 样式：卡片容器、hover 效果、当前日期高亮

  **Must NOT do**：
  - 不引入第三方日历库
  - 不在 Calendar 组件内处理账单逻辑（交给 DayCell）

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：UI 组件，涉及 CSS Grid 布局、日期计算、交互设计
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 6, 9, 10, 11 并行）
  - **Blocks**：Tasks 8, 12
  - **Blocked By**：Task 2（types）

  **References**：
  - CSS Grid 布局：`https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout`
  - MDN Date API（getDay/getDate）：`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date`

  **Acceptance Criteria**：
  - [ ] 7 列网格正确渲染月份所有日期
  - [ ] 第一天空白天数正确（如 2026-06-01 是周一，网格第一个位置为 6 月 1 日）
  - [ ] 翻月按钮正确切换到上/下个月（1月←→12月自动跨年）
  - [ ] 当前日期高亮（如蓝色边框或背景）
  - [ ] 月份标题显示为 "2026年6月" 格式

  **QA Scenarios**：

  ```
  Scenario: 月历渲染 + 翻月
    Tool: Playwright
    Preconditions：应用已启动，包含 Calendar 组件
    Steps：
      1. 导航到页面，查看月历
      2. 断言页面显示 "2026年6月"
      3. 断言网格显示 30 个日期格（2026年6月）
      4. 截图保存
      5. 点击左箭头翻到 5 月
      6. 断言页面显示 "2026年5月"，日期数量为 31
      7. 点击右箭头翻到 7 月，再翻到 2027年1月
      8. 断言显示 "2027年1月"
    Expected Result：所有月份渲染正确，跨年翻月正常
    Evidence：.sisyphus/evidence/task-7-calendar-render.png, .sisyphus/evidence/task-7-calendar-navigate.png
  ```

  **Commit**：YES
  - Message：`feat(calendar): add month grid calendar with navigation`
  - Files：`src/components/Calendar.tsx`

- [ ] 8. DayCell 日格组件（src/components/DayCell.tsx）

  **What to do**：
  - 创建 `DayCell` 组件，接收 `date`, `billsForDate`, `isToday`, `isCurrentMonth`, `onClick` props
  - 日期数字显示在日格顶部
  - 按账单类型分组显示：
    - 单次账单：显示名称 + 金额
    - 分期账单：显示名称 + 当月应还金额
  - 已还账单用灰色文字 + 删除线样式（`line-through text-gray-400`）
  - 未还账单用主题色（`text-blue-600 font-semibold`）
  - 如果有 3 笔以上账单，显示 "+N more" 折叠提示
  - 点击日格触发 `onClick(date)`
  - 非当月日期（上月/下月填充）用浅灰背景（`bg-gray-50`）
  - 今日日期用蓝色边框高亮（`ring-2 ring-blue-400`）

  **Must NOT do**：
  - 不在 DayCell 中处理账单操作（标记已还等——由父组件处理）
  - 不显示超过 3 笔账单的完整列表（折叠）

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：UI 组件，涉及条件渲染、颜色状态、数据展示
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 6, 9, 10, 11 并行，但依赖 Task 7 的类型）
  - **Blocks**：Task 12
  - **Blocked By**：Tasks 2（types）, 7（Calendar 调用 DayCell）

  **References**：
  - Tailwind text colors：`https://tailwindcss.com/docs/text-color`
  - Tailwind ring：`https://tailwindcss.com/docs/ring-width`

  **Acceptance Criteria**：
  - [ ] 日格显示日期数字
  - [ ] 未还账单显示为蓝色加粗
  - [ ] 已还账单显示为灰色 + 删除线
  - [ ] 3 笔以上显示 "+N more"
  - [ ] 今日日格有蓝色边框
  - [ ] 非当月日期背景为浅灰
  - [ ] 点击触发 onClick(date)

  **QA Scenarios**：

  ```
  Scenario: 日格渲染多种状态
    Tool: Playwright
    Preconditions：添加了多笔账单的日历视图
    Steps：
      1. 在 15 日添加 1 笔未还单次账单(500) 和 1 笔未还分期(50)
      2. 标记单次账单为已还
      3. 查看 15 日格子
      4. 断言未还分期显示蓝色金额 "50"
      5. 断言已还单次显示灰色删除线金额 "500"
      6. 在 15 日添加第 3、4 笔账单
      7. 断言显示 "+2 more"（超过3笔后折叠）
      8. 点击 15 日格子
      9. 断言触发了日期点击（父组件的 onDateClick 被调用）
    Evidence：.sisyphus/evidence/task-8-daycell-states.png
  ```

  **Commit**：YES
  - Message：`feat(calendar): add DayCell with bill amounts and paid/unpaid styling`
  - Files：`src/components/DayCell.tsx`

- [ ] 9. BillForm 表单组件（src/components/BillForm.tsx）

  **What to do**：
  - 创建模态框表单组件，支持两种模式：创建（初始空）和编辑（预填数据）
  - **表单字段**：
    - 账单名称（text input，必填，最大 20 字）
    - 账单类型切换（单次 / 分期，radio 或 tabs）
    - 单次模式：金额（number input）+ 还款日期（date input）
    - 分期模式：总金额（number input）+ 分期月数（number, 2-60）+ 还款日（select 1-28）+ 起始年月（month input）
  - **表单验证**：
    - 名称为空 → "请输入账单名称"
    - 金额 ≤ 0 → "金额必须大于 0"
    - 分期月数 < 2 → "分期月数至少为 2"
    - 验证通过后调用 `onSubmit(formData)`
  - 点击背景遮罩或取消按钮关闭 -> `onClose()`
  - 使用 Tailwind 样式：白色卡片居中、半透明遮罩、输入框 focus ring

  **Must NOT do**：
  - 不引入 formik、react-hook-form 等表单库
  - 不在组件内直接操作 localStorage

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：表单 UI 组件，涉及条件渲染、表单验证、模态框交互
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 7, 8, 10, 11 并行）
  - **Blocks**：Task 12
  - **Blocked By**：Tasks 2（types）, 6（useBills）

  **References**：
  - Tailwind 表单样式：`https://tailwindcss.com/docs/forms`
  - HTML date input：`https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date`
  - HTML month input：`https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month`

  **Acceptance Criteria**：
  - [ ] 创建模式：所有字段为空，类型默认"单次"
  - [ ] 编辑模式：所有字段预填当前值
  - [ ] 切换类型时显示对应字段（单次显示日期，分期显示月数+还款日+起始月）
  - [ ] 名称为空提交 → 显示 "请输入账单名称"
  - [ ] 金额 ≤ 0 提交 → 显示 "金额必须大于 0"
  - [ ] 有效数据提交 → 调用 onSubmit
  - [ ] 点击遮罩/取消 → 调用 onClose

  **QA Scenarios**：

  ```
  Scenario: 创建单次账单
    Tool: Playwright
    Preconditions：日历页面已打开，点击"添加账单"按钮
    Steps：
      1. 填写名称 "花呗"
      2. 保持类型为 "单次"
      3. 输入金额 3500
      4. 选择日期 2026-06-15
      5. 点击 "保存"
      6. 断言模态框关闭
      7. 断言日历 6 月 15 日显示 "花呗 3500"
    Evidence：.sisyphus/evidence/task-9-create-onetime.png

  Scenario: 创建分期账单 + 验证错误
    Tool: Playwright
    Preconditions：表单已打开
    Steps：
      1. 切换类型为 "分期"
      2. 名称留空，输入金额 100，月数 3，还款日 15，起始月 2026-06
      3. 点击保存
      4. 断言显示 "请输入账单名称"
      5. 填写名称为 "车贷"
      6. 清空金额输入 0
      7. 点击保存
      8. 断言显示 "金额必须大于 0"
      9. 修正金额为 120000，点击保存
      10. 断言日历显示分期账单
    Evidence：.sisyphus/evidence/task-9-create-recurring.png, .sisyphus/evidence/task-9-validation.png
  ```

  **Commit**：YES
  - Message：`feat(form): add BillForm modal with validation for both bill types`
  - Files：`src/components/BillForm.tsx`

- [ ] 10. BillList 账单详情列表（src/components/BillList.tsx）

  **What to do**：
  - 创建 `BillList` 组件，接收 `date`, `bills`, `onTogglePaid`, `onToggleInstallment`, `onEdit`, `onDelete` props
  - 以弹出面板/侧边栏形式显示选中日期的所有账单
  - 按账单类型分两个区域：
    - "单次账单" 区：每行显示名称、金额、[已还/未还] 切换按钮、编辑、删除
    - "分期账单" 区：显示名称、总金额/总期数、当期金额、[已还/未还] 切换按钮、编辑、删除
  - 点击"已还/未还"按钮切换 paid 状态（单次调用 `onTogglePaid`，分期调用 `onToggleInstallment`）
  - 点击编辑按钮打开 BillForm（通过父组件控制）
  - 点击删除按钮弹出确认对话框：`"确定要删除 [账单名称] 吗？"`
  - 空日期显示 "当天无待还款项"

  **Must NOT do**：
  - 不在 BillList 内嵌 BillForm 模态框（由父组件协调）
  - 不添加拖拽排序

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：UI 列表组件，涉及条件渲染、状态切换、删除确认交互
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 7, 8, 9, 11 并行）
  - **Blocks**：Task 12
  - **Blocked By**：Tasks 2（types）, 6（useBills）

  **References**：
  - 无特殊外部依赖

  **Acceptance Criteria**：
  - [ ] 选中日期有多笔账单时全部列出
  - [ ] 单次账单显示名称、金额、已还/未还按钮
  - [ ] 分期账单显示名称、总金额/总期数、当期金额、已还/未还按钮
  - [ ] 点击已还/未还按钮状态切换（视觉反馈：灰色↔蓝色）
  - [ ] 点击删除弹出确认 "确定要删除 [名称] 吗？"
  - [ ] 确认删除后账单从列表消失
  - [ ] 空日期显示 "当天无待还款项"

  **QA Scenarios**：

  ```
  Scenario: 账单列表交互
    Tool: Playwright
    Preconditions：15日有2笔账单（单次-花呗-500 + 分期-车贷-6月/50）
    Steps：
      1. 点击 15 日格子
      2. 断言 BillList 面板显示
      3. 断言显示 "花呗 500" 和 "车贷 50（总120000/12期）"
      4. 点击花呗的 "已还" 按钮
      5. 断言花呗行变为灰色样式
      6. 点击车贷的删除按钮
      7. 断言弹出 "确定要删除 车贷 吗？"
      8. 点击 "取消"
      9. 断言车贷仍在列表中
      10. 再次点击删除 → 确认
      11. 断言车贷从列表消失，日历 15 日不再显示车贷
    Evidence：.sisyphus/evidence/task-10-billlist-interact.png
  ```

  **Commit**：YES
  - Message：`feat(billlist): add bill detail panel with toggle paid and delete`
  - Files：`src/components/BillList.tsx`

- [ ] 11. InstallmentTracker 分期追踪组件（src/components/InstallmentTracker.tsx）

  **What to do**：
  - 创建 `InstallmentTracker` 组件，接收 `bill: RecurringBill`, `onToggleInstallment` props
  - 在分期账单详情中显示所有分期的逐期列表
  - 每行显示：期数序号、月份（YYYY-MM）、金额、已还/未还状态开关
  - 已还期用灰色 + 删除线，未还期用蓝色
  - 显示进度条：已还期数 / 总期数（如 "8/12 期已还"）
  - 显示剩余总待还金额（sum of unpaid installments）
  - 可在 BillList 中选择分期账单后展开显示（内联或可折叠）

  **Must NOT do**：
  - 不在此组件中编辑账单（编辑由 BillForm 处理）
  - 不添加动画效果（保持简洁）

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：UI 组件，涉及列表渲染、进度可视化、逐期状态切换
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 2（与 Tasks 7, 8, 9, 10 并行）
  - **Blocks**：Task 12
  - **Blocked By**：Tasks 2（types）, 6（useBills）

  **References**：
  - Tailwind 进度条：`https://tailwindcss.com/docs/width`（用 w-1/2 等做百分比宽度）

  **Acceptance Criteria**：
  - [ ] 显示 12 期账单时列出 12 行
  - [ ] 每行有独立的已还/未还切换
  - [ ] 进度条正确显示：已标记 8/12 → 进度条 66.7%
  - [ ] 剩余待还金额 = 未还各期金额之和
  - [ ] 全部标记已还后进度条 100%，剩余金额 0

  **QA Scenarios**：

  ```
  Scenario: 分期逐期追踪
    Tool: Playwright
    Preconditions：已创建分期账单 车贷(120000, 12期, 15日, 2026-06)
    Steps：
      1. 点击日历 15 日 → BillList 显示车贷
      2. 点击车贷展开 InstallmentTracker
      3. 断言显示 12 期，每期 10000
      4. 断言进度条 0%，"剩余 120000 未还"
      5. 逐一标记 6月、7月、8月为已还（点击3次）
      6. 断言进度条 25%（3/12），"剩余 90000 未还"
      7. 断言 6月、7月、8月行显示灰色删除线
      8. 断言 9月-次年5月行仍为蓝色
    Evidence：.sisyphus/evidence/task-11-installment-track.png
  ```

  **Commit**：YES
  - Message：`feat(installment): add per-installment tracking with progress bar`
  - Files：`src/components/InstallmentTracker.tsx`

- [ ] 12. App 布局 + 导航（src/App.tsx）

  **What to do**：
  - 在 `App.tsx` 中整合所有组件：
    - 顶部导航栏：Logo/标题 "欠款账单日历" + 两个标签切换按钮（"月历视图" / "年度统计"）
    - 使用 `useBills` Hook 管理全局状态
    - 管理 `currentYear`, `currentMonth`, `selectedDate`, `view` 等 UI 状态
    - 管理 `showForm`（模态框开关）和 `editingBill`（编辑目标）状态
    - "添加账单" 按钮（固定在右下角 FAB 或导航栏中）
  - 状态驱动的条件渲染：
    - `view === 'month'` → 渲染 Calendar + MonthlyStats
    - `view === 'year'` → 渲染 YearStats
    - `selectedDate !== null` → 在右侧面板渲染 BillList
    - `showForm === true` → 渲染 BillForm 模态框
  - 实现所有回调：
    - `onDateClick(date)` → 设置 selectedDate，展示 BillList
    - `onAddBill(formData)` → 调用 addBill，关闭表单
    - `onEditBill(bill)` → 设置 editingBill，打开表单
    - `onUpdateBill(formData)` → 调用 updateBill，关闭表单
    - `onDeleteBill(id)` → 调用 deleteBill
    - `onTogglePaid(id)` → 调用 togglePaid
    - `onToggleInstallment(id, month)` → 调用 toggleInstallment

  **Must NOT do**：
  - 不引入 react-router
  - 不添加复杂动画/过渡

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：应用主布局，整合所有组件，协调状态流
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：NO
  - **Parallel Group**：Wave 3（唯一依赖所有 Wave 2 组件的任务，但可与 Task 13 并行）
  - **Blocks**：Tasks 15, 16, 18
  - **Blocked By**：Tasks 6-11（所有组件和 Hook）

  **References**：
  - 无特殊外部依赖

  **Acceptance Criteria**：
  - [ ] 应用启动显示月历视图（当前月份）
  - [ ] "月历视图"/"年度统计" 切换按钮正常工作
  - [ ] 点击日期 → 右侧显示 BillList
  - [ ] 点击 "添加账单" → 弹出 BillForm 模态框
  - [ ] 创建账单后日历自动更新
  - [ ] 编辑/删除账单功能正常
  - [ ] 翻月后 Calendar 更新，selectedDate 重置

  **QA Scenarios**：

  ```
  Scenario: 完整用户流程
    Tool: Playwright
    Preconditions：应用已启动
    Steps：
      1. 断言标题 "欠款账单日历" 可见
      2. 断言月历显示当前月份
      3. 点击 "添加账单" → 表单弹出
      4. 创建单次账单 "花呗 3500 6月15日" → 提交
      5. 断言 6月15日显示 "花呗 3500"（蓝色）
      6. 点击 6月15日 → 右侧 BillList 显示花呗
      7. 在 BillList 中点击 "已还" → 日历中花呗变灰色
      8. 切换到 "年度统计" → 断言统计页面显示
      9. 切换回 "月历视图" → 数据仍然存在
      10. 刷新页面 → 数据仍然存在
    Evidence：.sisyphus/evidence/task-12-full-flow.png
  ```

  **Commit**：YES
  - Message：`feat(app): integrate layout, navigation, and all components`
  - Files：`src/App.tsx`

- [ ] 13. MonthlyStats 月度统计面板（src/components/MonthlyStats.tsx）

  **What to do**：
  - 创建 `MonthlyStats` 组件，接收 `bills`, `year`, `month` props
  - 调用 `getMonthlyTotal(bills, yearMonth)` 和 `getDailyAverage(bills, yearMonth)`
  - 显示卡片式统计面板（日历下方或侧边）：
    - 本月待还总额（蓝色大字 + ¥符号）
    - 本月已还总额（灰色大字 + ¥符号）
    - 月均每天待还（待还总额 / 当月天数）
  - 月份标签："2026年6月 统计"
  - 使用 Tailwind 卡片样式：圆角、阴影、内边距

  **Must NOT do**：
  - 不添加图表
  - 不在面板内编辑账单

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：统计展示 UI 组件，数据驱动的卡片布局
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 3（与 Tasks 12, 14, 15, 16 并行）
  - **Blocks**：Task 14
  - **Blocked By**：Tasks 4（calculate）, 6（useBills）

  **References**：
  - Task 4 中定义的 `getMonthlyTotal` 和 `getDailyAverage` 函数

  **Acceptance Criteria**：
  - [ ] 显示 "本月待还" 和 "本月已还" 金额
  - [ ] 显示 "日均待还" 
  - [ ] 金额格式化为 ￥X,XXX.XX
  - [ ] 翻月后统计自动更新

  **QA Scenarios**：

  ```
  Scenario: 月度统计验证
    Tool: Playwright
    Preconditions：6月有2笔账单：花呗(500, 未还) + 车贷第一期(10000, 未还)
    Steps：
      1. 查看月历视图，定位 MonthlyStats 面板
      2. 断言 "本月待还" = ￥10,500.00
      3. 断言 "本月已还" = ￥0.00
      4. 断言 "日均待还" = ￥350.00（10500/30）
      5. 标记花呗为已还
      6. 断言 "本月待还" = ￥10,000.00，"本月已还" = ￥500.00
    Evidence：.sisyphus/evidence/task-13-monthly-stats.png
  ```

  **Commit**：YES
  - Message：`feat(stats): add monthly statistics panel with pending/paid/average`
  - Files：`src/components/MonthlyStats.tsx`

- [ ] 14. YearStats 年度统计页面（src/components/YearStats.tsx）

  **What to do**：
  - 创建 `YearStats` 组件，接收 `bills`, `year` props
  - 调用 `getYearStats(bills, year)` 获取 12 个月数据
  - 显示年度标题："2026年 年度统计" + 年份切换（←2025 2026 2027→ 按钮）
  - 12 个月卡片网格（4×3 或 6×2）：
    - 每张卡显示月份名、待还总额、已还总额
    - 如果当月有待还 → 卡片带淡蓝背景提示
    - 如果当月全部已还 → 卡片带淡绿背景
    - 如果当月无账单 → 卡片灰色
  - 年度汇总行：
    - 年度总待还、年度总已还、年度月均待还

  **Must NOT do**：
  - 不添加柱状图/折线图
  - 不添加环比/同比计算

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：年度统计视图，12 个月卡片网格 + 汇总计算
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 3（与 Tasks 12, 13, 15, 16 并行）
  - **Blocks**：Task 18
  - **Blocked By**：Tasks 4（calculate）, 13（MonthlyStats 已被复用或作参考）

  **References**：
  - Task 4 中定义的 `getYearStats` 函数

  **Acceptance Criteria**：
  - [ ] 12 个月全部显示，每个含待还/已还金额
  - [ ] 年份切换按钮正常（2025↔2026↔2027）
  - [ ] 无账单月份显示灰色 "无账单"
  - [ ] 年度汇总：年度总待还、年度总已还、月均待还
  - [ ] 从月历视图切换到年度统计正常

  **QA Scenarios**：

  ```
  Scenario: 年度统计展示
    Tool: Playwright
    Preconditions：有多笔跨月账单（6-8月各一笔）
    Steps：
      1. 切换到 "年度统计" 标签
      2. 断言页面标题 "2026年 年度统计"
      3. 断言 6月、7月、8月卡片有金额显示
      4. 断言 1-5月、9-12月卡片显示 "无账单"（灰色）
      5. 断言年度汇总行显示正确的总待还
      6. 点击 → 翻到 2027年
      7. 断言所有月份显示 "无账单"（灰色）
    Evidence：.sisyphus/evidence/task-14-year-stats.png
  ```

  **Commit**：YES
  - Message：`feat(stats): add yearly statistics page with monthly breakdown`
  - Files：`src/components/YearStats.tsx`

- [ ] 15. EmptyState 空状态组件（src/components/EmptyState.tsx）

  **What to do**：
  - 创建 `EmptyState` 组件，无 props（或接收 `view` 区分月历/年度）
  - 当 bills 数组为空时显示，替换日历和统计区域
  - 显示友好的引导信息：
    - 图标（💰 emoji 或 SVG）
    - 文案："还没有账单记录"
    - 副文案："点击下方按钮添加您的第一笔账单吧"
    - "添加账单" 按钮（调用父组件的 onAdd 回调）

  **Must NOT do**：
  - 不要做成复杂的 onboarding 流程（多步骤引导）
  - 不要放示例数据（保持干净）

  **Recommended Agent Profile**：
  - **Category**：`visual-engineering`
    - Reason：简单 UI 占位组件
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 3（与 Tasks 12, 13, 14, 16 并行）
  - **Blocks**：None
  - **Blocked By**：Task 12（需要 App 中集成）

  **References**：
  - 无特殊外部依赖

  **Acceptance Criteria**：
  - [ ] 无账单时显示 EmptyState
  - [ ] 添加第一笔账单后 EmptyState 消失
  - [ ] "添加账单" 按钮触发 BillForm 打开
  - [ ] 文案为中文

  **QA Scenarios**：

  ```
  Scenario: 空状态引导
    Tool: Playwright
    Preconditions：localStorage 清空，应用首次启动
    Steps：
      1. 打开应用
      2. 断言显示 "还没有账单记录"
      3. 断言显示 "点击下方按钮添加您的第一笔账单吧"
      4. 点击 "添加账单" 按钮
      5. 断言 BillForm 模态框打开
      6. 填写并提交一笔账单
      7. 断言 EmptyState 消失，日历正常显示
    Evidence：.sisyphus/evidence/task-15-empty-state.png
  ```

  **Commit**：YES
  - Message：`feat(ui): add EmptyState component for first-launch experience`
  - Files：`src/components/EmptyState.tsx`

- [ ] 16. 错误处理 + 边界情况

  **What to do**：
  - 在 `App.tsx` 中添加 `useEffect` 检查 localStorage 可用性（首次加载时）
  - 如果 localStorage 不可用 → 显示错误提示："localStorage 不可用，数据无法保存。请检查浏览器设置。"
  - 在 `storage.ts` 中：loadBills 捕获损坏数据返回空数组
  - 在 `calculate.ts` 中：处理边界输入
    - 0 期 → 返回空 installments 数组
    - 金额为 NaN → 返回 0
  - 在 `Calendar.tsx` 中：处理 month=0 和 month=13 的跨年翻月
  - 在 `BillForm.tsx` 中：
    - 金额输入过滤非数字字符
    - 分期月数最小 2，最大 60，还款日 1-28
    - 起始月不能早于 2000 年，不晚于 2100 年
  - 所有 try/catch 捕获到异常时：console.error 记录 + 友好的用户提示

  **Must NOT do**：
  - 不要引入错误监控服务（Sentry 等）

  **Recommended Agent Profile**：
  - **Category**：`unspecified-high`
    - Reason：跨组件错误处理，需系统性思维，修改多个文件
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 3（与 Tasks 13, 14, 15 并行）
  - **Blocks**：Task 18
  - **Blocked By**：Tasks 3（storage）, 6（useBills）, 12（App）

  **References**：
  - 所有已创建的组件文件

  **Acceptance Criteria**：
  - [ ] localStorage 不可用时显示友好错误
  - [ ] 损坏的 JSON 数据不导致白屏
  - [ ] 分期月数输入 0 → 显示错误提示
  - [ ] 金额输入 "abc" → 输入框不接受或显示验证错误
  - [ ] 跨年翻月正常（12月→1月，1月→12月）
  - [ ] 起始月 1999-01 → 显示验证错误

  **QA Scenarios**：

  ```
  Scenario: localStorage 不可用
    Tool: Playwright
    Preconditions：在浏览器中禁用 localStorage
    Steps：
      1. 打开应用
      2. 断言显示 "localStorage 不可用，数据无法保存"
    Evidence：.sisyphus/evidence/task-16-storage-error.png

  Scenario: 跨年翻月
    Tool: Playwright
    Preconditions：日历显示 2026年12月
    Steps：
      1. 点击右箭头翻到下月
      2. 断言显示 "2027年1月"
      3. 点击左箭头翻回上月
      4. 断言显示 "2026年12月"
    Evidence：.sisyphus/evidence/task-16-year-boundary.png
  ```

  **Commit**：YES
  - Message：`fix(error): add error handling, edge cases, and input validation`
  - Files：`src/App.tsx`, `src/utils/storage.ts`, `src/utils/calculate.ts`, `src/components/Calendar.tsx`, `src/components/BillForm.tsx`

- [ ] 17. 单元测试（vitest）

  **What to do**：
  - 配置 vitest：在 `vite.config.ts` 中添加 `test` 配置（environment: 'jsdom'）
  - 创建 `src/utils/__tests__/storage.test.ts`：
    - 测试 `saveBills` + `loadBills` 正常读写
    - 测试 `loadBills` 损坏数据返回 []
    - 测试 `isStorageAvailable` 正常/异常情况
  - 创建 `src/utils/__tests__/calculate.test.ts`：
    - 测试 `calculateInstallments(100, 3, 15, '2026-06')` → 验证 3 期金额和余数
    - 测试 `calculateInstallments(1000, 12, 1, '2026-01')` → 验证总金额精确
    - 测试 `getMonthlyTotal` → 验证 pending/paid 分类
    - 测试 `getYearStats` → 验证 12 个月数据结构
    - 测试 `getBillsForDate` → 验证单次+分期匹配
    - 测试 `getDailyAverage` → 验证计算结果
    - 测试边界：0 期 → 空数组, 金额 NaN → 0

  **Must NOT do**：
  - 不测试 UI 组件（仅测试纯函数逻辑）
  - 不过度测试（追求覆盖率数字）

  **Recommended Agent Profile**：
  - **Category**：`quick`
    - Reason：标准 vitest 单元测试，纯函数测试无复杂依赖
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 4（与 Task 18 并行）
  - **Blocks**：None
  - **Blocked By**：Tasks 3（storage）, 4（calculate）

  **References**：
  - Vitest 文档：`https://vitest.dev/guide/`
  - 已实现的 `src/utils/storage.ts` 和 `src/utils/calculate.ts`

  **Acceptance Criteria**：
  - [ ] `npx vitest run` 全部测试通过
  - [ ] 测试覆盖 `storage.ts` 的所有导出函数
  - [ ] 测试覆盖 `calculate.ts` 的所有导出函数
  - [ ] 至少 10 个测试用例

  **QA Scenarios**：

  ```
  Scenario: 测试套件运行
    Tool: Bash
    Preconditions：vitest 配置就绪，测试文件已创建
    Steps：
      1. 运行 `npx vitest run`
      2. 断言输出包含 "Tests  N passed"
      3. 断言 N >= 10
      4. 断言无失败测试
    Expected Result：所有测试通过，无失败
    Evidence：.sisyphus/evidence/task-17-vitest-results.txt
  ```

  **Commit**：YES
  - Message：`test: add unit tests for storage and calculate utilities`
  - Files：`vite.config.ts`, `src/utils/__tests__/storage.test.ts`, `src/utils/__tests__/calculate.test.ts`

- [ ] 18. 功能文档（doc/functional.md）

  **What to do**：
  - 编写完整的功能说明文档，基于实际实现的功能（不是需求文档重复）：
    1. **系统概述**：技术栈（Vite + React + TS + Tailwind）、运行方式（`npm run dev`）
    2. **功能说明**（图文结合，每个功能包含截图占位符）：
       - 月历视图：如何查看、翻月、日期高亮
       - 账单录入：两种类型如何创建
       - 账单管理：如何编辑、删除、标记已还
       - 分期追踪：如何逐期标记已还、查看进度
       - 月度统计：如何解读待还/已还/日均
       - 年度统计：如何查看全年概览
    3. **数据存储**：localStorage key、JSON 格式说明
    4. **已知限制**：单浏览器、无移动端适配、还款日 1-28、无数据导出
    5. **常见问题**：如何清除数据、如何迁移数据、浏览器兼容性

  **Must NOT do**：
  - 不复制需求文档内容
  - 不写开发指南（那是给开发者的，不是给用户的）

  **Recommended Agent Profile**：
  - **Category**：`writing`
    - Reason：面向用户的功能文档，需清晰表达和结构化
  - **Skills**：`[]`

  **Parallelization**：
  - **Can Run In Parallel**：YES
  - **Parallel Group**：Wave 4（与 Task 17 并行）
  - **Blocks**：None
  - **Blocked By**：Tasks 12-16（需要应用功能完整实现后编写）

  **References**：
  - 需求文档：`doc/requirements.md`
  - 所有已实现的组件文件

  **Acceptance Criteria**：
  - [ ] 文档包含系统概述、每个功能的说明、数据存储、已知限制、常见问题
  - [ ] 每个功能有明确的用户操作步骤
  - [ ] 文档以中文编写
  - [ ] 文件大小 > 3KB

  **QA Scenarios**：

  ```
  Scenario: 功能文档完整性
    Tool: Bash
    Preconditions：doc/functional.md 已创建
    Steps：
      1. 检查文件存在
      2. 检查包含关键字："系统概述"、"功能说明"、"数据存储"、"已知限制"
      3. 检查文件大小 > 3KB
    Expected Result：文件存在且结构完整
    Evidence：.sisyphus/evidence/task-18-functional-doc.txt
  ```

  **Commit**：YES
  - Message：`docs: add functional documentation with user guide`
  - Files：`doc/functional.md`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  逐条对照 "Must Have" 和 "Must NOT Have" 检查实现：
  - `Must Have [N/7]`：通过读取源码、运行命令验证每项
  - `Must NOT Have [N/14]`：搜索代码库检查未引入被禁止的库和模式
  - `Tasks [N/18]`：验证每个任务的交付物存在且功能正常
  - 输出：`Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  - 运行 `npx tsc --noEmit` → 验证无类型错误
  - 运行 `npx vitest run` → 验证所有测试通过
  - 运行 `npm run build` → 验证构建成功
  - 检查代码质量：无 `any` 类型滥用、无 `console.log` 遗留、无注释代码、无未使用的 import
  - 检查 AI Slop：无过度抽象、无通用命名（data/result/item）、无冗余注释
  - 输出：`Build [PASS/FAIL] | TypeCheck [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`（+ `playwright` skill）
  - 从干净状态开始（清空 localStorage）
  - 执行所有任务的 QA 场景（Task 1-18）
  - 测试跨任务集成场景：
    - 创建 5 笔混合账单（3单次 + 2分期）
    - 翻月查看 6 个月份
    - 标记 3 期分期为已还
    - 切换到年度统计验证跨月数据
    - 刷新浏览器验证持久化
    - 删除 2 笔账单验证日历更新
  - 测试边界：空状态、跨年翻月、多账单同日
  - 证据保存至 `.sisyphus/evidence/final-qa/`
  - 输出：`Scenarios [N/N pass] | Integration [N tested] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  - 逐任务对比 "What to do" 和实际 git diff
  - 验证所有交付物文件存在且内容匹配
  - 检查 "Must NOT do" 合规（无越权实现）
  - 检测任务间污染（Task N 是否修改了 Task M 的文件）
  - 标记任何未经计划的额外改动
  - 输出：`Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

**提交策略**：每个 Wave 完成后进行一次 git commit。

```
Wave 1:  feat(init): project scaffolding + types + storage + requirements doc
Wave 2:  feat(core): bill management hook + calendar + form components
Wave 3:  feat(ui): app layout + statistics + error handling
Wave 4:  feat(test+docs): unit tests + functional documentation
```

## Success Criteria

### 验证命令
```bash
npm run dev              # Expected: Vite dev server starts on localhost
npm run build            # Expected: Build succeeds, dist/ created
npx vitest run           # Expected: All tests pass
npx tsc --noEmit         # Expected: No type errors
```

### 最终检查清单
- [ ] 所有 "Must Have" 已实现
- [ ] 所有 "Must NOT Have" 已确认不存在
- [ ] 所有测试通过
- [ ] 需求文档和功能文档完整
