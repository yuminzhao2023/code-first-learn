# Trace Compare 交付记录

状态：功能已实现，分区视觉基线已获用户人工批准，批准后完整自动视觉对比 12 项通过；未提交或合并。需求存放于 `done/` 本身不代表验收或批准，批准依据为本会话用户的明确确认。本文汇总本次会话中实际执行的分阶段检查，不代表每项检查都针对最终版本重新运行过。

后续视觉测试已改为共享区域与页面内容分别截图；本文中的完整 9 项结果对应拆分前版本。最新截图范围与迁移状态见[分区截图交付记录](visual-regions-delivery.md)。

## 最终行为与范围

新增 `/compare`，支持同一操作下选择基准与对照执行、搜索选项、交换与清空、比较耗时与 Token、按步骤类型和名称及出现顺序对齐，并跳转关联 Trace。页面可见文案及可访问名称使用英文。

选择弹层与输入框等宽，限制高度与视口边界，支持内部滚动、长文本换行与键盘导航。两组执行桌面使用竖向边框分隔，移动端改为横向边框。英文步骤表使用稳定列宽并保留局部横向滚动。

数据全部来自固定样例，没有接入后端、实时数据、成本推算或自动根因分析。新增 7 条对比样例接入统一 Trace 集合，因此 Trace Explorer 总数和分页增加；既有样例值未修改。

## 实现与复用选择

| 文件 | 职责与选择 |
| --- | --- |
| [TraceCompare.tsx](../../src/pages/TraceCompare/TraceCompare.tsx) | 页面组合、受控选择与候选集合，复用 AppShell、Card、Button、StatusBadge |
| [TracePicker.tsx](../../src/pages/TraceCompare/TracePicker.tsx) | 页面私有的领域选择器，在本页两处复用；自身管理搜索与弹层，选择由页面控制 |
| [comparison.ts](../../src/pages/TraceCompare/comparison.ts) | 派生指标变化和步骤配对，保持输入不变 |
| [TraceCompare.css](../../src/pages/TraceCompare/TraceCompare.css) | 页面与 Portal 弹层的局部样式，复用语义 token |
| [comparisons.ts](../../src/data/comparisons.ts)、[mock.ts](../../src/data/mock.ts) | 独立样例及共享 Trace 集合接入，保证深链接能够定位 |
| [routes.ts](../../src/router/routes.ts) | 注册页面、导航和面包屑 |
| [app.css](../../src/styles/app.css) | 修复第四个导航项导致的 426–750px 布局溢出 |
| [behavior.spec.ts](../../tests/behavior.spec.ts)、[visual.spec.ts](../../tests/visual.spec.ts) | 行为边界、跨页回归及页面与弹层截图 |
| [trace-picker.ts](../../tests/helpers/trace-picker.ts) | 浏览器测试中的真实搜索与选项选择交互 |

未修改公共组件接口或新增依赖。MetricCard 固定显示上期对比文案，不适用于本次执行对比，因此保留局部指标布局。页面私有组件的归属规则已补充到 UI Guidelines，具体状态与回调契约保留在[功能说明](../features/done/trace-compare.md)，不再另建一份重复的组件文档。

## 已执行检查与阶段

| 检查 | 实际结果及适用阶段 |
| --- | --- |
| `npm run docs:check` | 实现、英文调整及后续文档补充阶段均通过；归档链接修复后的结果以本次交付回复为准 |
| `npm run typecheck`、`npm run build` | 最终英文文案及步骤表布局调整阶段通过 |
| `npm run test:e2e` | 选择器与 UI 调整完成后完整 21 项通过；该次运行早于英文文案调整 |
| `npm run test:e2e -- --grep 'Trace Compare'` | 英文文案与步骤表调整后，相关 6 项通过；覆盖计算、选择联动、搜索、键盘、空状态、Trace 定位、刷新和溢出 |
| `npm run test:visual` | 选择器调整阶段，其他页面 5 项对比通过，本页 4 项因预期差异或缺少展开态基线失败；不能视为全站视觉验收通过 |
| `npm run test:visual -- --grep 'Trace Compare'` | 最终英文调整阶段，本页 4 项因文案及列宽预期变化失败；已目视检查实际截图 |
| `npm run test:visual:update -- --grep 'Trace Compare'` | 最终英文调整阶段，仅生成本页 4 张候选图，更新模式 4 项完成；不代表基线已批准 |
| `npm run test:visual`（基线更新后） | 最终英文页面的完整自动视觉对比 9 项通过；与人工批准分别记录 |
| `git diff --check` | 实现及文档补充阶段通过 |
| `npm run test:docs` | 未运行（未修改文档检查器，不适用） |

响应式行为检查覆盖 390、426、500、600、750、760、1000px；页面截图检查覆盖桌面 1440×900、移动端 390×844，以及长选项弹层。已目视检查换行、分隔线、箭头与长文本；未完成独立屏幕阅读器验收或独立人工全流程验收。

本次曾遇到本机服务访问限制及 Vite `504 (Outdated Optimize Dep)`，在允许访问本机服务的环境运行、重启开发服务并重新优化依赖后完成检查。扩展宽度检查发现并修复导航溢出；截图检查发现并修复英文表头挤窄步骤名称列的问题。

## 截图与待验收项

本页当前分区基线（已人工批准，批准后自动对比通过）：

- [桌面页面](../../tests/visual.spec.ts-snapshots/trace-compare-desktop-chromium-darwin.png)
- [移动端页面](../../tests/visual.spec.ts-snapshots/trace-compare-mobile-chromium-darwin.png)
- [桌面长选项弹层](../../tests/visual.spec.ts-snapshots/trace-compare-picker-desktop-chromium-darwin.png)
- [移动端长选项弹层](../../tests/visual.spec.ts-snapshots/trace-compare-picker-mobile-chromium-darwin.png)

用户告知视觉基线已更新后，已运行完整 `npm run test:visual`，共 9 项通过，包含四个页面及对比页的桌面、移动端展开态。本次运行未再次更新截图文件。该结果证明当前页面与当前基线一致，不单独证明产品或设计验收完成。

后续用户明确回复“人工审核通过”，本次分区方案的 15 张基线已批准，批准后完整视觉对比 12 项通过；整页方案的早期差异作为历史记录保留，最新范围与验收证据由分区交付记录维护。

按[验证规范](../VALIDATION.md)完成截图和产品审核；若后续人工批准或调整基线，按规范重新运行完整视觉对比并记录结果。随后分区改造阶段已完成完整 22 项行为回归，另新增 1 项导航隔离实验单独通过；详情见分区交付记录。

`test-results/` 中的实际截图、diff、错误上下文和浏览器 trace 是本地临时检查产物，可能被后续测试清理；本记录和候选图链接用于持久交接，不依赖临时报告存在。
