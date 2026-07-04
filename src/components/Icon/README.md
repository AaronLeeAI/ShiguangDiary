# Icon - 图标组件

基于 [项目设计文档](../../../docs/project-设计-docs/components/Icon.md) 实现。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 基于 `react-native-svg` + 自维护的 SVG path 数据（`paths.ts`）
- 不依赖图标字体（更可控、性能更好、与设计像素级一致）
- 支持 50+ 图标的完整集合

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| name | `IconName` | 必填 | 图标名 |
| size | `IconSize \| number` | `'md'` | 预设或自定义数值 |
| color | `string` | 主题色 | 颜色覆盖 |
| variant | `'outline' \| 'filled' \| 'round'` | `'outline'` | 形态 |
| hitSlop | `number` | - | 点击热区 |
| testID | `string` | - | 测试 ID |

## 使用示例

```tsx
import {Icon} from '@/components/Icon';

<Icon name="add" />
<Icon name="check" size="lg" color={theme.colors.brand.primary} />
<Icon name="hourglass" variant="filled" />
<Icon name="camera" size={28} />
```

## 支持的图标名（部分）

- 基础操作：add, close, check, edit, delete, more, search
- 导航：back, chevronLeft/Right/Up/Down
- Tab 业务：list, book, album, profile, bookmark
- 时间/提醒：bell, clock, calendar, hourglass
- 功能：trash, settings, tune, recycle, export, share, moon, chart, crown, tag
- 多媒体：image, link, mic, camera
- 编辑器：bold, italic, underline, strikethrough, quote
- 其他：swap, location, weather, doc, save, flag

完整清单见 `paths.ts`。

## 目录结构

```
Icon/
├── Icon.tsx          # 主组件
├── paths.ts          # SVG path 数据
├── types.ts          # Props 类型
├── styles.ts         # 样式
├── index.ts          # 入口
└── README.md         # 本文件
```
