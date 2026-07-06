# Switch

> 开关

## 规范来源

- 详细规范：[docs/project-设计-docs/components/Switch.md](../../../../../docs/project-设计-docs/components/Switch.md)
- 设计 Token：[docs/project-设计-docs/docs/04_Design_System.md](../../../../../docs/project-设计-docs/docs/04_Design_System.md)

## Props

参见 `types.ts`。

## 使用示例

```tsx
import { Switch } from '@components/Switch';

<Switch ...props />
```

## 状态

✅ **已实现** — 已完成可复用组件实现、类型定义与统一导出，可按当前 props 在业务页面中使用。

## 目录结构

```
Switch/
├── Switch.tsx        # 组件实现
├── types.ts          # 类型定义
├── styles.ts         # 样式
├── index.ts          # 入口
└── README.md         # 本文件
```
