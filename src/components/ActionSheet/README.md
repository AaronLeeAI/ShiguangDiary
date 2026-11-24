# ActionSheet - 底部操作菜单

> 从底部弹出的操作列表：标题 + 操作项 + 取消按钮。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 基于 RN `Modal`（透明 + slide 动画），跨平台一致
- 标题 + 描述（可选，居中显示）
- 操作项支持 icon + label；可标记 destructive（红色）/ disabled（灰色）
- 点击操作项后自动关闭（先 onPress 再 onClose）
- 固定底部"取消"按钮
- backdropDismiss 控制点击遮罩是否关闭（默认 true）

## Props

| Prop            | 类型                | 默认值   | 说明         |
| --------------- | ------------------- | -------- | ------------ |
| visible         | `boolean`           | 必填     | 是否可见     |
| onClose         | `() => void`        | 必填     | 关闭回调     |
| title           | `string`            | -        | 标题         |
| description     | `string`            | -        | 描述         |
| items           | `ActionSheetItem[]` | 必填     | 操作列表     |
| cancelLabel     | `string`            | `'取消'` | 取消按钮文案 |
| backdropDismiss | `boolean`           | `true`   | 点击遮罩关闭 |

### ActionSheetItem

| 字段        | 类型         | 说明           |
| ----------- | ------------ | -------------- |
| key         | `string`     | 唯一标识       |
| label       | `string`     | 显示文案       |
| icon        | `IconName`   | 可选图标       |
| destructive | `boolean`    | 危险操作（红） |
| disabled    | `boolean`    | 禁用（灰）     |
| onPress     | `() => void` | 点击回调       |

## 使用示例

```tsx
import { ActionSheet } from '@/components/ActionSheet'

const [visible, setVisible] = useState(false)

;<ActionSheet
  visible={visible}
  onClose={() => setVisible(false)}
  title="日记操作"
  items={[
    { key: 'edit', label: '编辑', icon: 'edit', onPress: handleEdit },
    { key: 'share', label: '分享', icon: 'share', onPress: handleShare },
    {
      key: 'delete',
      label: '删除',
      icon: 'trash',
      destructive: true,
      onPress: handleDelete,
    },
    { key: 'move', label: '移至草稿', icon: 'save', disabled: true },
  ]}
/>
```

## 目录结构

```
ActionSheet/
├── ActionSheet.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
