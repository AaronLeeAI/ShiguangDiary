# Sync Feature

> 同步与备份功能

## 职责范围

- 云端同步（按账号）
- 备份与还原
- 同步状态指示
- 冲突解决
- 离线缓存队列

## 目录

```
sync/
├── README.md
├── index.ts
├── components/    # SyncStatusIndicator, ConflictResolver
├── hooks/         # useSyncStatus, useSyncTrigger
├── services/      # 同步逻辑
└── types.ts
```

## 关联

- **依赖**：api、database、store
- **被引用**：profile（云同步入口）

## 状态

🚧 **待开发** — 当前 Task1 仅创建目录骨架。