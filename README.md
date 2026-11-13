# PulseTrace · 可观测性前端实验项目

一个用 React 和 TypeScript 构建的 Agent 执行追踪界面。

**[在线演示](https://code-first.vercel.app/)** · **技术栈：** React 19、TypeScript、Vite、Playwright

## 页面内容

| 页面                                                   | 主要功能                                                  |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Trace Explorer](https://code-first.vercel.app/)       | 搜索、筛选和分页；查看执行步骤、详情及可刷新的 Trace 链接 |
| [LLM Metrics](https://code-first.vercel.app/metrics)   | 按模型查看指标、排序成本，展示固定的趋势样例              |
| [Error Analysis](https://code-first.vercel.app/errors) | 按失败执行去重统计，筛选异常并跳转到关联 Trace            |
| [Trace Compare](https://code-first.vercel.app/compare) | 选择同一操作的两次执行，对比指标并对齐同名步骤            |

## 项目架构

- **路由与布局：** [src/router](src/router/) 集中定义页面入口，[AppShell](src/components/layout/AppShell.tsx) 提供共用导航和顶栏。
- **页面与业务规则：** [src/pages](src/pages/) 管理各页交互状态并组合视图；Trace 对比和异常聚合的计算逻辑放在对应页面目录中。
- **组件与数据：** [领域组件](src/components/observability/) 展示表格、瀑布图和趋势图，[基础组件](src/components/ui/) 复用控件；页面读取 [固定样例数据](src/data/) 和 [数据类型](src/types/)。

## 本地运行与验证

需要 Node.js 22.13+（22.x）或 24+，无需环境变量。

```bash
npm ci
npm run dev
```

打开 `http://127.0.0.1:5173`。验证生产构建和行为测试：

```bash
npx playwright install chromium
npm run check
```

`npm run check` 包含文档、Lint、格式、类型、构建和行为检查。统一的视觉截图比较另需 Docker，运行 `npm run test:visual:docker`；截图基线的更新与人工审核步骤见[验证规范](docs/VALIDATION.md)。

## 项目边界与文档

所有 Trace、请求、成本和性能数据均为**固定样例，不是生产监控数据**。

进一步阅读：[开发工作流](docs/WORKFLOW.md) · [UI 规范](docs/UI_GUIDELINES.md) · [代码规范](docs/CODE_GUIDELINES.md) · [部署说明](docs/DEPLOYMENT.md)。

本仓库是作品集示例，未提供开源许可证；转载或商用请先联系作者。
