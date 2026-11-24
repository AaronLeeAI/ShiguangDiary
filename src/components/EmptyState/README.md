# EmptyState - 空状态

基于 [项目设计文档](../../../docs/project-设计-docs/components/EmptyState.md) 实现。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 5 种预设 variant（notebook/album/noDiaryToday/noDraft/search） + custom
- 自动应用预设的 title 和 subtitle，外部可覆盖
- 120dp 圆形图标容器 + lg 阴影
- 自定义图标（customIcon）或根据 variant 自动选择
- 可选的行动按钮（actionLabel + onAction）

## Props

| Prop        | 类型                | 默认值 | 说明         |
| ----------- | ------------------- | ------ | ------------ |
| variant     | `EmptyStateVariant` | 必填   | 变体预设     |
| title       | `string`            | 预设   | 标题         |
| subtitle    | `string`            | 预设   | 副标题       |
| customIcon  | `ReactNode`         | -      | 自定义图标   |
| actionLabel | `string`            | -      | 行动按钮文案 |
| onAction    | `() => void`        | -      | 行动按钮回调 |

## 预设文案

| variant      | 标题                 | 副标题                       |
| ------------ | -------------------- | ---------------------------- |
| notebook     | 没有属于自己的日记本 | 赶紧点击右上角的加号创建吧   |
| album        | 没有属于自己的相册   | 赶紧点击右上角的加号创建吧   |
| noDiaryToday | 没有记录内容         | -                            |
| noDraft      | 草稿箱空空如也       | 已保存的草稿会自动显示在这里 |
| search       | 没有找到相关日记     | 试试别的关键词               |

## 使用示例

```tsx
import {EmptyState} from '@/components/EmptyState';

<EmptyState variant="notebook" />
<EmptyState variant="search" subtitle="试试搜索今天的日期" />
<EmptyState
  variant="custom"
  title="全部完成"
  subtitle="今日的所有日记都已记录"
  customIcon={<MyIcon size={56} />}
/>
<EmptyState
  variant="notebook"
  actionLabel="新建日记本"
  onAction={() => navigation.navigate('P201')}
/>
```

## 目录结构

```
EmptyState/
├── EmptyState.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
