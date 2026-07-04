# 拾光日记 (Shiguang Diary)

> 安静地记录每一天。

**拾光日记** 是一款基于 React Native + TypeScript 的 Android 日记应用。
项目当前处于 **Task 1：Foundation** 阶段，仅完成工程基础设施搭建，不含任何页面/业务实现。

---

## 📖 文档导航

| 文档 | 说明 |
|------|------|
| [PROJECT_INFO.md](./PROJECT_INFO.md) | 项目架构 + 目录结构说明 |
| [docs/development/Architecture.md](./docs/development/Architecture.md) | 整体架构 |
| [docs/development/DirectoryGuide.md](./docs/development/DirectoryGuide.md) | 目录详解 |
| [docs/development/CodingStyle.md](./docs/development/CodingStyle.md) | 代码风格 |
| [docs/development/NamingConvention.md](./docs/development/NamingConvention.md) | 命名约定 |
| [docs/development/ComponentConvention.md](./docs/development/ComponentConvention.md) | 组件规范 |
| [docs/development/ImportConvention.md](./docs/development/ImportConvention.md) | 导入规范 |
| [docs/development/ReactNativeConvention.md](./docs/development/ReactNativeConvention.md) | RN 规范 |
| [docs/ai/ClaudeCodeGuide.md](./docs/ai/ClaudeCodeGuide.md) | Claude Code 开发指南 |
| [docs/ai/DevelopmentWorkflow.md](./docs/ai/DevelopmentWorkflow.md) | 开发工作流 |
| [docs/ai/TaskConvention.md](./docs/ai/TaskConvention.md) | Task 约定 |
| [docs/ai/ReviewChecklist.md](./docs/ai/ReviewChecklist.md) | Review 检查清单 |
| [docs/ai/PromptConvention.md](./docs/ai/PromptConvention.md) | Prompt 约定 |

外部设计参考：
- `D:/my dev/docs/project-设计-docs/` — 设计文档（页面/组件/交互/动画）
- `D:/my dev/docs/apk-analysis-docs/` — APK 拆解分析

---

## 🚀 快速开始

### 环境要求

- Node.js **>= 18**
- npm 或 yarn
- Android Studio (含 Android SDK Platform 33+)
- JDK 17
- React Native CLI（通过 `npx` 调用）

### 安装依赖

```bash
cd ShiguangDiary
npm install
```

### 运行（Android）

```bash
# 终端 1：启动 Metro
npm start

# 终端 2：构建并运行 Android
npm run android
```

### 类型检查 / Lint / 格式化

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run lint:fix      # 自动修复
npm run format        # Prettier
```

### 测试

```bash
npm test              # Jest
npm run test:watch    # Watch 模式
npm run test:coverage # 覆盖率
```

---

## 📦 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React Native 0.76.5 |
| 语言 | TypeScript 5.0.4 |
| 导航 | @react-navigation v7 |
| 状态管理 | Zustand 5 + @tanstack/react-query 5 |
| 存储 | react-native-sqlite-storage + react-native-mmkv |
| 动画 | react-native-reanimated 3 |
| 手势 | react-native-gesture-handler |
| 列表 | @shopify/flash-list |
| 图片 | react-native-fast-image |
| 富文本 | react-native-pell-rich-editor |

完整依赖见 `package.json`。

---

## 📁 目录速览

```
ShiguangDiary/
├── android/                # Android 原生工程
├── ios/                    # iOS 原生工程（预留扩展）
├── assets/                 # 静态资源
├── src/
│   ├── assets/             # 资源索引
│   ├── navigation/         # 路由
│   ├── screens/            # 页面（待实现）
│   ├── components/         # 公共组件（41 个骨架）
│   ├── theme/              # 设计 Token 系统
│   ├── hooks/              # 自定义 Hooks
│   ├── providers/          # Provider 组件
│   ├── contexts/           # React Context
│   ├── services/           # 业务服务
│   │   └── api/            # 网络层
│   ├── database/           # SQLite 数据层
│   ├── store/              # Zustand 状态
│   ├── utils/              # 工具
│   ├── constants/          # 常量
│   ├── types/              # 类型
│   ├── features/           # 10 个业务 Feature
│   ├── animations/         # 动画封装
│   ├── configs/            # 运行时配置
│   ├── locales/            # 国际化
│   └── permissions/        # 权限管理
├── docs/
│   ├── development/        # 开发规范
│   └── ai/                 # AI 开发规范
├── App.tsx                 # 应用入口
├── index.js                # 注册入口
├── tsconfig.json           # TypeScript 配置
├── babel.config.js         # Babel 配置
├── metro.config.js         # Metro 配置
├── package.json            # 依赖
└── README.md               # 本文件
```

---

## 🎨 Design Foundation

**所有 Theme、颜色、字体、间距、阴影、动画** 严格遵循 [`docs/project-设计-docs/docs/04_Design_System.md`](D:/my dev/docs/project-设计-docs/docs/04_Design_System.md) 和 [`docs/project-设计-docs/docs/08_Animation.md`](D:/my dev/docs/project-设计-docs/docs/08_Animation.md)。

主色：`#1AAD66`（拾光日记绿）

详见 `src/theme/` 下各 Token 文件。

---

## 🤖 AI 协作

本项目遵循统一的 AI 开发规范（见 `docs/ai/`）。
所有由 Claude Code 执行的 Task 必须符合：
- **TaskConvention** — 任务边界
- **DevelopmentWorkflow** — 开发工作流
- **ReviewChecklist** — Review 检查清单
- **PromptConvention** — Prompt 风格

---

## 📐 开发规范

详见 [`docs/development/`](./docs/development/)，所有 AI 生成的代码必须严格遵守。

---

## 📜 License

MIT License © 2026 拾光日记 Team