# 欠款账单日历 (Money-Pro)

一个纯前端的个人欠款账单管理工具，通过月历视图直观查看每日到期账单，支持单次账单和分期账单的还款进度跟踪，并提供月度与年度统计汇总。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 |
| 语言 | TypeScript 6 |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | useReducer + 自定义 Hook |
| 数据持久化 | 浏览器 localStorage |
| 测试 | Vitest + Testing Library |

## 功能列表

- **单次账单**：创建一次性还款账单，指定名称、金额和还款日期
- **分期账单**：创建多期还款账单（1–60 期），系统自动计算每期金额，末尾吸收余数确保精确
- **月历视图**：自定义 CSS Grid 月历，日格上直观显示账单名称与金额；已还账单灰色删除线，未还蓝色加粗
- **还款标记**：单次账单一键勾选已还/未还；分期账单逐期跟踪，带进度条
- **月度统计**：当月待还总额、已还总额、日均待还金额
- **年度统计**：12 个月份卡片网格，含年度汇总行
- **数据持久化**：所有数据自动保存至 localStorage，支持跨标签页实时同步
- **错误边界**：全局异常捕获，友好的错误提示与刷新恢复
- **空状态引导**：首次使用时的友好引导提示

## 项目结构

```
Money-Pro/
├── doc/
│   ├── functional.md          # 功能说明书
│   └── requirements.md        # 需求规格说明书
├── src/
│   ├── components/
│   │   ├── Calendar.tsx       # 月历组件（导航 + 日期网格）
│   │   ├── DayCell.tsx        # 单日格子组件
│   │   ├── BillForm.tsx       # 账单表单模态框
│   │   ├── BillList.tsx       # 账单列表（右侧面板）
│   │   ├── DateDetailPanel.tsx # 日期详情面板
│   │   ├── InstallmentTracker.tsx  # 分期还款跟踪器
│   │   ├── MonthlyStats.tsx   # 月度统计卡片
│   │   ├── YearStats.tsx      # 年度统计视图
│   │   ├── EmptyState.tsx     # 空状态提示
│   │   └── ErrorBoundary.tsx  # 错误边界（Class Component）
│   ├── hooks/
│   │   └── useBills.ts        # 账单数据管理 Hook（useReducer）
│   ├── types/
│   │   └── bill.ts            # TypeScript 类型定义与类型守卫
│   ├── utils/
│   │   ├── calculate.ts       # 分期计算、月度/年度统计
│   │   └── storage.ts         # localStorage 读写封装
│   ├── test/
│   │   ├── calculate.test.ts  # 计算逻辑单元测试（26 个用例）
│   │   ├── storage.test.ts    # 存储逻辑单元测试（8 个用例）
│   │   └── setup.ts           # 测试环境配置
│   ├── App.tsx                # 应用根组件
│   ├── main.tsx               # 入口文件
│   └── index.css              # 全局样式（Tailwind 入口）
├── eslint.config.js           # ESLint 配置
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置入口
├── tsconfig.app.json          # 应用 TypeScript 配置
├── tsconfig.node.json         # Node 端 TypeScript 配置
├── index.html                 # HTML 入口
├── 启动应用.bat               # Windows 批处理启动脚本
├── 启动应用.ps1               # PowerShell 启动脚本
└── package.json
```

## 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x
- **浏览器**：Chrome / Edge / Firefox 最新稳定版
- **屏幕分辨率**：建议 1280 × 720 以上（桌面优先，未做移动端适配）

## 安装与运行

```bash
# 1. 克隆或进入项目目录
cd Money-Pro

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173`。

Windows 用户也可直接双击 `启动应用.bat` 或运行 `启动应用.ps1` 一键启动。

## 构建与部署

```bash
# 生产构建
npm run build

# 预览构建产物
npm run preview
```

构建产物位于 `dist/` 目录，可直接部署至任何静态文件服务器（Nginx、Vercel、Netlify 等）。

## 测试

```bash
# 运行全部测试
npm test
```

包含 34 个单元测试用例，覆盖：
- 分期金额计算（等额拆分、余数吸收、闰年处理、跨年滚动等）
- localStorage 数据读写（空数据、损坏数据、非数组数据等边界情况）

## 使用说明

### 新建账单

点击右上角「新建账单」按钮，在弹出的表单中选择账单类型：

- **单次账单**：填写名称、金额、还款日期，点击保存
- **分期账单**：填写名称、总金额、分期月数（1–60）、每月还款日（1–28）、起始月份，系统自动生成每期明细

### 查看日历

默认显示当月日历。每个日期格子上标注当天到期的账单：
- 蓝色加粗 = 待还账单
- 灰色删除线 = 已还账单

点击日期格子可在右侧面板查看该日全部账单详情。

### 标记还款

- **单次账单**：点击复选框切换已还/未还状态
- **分期账单**：在详情面板的跟踪器中逐期点击「标记已还」

### 查看统计

- **月度统计**：日历下方自动显示当月待还总额、已还总额、日均待还
- **年度统计**：点击顶栏「年度统计」选项卡，查看全年 12 个月的汇总卡片

### 编辑/删除账单

右侧账单列表中每张卡片都有「编辑」和「删除」按钮。编辑分期账单时，已还期次金额保持不变，剩余期次根据新参数重新计算。

## 数据存储说明

- 所有账单数据存储在浏览器 `localStorage` 中，键名为 `bill-calendar-v1`
- 清除浏览器缓存或使用隐私模式可能导致数据丢失
- 多标签页打开时会自动同步数据
- 数据格式损坏时自动重置为空，控制台输出警告

## 架构设计要点

- **状态管理**：使用 `useReducer` 管理全部账单状态，6 种 action（LOAD/ADD/UPDATE/DELETE/TOGGLE_PAID/TOGGLE_INSTALLMENT）
- **分币计算**：分期金额计算使用整数分（cents）避免 JavaScript 浮点精度问题，最后一期吸收全部余数
- **跨标签同步**：监听 `window.storage` 事件实现多标签页实时数据同步
- **编辑重算**：编辑分期账单时，已还期次不变，剩余金额按新参数从已还最后一期的下个月重新计算

## 许可证

Private
