# Calendar Feature

> 日历视图功能

## 职责范围

- 日历展示（周/月/年三态）
- 日期切换
- 有“记”标记
- 日期点击跳转
- Timeline Engine 生成周/月矩阵

## 目录

```
calendar/
├── components/    # Calendar、WeekView、YearView 等
├── hooks/         # useCalendar
├── services/      # calendarService
├── store/         # calendarStore
├── utils/         # timeline 计算
└── types.ts
```

## 关联

- **依赖**：diaryStore 数据快照
- **被引用**：首页日历、统计/时间线能力

## 状态

✅ **已实现** — 已提供 Timeline Engine、周/月/年视图组件、useCalendar、calendarStore 与 calendarService。
