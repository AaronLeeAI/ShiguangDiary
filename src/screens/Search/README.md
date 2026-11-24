# Search Screen - P005 搜索页面

> 搜索日记：输入即查（防抖 300ms）+ 搜索历史。

## 状态：✅ 已实现（mock 数据）

## 实现要点

- SearchBar：autoFocus + 取消按钮
- 防抖搜索：300ms 后才执行查询
- 三种状态：
  - **idle**（未输入）：显示搜索历史（标签云）+ 清空按钮
  - **searching**：loading inline spinner
  - **results**：DiaryCard 列表（按相关性匹配 mock 4 条）
  - **empty**：EmptyState（search 变体）+ 副标题提示
- 搜索字段：title / summary / content / location / weather
- 提交（回车）：自动加入历史（去重，最多 8 条）
- 点击历史标签：自动填入并搜索
- 点击结果：跳转 DiaryView

## 整合的组件

| 组件       | 用途     |
| ---------- | -------- |
| SearchBar  | 顶部搜索 |
| DiaryCard  | 搜索结果 |
| EmptyState | 无结果   |
| Loading    | 搜索中   |

## 路由

```typescript
// HomeScreen TopBar search icon
navigation.navigate(ROUTES.SEARCH)

// 或 modal
navigation.navigate(ROUTES.MODAL, { type: 'Search', props: {} })
```

## 后续 TODO

1. 接入数据库（替换 MOCK_DATASET）
2. 搜索历史持久化（AsyncStorage）
3. 高亮匹配关键词
4. 高级筛选（按笔记本 / 标签 / 时间范围）
5. 全文搜索（FTS5 SQLite）
