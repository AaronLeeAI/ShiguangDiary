# Coding Style

> 代码风格规范

## 1. 语言规范

- 所有业务代码使用 **TypeScript**
- 严格模式（`strict: true`）
- 避免使用 `any`；必要时使用 `unknown` + 类型守卫
- 优先使用类型推断，必要时显式声明

```typescript
// ✅ 推荐
const count = 5;
const user: User | null = await fetchUser();

// ❌ 避免
const count: any = 5;
```

## 2. 命名规范

### 2.1 文件命名

| 类型 | 命名 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `DiaryCard.tsx` |
| Hook | camelCase | `useTheme.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量 | camelCase 或 UPPER_SNAKE | `routes.ts`, `APP_CONFIG.ts` |
| 类型定义 | camelCase | `types.ts`, `models.ts` |
| 样式 | camelCase | `styles.ts` |

### 2.2 标识符命名

| 类型 | 命名风格 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `DiaryCard` |
| 类型/接口 | PascalCase | `DiaryCardProps`, `User` |
| 函数/方法 | camelCase | `handlePress`, `getUserById` |
| 变量 | camelCase | `isLoading`, `userName` |
| 常量 | UPPER_SNAKE_CASE 或 camelCase | `MAX_LENGTH`, `routes` |
| 枚举 | PascalCase | `ThemeMode` |
| 私有前缀 | `_` | `_handlePress` |

### 2.3 布尔变量前缀

- `is*` - 状态：`isLoading`, `isVisible`
- `has*` - 拥有：`hasError`, `hasPermission`
- `should*` - 应该：`shouldUpdate`, `shouldRender`
- `can*` - 可以：`canEdit`, `canDelete`

## 3. 注释规范

### 3.1 文件头注释

每个文件顶部添加说明：

```typescript
/**
 * 文件名
 *
 * 文件职责简述
 */
```

### 3.2 函数注释

公开函数必须添加 JSDoc：

```typescript
/**
 * 获取用户信息
 *
 * @param userId 用户 ID
 * @returns 用户对象，未找到时返回 null
 */
async function getUserById(userId: string): Promise<User | null> {
  // ...
}
```

### 3.3 复杂逻辑注释

使用行内注释解释**为什么**，而不是**是什么**：

```typescript
// 推荐：解释原因
// 同一秒内的多次更新需要去重，避免闪屏
const debouncedUpdate = debounce(updateFn, 1000);

// 避免：翻译代码
// 设置 loading 为 false
setLoading(false);
```

## 4. 导入顺序

```typescript
// 1. React/React Native
import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';

// 2. 第三方库
import {NavigationContainer} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';

// 3. 内部别名
import {useTheme} from '@theme';
import {apiClient} from '@api';

// 4. 相对路径
import {Component} from './Component';
import styles from './styles';

// 5. 类型导入（放最后）
import type {DiaryCardProps} from './types';
```

> 由 `eslint-plugin-import` 或 IDE 自动排序。

## 5. 函数与组件

### 5.1 函数大小

- 单个函数不超过 **50 行**
- 嵌套不超过 **3 层**

### 5.2 组件拆分

- 单个组件 JSX 不超过 **300 行**
- 复杂 UI 必须拆分为子组件

### 5.3 默认导出与具名导出

```typescript
// ✅ 推荐：具名导出 + 默认导出
export const DiaryCard: React.FC<Props> = (...) => ...;
export default DiaryCard;

// 避免：仅默认导出
export default (...) => ...;
```

## 6. 错误处理

### 6.1 异步错误

```typescript
// ✅ 推荐：使用 try-catch
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  showErrorToast('加载失败');
}
```

### 6.2 类型化错误

```typescript
class AppError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

## 7. 性能实践

- 列表组件必须使用 `keyExtractor`
- 大列表使用 `FlashList`
- 图片使用 `FastImage`
- 避免在渲染中创建新对象
- `useMemo` / `useCallback` 谨慎使用

## 8. 国际化

- 用户可见文案必须从 `locales/` 引入（预留）
- 禁止硬编码用户可见的中文字符串
- 例外：注释、日志、调试代码

## 9. 测试

- 工具函数必须有单元测试
- 关键组件必须有渲染测试
- 测试覆盖率目标：**80%+**

## 10. 工具支持

- Prettier 自动格式化
- ESLint 代码检查
- TypeScript 类型检查
- IDE：VS Code 推荐