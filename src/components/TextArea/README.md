# TextArea - 多行输入

> 日记正文编辑器。基于 RN TextInput multiline 实现。

## 状态：✅ 已实现

## 实现要点

- 基于 RN TextInput multiline + textAlignVertical: 'top'
- minHeight / maxHeight 控制自动撑高（超过 maxHeight 内部滚动）
- showCount 字符计数：maxLength 时显示 `X / Y`
- 计数颜色阈值：90% warning / 100% danger
- 三态视觉：default / focused / error
- 颜色/间距/字号严格来自 @theme

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| value | `string` | 必填 | 输入值 |
| onChangeText | `(text) => void` | 必填 | 值变化回调 |
| placeholder | `string` | - | 占位符 |
| minHeight | `number` | 120 | 最小高度(dp) |
| maxHeight | `number` | 400 | 最大高度(dp) |
| showCount | `boolean` | `false` | 显示字符计数 |
| maxLength | `number` | - | 最大字符数 |
| error | `string` | - | 错误信息 |

继承 `TextInputProps` 其余字段。

## 使用示例

```tsx
import {TextArea} from '@/components/TextArea';

// 基础
<TextArea
  value={content}
  onChangeText={setContent}
  placeholder="今天发生了什么..."
  minHeight={200}
/>

// 带字符计数
<TextArea
  value={content}
  onChangeText={setContent}
  showCount
  maxLength={2000}
/>

// 错误态
<TextArea
  value={content}
  onChangeText={setContent}
  error="内容不能为空"
/>
```

## 目录结构

```
TextArea/
├── TextArea.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```