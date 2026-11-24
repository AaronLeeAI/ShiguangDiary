# 拾光日记 (Shiguang Diary)

> 安静地记录每一天。

**拾光日记** 是一款基于 React Native + TypeScript 的 Android 日记应用。

Current release: **v1.0.0-rc.1**  
Current milestone: **Task19 — Release Candidate & Final QA**

---

## Release Candidate Status

Task19 已完成自动化/静态 QA 与 Release Candidate 构建验证：

- Jest: `6` suites / `57` tests passed
- TypeScript: `tsc --noEmit` passed
- ESLint: `0` errors（现存 warnings 作为非阻塞遗留债务记录）
- Android release build: `assembleRelease` passed
- APK metadata: `com.shiguangdiary`, `versionName=1.0.0-rc.1`, label `拾光日记`
- APK signature verification: passed for RC debug-key artifact

RC APK:

```text
android/app/build/outputs/apk/release/app-release.apk
SHA-256: 43A42C620775EC0AD149D17AF1CE06B0652FECB52FB42DED3C451DEAC7DE91C8
```

> Production note: `v1.0.0-rc.1` is an internal RC artifact signed with the debug keystore. Final `v1.0.0` must be signed with a private release keystore and smoke-tested on an Android device.

---

## Features

- Home diary timeline and diary view/edit flows
- Notebook and album organization basics
- Search and statistics modules
- Calendar/timeline utility foundation
- Settings, preferences, dark mode, about, profile
- Local-first persistence with SQLite + MMKV
- JSON backup/export, integrity checking, and sync-provider abstraction
- Shared component library, design tokens, motion/haptics wrappers

Some future-facing entries are intentionally disabled in the RC UI and marked `敬请期待`.

---

## Documentation

| Document                                                                     | Purpose                             |
| ---------------------------------------------------------------------------- | ----------------------------------- |
| [PROJECT_INFO.md](./PROJECT_INFO.md)                                         | Architecture and directory overview |
| [docs/RELEASE_NOTES_v1.0.0.md](./docs/RELEASE_NOTES_v1.0.0.md)               | RC release notes                    |
| [docs/FINAL_QA_REPORT_Task19.md](./docs/FINAL_QA_REPORT_Task19.md)           | Final QA evidence and verdict       |
| [docs/REGRESSION_REPORT_Task19.md](./docs/REGRESSION_REPORT_Task19.md)       | Regression report                   |
| [docs/PIXEL_PERFECT_REPORT_Task19.md](./docs/PIXEL_PERFECT_REPORT_Task19.md) | Pixel/UI consistency review         |
| [docs/ACCESSIBILITY_REPORT_Task19.md](./docs/ACCESSIBILITY_REPORT_Task19.md) | Accessibility baseline review       |
| [docs/SECURITY_REVIEW_Task19.md](./docs/SECURITY_REVIEW_Task19.md)           | Security/permission review          |
| [docs/RELEASE_BUILD_Task19.md](./docs/RELEASE_BUILD_Task19.md)               | Release build details               |
| [docs/reports/PROJECT_POSTMORTEM.md](./docs/reports/PROJECT_POSTMORTEM.md)   | Project postmortem                  |
| [docs/development/Architecture.md](./docs/development/Architecture.md)       | Architecture details                |
| [docs/development/CodeQuality.md](./docs/development/CodeQuality.md)         | 代码质量体系与门禁说明              |
| [docs/ai/DevelopmentWorkflow.md](./docs/ai/DevelopmentWorkflow.md)           | AI development workflow             |

External source-of-truth references:

- `D:/my dev/docs/PROJECT_PLAN.md`
- `D:/my dev/docs/tasks/Task19.md`
- `D:/my dev/docs/project-设计-docs/`
- `D:/my dev/docs/apk-analysis-docs/`

---

## Quick Start

### Requirements

- Node.js >= 18
- npm
- Android Studio / Android SDK
- JDK 17
- React Native CLI via `npx`

### Install

```bash
npm install
```

### Run Android Debug Build

```bash
npm start
npm run android
```

### Quality Gates

本地一条命令跑完全部门禁（与 CI 完全一致）：

```bash
npm run verify
```

拆开看：

```bash
npm run lint          # ESLint 10 flat config
npm run typecheck     # tsc --noEmit（strict）
npm run format:check  # Prettier 3
npm run test          # Jest
npm run test:ci       # 串行 + 覆盖率（CI 用）
```

提交时由 husky 自动执行 `lint-staged`（暂存文件 `eslint --fix` + `prettier --write`）
和 `commitlint`（Conventional Commits）。CI 见 `.github/workflows/ci.yml`：
`lint → typecheck → format:check → jest(coverage)`，外加一个 `react-native bundle`
冒烟 job，用来验证 JS 依赖图完整、不依赖原生构建。

详见 [docs/development/CodeQuality.md](./docs/development/CodeQuality.md)。

### Release Candidate Build

```powershell
cd android
.\gradlew.bat assembleRelease --no-daemon
```

---

## Tech Stack

| Area        | Selection                      |
| ----------- | ------------------------------ |
| Framework   | React Native 0.76.5            |
| Language    | TypeScript 5.9.3（strict）     |
| Navigation  | React Navigation 7             |
| State       | Zustand 5 + TanStack Query 5   |
| Storage     | SQLite + MMKV + RNFS           |
| Animation   | Reanimated 3 + gesture-handler |
| Lists       | FlashList                      |
| Images      | FastImage                      |
| Rich editor | react-native-pell-rich-editor  |
| Lint        | ESLint 10（flat config）       |
| Format      | Prettier 3                     |
| Git hooks   | husky 9 + lint-staged 17       |
| CI          | GitHub Actions + Dependabot    |

---

## Architecture Snapshot

```text
src/
├── animations/     # Motion/haptic wrappers
├── assets/         # Asset index
├── components/     # Shared UI component library
├── constants/      # App/routes constants
├── contexts/       # React contexts
├── database/       # SQLite DAO/repository layer
├── features/       # Feature hooks, engines, components
├── hooks/          # Shared hooks
├── navigation/     # Root stack / tabs / route types
├── providers/      # App providers
├── screens/        # Screen composition
├── services/       # Backup/sync/API/logging/storage services
├── store/          # Zustand stores
├── theme/          # Design tokens
└── utils/          # Utilities
```

---

## License

Apache License 2.0
