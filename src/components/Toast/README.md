# Toast - 全局轻提示

> 不阻塞用户的简短反馈提示。Provider + Hook 模式，支持静态调用。

## 状态：✅ 已实现（P1 核心组件）

## 实现要点

- 三层架构：
  - **ToastProvider**：应用根节点挂载，维护 Toast 队列
  - **useToast**：Hook 方式在组件内调用
  - **toast（静态）**：无需 Hook，直接 `toast.success('保存成功')`
- 4 种 variant：success / error / info / warning（颜色来自 `colors.func.*`）
- 3 种 position：top（默认）/ center / bottom
- 自动消失（默认 2000ms，可通过 `duration` 自定义，`duration: 0` 表示不自动关闭）
- 支持自定义右侧 action（如"撤销"按钮）
- 全局单例：静态 `toast.xxx` 通过 `setToastHandler` 与 Provider 通信

## 安装

### 1. App 根节点包裹 Provider

```tsx
// App.tsx
import {ToastProvider} from '@/components/Toast';

export default function App() {
  return (
    <ToastProvider defaultDuration={2000} defaultPosition="top">
      {/* ... */}
    </ToastProvider>
  );
}
```

### 2. 组件中使用

```tsx
import {useToast} from '@/components/Toast';

const MyComponent = () => {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await api.save();
      toast.success('保存成功');
    } catch (e) {
      toast.error('保存失败，请重试');
    }
  };

  return <Button onPress={handleSave} title="保存" />;
};
```

### 3. 静态 API（无需 Hook）

```tsx
import {toast} from '@/components/Toast';

// 任意位置（包括工具函数中）
toast.success('操作成功');
toast.error('网络错误');
toast.warning('注意：草稿将丢失');
toast.info('已复制到剪贴板');

// 自定义选项
toast.show({
  message: '已删除',
  variant: 'success',
  duration: 3000,
  action: {
    label: '撤销',
    onPress: handleUndo,
  },
});
```

## API

### useToast / toast

| 方法 | 说明 |
|------|------|
| `show(options)` | 显示自定义 Toast |
| `success(message, options?)` | 成功提示 |
| `error(message, options?)` | 错误提示 |
| `info(message, options?)` | 信息提示 |
| `warning(message, options?)` | 警告提示 |
| `dismiss(id)` | 手动关闭指定 Toast |
| `clear()` | 关闭所有 Toast |

### ToastOptions

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| message | `string` | 必填 | 文案 |
| variant | `ToastVariant` | `'info'` | 视觉变体 |
| duration | `number` | `2000` | 持续时间(ms)，0 = 不自动关闭 |
| position | `ToastPosition` | `'top'` | 位置 |
| icon | `IconName` | 自动 | 自定义图标 |
| action | `{label, onPress}` | - | 右侧操作 |

## 目录结构

```
Toast/
├── Toast.tsx          # Provider + useToast + 静态 toast
├── ToastView.tsx      # 单条 Toast UI
├── types.ts
├── styles.ts
├── index.ts
└── README.md
```