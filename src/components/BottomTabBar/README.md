# BottomTabBar - 底部 Tab 导航栏

> 底部 4-Tab 导航：Home（日记）/ Notebook（日记本）/ Album（相册）/ Profile（我的）

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 4 个 Tab：Home / Notebook / Album / Profile（与 `RootStackParamList.TabParamList` 对齐）
- 支持两种使用模式：
  - **受控模式**：传入 `currentTab` + `onTabPress`，由外部 navigation 驱动
  - **非受控模式**：传入 `defaultTab`，组件内部维护状态（适合预览/Storybook）
- 激活态：图标切换为 filled 变体（listActive/bookActive/albumActive/profileActive）+ 文字色变绿
- 触控反馈：`pressed` 状态 opacity 0.6 + hitSlop=8 扩展点击区
- 无障碍：`accessibilityRole="button"` + `accessibilityState.selected`

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| currentTab | `BottomTabName` | - | 受控激活态 |
| onTabPress | `(tab) => void` | - | Tab 点击回调 |
| defaultTab | `BottomTabName` | `'Home'` | 非受控默认 Tab |
| tabs | `BottomTabConfig[]` | `BOTTOM_TABS` | 自定义 Tab 列表 |
| testID | `string` | - | 测试 ID |
| style | `ViewStyle` | - | 样式覆盖 |

## 类型

```typescript
type BottomTabName = 'Home' | 'Notebook' | 'Album' | 'Profile';
```

## 使用示例

### 受控模式（推荐 - 与 React Navigation 配合）

```tsx
import {BottomTabBar} from '@/components/BottomTabBar';

<BottomTabBar
  currentTab={currentTab}
  onTabPress={(tab) => navigation.navigate(ROUTES.MAIN_TABS, {screen: tab})}
/>
```

### 非受控模式

```tsx
<BottomTabBar defaultTab="Home" onTabPress={(tab) => console.log(tab)} />
```

### 与 BottomTabBar 整合到 Tab Navigator

修改 `AppNavigator.tsx`，把 `MainTabs` 中的 Tab.Screen 的 `tabBar` prop 替换为本组件：

```tsx
<Tab.Screen
  name={ROUTES.HOME}
  component={Home}
  options={{
    tabBar: () => (
      <BottomTabBar
        currentTab={getCurrentTab()}
        onTabPress={(tab) => navigation.navigate(...)}
      />
    ),
  }}
/>
```

## 目录结构

```
BottomTabBar/
├── BottomTabBar.tsx       # 主组件
├── types.ts               # 类型 + BOTTOM_TABS 配置
├── styles.ts              # 样式
├── index.ts               # 入口
└── README.md              # 本文件
```