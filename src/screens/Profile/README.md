# Profile Screen - P004 个人中心

> 用户中心：头像 + 用户信息 + 数据统计 + 设置菜单。

## 状态：✅ 已实现（mock 数据）

## 实现要点

- TopBar：标题"我的"
- 用户卡片：Avatar + 名称 + 简介 + 编辑按钮
- 统计栏：3 项（日记 / 日记本 / 相册）
- 菜单组（3 组）：
  - **第 1 组**：回收站、草稿箱、数据统计
  - **第 2 组**：深色模式、偏好设置、列表样式、主题背景
  - **第 3 组**：导出与备份、关于
- 每项：左侧图标 + 中间文字 + 右侧 chevron 箭头
- 点击菜单项：跳转到对应路由（route 名）
- 底部 BottomTabBar（currentTab="Profile"）

## 整合的组件

| 组件 | 用途 |
|------|------|
| TopBar | 头部 |
| Avatar | 用户头像 |
| Icon | 各菜单图标 + chevron |
| BottomTabBar | Tab 切换 |

## 数据结构

```typescript
interface ProfileMenuItem {
  key: string;
  label: string;
  icon: IconName;
  hint?: string;
  route?: keyof RootStackParamList;
  showArrow?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}
```

## 目录结构

```
screens/Profile/
├── ProfileScreen.tsx
├── styles.ts
├── types.ts
├── index.ts
└── README.md
```

## 后续 TODO

1. 接入用户数据（替换 mock stats / name）
2. SettingsRow 组件（当前用 Pressable+Icon+Text 内联实现）
3. 关于 / 回收站 / 草稿箱 等二级页面