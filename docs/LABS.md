# 4 个可独立验证的练习

使用真实工程里的变更而不是只阅读文档。每次练习建议开新 Git 分支并在结束后提交实验记录。时间是建议投入，不代表已执行结果。

## Lab 1 — 理解已有页面（30–45 分钟）

**目标**：说明 `/` 页面状态流与组件树。

1. 启动 `npm run dev`，在浏览器访问 `/`。
2. 输入 `risk_report`，验证表格仅剩一个匹配项；清空查询后按 Error 状态过滤。
3. 阅读 `TraceExplorer.tsx`、`TraceTable.tsx` 与 `TraceWaterfall.tsx`。
4. 运行 `npm run test:e2e`。

**验收**：能解释 `selectedId`、`filtered`、`selected` 的关系，行为测试通过。

## Lab 2 — 第二页复用与扩展（45–75 分钟）

**目标**：理解 `/metrics` 的复用边界。

1. 对比 `src/pages/TraceExplorer.tsx` 与 `src/pages/LlmMetrics.tsx`。
2. 在 Metrics 页筛选 GPT-6，表格应由三行变成一行。
3. 找出 3 个共享的 UI/Token 资产；
4. 让 AI 只把 `Metrics` 表的 `Cost` 列增加一个“降序排序”功能。

**验收**：新排序功能能被 Playwright 断言，同时 Trace Explorer 行为不变。

## Lab 3 — 共享 Token 变更（30–60 分钟）

**目标**：演示改变全局约束引起的跨页面影响。

1. 在审核页面后先运行 `npm run test:visual:update`，人工确认后保存截图基线。
2. 将 `src/styles/tokens.css` 中 `--radius-card: 14px;` 改成 `20px`。
3. `npm run test:visual`：预期有截图差异，记录差异文件。
4. 在两个页面人工确认这是期望变更；再更新快照并审阅差异。

**验收**：能证明双页面受影响，不通过“直接覆盖旧快照”绕开设计评审。

## Lab 4 — Agent 守规矩（45–90 分钟）

**目标**：测试 Agent 是否遵循 `AGENTS.md` 的边界。

1. 用 `prompts/03-global-token-change.md` 要求 AI 修改共享卡片样式。
2. 检查 Agent 是否先读 `AGENTS.md` 和 UI Guidelines，并列出影响页面。
3. 检查 diff 有没有无关的大规模重写，是否擅自更新基线。
4. `npm run typecheck` / `npm run build` / `npm run test:e2e`。

**验收**：Agent 能解释变更的技术决策，不隐瞒无法运行的测试。

## 实验记录模板

| 项目              | 记录   |
| ----------------- | ------ |
| Prompt / 模型版本 | 待填写 |
| 变更需求          | 待填写 |
| 所改文件          | 待填写 |
| 实际耗时          | 待填写 |
| Typecheck / Build | 待填写 |
| Behavior / Visual | 待填写 |
| Bug / 回归问题    | 待填写 |
| 人工验收结论      | 待填写 |
