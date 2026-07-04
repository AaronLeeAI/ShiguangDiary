# Album Screen - P003 相册列表

> 相册列表页：2 列网格展示相册卡片 + 新建入口。

## 状态：✅ 已实现（mock 数据）

## 实现要点

- TopBar：标题"相册"
- 2 列网格（48% + space-between）
- AlbumCard 列表
- 三态视觉：loading / empty / grid
- 右下角 FAB → 跳转 AlbumCreate
- 底部 BottomTabBar（currentTab="Album"）

## 整合的组件

| 组件 | 用途 |
|------|------|
| TopBar | 头部 |
| BottomTabBar | Tab 切换 |
| AlbumCard | 单个相册卡片 |
| EmptyState | 空状态 |
| FloatingActionButton | 新建相册 |
| Loading | 加载态 |

## 目录结构

```
screens/Album/
├── AlbumScreen.tsx
├── styles.ts
├── types.ts
├── index.ts
└── README.md
```

## 后续 TODO

1. 接入数据库查询
2. 实现 AlbumDetail 页面
3. 相册封面图（待接入图片库）
4. 长按 ActionSheet（编辑/删除）