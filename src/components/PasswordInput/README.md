# PasswordInput

密码输入框组件。

## 用途

密码输入，内置显示/隐藏切换。

## Props

| Prop         | 类型           | 默认值       | 说明       |
| ------------ | -------------- | ------------ | ---------- |
| value        | string         | —            | 密码值     |
| onChangeText | (text) => void | —            | 值变更回调 |
| placeholder  | string         | '请输入密码' | 占位文字   |
| label        | string         | —            | 标签文字   |
| error        | string         | —            | 错误提示   |
| disabled     | boolean        | false        | 禁用       |
| autoFocus    | boolean        | false        | 自动聚焦   |

## 用法

```tsx
import { PasswordInput } from '@components'

;<PasswordInput
  value={password}
  onChangeText={setPassword}
  label="密码"
  error={errorMsg}
/>
```
