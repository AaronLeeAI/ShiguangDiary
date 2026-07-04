# SearchBar - 搜索输入

> 基于 TextField 的搜索专用包装：内置 search 图标 + clearable + 可选取消按钮。

## 状态：✅ 已实现

## 实现要点

- 内部基于 TextField 实现（size="medium"）
- 内置 search 图标（leftIcon）+ clearable 自动启用
- 支持右侧"取消"按钮（受控 showCancel）
- 提交搜索：onSubmitEditing 触发 onSubmit
- 颜色/间距/字号严格来自 @theme

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| value | `string` | 必填 | 当前值 |
| onChangeText | `(text) => void` | 必填 | 值变化回调 |
| onSubmit | `() => void` | - | 提交搜索 |
| placeholder | `string` | `'搜索日记...'` | 占位符 |
| autoFocus | `boolean` | `false` | 自动聚焦 |
| showCancel | `boolean` | `false` | 显示取消按钮 |
| onCancel | `() => void` | - | 取消回调 |
| rightAction | `ReactNode` | - | 自定义右侧内容 |

## 使用示例

```tsx
import {SearchBar} from '@/components/SearchBar';

<SearchBar
  value={keyword}
  onChangeText={setKeyword}
  onSubmit={handleSearch}
  showCancel={focused}
  onCancel={() => navigation.goBack()}
  autoFocus
/>
```

## 目录结构

```
SearchBar/
├── SearchBar.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```