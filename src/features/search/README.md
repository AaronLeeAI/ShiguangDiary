# Search Feature

> 搜索功能

## 职责范围

- 全日记搜索（标题、正文、标签）
- 搜索结果展示
- 搜索历史
- 搜索筛选

## 目录

```
search/
├── README.md
├── index.ts
├── components/
├── hooks/        # useSearchHistory, useSearchResults
└── types.ts
```

## 关联

- **依赖**：database（全量搜索）
- **被引用**：home（搜索入口）、diary（搜索结果点击）

## 状态

🚧 **待开发**