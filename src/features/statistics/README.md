# Statistics Feature

> 数据统计与 Insights Engine

## 职责范围

- 日记总数 / 总字数 / 连续记录 / 本月 / 本年统计
- 写作趋势(最近 7 天 / 7 个月)
- 单一 Insights Engine:统一统计计算,页面不得自行计算

## 数据流

```
StatisticsScreen → useStatistics → statisticsStore(范围/态)
                                  └→ diaryStore(diaries) → statisticsService → insightsEngine(纯函数)
```

纯派生范式(DECISIONS 033,延续 030/032):入参 `diaryStore.diaries`,
**不访问 Repository/DAO/SQLite**,statisticsService **不注册全局 registry**(与 calendarService/searchService 同范式)。
派生结果(summary/trend)由 useStatistics useMemo 派生,**不进 store**(避免与 diaries 缓存分裂)。

## 目录

```
statistics/
├── README.md
├── index.ts          # 公共导出
├── types.ts          # StatisticsRange/SummaryMetrics/TrendData/InsightsResult/Store
├── components/
│   ├── StatisticsCard.tsx   # 通用统计卡
│   ├── SummaryCard.tsx       # 顶部指标网格
│   ├── TrendChart.tsx        # 自绘柱状条(零第三方依赖,接口可替换)
│   └── RangeSelector.tsx     # 月/年/全部切换
├── hooks/
│   └── useStatistics.ts      # 视图模型 hook
├── services/
│   └── statisticsService.ts  # 派生聚合
├── store/
│   └── statisticsStore.ts   # 运行时态(不持久化)
└── utils/
    └── insightsEngine.ts     # 纯函数核心:countWords/computeStreak/computeSummary/computeTrend/generateInsights
```

## 约定

- 总字数 = `content` 去除空白后字符数(不计 title/summary)。
- 连续记录:今日有→从今日回扫;今日无→currentStreak=0(历史 longest 保留)。
- 趋势图自绘,不引 chart 库;后续可替换组件实现而不改调用方。
- 跳过 `deletedAt !== null` 的日记。

## 关联

- **依赖**:`@store/diaryStore`(diaries)、`@theme` token
- **被引用**:Profile → Statistics 路由

## 状态

✅ **已完成**(Task13)

留 TODO(Out of Scope):AI Summary / 年度回顾动画 / 导出报告 / 社交分享 / 多维情绪分析 / 按日记本标签筛选 / SQLite 聚合查询升级(statisticsService 接口可平滑切换)。
