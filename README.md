# PulseTrace · Code-first Frontend Engineering Lab

React + TypeScript + Vite + Playwright 示例工程

项目演示的循环是：明确需求 → 修改页面 → 检查交互与视觉 → 人工验收 → 提炼可复用的 token、组件与规范 → 新页面复用 → 回归验证。

## 已有功能与边界

| 路径       | 页面           | 功能                                                        |
| ---------- | -------------- | ----------------------------------------------------------- |
| `/`        | Trace Explorer | 搜索、状态筛选、每页 5 条分页、Trace 选择、Waterfall 与详情 |
| `/metrics` | LLM Metrics    | 模型过滤、成本排序、延迟与 Token 指标、图表和明细           |
| `/compare` | Trace Compare | 同操作执行选择、指标差异、步骤对齐及关联 Trace 定位 |
| `/errors`  | Error Analysis | 异常聚合、搜索与筛选、排序、分组及关联 Trace 定位           |

数据来自 `src/data/` 中的固定样本。统计与成本不是生产测量，项目尚未连接真实 OpenTelemetry、Sentry、后端、登录或流式数据，也未提供大数据虚拟化、性能基准和 CI 流水线。

## 本地启动

- Node.js 22.12+（项目 `package.json` 的要求）。
- npm，以及安装依赖时可访问 npm registry 的网络。

```bash
npm install
npm run dev
```

打开终端输出的地址，默认是 `http://127.0.0.1:5173`，通过侧栏切换页面。

## 运行检查

```bash
npm run docs:check
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:visual:docker
```

`npm run docs:check` 检查实际 Markdown 链接与规范链接依赖；修改检查器时运行 `npm run test:docs` 验证解析边界。检查器不判断自然语言阅读要求或引用是否必要。

行为测试使用 Playwright 随依赖版本安装的 Chromium，可在本机运行。视觉测试通过 Docker Compose 在固定的 Linux Playwright 镜像中运行，Mac、Windows 和 CI 使用同一截图环境；需要安装 Docker Desktop 或 Docker Engine 与 Compose。镜像版本与 `package-lock.json` 中的 Playwright 版本保持一致，升级 Playwright 时须同时更新 `Dockerfile.visual`。

行为测试覆盖页面交互和路由，视觉测试将共享导航、顶栏与页面内容分别对比：共享区域覆盖桌面、紧凑和移动布局，内容区域覆盖四个桌面页面及 Metrics、Error Analysis、Trace Compare 的移动端，并单独检查 Trace Compare 弹层。具体用例以 `tests/` 为准；单次检查是否通过，以实际运行结果为准。

视觉测试对比当前页面与参考截图，不能自动判断页面是否美观或符合需求。`npm run test:visual:docker` 会构建容器并在其中运行测试；可用 `npm run test:visual:docker -- --grep 'Trace Compare'` 限定用例。截图和 diff 保存在本机 `test-results/`。容器固定了 Linux 系统、浏览器版本、字体环境与时区；本机直接执行 Playwright 生成的截图不能作为统一基线。

现有 `chromium-darwin` 截图是此前批准的 macOS 基线。迁移时先运行容器测试确认缺少 Linux 基线，再生成 `chromium-linux` 候选图，逐张审核后方可替换旧基线。迁移期间的缺失基线不代表视觉回归通过。

首次建立或有意更新基线时，先查看页面与差异，再生成候选截图：

```bash
npm run test:visual:update
```

该命令会在同一容器中更新所有视觉用例。检查 `tests/visual.spec.ts-snapshots/` 中的 PNG 和无关改动，人工批准后才能提交基线，再运行 `npm run test:visual:docker`。失败截图和 diff 位于 `test-results/`。完整要求见目录入口中的验证规范。

## 页面复用示例

Trace Explorer 展示了 AppShell、Card、Button、MetricCard 等基础组件与 TraceTable、TraceWaterfall 等领域视图的组合。LLM Metrics 复用布局、指标卡和视觉规则，同时保留独立的延迟图表与请求量展示；Error Analysis 继续复用这些基础能力，加入异常聚合与关联 Trace。

可以按“实现一个页面 → 提炼已验证的共性 → 新页面复用 → 跨页回归”理解这个教学示例。这是演进思路的说明，不代表仓库保留了对应的真实开发日志。具体 UI 规则由 UI Guidelines 维护。

执行对比页的规则与边界见 [Trace Compare 需求](docs/features/done/trace-compare.md)。新增固定对比样例接入共享 Trace 集合，Trace Explorer 的记录总数与分页随之增加；既有样例保持不变。

## 组件契约与示例

代表性组件的使用文档集中维护在 `docs/components/`：[Button](docs/components/ui/Button.md)、[MetricCard](docs/components/ui/MetricCard.md)、[TraceTable](docs/components/observability/TraceTable.md)。文档解释适用场景、示例、状态和限制；TypeScript 是 API 的权威来源，JSDoc 记录非直观契约，测试提供对应验证证据。组件契约变化时同步更新对应文档。

目前使用 Markdown 与页面测试维护这些示例；需要集中预览多个组件状态时再考虑 Storybook。日常改动按验证规范选择检查范围，“运行检查”中的完整检查适合整体回归。

## 目录与规范入口

| 位置                                   | 内容与读者                                       |
| -------------------------------------- | ------------------------------------------------ |
| [AGENTS.md](AGENTS.md)                 | AI Agent 必读入口、优先级与约束                  |
| [开发工作流](docs/WORKFLOW.md)         | Agent 与贡献者执行任务的步骤、影响范围和交付要求 |
| [验证规范](docs/VALIDATION.md)         | 检查命令、证据要求与视觉基线批准流程             |
| [UI Guidelines](docs/UI_GUIDELINES.md) | 设计语言、组件归属与 token 变更规则              |
| [代码规范](docs/CODE_GUIDELINES.md)    | 模块、状态、命名与注释规范                       |
| `docs/features/`                       | 具体功能的需求与设计说明                         |
| `src/styles/`                          | 共享语义 token 与全局样式                        |
| `src/components/`                      | UI 基础组件、布局与领域组件                      |
| `src/pages/`                           | 页面组合、局部状态与页面资源                     |
| `src/data/`                            | 固定样本数据                                     |
| `tests/`                               | Playwright 行为与截图测试                        |

## 参考资料

- [Vite Getting Started](https://vite.dev/guide/)
- [React Learn](https://react.dev/learn)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)

**授权**：此示例工程代码可自由用于个人学习及修改；不包含第三方图片、品牌素材或专有 SDK。
