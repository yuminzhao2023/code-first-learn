# Button

用于触发重置、翻页等操作；跨页面导航使用链接。组件沿用原生按钮语义，不负责业务状态或异步请求。

## 变体与示例

- `primary`：当前区域的重点操作。
- `secondary`：次要操作，也是默认变体。
- `ghost`：低强调操作。

以下示例的重置和翻页由调用方提供实际处理函数：

```tsx
import { Button } from "../../../src/components/ui/Button";
import { Icon } from "../../../src/components/ui/Icon";

export function ButtonExample({
  onReset,
  onPrevious,
  isFirstPage,
}: {
  onReset: () => void;
  onPrevious: () => void;
  isFirstPage: boolean;
}) {
  return (
    <>
      <Button variant="primary" onClick={onReset}>
        Reset filters
      </Button>
      <Button disabled={isFirstPage} onClick={onPrevious}>
        Previous
      </Button>
      <Button variant="ghost" aria-label="Reset filters" onClick={onReset}>
        <Icon name="filter" />
      </Button>
    </>
  );
}
```

## 契约与状态

完整属性与默认值见 [Button.tsx](../../../src/components/ui/Button.tsx)。默认 `type="button"`，表单提交须显式设置 `type="submit"`；原生事件和 ARIA 属性透传。

| 状态     | 用法与检查点                                         |
| -------- | ---------------------------------------------------- |
| 默认     | 文案描述动作，变体体现操作权重                       |
| 悬停     | 主按钮已有 hover 样式；不假定所有变体有独立 hover 色 |
| 键盘焦点 | Tab 聚焦后显示共享焦点提示，Enter 或 Space 触发操作  |
| 禁用     | 使用 `disabled`，由浏览器阻止操作并退出正常 Tab 顺序 |
| 只有图标 | 提供 `aria-label`，装饰 Icon 自身不提供按钮名称      |

没有专用的 loading 状态或防重复请求机制；若引入异步操作，需要由调用方管理并定义反馈。
