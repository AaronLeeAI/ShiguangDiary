# Editor Feature

> 日记编辑功能（写日记页）

## 职责范围

- 编辑态管理
- 草稿键与自动保存基础
- 标题/正文校验
- 字数统计
- 保存前快照整理

## 目录

```
editor/
├── hooks/       # useEditor
├── services/    # editorEngine
├── store/       # editorStore
├── types.ts
└── index.ts
```

## 关联

- **依赖**：diaryStore、preferencesStore
- **被引用**：DiaryEditScreen

## 状态

✅ **已实现** — 已提供编辑态 store、useEditor、草稿键、校验、字数统计与 editorEngine。
