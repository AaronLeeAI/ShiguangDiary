# TextField - 单行输入框

> 基于 React Native `TextInput` 的封装：label / leftIcon / clearable / error。
>
> 多行输入请使用 `TextArea`。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 三种尺寸：large (52dp) / medium (44dp) / small (36dp)
- label 在输入框上方
- leftIcon / rightIcon 注入
- clearable：非空且非禁用时显示清空按钮
- 三态视觉：default / focused / error（error 优先于 focused）
- disabled 态：背景变 subtle + opacity 0.7
- 颜色/间距/字号严格来自 @theme

## Props

| Prop             | 类型                             | 默认值     | 说明             |
| ---------------- | -------------------------------- | ---------- | ---------------- |
| value            | `string`                         | 必填       | 输入值           |
| onChangeText     | `(text) => void`                 | 必填       | 值变化回调       |
| placeholder      | `string`                         | -          | 占位符           |
| label            | `string`                         | -          | 标签             |
| leftIcon         | `ReactNode`                      | -          | 左侧图标         |
| rightIcon        | `ReactNode`                      | -          | 右侧图标         |
| clearable        | `boolean`                        | `false`    | 是否显示清空按钮 |
| onClear          | `() => void`                     | -          | 清空回调         |
| error            | `string`                         | -          | 错误信息         |
| size             | `'large' \| 'medium' \| 'small'` | `'medium'` | 尺寸             |
| editable         | `boolean`                        | `true`     | 是否可编辑       |
| onFocus / onBlur | `() => void`                     | -          | 焦点回调         |

继承 `TextInputProps` 的其余 props（`autoCapitalize`、`keyboardType` 等）。

## 使用示例

```tsx
import {TextField} from '@/components/TextField';
import {Icon} from '@/components/Icon';

// 基础
<TextField value={name} onChangeText={setName} placeholder="请输入名称" />

// 带 label + error
<TextField
  label="邮箱"
  value={email}
  onChangeText={setEmail}
  error={!isValid ? '邮箱格式不正确' : undefined}
/>

// 带搜索图标 + 清空
<TextField
  value={keyword}
  onChangeText={setKeyword}
  placeholder="搜索日记"
  leftIcon={<Icon name="search" size={20} />}
  clearable
/>

// 大尺寸登录
<TextField
  size="large"
  label="账号"
  value={account}
  onChangeText={setAccount}
  autoCapitalize="none"
/>
```

## 目录结构

```
TextField/
├── TextField.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
