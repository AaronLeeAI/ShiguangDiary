# Screen

全屏容器组件。

## 用途

所有页面必须使用 Screen 作为根容器，禁止自行包裹 SafeAreaView。

## Props

| Prop             | 类型                                       | 默认值            | 说明                                                 |
| ---------------- | ------------------------------------------ | ----------------- | ---------------------------------------------------- |
| children         | ReactNode                                  | —                 | 页面内容                                             |
| scroll           | boolean                                    | false             | 启用 ScrollView 包裹                                 |
| keyboardAvoiding | boolean                                    | false             | 启用 KeyboardAvoidingView                            |
| padded           | boolean                                    | false             | 添加水平内边距（spacing.base）                       |
| edges            | ('top' \| 'bottom' \| 'left' \| 'right')[] | ['top', 'bottom'] | SafeArea 适配边                                      |
| statusBarStyle   | 'dark-content' \| 'light-content'          | 'dark-content'    | StatusBar 样式                                       |
| backgroundColor  | string                                     | —                 | 自定义背景色（默认 theme.colors.semantic.bg.canvas） |

## 用法

```tsx
import {Screen} from '@components';

// 基本用法
<Screen>
  <Text>内容</Text>
</Screen>

// 滚动 + 键盘避让（表单页）
<Screen scroll keyboardAvoiding padded>
  <TextField />
</Screen>
```
