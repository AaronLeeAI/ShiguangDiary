# TextButton

文字按钮组件。

## 用途

次要操作、导航文字、弹窗确认等轻量交互。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | — | 按钮文字 |
| onPress | () => void | — | 点击回调 |
| color | string | brand.primary | 文字颜色 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | 尺寸 |
| disabled | boolean | false | 禁用 |
| underline | boolean | false | 下划线 |
| icon | ReactNode | — | 前置/后置图标 |
| iconPosition | 'left' \| 'right' | 'left' | 图标位置 |

## 用法

```tsx
import {TextButton} from '@components';

<TextButton title="取消" onPress={handleCancel} />
<TextButton title="查看更多" onPress={handleViewMore} underline />
```