# Tag Feature

> 标签管理功能

## 职责范围

- 标签 CRUD
- 标签分组
- 标签颜色/图标
- 按标签筛选日记

## 目录

```
tag/
├── README.md
├── index.ts
├── components/    # TagBadge, TagEditor
├── hooks/
└── types.ts
```

## 关联

- **依赖**：database（标签表）
- **被引用**：editor（标签选择）、diary（按标签筛选）

## 状态

🚧 **待开发**