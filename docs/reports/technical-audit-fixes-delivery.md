# 技术审查修复交付

## 范围与结果

本轮落实技术审查的 F01–F08，不扩展真实 API、模型调用或其他可选产品功能。所有数据仍为固定 fixture，没有生成新的统计值或改写既有样例。保留了用户原有的 `.gitignore` 中 `tech-review.md` 忽略项。

| 问题             | 实施结果                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| F01：P95 口径    | 全部模型显示 `—` 和缺少请求级数据的说明；单模型显示对应 fixture P95，不再加权平均分位数或展示虚构同比              |
| F02：CI 缺少门禁 | 新增 quality 工作流，执行文档、Lint、Prettier 全仓格式、类型检查和生产构建行为测试；保留独立的固定 Linux 视觉任务  |
| F03：部署闭环    | 增加 Vercel 静态配置、SPA rewrite、部署与故障排查说明，以及针对生产产物的行为测试入口；未创建线上部署              |
| F04：完整标识    | Waterfall 名称允许换行、行高随内容增长；Trace ID 和 Waterfall 副标题允许换行；Trace 表格 ID 使用已有可读文字 token |
| F05：重复事件    | 组内每个 Trace 保留最新事件；同时间按消息选取，执行列表同时间按 Trace ID 排序；覆盖乱序与输入不变性                |
| F06：环境文件    | 忽略 `.env` 及 `.env.*`，允许 `.env.example`；当前没有必填环境变量                                                 |
| F07：工程检查    | 新增 ESLint、React Hooks 规则、Prettier 标准命令；类型检查扩展到测试和 Playwright 配置；按用户要求统一全仓格式     |
| F08：展示文档    | README 改为英文入口，提供截图、真实功能边界、代码导览和待部署状态；纠正面试提纲中的能力自评与 CI 描述              |

`MetricCard` 增加无同比的 `note` 状态，类型限制它与 `delta`/`tone` 互斥。文档示例与新状态均已做类型检查。业务计算仍位于页面私有模块，共享 UI 不新增领域依赖。

## 本机命令

```bash
npm run check
```

`npm test` 现在只执行本机行为测试，不调用 Docker。按用户后续要求，已删除临时浏览器切换，配置固定使用 Playwright 配套 Chromium。当前机器 macOS 13.7.8 不受该版本 Chromium 支持，后续浏览器回归需在受支持的系统、兼容容器或 CI 环境执行。

下方原始修复阶段的浏览器结果来自删除临时配置前的 Chrome 157.0.8103.52 运行，不能视为恢复固定 Chromium 后已通过。

Node 要求更新为 22.13+ 的 22.x 或 24+，以符合新增 ESLint 的运行要求；`.nvmrc` 与 CI 均选择 Node 22 系列。现有依赖版本保持不变，仅添加开发工具及其传递依赖。

新增工具带出的 minimatch 告警通过限定 7–10 系列到 11.0.6 的临时 override 处理，原因见 [安全公告](https://github.com/advisories/GHSA-g3hv-75wg-m249)。已核查调用方使用的匹配接口，实际 Lint 通过，负向样例能触发缺失 Hook 依赖错误；上游采用修复版后应移除 override。

## 已执行验证

- 原始修复阶段使用本机 Chrome 执行完整检查：当时通过，包含生产构建及 26 个行为用例；该浏览器切换现已删除。
- `npm run lint`：通过；负向内存样例确认 Hooks 规则实际生效。
- `npm run typecheck`：通过，覆盖应用、测试和配置。
- `npm run docs:check`：通过。
- `npm run test:docs`：43 项通过。
- `npm run format:check`：通过。
- 原始修复阶段使用本机 Chrome 对生产产物运行行为测试：当时构建成功，26 个用例通过。
- MetricCard Markdown 示例及 note 状态：临时提取后通过 TypeScript 检查，临时文件已清理。
- `npm audit --json --ignore-scripts --fetch-retries=0 --fetch-timeout=15000 --cache /private/tmp/pulsetrace-npm-cache`：0 个已知漏洞。
- `git diff --check`：通过。

本机 Chrome 已生成并人工查看四页桌面截图，以及 Metrics、长 Trace ID、长 Span 名称的移动端截图；未发现本次修改引入的裁剪或整体溢出。截图保存在 `/private/tmp/pulsetrace-*.png`，未写入基线。截图采集期间无 pageerror。

## 恢复固定 Chromium 后的检查

- `npm run typecheck`、`npm run build`、`npm run lint`、`npm run docs:check`、`npm run format:check`、`git diff --check`：通过。
- 默认与 preview 配置的 `playwright test --list`：均成功加载，分别发现 38 与 26 个用例；这仅验证配置加载和用例发现，不代表执行通过。
- 直接读取配置确认浏览器类型为 `chromium`，未设置 channel；仓库已无临时浏览器环境变量引用。
- 当前机器未重新执行固定 Chromium 浏览器用例或 Docker 验证，后续在兼容环境完成。

## 简化格式流程后的检查

- 按用户要求改用 `prettier --check .` 与 `prettier --write .`，移除自定义增量脚本及其测试、CI Git 基准变量和完整历史拉取；更新 README 与验证规范。
- 已完成一次全仓格式整理，保留忽略文件、依赖锁文件及截图基线；对本轮仅格式化的 22 个应用源码文件做转译后归一化语法树比对，未发现业务结构差异。
- `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm run build`、`npm run docs:check`、`git diff --check`：通过。
- `npm run test:docs`：43 项通过；三个组件文档的 TSX 示例提取后类型检查通过，临时文件已清理。
- 本轮没有重新运行浏览器或 Docker 检查，截图基线未更新；不能据此将完整 `npm run check` 或统一视觉回归标为当前版本已通过。

## 待验证与审核

- 按用户要求，本机未执行 Docker 统一视觉回归，也未生成或接受任何新基线。P95 内容、Trace ID 文字颜色与长文本布局存在有意视觉变化；需在 Docker 环境或 CI 查看差异，人工批准候选基线后再比较。
- 新增 GitHub Actions 工作流尚未在远端触发，不能将本机检查结果等同于远端 CI 已通过。
- Vercel 配置尚未线上运行。本机 Vite preview 的路由刷新通过，不能替代托管平台 rewrite、静态资源响应和线上页面回归。
- 没有提交、推送或部署；没有实施真实 AI 运行链路、虚拟化或全局状态库等可选扩展。
