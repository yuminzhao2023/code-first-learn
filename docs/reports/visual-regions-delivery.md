# 视觉截图分区交付记录

状态：测试改造完成，分区候选基线待人工审核；未提交代码或截图。

## 问题与结果

此前每张页面截图都包含导航与顶栏，新增导航项会让多个无内容变化的页面同时产生差异。现在共享导航、共享顶栏、页面内容和 Portal 弹层分别截图，保留真实页面进行整体布局检查。

| 区域 | 截图范围 | 覆盖 |
| --- | --- | --- |
| 导航 | Primary sidebar，包括品牌与导航 | 1440×900、600×844、390×844，固定访问 Trace Explorer |
| 顶栏 | `.topbar` | 同上，固定入口保证面包屑状态一致 |
| 页面内容 | `.content-wrap` | 四个桌面页面及 Metrics、Error Analysis、Trace Compare 移动端 |
| 弹层 | `.trace-picker-popup` | Trace Compare 桌面、移动端长选项 |

共 12 个视觉用例、15 张截图。既有页面与弹层截图文件名保留，但截图范围已改变，因此需要重新审核；另新增导航及顶栏共 6 张。没有修改产品运行代码、数据、像素阈值，也没有通过遮罩或隐藏导航跳过变化。

桌面导航在截图前临时设置为 900px 高并断言尺寸，截图后移除测试样式；否则侧栏随页面高度拉伸，仍会受到内容长度影响。整体布局行为检查使用原始页面样式，不应用此截图样式。

如果未来导航变化同时影响内容可用宽度、共享样式或页面数据，内容截图仍应报出真实差异；分区并不保证任何导航改动都只影响一张图。

## 修改文件

- [visual.spec.ts](../../tests/visual.spec.ts)：分区截图、独立共享区域用例、固定导航测试高度。
- [behavior.spec.ts](../../tests/behavior.spec.ts)：四个页面在桌面、紧凑与移动布局下的导航选中态、面包屑、区域相对位置和溢出检查；新增导航隔离实验。
- [验证规范](../VALIDATION.md)：维护截图边界、整体布局保护及基线审核要求。
- README 更新覆盖说明，Trace Compare 文档与旧交付记录注明截图方案迁移，保留历史检查结果的适用阶段。

## 实际验证

| 命令 | 结果 |
| --- | --- |
| `npm run docs:check` | 通过；新增交付文档后再次运行，最终结果见本次交付回复 |
| `npm run typecheck`、`npm run build` | 通过 |
| `npm run test:e2e` | 添加整体布局用例后完整 22 项通过；运行时尚未加入后述隔离实验 |
| `npm run test:e2e -- --grep 'Visual boundaries'` | 新增的 1 项通过：仅在测试 DOM 中追加导航项，1440、600、390px 三种宽度下，页面内容截图与追加前逐字节一致 |
| `npm run test:visual` | 迁移初次 12 项失败，原因为原整页基线尺寸不匹配或新增共享区域基线缺失，符合截图边界变化 |
| `npm run test:visual -- --grep 'App shell desktop'` | 复核中确认导航固定为 244×900px，与最初自动生成的 244×1475px 候选不同，需使用修正后的候选 |
| `npm run test:visual:update` | 最终 12 项更新模式完成，生成全部 15 张分区候选；不代表人工批准或视觉验收通过 |
| `git diff --check` | 通过 |
| `npm run test:docs` | 未运行（未修改检查器，不适用） |

已目视检查全部分区：导航、顶栏与内容没有重复截取，长内容与长选项保留，桌面导航高度固定为 900px。未执行独立人工全流程或屏幕阅读器验收。隔离实验在一次完整 22 项之后单独运行通过，不将两次运行描述为同次完整 23 项回归。

## 候选图与后续审核

| 区域 | 候选图 |
| --- | --- |
| 导航 | [桌面](../../tests/visual.spec.ts-snapshots/navigation-desktop-chromium-darwin.png)、[紧凑](../../tests/visual.spec.ts-snapshots/navigation-compact-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/navigation-mobile-chromium-darwin.png) |
| 顶栏 | [桌面](../../tests/visual.spec.ts-snapshots/topbar-desktop-chromium-darwin.png)、[紧凑](../../tests/visual.spec.ts-snapshots/topbar-compact-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/topbar-mobile-chromium-darwin.png) |
| Trace Explorer 内容 | [桌面](../../tests/visual.spec.ts-snapshots/trace-explorer-desktop-chromium-darwin.png) |
| Metrics 内容 | [桌面](../../tests/visual.spec.ts-snapshots/llm-metrics-desktop-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/llm-metrics-mobile-chromium-darwin.png) |
| Error Analysis 内容 | [桌面](../../tests/visual.spec.ts-snapshots/error-analysis-desktop-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/error-analysis-mobile-chromium-darwin.png) |
| Trace Compare 内容 | [桌面](../../tests/visual.spec.ts-snapshots/trace-compare-desktop-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/trace-compare-mobile-chromium-darwin.png) |
| Trace Compare 弹层 | [桌面](../../tests/visual.spec.ts-snapshots/trace-compare-picker-desktop-chromium-darwin.png)、[移动](../../tests/visual.spec.ts-snapshots/trace-compare-picker-mobile-chromium-darwin.png) |

分区候选尚未人工批准。审核时重点确认裁剪边界、导航固定高度、弹层范围及现有内容是否完整。批准后再运行完整 `npm run test:visual`，不能把更新模式通过当作视觉验收通过。先前的整页基线对比结果不直接适用于此次分区方案。
