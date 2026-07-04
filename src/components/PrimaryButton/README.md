# PrimaryButton - 主操作按钮

基于 [项目设计文档](../../../docs/project-设计-docs/components/PrimaryButton.md) 实现。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 5 种 variant × 3 种 size 的组合
- 内置 loading 状态（显示 ActivityIndicator）
- 按下反馈（变深 8% + scale 0.98）
- 禁用态自动处理
- 支持 icon + 文字组合（左/右）

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| title | `string` | 必填 | 按钮文案 |
| onPress | `() => void` | 必填 | 点击回调 |
| variant | `'primary' \| 'danger' \| 'ghost' \| 'outline' \| 'disabled'` | `'primary'` | 视觉变体 |
| size | `'large' \| 'medium' \| 'small'` | `'medium'` | 尺寸 |
| loading | `boolean` | `false` | 加载态 |
| disabled | `boolean` | `false` | 是否禁用 |
| fullWidth | `boolean` | `true` | 宽度铺满 |
| icon | `ReactNode` | - | 图标 |
| iconPosition | `'left' \| 'right'` | `'left'` | 图标位置 |

## 视觉规格

- 高度：large 56dp / medium 48dp / small 36dp
- 圆角：`radius.full`（胶囊）
- 主色：`brand.primary` (`#1AAD66`)
- 字体：titleS (18sp medium) / bodyS (14sp)

## 使用示例

```tsx
import {PrimaryButton} from '@/components/PrimaryButton';
import {Icon} from '@/components/Icon';

<PrimaryButton title="保存" onPress={handleSave} />
<PrimaryButton
  title="删除日记本"
  onPress={handleDelete}
  variant="danger"
  size="large"
/>
<PrimaryButton
  title="导出"
  onPress={handleExport}
  variant="primary"
  loading={exporting}
  icon={<Icon name="export" size={20} color="white" />}
/>
```

## 目录结构

```
PrimaryButton/
├── PrimaryButton.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
