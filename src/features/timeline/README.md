# Timeline Feature

> 时间线视图功能

## 职责范围

- 按时间线展示日记
- 年/月/日分组
- 滚动定位
- 时间线样式切换

## 目录

```
timeline/
├── README.md
├── index.ts
├── components/    # TimelineItem, TimelineHeader, TimelineSection
├── hooks/         # useTimelineData, useTimelineScroll
└── utils/
```

## 关联

- **依赖**：diary（按时间分组）
- **被引用**：home（时间线样式入口）

## 状态

🚧 **待开发**