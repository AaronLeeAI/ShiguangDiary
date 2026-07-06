# Search Feature

> 搜索功能

## 职责范围

- 全日记搜索（标题、正文、摘要）
- 搜索结果排序
- 搜索历史与推荐
- 命中高亮

## 目录

```
search/
├── components/  # HighlightText、SearchHistory、SearchResultItem
├── hooks/       # useSearch
├── services/    # searchService
├── store/       # searchStore
├── utils/       # searchEngine
└── types.ts
```

## 关联

- **依赖**：diaryStore 数据快照
- **被引用**：SearchScreen、首页搜索入口

## 状态

✅ **已实现** — 已提供搜索 store、useSearch、搜索服务、历史、结果项与高亮组件。
