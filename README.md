# PulseTrace · Code-first Frontend Engineering Lab

**中文版 · React + TypeScript + Vite + Playwright · 示例工程 / 教学最终态**

这是一个用于验证以下工作流的最小工程：

`Product Spec → AI Agent → React 页面 → 人工验收 → 提炼 Design Tokens/Component Library/UI Guidelines/Visual Tests → 第二页复用 → 增量演进 → 回归验证`

本仓库提供两个**已经实现**的页面：

- `http://localhost:5173/` — Trace Explorer：搜索、状态筛选、点击操作、查看 Trace Waterfall 和详情。
- `http://localhost:5173/metrics` — LLM Metrics：模型过滤、成本/延迟/Token 指标、图表、明细表。

**注意：** 页面数据全部来自 `src/data/mock.ts`，不是生产级 OpenTelemetry/Sentry 数据。没有后端、登录或真实流式处理。代码是一个教学示例，不应被误认为完整的生产项目。此仓库未包含实际 AI 对话历史，因此“V1 → V2”是演进思路的可学习示例，而非可证实的真实开发日志。

## 运行要求

- Node.js **22.12+**（Vite 8 兼容要求）。
- npm 和能够访问 npm registry 的网络。
- Playwright 首次测试需要安装 Chromium 浏览器。

```bash
npm install
npm run dev
```

打开 `http://localhost:5173` 或 `http://localhost:5173/metrics`。

> **交付验证说明**：本次生成环境无法访问 npm Registry，不能在此安装依赖或运行浏览器测试。已完成 TS/TSX 语法检查；构建与测试仍需你本机执行。见 `docs/VALIDATION.md`。

## 构建与行为测试

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

## 视觉回归测试：先审核、再建立基线

仓库故意**不附带批准截图**，因为 Windows/macOS/Linux 的字体和浏览器渲染可能不同。

```bash
npm run test:visual:update    # 初次人工核验通过后，创建参考截图
npm run test:visual           # 后续与批准过的截图对比
```

运行 update 后请查看 `tests/visual.spec.ts-snapshots/`，截图没有错误才提交到版本控制。修改全局 Tokens 后，即便差异是预期的，也先人工审阅再更新快照。**不要为了让测试变绿就更新所有截图。**

## 目录导读

```text
AGENTS.md                          # Agent 开发规则（必须先读）
docs/
  UI_GUIDELINES.md                 # UI Guidelines 与设计系统演进
  WORKFLOW.md                      # 中文详细工作流、PR 拆分及设计决策
  LABS.md                          # 4 个实操实验及验收标准
  VALIDATION.md                    # 当前环境实际检查结果与本机验证清单
prompts/
  01-first-page.md                 # 第 1 页生成指令（复刻练习）
  02-second-page.md                # 第 2 页复用与扩展
  03-global-token-change.md        # 共享 token 的变更控制
  04-visual-bugfix.md               # 浏览器截图 + 自然语言反馈
src/
  styles/tokens.css                # Design Tokens（共享语义变量）
  styles/app.css                   # 页面与组件样式（包含可审查的技术债）
  components/ui/                   # 通用组件（Card、Button、MetricCard 等）
  components/layout/               # AppShell 导航布局
  components/observability/        # TraceWaterfall、TraceTable、LatencyChart
  data/mock.ts                     # 固定样本数据，保障可复现
  pages/TraceExplorer.tsx          # 页面 1
  pages/LlmMetrics.tsx             # 页面 2
tests/
  behavior.spec.ts                 # Playwright 功能验收
  visual.spec.ts                   # Playwright 截图回归
```

## 推荐阅读顺序

1. `docs/WORKFLOW.md` — 先理解两层循环。
2. `AGENTS.md` — Agent 怎样不破坏公共体系。
3. `src/styles/tokens.css` 和 `docs/UI_GUIDELINES.md`。
4. `src/pages/TraceExplorer.tsx` → `src/pages/LlmMetrics.tsx`。
5. `docs/LABS.md` — 做 Lab 1～4，并使用 `prompts/` 进行 Agent 实验。

## 测试与工程边界

- 行为测试覆盖：Trace 搜索、筛选、行选择、重置，模型过滤，以及移动端页面整体不溢出。
- 视觉测试覆盖：两个桌面页面和一个移动页面的固定截图。
- 截图对比是**回归测试**，不能自动判定设计是否足够美观。
- 统计/图表为示意数据；尚未接入真实 OTel，也未加入性能基准、大数据虚拟化或 CI 流水线。
- 本示例使用 React 19、Vite 8、Playwright 1.64，依赖版本应结合实际项目兼容性管理。

## 常见问题

**Q：为什么不是一开始就把所有 UI 组件造完？** 先验证真实业务需求，再按需抽象。新页面优先复用既有能力。

**Q：新页面有新元素，四类文件都要更新吗？** 不一定。只有共享契约改变时才更新对应 token、组件或规范；新增行为/视觉状态时补测试。

**Q：在哪里让 Codex 自动读这些规则？** 把仓库作为工作目录运行 Codex / Claude Code，显式要求先读 `AGENTS.md`。对工具是否自动发现此文件不要做未经验证的假设。

**Q：为何没有 Figma？** 这是专门验证 Code-first 的实验。设计规范作为代码仓库内的 tokens、components、guidelines 和 tests 管理；需要设计师协同时可再引入 Figma MCP。

## 参考资料

- Vite Getting Started: https://vite.dev/guide/
- React Learn: https://react.dev/learn
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots

**授权**：此示例工程代码可自由用于个人学习及修改；不包含第三方图片、品牌素材或专有 SDK。
