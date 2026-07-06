# Notebook Screen - P002 日记本列表

> 日记本列表页：日记本卡片列表 + 新建/排序操作。

## 状态：✅ 已实现（mock 数据，待接入数据库）

## 实现要点

- TopBar：标题"日记本" + 右侧 tune（排序）图标
- FlatList 渲染 DiaryBookCard 列表
- 三态视觉：
  - **loading**：`<Loading variant="full" />`
  - **empty**：`<EmptyState variant="notebook" />` + "新建日记本"按钮
  - **list**：DiaryBookCard 列表
- 右下角 FAB → 跳转 NotebookCreate
- 底部 BottomTabBar（currentTab="Notebook"）
- 长按日记本：预留 onLongPress（后续接 ActionSheet）
- 点击日记本：进入 NotebookDetail 日记本内页

## 整合的组件

| 组件                 | 用途                 |
| -------------------- | -------------------- |
| TopBar               | 头部 + 排序入口      |
| BottomTabBar         | Tab 切换             |
| DiaryBookCard        | 单个日记本卡片       |
| EmptyState           | 空状态（含新建按钮） |
| FloatingActionButton | 新建日记本           |
| Loading              | 加载态               |
| Icon                 | 排序图标             |

## 目录结构

```
screens/Notebook/
├── NotebookScreen.tsx
├── styles.ts
├── types.ts
├── index.ts
└── README.md
```

## 后续 TODO

1. 接入数据库查询
2. NotebookDetail 页面已接入导航，后续可扩展筛选/批量管理
3. 排序弹层（按创建时间/更新时间/篇数）
4. 长按 ActionSheet（编辑/排序/删除/导出）
