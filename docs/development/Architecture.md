# Architecture

> 拾光日记 - 整体架构说明

## 1. 分层架构

```
┌─────────────────────────────────────────────────────┐
│ UI Layer（screens, components, dialogs）            │
│   - React 组件 + Hooks                              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│ State Layer（store, contexts, providers）           │
│   - Zustand stores                                  │
│   - React Query                                     │
│   - React Context                                   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│ Service Layer（services/api, services/storage）     │
│   - Repository / Service 业务逻辑                    │
│   - 跨域业务封装                                     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│ Data Layer（database, storage, network）            │
│   - SQLite DAO / Repository                         │
│   - MMKV / AsyncStorage                             │
│   - Axios HTTP Client                               │
└─────────────────────────────────────────────────────┘
```

## 2. 单向数据流

```
User Action
   ↓
Component (event handler)
   ↓
Store / API (state update)
   ↓
Component (re-render via hook)
   ↓
View
```

## 3. 关键设计决策

### 3.1 状态管理分层

- **服务端状态**（cache、失效、重试）→ React Query
- **客户端全局状态**（用户、偏好、当前 Tab）→ Zustand
- **局部状态**（UI 状态、表单值）→ React useState
- **跨组件共享状态**（主题）→ React Context

### 3.2 数据持久化

- **结构化数据**（日记、日记本、相册）→ SQLite
- **键值数据**（token、偏好、草稿）→ MMKV
- **大文件**（图片、附件）→ 文件系统 (RNFS)

### 3.3 路由方案

- **根路由**：NativeStack
  - 支持系统级返回和转场动画
- **Tab 路由**：BottomTabs
  - 保持 Tab 内 stack 状态
- **Modal**：作为 NativeStack 屏幕
  - 透明背景 + 自实现弹层

### 3.4 主题方案

- **静态 Token**：单文件导出
- **动态切换**：通过 Context 切换 light/dark
- **响应式**：通过 `useTheme()` Hook 访问
- **持久化**：用户偏好通过 Zustand store 保存

## 4. 模块依赖关系

```
navigation → screens → components → theme
                 ↓
            features → services → api → database → storage
                          ↓
                         store
```

**严禁**：循环依赖。引用顺序：theme → components → features → screens → navigation。

## 5. 关键技术选型

| 用途   | 选型                           |
| ------ | ------------------------------ |
| 框架   | React Native 0.76+             |
| 语言   | TypeScript 5.x                 |
| 导航   | React Navigation 7.x           |
| 状态   | Zustand + React Query          |
| 存储   | SQLite + MMKV                  |
| 动画   | Reanimated 3.x                 |
| 表单   | 业务内部封装（不引入 form 库） |
| 富文本 | react-native-pell-rich-editor  |
| 图标   | react-native-vector-icons      |

## 6. 性能策略

- 长列表使用 `FlashList` 替代 `FlatList`
- 必填 `keyExtractor`、`estimatedItemSize`
- 动画统一使用 `useNativeDriver: true`
- 图片使用 `react-native-fast-image`
- 启动期 lazy 加载非关键 bundle

## 7. 安全策略

- 敏感数据（token）使用 MMKV 加密存储
- 不在日志中输出敏感信息
- 加密日记使用单独加密表存储

## 8. 测试策略

- 工具函数：Jest 单元测试
- 组件：React Native Testing Library
- 流程：手动测试 + 关键路径 E2E

## 9. 持续集成

- ESLint + Prettier 强制检查
- TypeScript 严格模式编译
- PR 模板强制填写变更说明
