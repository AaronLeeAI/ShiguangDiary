# Project Info — 拾光日记

Version: **v1.0.0-rc.1**  
Platform: **Android**  
Framework: **React Native + TypeScript**  
Milestone: **Task19 — Release Candidate & Final QA**

## Core Concept

拾光日记是一款专注于「安静记录」的日记应用：

- 极简留白：靠空间分层，不靠过度线条
- 主色克制：绿色仅用于关键操作与强调
- 内容优先：主要视觉面积留给日记内容
- 本地优先：SQLite + MMKV 作为本地数据真源
- 文档驱动：设计文档、工程文档、Task 文档作为开发依据

## Architecture

```text
ShiguangDiary/
├── android/              # Android native project
├── ios/                  # Reserved iOS native project
├── assets/               # Raw static resources
├── docs/                 # Project engineering/release docs
├── src/
│   ├── animations/       # Motion and haptic wrappers
│   ├── assets/           # Asset index and typed references
│   ├── components/       # Shared component library
│   ├── constants/        # App and route constants
│   ├── contexts/         # React contexts
│   ├── database/         # SQLite DAO/repository layer
│   ├── features/         # Feature hooks, engines, components
│   ├── hooks/            # Shared hooks
│   ├── navigation/       # Root stack / tabs / route types
│   ├── providers/        # App-level providers
│   ├── screens/          # Screen composition layer
│   ├── services/         # Backup/sync/API/logging/storage facades
│   ├── store/            # Zustand global state
│   ├── theme/            # Design tokens
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Utilities
├── __tests__/            # Jest regression tests
├── App.tsx
├── index.js
├── package.json
└── README.md
```

## Release Candidate Evidence

Task19 generated the following release-readiness documents:

- `docs/FINAL_QA_REPORT_Task19.md`
- `docs/REGRESSION_REPORT_Task19.md`
- `docs/PIXEL_PERFECT_REPORT_Task19.md`
- `docs/ACCESSIBILITY_REPORT_Task19.md`
- `docs/SECURITY_REVIEW_Task19.md`
- `docs/RELEASE_BUILD_Task19.md`
- `docs/RELEASE_NOTES_v1.0.0.md`
- `docs/reports/PROJECT_POSTMORTEM.md`

## Quality Gates

Validated on 2026-07-06:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
cd android; .\gradlew.bat assembleRelease --no-daemon
```

Results:

- Jest passed: 6 suites / 57 tests
- TypeScript passed: no errors
- ESLint passed: 0 errors
- Android release build passed
- APK metadata and signature verification passed

## External Documentation Inputs

The canonical planning/design documents live outside this Git repo in the workspace:

- `D:/my dev/docs/PROJECT_PLAN.md`
- `D:/my dev/docs/tasks/Task19.md`
- `D:/my dev/docs/project-设计-docs/`
- `D:/my dev/docs/apk-analysis-docs/`

## Production Release Notes

`v1.0.0-rc.1` is an internal release candidate. Before final `v1.0.0`:

1. Sign with a private production keystore.
2. Install on a real Android device or configured AVD.
3. Verify launch, navigation, create/edit, backup/export, dark mode, and uninstall/reinstall smoke flows.
4. Create the final `v1.0.0` tag only after device QA passes.
