# Directory Guide

> 目录结构详解

## 根目录

```
shiguang/
├── android/              # Android 原生工程（RN 自动生成）
├── ios/                  # iOS 原生工程（RN 自动生成，预留扩展）
├── src/                  # 业务代码
├── assets/               # 静态资源
├── docs/                 # 内部开发文档
├── App.tsx               # 应用入口
├── index.js              # 注册入口
├── package.json          # 依赖管理
├── tsconfig.json         # TypeScript 配置
├── babel.config.js       # Babel 配置
├── metro.config.js       # Metro 配置
└── ...
```

## src/ 目录

### navigation/

```
navigation/
├── AppNavigator.tsx      # 导航根容器
├── types.ts              # 路由参数类型
├── routes.ts             # 路由常量重导出
├── navigation.ts         # 导航工具函数
└── index.ts              # 入口导出
```

**规则**：
- 所有跳转必须使用 `@navigation` 提供的工具函数
- 不直接调用 navigation.navigate 字符串硬编码

### screens/

每个页面独立目录：

```
screens/
└── HomeScreen/
    ├── index.tsx              # 入口
    ├── HomeScreen.tsx         # 页面组件
    ├── useHomeData.ts         # 业务 hook
    ├── components/            # 页面私有组件
    ├── types.ts
    ├── styles.ts
    └── __tests__/
```

### components/

公共组件，每个组件独立目录：

```
components/
└── DiaryCard/
    ├── DiaryCard.tsx          # 组件实现
    ├── types.ts               # Props 类型
    ├── styles.ts              # 样式
    ├── index.ts               # 入口导出
    └── README.md              # 组件说明
```

**规则**：
- 组件文件夹使用 PascalCase
- 必须包含 `index.ts` 作为入口
- 不允许在 `index.ts` 之外暴露内部文件

### theme/

```
theme/
├── colors.ts             # 颜色 Token
├── spacing.ts            # 间距 Token
├── radius.ts             # 圆角 Token
├── typography.ts         # 字体 Token
├── shadow.ts             # 阴影 Token
├── animation.ts          # 动画 Token
├── theme.ts              # 主题聚合
├── ThemeContext.tsx      # 主题 Context
└── index.ts              # 入口导出
```

### features/

按业务域拆分的功能模块：

```
features/
├── diary/
├── editor/
├── calendar/
├── search/
├── statistics/
├── settings/
├── sync/
├── attachment/
├── tag/
└── timeline/
```

每个 feature 内部结构：

```
featureName/
├── README.md
├── index.ts
├── types.ts
├── components/
├── hooks/
├── utils/
└── screens/
```

### services/api/

```
services/api/
├── client.ts             # HTTP Client
├── interceptor.ts        # 拦截器
├── request.ts            # 请求封装
├── response.ts           # 响应处理
├── repository.ts         # 数据仓储
├── service.ts            # 业务服务
└── index.ts
```

### database/

```
database/
├── config.ts             # 数据库配置
├── connection.ts         # 连接管理
├── models/               # 数据模型
├── dao/                  # 数据访问对象
├── repository/           # 仓储层
├── migration/            # 迁移脚本
└── index.ts
```

### store/

```
store/
├── diaryStore.ts         # 日记状态（后续 Task 补充）
├── notebookStore.ts
├── ...
└── index.ts              # 统一导出
```

### assets/

```
assets/
├── images/               # 图片
├── icons/                # 图标
├── svg/                  # 原始 SVG
├── font/                 # 字体
├── animations/           # Lottie 动画
└── audio/                # 音频
```

所有资源统一通过 `@assets` 引用。

### 其他目录

- **hooks/**：跨特性复用的 hooks
- **utils/**：通用工具函数
- **constants/**：常量（路由名、配置）
- **types/**：全局类型
- **providers/**：Provider 组件（如 SafeAreaProvider）
- **contexts/**：React Context
- **animations/**：可复用动画封装
- **styles/**：全局样式
- **configs/**：运行时配置
- **locales/**：国际化文案
- **permissions/**：权限管理
- **storage/**：本地存储封装（MMKV）

## 路径别名

| 别名 | 路径 |
|------|------|
| `@/*` | `src/*` |
| `@assets/*` | `assets/*` |
| `@components/*` | `src/components/*` |
| `@screens/*` | `src/screens/*` |
| `@navigation/*` | `src/navigation/*` |
| `@theme` | `src/theme/index` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |
| `@constants/*` | `src/constants/*` |
| `@types/*` | `src/types/*` |
| `@services/*` | `src/services/*` |
| `@api/*` | `src/services/api/*` |
| `@store/*` | `src/store/*` |
| `@database/*` | `src/database/*` |
| `@features/*` | `src/features/*` |

## 引用规则

1. **同目录下**：使用相对路径 `./xxx`
2. **跨目录**：使用路径别名 `@xxx/...`
3. **避免**：`../../../` 这种深层相对路径