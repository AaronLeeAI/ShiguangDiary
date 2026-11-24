# Task18 Stability Report

Task: Task18 - Performance, Stability & Reliability
Date: 2026-07-06

## Stability Fixes

### Database Bootstrap Concurrency

`initDatabase()` is now guarded by an in-flight promise. If multiple screens/hooks request initialization at the same time, only one bootstrap sequence runs and all callers await the same promise.

Risk reduced:

- Duplicate migration execution attempts.
- Duplicate file bucket initialization.
- Race-dependent startup failures.

### Store Reload Recovery

`diaryStore.reload()` now resets `initialized: false`, `loading: false`, and `error: null` before calling `init()`.

Previous risk:

- `reload()` set `loading: true`.
- `init()` returned early because it refuses to start while loading.
- Error banner retry could leave the UI stuck in loading state.

### DAO Safe Partial Updates

Partial update methods now no-op for empty patches and skip `undefined` fields.

Risk reduced:

- Invalid SQL such as `UPDATE tag SET  WHERE id = ?`.
- Invalid SQL with an empty field list before `updatedAt`.
- Accidental overwrite of nullable columns with JavaScript `undefined`.

### Release Dependency Stability

Release build troubleshooting found incompatible combinations in the native dependency set. Task18 pins compatible versions for React Native 0.76 and keeps `newArchEnabled=false` for this release baseline.

Risk reduced:

- RN New Architecture / Fabric native build failures in release mode.
- Reanimated and Screens codegen/API mismatches from overly broad semver ranges.
- MMKV 3.x old-architecture Java spec mismatch on RN 0.76.

### Logging Reliability

Store fallback and optimistic-degrade warnings are routed through `createLogger('DiaryStore')`, preserving release warnings while removing ad-hoc console usage.

## Reliability Matrix

| Area               | Result                        | Evidence                                                                             |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| Startup retry      | Improved                      | `reload()` no longer self-blocks on `loading` guard                                  |
| Concurrent init    | Improved                      | Shared `initializing` promise in database bootstrap                                  |
| Database migration | Improved                      | Version 2 index migration is idempotent with `IF NOT EXISTS`                         |
| DAO updates        | Improved                      | Empty/undefined patches are guarded                                                  |
| Rendering          | Improved                      | Stable FlatList callbacks and virtualization defaults                                |
| Logging            | Improved                      | Store warnings use scoped logger                                                     |
| Cache cleanup      | Existing capability confirmed | `fileStorage.clearCache()` only clears cache bucket                                  |
| Release build      | Passed locally                | `.\gradlew.bat clean assembleRelease --no-daemon --stacktrace` generated release APK |
| Secrets/signing    | No secrets committed          | Release signing remains documented, not hard-coded                                   |

## Regression Verification

Executed from `D:\my dev\ShiguangDiary\ShiguangDiary`:

```powershell
npm run typecheck
npx eslint src --quiet
npx jest __tests__/features/data-management __tests__/features/settings __tests__/features/statistics __tests__/store
git diff --check
```

Results:

- TypeScript: passed.
- ESLint: passed.
- Jest targeted suites: passed, 5 suites / 56 tests.
- Diff whitespace check: passed.

Android release verification:

```powershell
cd android
.\gradlew.bat clean assembleRelease --no-daemon --stacktrace
```

Result: passed; `app-release.apk` generated.

## Remaining Release QA Items for Task19

- Real-device cold start / warm start timing.
- Long-session memory observation.
- Scroll FPS sampling on low/mid Android hardware.
- Signed release APK install and smoke test.
- APK size comparison after any optional minification experiment.
