# DiaryCard

> 日记卡片组件

用于首页、搜索结果、日记本内页的日记列表项展示。

## 规范来源

- 详细规范：[docs/project-设计-docs/components/DiaryCard.md](../../../../../docs/project-设计-docs/components/DiaryCard.md)
- 设计 Token：[docs/project-设计-docs/docs/04_Design_System.md](../../../../../docs/project-设计-docs/docs/04_Design_System.md)

## Props

```typescript
interface DiaryCardProps {
  item: Diary;        // 日记数据
  onPress?: () => void; // 点击回调
  style?: ViewStyle;    // 自定义样式
}
```

## 使用示例

```tsx
import {DiaryCard} from '@components/DiaryCard';

<DiaryCard item={diaryData} onPress={() => handlePress()} />
```

## 状态

🚧 **待开发** — 当前 Task1 仅创建目录骨架。

## 目录结构

```
DiaryCard/
├── DiaryCard.tsx        # 组件实现
├── types.ts          # 类型定义
├── styles.ts         # 样式
├── index.ts          # 入口
└── README.md         # 本文件
```