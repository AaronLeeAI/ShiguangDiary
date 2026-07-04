# Import Convention

> 导入路径规范

## 1. 路径别名

| 别名 | 路径 |
|------|------|
| `@/*` | `src/*` |
| `@assets` | `assets/index` |
| `@assets/*` | `assets/*` |
| `@components` | `src/components/index` |
| `@components/*` | `src/components/*` |
| `@screens/*` | `src/screens/*` |
| `@navigation` | `src/navigation/index` |
| `@theme` | `src/theme/index` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |
| `@constants/*` | `src/constants/*` |
| `@types/*` | `src/types/*` |
| `@services/*` | `src/services/*` |
| `@api` | `src/services/api/index` |
| `@store` | `src/store/index` |
| `@database` | `src/database/index` |
| `@features/*` | `src/features/*` |

## 2. 导入顺序

```typescript
// 1. 外部：Node 标准库
// （通常不使用）

// 2. 外部：React / React Native
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// 3. 外部：第三方库
import {observer} from 'mobx-react-lite';
import {NavigationContainer} from '@react-navigation/native';
import axios from 'axios';

// 4. 内部：路径别名
import {useTheme} from '@theme';
import {apiClient} from '@api';
import type {DiaryCardProps} from '@types';

// 5. 内部：相对路径
import {SubComponent} from './SubComponent';
import {styles} from './styles';

// 6. 类型导入
import type {RootStackParamList} from '@navigation/types';
```

每组之间空一行。

## 3. 命名导入 vs 默认导入

```typescript
// ✅ 推荐：具名导入
import {View, Text} from 'react-native';
import {useTheme} from '@theme';

// 默认导入（仅用于组件）
import DiaryCard from '@components/DiaryCard';
```

## 4. 类型导入

使用 `import type` 隔离类型导入：

```typescript
import type {ReactNode} from 'react';
import type {DiaryCardProps} from './types';
```

或使用内联类型：

```typescript
import {type ReactNode} from 'react';
```

## 5. 循环依赖

### 5.1 检测

TypeScript / ESLint 可自动检测循环依赖。

### 5.2 解决

- 抽离公共类型到独立文件
- 使用 `import type` 解耦类型引用
- 重新组织模块结构

## 6. 避免

```typescript
// ❌ 深层相对路径
import {Foo} from '../../../components/Foo';

// ❌ 整个库导入
import * as React from 'react';

// ❌ 重名导入但不重命名
import {Foo} from '@components/Foo';
import {Foo as Foo2} from '@components/Foo2';
```

## 7. 自动排序

推荐使用 ESLint 插件：

```json
{
  "plugins": ["import"],
  "rules": {
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        ["parent", "sibling", "index"]
      ]
    }]
  }
}
```