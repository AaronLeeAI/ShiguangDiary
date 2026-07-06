# TopBar

> 顶部导航栏（返回 + 标题 + 右侧操作）

## 规范来源

- 详细规范：[docs/project-设计-docs/components/TopBar.md](../../../../../docs/project-设计-docs/components/TopBar.md)
- 设计 Token：[docs/project-设计-docs/docs/04_Design_System.md](../../../../../docs/project-设计-docs/docs/04_Design_System.md)

## Props

参见 `types.ts`。

## 使用示例

```tsx
import { TopBar } from '@components/TopBar';

<TopBar ...props />
```

## 状态

✅ **已实现** — 已完成可复用组件实现、类型定义与统一导出，可按当前 props 在业务页面中使用。

## 目录结构

```
TopBar/
├── TopBar.tsx        # 组件实现
├── types.ts          # 类型定义
├── styles.ts         # 样式
├── index.ts          # 入口
└── README.md         # 本文件
```
