# DateTimePicker - 日期时间选择

> 基于 @react-native-community/datetimepicker 的封装。

## 状态：✅ 已实现

## 实现要点

- 3 种模式：date / time / datetime
- 跨平台处理：
  - iOS：spinner inline 渲染（在 Modal 中展示）
  - Android：使用官方 dialog 弹出
- 提供两种 API：
  - `<DateTimePicker />` 直接受控渲染
  - `<DateTimePickerField />` 点击触发 + 展示当前值
- 支持 minimumDate / maximumDate 边界
- 颜色来自 theme

## Props

### DateTimePicker

| Prop        | 类型                             | 默认值   | 说明           |
| ----------- | -------------------------------- | -------- | -------------- |
| value       | `number`                         | 必填     | 当前时间戳(ms) |
| onChange    | `(ts) => void`                   | 必填     | 值变化回调     |
| mode        | `'date' \| 'time' \| 'datetime'` | `'date'` | 选择模式       |
| minimumDate | `number`                         | -        | 最小日期       |
| maximumDate | `number`                         | -        | 最大日期       |

### DateTimePickerField

额外字段：`label` / `placeholder` / `formatValue` / `rightIconName`

## 使用示例

```tsx
import {DateTimePicker, DateTimePickerField} from '@/components/DateTimePicker';

// 字段式（最常用）
<DateTimePickerField
  label="日期"
  value={timestamp}
  onChange={setTimestamp}
  mode="date"
/>

// 直接受控
<DateTimePicker value={Date.now()} onChange={setTs} mode="datetime" />
```

## 目录结构

```
DateTimePicker/
├── DateTimePicker.tsx          # 核心（直接受控）
├── DateTimePickerField.tsx     # 字段式（点击触发）
├── types.ts
├── index.ts
└── README.md
```
