# Statistics Feature

> 数据统计功能

## 职责范围

- 日记总数/字数统计
- 时间轴（按月/年）
- 写作热力图
- 心情/标签分布

## 目录

```
statistics/
├── README.md
├── index.ts
├── components/   # StatCard, HeatMap, BarChart
├── hooks/        # useStatisticsData
└── utils/        # 数据聚合
```

## 关联

- **依赖**：database（聚合查询）
- **被引用**：profile（统计入口）

## 状态

🚧 **待开发**