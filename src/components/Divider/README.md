# Divider

分割线组件。

## 用途

在内容之间做视觉分离，避免使用边框。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| vertical | boolean | false | 垂直分割线 |
| color | string | — | 自定义颜色（默认 theme divider） |
| thickness | number | 1 | 分割线粗细 |
| spacing | 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'sm' | 分割线间距 |
| style | ViewStyle | — | 容器样式 |

## 用法

```tsx
import {Divider} from '@components';

// 水平分割线
<Divider />

// 垂直分割线
<View style={{flexDirection: 'row'}}>
  <Text>左</Text>
  <Divider vertical />
  <Text>右</Text>
</View>
```