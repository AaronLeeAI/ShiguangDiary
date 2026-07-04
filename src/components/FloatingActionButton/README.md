# FloatingActionButton - 悬浮按钮（FAB）

> 主页右下角的"新建"入口按钮。

## 状态：✅ 已实现

## 实现要点

- 三种尺寸：small (40dp) / medium (48dp) / large (56dp)
- 两种变体：primary（品牌绿）/ danger（红色）
- 默认 `position: absolute` 定位在右下角（bottom: 88dp，避开 BottomTabBar）
- 大阴影（shadow.lg 等价）
- 按下态 scale 0.96 反馈
- 默认图标 `add`（variant="round"），可自定义

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| onPress | `() => void` | 必填 | 点击回调 |
| icon | `IconName` | `'add'` | 图标 |
| children | `ReactNode` | - | 自定义内容（覆盖默认图标） |
| variant | `'primary' \| 'danger'` | `'primary'` | 视觉变体 |
| size | `'small' \| 'medium' \| 'large'` | `'large'` | 尺寸 |
| accessibilityLabel | `string` | `'新建'` | 无障碍标签 |
| disabled | `boolean` | `false` | 禁用 |

## 使用示例

```tsx
import {FloatingActionButton} from '@/components/FloatingActionButton';

<FloatingActionButton onPress={() => navigation.navigate('DiaryEdit')} />

<FloatingActionButton
  variant="danger"
  icon="trash"
  accessibilityLabel="删除"
  onPress={handleDelete}
/>

<FloatingActionButton size="small" icon="add" />
```

## 目录结构

```
FloatingActionButton/
├── FloatingActionButton.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```