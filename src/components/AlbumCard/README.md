# AlbumCard - 相册卡片

> 在 Album 页面以 2 列网格展示相册：方形封面 + 名称 + 日记数量。

## 状态：✅ 已实现

## 实现要点

- 2 列网格布局（48% 宽 + gap）
- 封面：1:1 方形 + lg 圆角 + 默认 placeholder 图标（album）
- 名称 + 数量（caption）
- 支持 onPress / onLongPress

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| item | `Album` | 必填 | 相册数据 |
| onPress | `() => void` | - | 点击回调 |
| onLongPress | `() => void` | - | 长按回调 |

## 使用示例

```tsx
import {AlbumCard} from '@/components/AlbumCard';

<AlbumCard item={album} onPress={handleOpen} />
```

## 目录结构

```
AlbumCard/
├── AlbumCard.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```