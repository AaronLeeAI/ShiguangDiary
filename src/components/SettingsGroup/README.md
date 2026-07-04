# SettingsGroup - 设置项容器

> 包裹一组 SettingsRow，自动添加分隔线（最后一项除外）。

## 状态：✅ 已实现

## 实现要点

- 自动为子节点添加分隔线（避开最后一项）
- 可选 title（显示在卡片上方）
- 卡片样式：lg 圆角 + card 背景
- 分隔线左缩进（避开左侧 icon）

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| children | `ReactNode` | 必填 | 子节点（多个 SettingsRow） |
| title | `string` | - | 组标题 |

## 使用示例

```tsx
import {SettingsGroup} from '@/components/SettingsGroup';
import {SettingsRow} from '@/components/SettingsRow';

<SettingsGroup title="账户">
  <SettingsRow icon="profile" label="个人资料" onPress={...} />
  <SettingsRow icon="lock" label="隐私" onPress={...} />
</SettingsGroup>

<SettingsGroup>
  <SettingsRow icon="moon" label="深色模式" right={<Switch ... />} />
  <SettingsRow icon="bell" label="通知" right={<Switch ... />} />
</SettingsGroup>
```

## 目录结构

```
SettingsGroup/
├── SettingsGroup.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```