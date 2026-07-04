# LoadingOverlay

全局加载遮罩组件。

## 用途

在全局加载场景使用，覆盖全屏，居中显示加载指示器。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | false | 显示/隐藏 |
| message | string | — | 加载提示文字 |
| transparent | boolean | true | 半透明遮罩 |
| indicatorSize | 'small' \| 'large' | 'large' | 指示器大小 |
| indicatorColor | string | brand.primary | 指示器颜色 |

## 用法

```tsx
import {LoadingOverlay} from '@components';

<LoadingOverlay visible={isLoading} message="加载中..." />
```