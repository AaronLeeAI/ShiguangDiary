# SettingsRow - 单行设置项

> 设置菜单中的单行项：左侧 icon + 中间 label + 右侧 hint/chevron/right。

## 状态：✅ 已实现

## 实现要点

- 三段式布局：左 icon | 中 label（弹性） | 右 hint/right/chevron
- 支持 `right` 自定义内容（Switch / Badge 等），与 chevron 互斥
- destructive 样式：label + icon 变 danger 色
- disabled 样式：opacity 0.5 + labelDisabled 色
- 按下态：subtle 灰背景
- 无障碍：accessibilityRole="button" + accessibilityState.disabled
- 颜色/间距/字号严格来自 @theme

## Props

| Prop        | 类型         | 默认值  | 说明             |
| ----------- | ------------ | ------- | ---------------- |
| icon        | `IconName`   | -       | 左侧图标         |
| label       | `string`     | 必填    | 标签             |
| hint        | `string`     | -       | 右侧副文本       |
| right       | `ReactNode`  | -       | 右侧自定义内容   |
| showArrow   | `boolean`    | `true`  | 显示右侧 chevron |
| disabled    | `boolean`    | `false` | 禁用             |
| destructive | `boolean`    | `false` | 危险项           |
| onPress     | `() => void` | -       | 点击回调         |

## 使用示例

```tsx
import {SettingsRow} from '@/components/SettingsRow';

<SettingsRow icon="recycle" label="回收站" onPress={handleOpen} />

<SettingsRow icon="delete" label="清空所有数据" destructive onPress={handleClear} />

<SettingsRow icon="bell" label="提醒" right={<Switch value={on} onValueChange={setOn} />} showArrow={false} />
```

## 目录结构

```
SettingsRow/
├── SettingsRow.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
