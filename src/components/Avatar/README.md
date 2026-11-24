# Avatar - 头像

基于 [项目设计文档](../../../docs/project-设计-docs/components/Avatar.md) 实现。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 三种预设尺寸：large (80dp) / medium (48dp) / small (32dp)
- 支持图片源（uri 或 require）
- 无图片时回退到 name 首字 + 浅灰背景
- 圆形/方形两种形状
- 可选 editable 模式（叠加相机角标）
- 基于 hash 算法为文字头像分配稳定的背景色

## Props

| Prop     | 类型                                       | 默认值     | 说明       |
| -------- | ------------------------------------------ | ---------- | ---------- |
| source   | `{uri} \| number`                          | -          | 图片源     |
| name     | `string`                                   | -          | 文字头像   |
| size     | `'large' \| 'medium' \| 'small' \| number` | `'medium'` | 尺寸       |
| shape    | `'circle' \| 'square'`                     | `'circle'` | 形状       |
| onPress  | `() => void`                               | -          | 点击回调   |
| editable | `boolean`                                  | `false`    | 是否可编辑 |

## 使用示例

```tsx
import {Avatar} from '@/components/Avatar';

<Avatar size="large" name="小明" />  {/* 显示 "小" + 浅绿背景 */}
<Avatar source={{uri: 'https://example.com/avatar.jpg'}} size="large" />
<Avatar source={require('./assets/local-avatar.png')} size="medium" shape="square" />
<Avatar size="small" name="李" editable onPress={handleEditAvatar} />
```

## 设计原则

- 边框：2dp white（带阴影时与背景区分）
- 默认占位：人物图标 + 浅灰背景
- 加载失败：灰色底 + "?"

## 目录结构

```
Avatar/
├── Avatar.tsx
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```
