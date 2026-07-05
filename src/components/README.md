# Shared Component Library

Project: 拾光日记（Shiguang Diary）

Last Updated: 2026-07-04

---

## Purpose

本目录包含应用所有公共 UI 组件。所有页面必须使用此目录下的组件，不允许重复实现。

---

## Usage

```ts
import { PrimaryButton, Icon, Avatar } from '@components'
```

禁止使用相对路径：

```ts
// ✗ 错误
import { PrimaryButton } from '../../components/PrimaryButton'
```

---

## Inventory

### Layout

| Component | Status | Notes               |
| --------- | ------ | ------------------- |
| Screen    | ✓      | 全屏容器 + SafeArea |
| Divider   | ✓      | 分割线              |

### Button

| Component            | Status | Notes        |
| -------------------- | ------ | ------------ |
| PrimaryButton        | ✓      | 主操作按钮   |
| IconButton           | ✓      | 图标按钮     |
| FloatingActionButton | ✓      | 悬浮操作按钮 |
| TextButton           | ✓      | 文字按钮     |

### Input

| Component      | Status | Notes        |
| -------------- | ------ | ------------ |
| TextField      | ✓      | 单行输入     |
| TextArea       | ✓      | 多行输入     |
| PasswordInput  | ✓      | 密码输入     |
| SearchBar      | ✓      | 搜索栏       |
| Checkbox       | ✓      | 复选框       |
| Switch         | ✓      | 开关         |
| DateTimePicker | ✓      | 日期时间选择 |
| PasswordInput  | TODO   | 密码输入     |
| RadioGroup     | ✓      | 单选组       |

### Display

| Component    | Status | Notes                  |
| ------------ | ------ | ---------------------- |
| Icon         | ✓      | 40+ SVG 图标，主题感知 |
| Avatar       | ✓      | 头像                   |
| Tag          | ✓      | 标签                   |
| EmptyState   | ✓      | 空状态                 |
| Loading      | ✓      | 加载状态               |
| Skeleton     | ✓      | 骨架屏                 |
| TabItem      | ✓      | Tab 单项               |
| BottomTabBar | ✓      | 底部 Tab 栏            |
| TopBar       | ✓      | 顶部导航栏             |
| Calendar     | ✓      | 日历                   |

### Feedback

| Component      | Status | Notes                         |
| -------------- | ------ | ----------------------------- |
| Toast          | ✓      | 轻提示                        |
| BottomSheet    | ✓      | 底部弹层                      |
| ActionSheet    | ✓      | 操作列表                      |
| AlertDialog    | ✓      | 警告弹窗                      |
| Modal          | ✓      | 模态框                        |
| PressableScale | Done   | Press scale + haptic feedback |
| LoadingOverlay | ✓      | 全局加载遮罩                  |

---

## Component Conventions

每个组件遵循统一目录结构：

```
ComponentName/
├── ComponentName.tsx   # 组件实现
├── types.ts            # Props + 类型导出
├── styles.ts           # StyleSheet
├── index.ts            # 桶导出
└── README.md           # 组件文档
```

### Rules

1. **TypeScript Strict**：所有 Props 必须有类型，禁止 `any`。
2. **Theme-only**：颜色、字号、间距、圆角、阴影 全部来自 Theme。
3. **Composition**：组件可组合，禁止大而全的 Monolith。
4. **No business logic**：组件不调用 store / API / navigation。
5. **PascalCase**：组件名使用 PascalCase，禁止缩写。
6. **Reusability**：组件跨页面通用，禁止业务命名（HomeButton、CalendarCard）。
7. **Assets from `@assets`**：图标使用 `@components/Icon`，图片使用 `@assets`。

---

## Adding a New Component

1. 在 `src/components/` 下新建组件目录，遵循标准结构。
2. 实现组件 + types + styles。
3. 在 `src/components/index.ts` 中 export。
4. 在本文档 Inventory 中添加一行。
5. Commit 格式：`Task04: add <ComponentName>`。

### Checklist

- [ ] Props 类型完整，无 `any`
- [ ] 颜色 / 字号 / 间距 / 圆角 / 阴影 全部来自 Theme
- [ ] README.md 含用法示例
- [ ] index.ts 已 export
- [ ] TypeScript 编译通过

---

## References

- 设计规范：`docs/project-设计-docs/components/`
- Design System：`docs/project-设计-docs/docs/04_Design_System.md`
- 命名规范：`docs/assets/NamingConvention.md`
