# Diary Feature

> 日记核心功能

## 职责范围

- 日记列表展示
- 日记查看
- 日记增删改查
- 日记列表多选/排序/筛选

## 目录

```
diary/
├── README.md           # 本文件
├── index.ts            # 公共导出
├── types.ts            # 类型定义
├── components/         # 该 Feature 私有组件
├── hooks/              # 该 Feature 私有 hooks
├── utils/              # 该 Feature 私有工具
└── screens/            # 该 Feature 相关页面
```

## 关联

- **依赖**：database、store/api
- **被引用**：navigation（首页/详情/编辑入口）、search、statistics

## 状态

🚧 **待开发** — 当前 Task1 仅创建目录骨架。