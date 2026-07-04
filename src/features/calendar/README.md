# Calendar Feature

> 日历视图功能

## 职责范围

- 日历展示（周/月/年三态）
- 日期切换
- 有"记"标记
- 农历/节气/节日展示
- 日期点击跳转

## 目录

```
calendar/
├── README.md
├── index.ts
├── components/    # CalendarGrid, CalendarHeader 等
├── hooks/         # useCalendarState
├── utils/         # 农历、节气、节日计算
└── types.ts
```

## 关联

- **依赖**：diary（查询某天的日记）
- **被引用**：home（首页日历）、editor（时间选择器）

## 状态

🚧 **待开发**