# MetricCard

用于摘要指标，展示标签、已格式化数值与图标；支持上期对比或普通说明。它不计算指标，也不提供点击或筛选行为。

## 示例与业务语义

```tsx
import { MetricCard } from '../../../src/components/ui/MetricCard';
import { Icon } from '../../../src/components/ui/Icon';

export function MetricCardExample() {
  return (
    <MetricCard
      label="Avg. Duration"
      value="1.84s"
      delta="-8.2%"
      tone="good"
      icon={<Icon name="clock" size={19} />}
    />
  );
}
```

示例为固定样本，不是实际性能测量。耗时下降可以是改善，因此负数可以配 `good`；错误率上升则应配 `bad`。调用方按指标含义选择 `tone`，组件不解析变化字符串。

## 契约与状态

完整属性与默认值见 [MetricCard.tsx](../../../src/components/ui/MetricCard.tsx)。

- `value`、`delta` 是调用方提供的展示字符串，单位、精度和正负号由调用方决定。
- `tone` 为 `good`、`neutral` 或 `bad`，默认是 `good`；`neutral` 当前使用警告色，不代表自动识别出的“无变化”。
- 有上期对比时传入 `delta` 与可选的 `tone`，对比说明固定为 `vs. previous period`。
- 没有上期对比时必须传入 `note`，不能同时传入 `delta` 或 `tone`。例如整体 P95 缺少请求级数据时，展示 `value="—"` 与 `note="Requires request-level data"`，不虚构指标和变化。
- 卡片不是交互控件，不增加无意义的 Tab 停靠点。
- 数值保持单行；长数值可能溢出。优先按业务单位合理格式化，关键数值不能只通过隐藏溢出来处理。长标签和本地化内容需要单独检查。
