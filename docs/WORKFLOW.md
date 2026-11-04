# 从 Prompt 到可维护 React 页面：Code-first 工作流（中文）

## 一、读什么、看什么

这个仓库是一个**已经展开到 V2 的教学最终态**，并非带 Git 历史的生产项目。两页都已经实现：
- `/`：Trace Explorer（代表第一次页面迭代）
- `/metrics`：LLM Metrics（代表在共享体系上增加第二页）

推荐按下面顺序阅读，而不是从所有 TSX 文件逐行看：

| 顺序 | 文件 | 关注点 |
|---|---|---|
| 1 | `AGENTS.md` | 约束 Agent 的规则及交付要求 |
| 2 | `docs/UI_GUIDELINES.md` | 设计规范、抽象边界、更新策略 |
| 3 | `src/styles/tokens.css` | 全局 token 的语义和影响范围 |
| 4 | `src/components/ui/` | Card、Button、MetricCard 等可复用组件 |
| 5 | `src/pages/TraceExplorer.tsx` | 页面状态、筛选、组件组合 |
| 6 | `src/pages/LlmMetrics.tsx` | 新页面如何复用旧系统并增加独立组件 |
| 7 | `tests/*.spec.ts` | 功能和视觉验收如何固化 |

## 二、两个嵌套闭环

### 1. Page Loop（一次页面）

`明确的 Spec → Agent 改代码 → npm run dev → 检查视觉和交互 → 反馈修改 → 测试 → 验收`

即使使用自然语言，也应尽量把反馈写成可验收的描述：

> “Trace 表格只允许表格容器横向滚动，390px 视口下整个页面不能横向滚动；不改变 status filter 的现有行为。”

比“这个页面看起来不太对”更能被测试验证。

### 2. Design System Loop（跨页面）

`发现可复用需求 → 检查现有 Token/组件 → 本地实现或共享扩展 → 双页面回归 → 写入规范`

第一张页面经过验收后，可提炼第一版 tokens、组件、guidelines 和视觉基线；第二页从这四类资产出发。**不要在每个页面重新生成四类文件。** 也不要为了“完整设计系统”预先造几十个通用组件。

## 三、典型 PR 切分

- PR A：先落地 Trace Explorer 页面及其基础组件（不求过度抽象）。
- PR B：把稳定样式移入 tokens，补 `AGENTS.md`、UI Guidelines、行为测试，审核截图基线。
- PR C：新增 LLM Metrics 页面，优先复用已有组件，新增少量领域视图。
- PR D：运行两个页面的回归，修复问题，更新批准过的规范与视觉基线。

本仓库是 PR D 的静态示范。你可以通过 `git init` 后自己做四次实验性提交，还原这个迭代过程。

## 四、Visual Tests vs Design Review

`tests/visual.spec.ts` 使用 Playwright 的 `toHaveScreenshot()`：

- 它判断 **现在的页面** 是否偏离 **已经批准的浏览器截图**；
- 它不自动证明“页面美观”或“符合产品需求”；
- 它不与 Figma 比较（本实验没有 Figma 依赖）；
- 浏览器/字体/OS 会影响截图差异，请在同一环境生成与执行基线。

首次创建：

```bash
npm run test:visual:update
```

审阅生成的 PNG 后再提交。之后正常回归：

```bash
npm run test:visual
```

如果故意修改 `--radius-card`，预期截图应报差异。检查两个页面均满足新规范之后，才允许更新截图基线。

## 五、两个流程之间的决策问题

| 变更请求 | 层级 | 预期影响 |
|---|---|---|
| “只缩小模型指标图表的上边距” | 业务视图局部样式 | 仅 `/metrics` |
| “所有 Card 都改成 18px 圆角” | `tokens.css` 共享变量 | 两个页面 |
| “Trace 行点击后出现 Span 详情” | `TraceExplorer` 业务状态 | `/` 行为测试 |
| “模型之间共享相同的加载态” | 可考虑通用组件 | 跨页复用，但先确认语义 |
| “表格中所有状态都用红色表示” | 拒绝：破坏语义颜色 | 可访问性与误导风险 |

## 六、如何带着 Codex 学习

把本项目作为工作目录运行 `codex`，依次发送 `prompts/` 中的指令。Agent 理想行为是：先读规范、提实施计划、只修改影响范围、测试、报告差异。模型可能出错，所以保留人工 PR 审核与测试。

## 七、与求职项目的关系

这个案例适合讲解 Agent orchestration、规范约束、组件抽象、视觉回归和变更控制；但是**不等于**完整的 AI Observability 产品：尚未连接 OpenTelemetry、Sentry、真实后端、流式数据或虚拟列表。下一步应在已有回测系统中逐步替换 mock traces，避免另起大型项目拖慢简历与投递。
