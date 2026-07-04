# Loading - 加载状态

基于 [项目设计文档](../../../docs/project-设计-docs/components/Loading.md) 实现。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 三种 variant：full / dialog / inline
- 独立 Spinner 组件（基于 react-native-reanimated + react-native-svg）
- 弧形旋转动画（1000ms一圈，无限循环）
- dialog 模式下支持背景遮罩 + 点击关闭（backdropDismiss）

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| variant | `'full' \| 'dialog' \| 'inline'` | 必填 | 加载形态 |
| visible | `boolean` | - | 是否显示 |
| text | `string` | - | 提示文案 |
| iconSize | `number` | 24 | 旋转图标尺寸 |
| backdropDismiss | `boolean` | `false` | 点击背景是否关闭（dialog） |
| onDismiss | `() => void` | - | 关闭回调（dialog + backdropDismiss） |

## 三种形态

### full（全屏）
用于 P001 开屏、内容加载：
- 全屏居中
- 64dp 旋转图标
- 可选 title + subtext

### dialog（弹窗）
用于会员中心加载等：
- 半透明黑色背景遮罩
- 居中 80dp 白色圆角弹窗
- 24dp 旋转图标 + 文字

### inline（内联）
用于按钮内或固定区域：
- 仅渲染图标（父组件控制容器）

## 使用示例

```tsx
import {Loading} from '@/components/Loading';

<Loading variant="full" visible={!ready} />

<Loading
  variant="dialog"
  visible={loadingVip}
  text="正在加载..."
  backdropDismiss
  onDismiss={() => setLoadingVip(false)}
/>

// 按钮内 inline
<PrimaryButton
  title="保存"
  onPress={handleSave}
  loading={saving}
/>

// 独立使用 Spinner
import {Spinner} from '@/components/Loading';
<Spinner size={20} />
```

## 目录结构

```
Loading/
├── Loading.tsx
├── Spinner.tsx        # 独立 Spinner 组件
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
