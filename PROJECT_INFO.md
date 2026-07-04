/**
 * 拾光日记 - 项目介绍
 *
 * 拾光日记是一款专注于「安静记录」的 Android 日记应用。
 * 项目基于 React Native + TypeScript 构建。
 *
 * ## 核心理念
 *
 * - **极简留白**：靠空间分层，不靠线条
 * - **主色克制**：绿色仅用于关键操作与强调
 * - **图标语言统一**：线性 outline，圆角收尾，2dp 笔触
 * - **内容优先**：80% 面积给内容，工具下沉
 *
 * ## 项目结构
 *
 * ```
 * shiguang/
 * ├── README.md
 * ├── package.json
 * ├── tsconfig.json
 * ├── App.tsx
 * ├── index.js
 * │
 * ├── android/              # Android 原生工程
 * │
 * ├── src/
 * │   ├── navigation/       # 导航配置
 * │   ├── screens/          # 页面（一级）
 * │   ├── components/       # 公共组件
 * │   ├── theme/            # 主题系统
 * │   ├── hooks/            # 自定义 hooks
 * │   ├── providers/        # Provider 组件
 * │   ├── contexts/         # React Context
 * │   ├── services/         # 业务服务
 * │   │   ├── api/         # API 客户端
 * │   │   ├── storage/     # 本地存储
 * │   │   └── ...
 * │   ├── database/         # 数据库层
 * │   ├── store/            # 状态管理
 * │   ├── utils/            # 工具函数
 * │   ├── constants/        # 常量
 * │   ├── types/            # 类型定义
 * │   ├── features/         # 功能模块
 * │   │   ├── diary/
 * │   │   ├── editor/
 * │   │   ├── calendar/
 * │   │   ├── search/
 * │   │   ├── statistics/
 * │   │   ├── settings/
 * │   │   ├── sync/
 * │   │   ├── attachment/
 * │   │   ├── tag/
 * │   │   └── timeline/
 * │   ├── animations/       # 动画
 * │   ├── configs/          # 配置
 * │   ├── locales/          # 国际化
 * │   └── permissions/      # 权限管理
 * │
 * └── assets/
 *     ├── images/           # 图片
 *     ├── icons/            # 图标
 *     ├── svg/              # SVG
 *     ├── font/             # 字体
 *     ├── animations/       # Lottie 动画
 *     └── audio/            # 音频
 * ```
 *
 * ## 快速开始
 *
 * ### 环境要求
 *
 * - Node.js >= 18
 * - Android SDK (API 21+)
 * - JDK >= 17
 *
 * ### 安装依赖
 *
 * ```bash
 * npm install
 * ```
 *
 * ### 运行（Android）
 *
 * ```bash
 * npm run android
 * ```
 *
 * ### 类型检查
 *
 * ```bash
 * npm run typecheck
 * ```
 *
 * ### 代码检查
 *
 * ```bash
 * npm run lint
 * npm run lint:fix
 * ```
 *
 * ### 格式化
 *
 * ```bash
 * npm run format
 * ```
 *
 * ## 开发规范
 *
 * - 详细规范请参考 [docs/development/](docs/development/)
 * - 遵循 [docs/project-设计-docs/](docs/project-设计-docs/) 设计系统
 *
 * ## 文档引用
 *
 * - [项目设计文档](docs/project-设计-docs/)
 * - [APK 分析文档](docs/apk-analysis-docs/)
 * - [开发规范](docs/development/)
 * - [AI 开发规范](docs/ai/)
 *
 * ## 许可证
 *
 * MIT License
 */