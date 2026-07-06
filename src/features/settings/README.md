# Settings Feature

> 设置功能与配置中心

## 职责范围

- 偏好配置读取/写入
- 配置校验、迁移和 diff
- 关于页、主题选择、步进器等设置组件
- 与 preferencesStore 保持单一数据源

## 目录

```
settings/
├── components/  # AboutCard、ThemeModeSelector、Stepper
├── hooks/       # useSettings
├── utils/       # configurationCenter
├── types.ts
└── index.ts
```

## 关联

- **依赖**：preferencesStore
- **被引用**：SettingsScreen、PreferencesScreen、DarkModeScreen

## 状态

✅ **已实现** — 已提供配置中心、useSettings、AboutCard、ThemeModeSelector、Stepper 与偏好门面。
