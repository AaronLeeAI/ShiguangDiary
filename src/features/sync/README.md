# Sync Feature

> 同步与备份能力入口

## 职责范围

- 暴露同步服务框架
- 本地优先 LocalProvider
- 与 services/sync、services/backup 对齐
- 为未来 WebDAV/Git/Cloud Provider 保留扩展点

## 目录

```
sync/
├── index.ts
└── README.md
```

## 关联

- **依赖**：src/services/sync、src/services/backup
- **被引用**：数据管理与同步状态能力

## 状态

✅ **框架已实现** — 同步/备份服务已在 src/services 暴露；当前使用 LocalProvider，本地优先且无远端云同步。
