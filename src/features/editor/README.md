# Editor Feature

> 日记编辑功能（写日记页）

## 职责范围

- 富文本编辑器集成
- 工具栏交互
- 自动保存草稿
- 字数统计
- 标题/封面/封面图

## 目录

```
editor/
├── README.md
├── index.ts
├── types.ts
├── components/
├── hooks/
├── utils/
└── screens/
```

## 关联

- **依赖**：database（草稿表）、tag、attachment
- **被引用**：diary（保存后跳转回列表）

## 状态

🚧 **待开发**