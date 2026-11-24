# Home Screen - P001 首页

> 日记列表页：日期头部 + 日记卡片列表 + FAB 新建 + BottomTabBar。

## 状态：✅ 已实现（使用 mock 数据，待接入数据库）

## 实现要点

- 顶部 TopBar：显示当前日期（`7月4日`）+ 右侧搜索/更多图标
- 中部 FlatList 渲染 DiaryCard 列表
- 三态视觉：
  - **loading**：使用 `<Loading variant="full" />`
  - **empty**：使用 `<EmptyState variant="noDiaryToday" />`
  - **list**：FlatList + DiaryCard
- 右下角 FloatingActionButton → 跳转 `DiaryEdit`
- 底部 BottomTabBar（受控模式：currentTab="Home"）
- 使用 mock 数据（MOCK_DIARIES），模拟 600ms 加载延迟
- 安全区：`useSafeAreaInsets()` 适配 iOS 刘海

## 整合的组件

| 组件                 | 用途                       |
| -------------------- | -------------------------- |
| TopBar               | 头部导航 + 标题 + 右侧操作 |
| BottomTabBar         | 底部 Tab 切换              |
| DiaryCard            | 单条日记                   |
| EmptyState           | 空状态                     |
| FloatingActionButton | 新建日记入口               |
| Loading              | 加载态                     |
| Icon                 | TopBar 右侧图标            |

## 目录结构

```
screens/Home/
├── HomeScreen.tsx
├── styles.ts
├── types.ts
├── index.ts
└── README.md
```

## 后续 TODO

1. 接入 `src/database/` 真实查询（替换 MOCK_DIARIES）
2. 点击搜索图标 → 跳转 Search Screen
3. 点击更多图标 → 显示 ActionSheet（置顶、列表样式、回收站等）
4. 下拉刷新
5. 集成 Calendar 组件显示历史日记

```

---

## 路由

- 当前页：`Home`（Tab 页）
- 可跳转：
  - `DiaryView` (id)
  - `DiaryEdit` (id?, notebookId?)
  - `MainTabs` (其他 Tab)
```
