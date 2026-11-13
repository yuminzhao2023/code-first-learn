# TraceTable

用于展示 Trace 记录并通知页面选择了哪条记录。它依赖 Trace 数据与状态语义，因此属于领域组件，不是通用表格。

## 受控选择示例

```tsx
import { useState } from 'react';
import type { Trace } from '../../../src/types/observability';
import { TraceTable } from '../../../src/components/observability/TraceTable';

export function TraceTableExample({ rows }: { rows: Trace[] }) {
  const [selectedId, setSelectedId] = useState('');
  const selected = rows.find((trace) => trace.id === selectedId) ?? rows[0];
  return (
    <TraceTable
      rows={rows}
      selectedId={selected?.id ?? ''}
      onSelect={setSelectedId}
    />
  );
}
```

示例由父组件将有效选择或首条记录传给表格。实际页面还用同一条 `selected` 渲染详情，见 [TraceExplorer.tsx](../../../src/pages/TraceExplorer.tsx)。

## 职责与契约

完整属性见 [TraceTable.tsx](../../../src/components/observability/TraceTable.tsx)。

| 组件负责                                    | 页面负责                           |
| ------------------------------------------- | ---------------------------------- |
| 按输入顺序渲染记录                          | 数据获取、筛选、排序和分页         |
| 用 `selectedId` 标记选中行与 `aria-pressed` | 维护选择，结果变化时计算有效选择   |
| 点击操作按钮时调用 `onSelect(id)`           | 更新选择、详情与相关 URL 状态      |
| 空数组显示空结果提示                        | 保持详情与可见记录一致，处理空详情 |
| 表格容器横向滚动                            | 防止外层布局撑宽视口               |

- 每条记录的 `id` 必须唯一；组件不修改输入数据。
- `selectedId` 未匹配任何记录时，不高亮任何行，也不自动触发回调。
- 时间和耗时使用已有 Trace 契约与格式化函数，不在组件内猜测时区或修改数据。
- 每页 5 条是 Trace Explorer 的规则；TraceTable 会展示传入的全部记录，没有内置条数限制。
