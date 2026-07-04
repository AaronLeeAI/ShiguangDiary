# DiaryBookCard - 日记本卡片

> 在 Notebook 页面展示一个日记本：封面（颜色 + 首字）+ 名称 + 描述 + 统计。

## 状态：✅ 已实现

## 实现要点

- 左侧 96dp 方形封面：背景色从 id hash 派生（6 色池），中央显示日记本名称的首字
- 右侧信息区：日记本名称 + 描述（最多 2 行）+ 元信息（篇数 + 更新时间）
- 点击：onPress（进入日记本内页）
- 长按 400ms：onLongPress（弹出 ActionSheet：编辑/排序/删除）
- 自定义 coverColor 时优先使用
- 颜色/间距/字号严格来自 @theme

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| item | `Notebook` | 必填 | 日记本数据 |
| onPress | `() => void` | - | 点击回调 |
| onLongPress | `() => void` | - | 长按回调 |
| coverColor | `string` | - | 自定义封面色 |
| style | `ViewStyle` | - | 容器样式 |

## 使用示例

```tsx
import {DiaryBookCard} from '@/components/DiaryBookCard';

<DiaryBookCard
  item={notebook}
  onPress={() => navigation.navigate('NotebookDetail', {id: notebook.id})}
  onLongPress={() => showActions(notebook)}
/>
```

## 目录结构

```
DiaryBookCard/
├── DiaryBookCard.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```