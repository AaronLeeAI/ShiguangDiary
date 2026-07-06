# Task18 Performance Report

Task: Task18 - Performance, Stability & Reliability
Date: 2026-07-06
Scope: engineering optimization only; no new product features or pages.

## Code Audit Summary

Audited implementation areas instead of relying only on task documents:

- Startup/data bootstrap: `src/database/core/init.ts`, `src/store/diaryStore.ts`
- Database query paths and migrations: `src/database/dao/index.ts`, `src/database/migration/index.ts`, repositories/services using the DAO layer
- Rendering hot paths: `src/screens/Home/HomeScreen.tsx`, `src/screens/Search/SearchScreen.tsx`, `src/screens/Notebook/NotebookScreen.tsx`
- Logging and release behavior: `src/services/core/logger.ts`, `src/store/diaryStore.ts`
- Android release defaults and dependency compatibility: `android/gradle.properties`, `android/build.gradle`, `android/app/build.gradle`, `package.json`
- File/cache lifecycle: `src/database/storage/fileStorage.ts`

## Optimizations Completed

### Startup / Initialization

- Added an in-flight `initDatabase()` promise guard so concurrent startup calls share one database bootstrap instead of racing `openDatabase -> runMigrations -> fileStorage.init`.
- Fixed `diaryStore.reload()` retry behavior. Previously it set `loading: true` and then called `init()`, but `init()` returns early when `loading` is true. Reload can now actually retry and clear stale errors.

### Database

Added schema migration version 2 with `CREATE INDEX IF NOT EXISTS` indexes for high-frequency query patterns:

- Active diary list ordered by `createdAt DESC`.
- Notebook-scoped diary queries and integrity checks.
- Pinned diary list support.
- Notebook and album active list sort paths.
- Attachment lookup by diary.
- Reverse tag lookup.
- Draft and recycle maintenance paths.

Also hardened DAO update methods:

- `diaryDao.update`, `notebookDao.update`, and `tagDao.update` now ignore `id` and `undefined` patch fields.
- Empty update patches now no-op instead of generating invalid SQL.

### Rendering

Optimized long-list screens by making FlatList callbacks stable and configuring conservative virtualization defaults:

- Home diary list.
- Search results list.
- Notebook list.

Applied props:

- `initialNumToRender={8}`
- `maxToRenderPerBatch={8}`
- `windowSize={7}`
- `removeClippedSubviews`

### Logging

- Replaced scattered `console.warn` fallback logs in `diaryStore` with the unified scoped logger.
- Existing logger behavior keeps `debug/info` out of release by default and retains `warn/error` for actionable diagnostics.

### Release Build Readiness

- Kept Hermes enabled.
- Disabled New Architecture for this RN 0.76 app because the current native dependency set is more reliable on Paper in release builds.
- Pinned compatible native dependency versions for RN 0.76 release builds.
- Added a narrow `react-native-screens` Paper-mode CMake task guard; Paper mode does not load `librnscreens.so`, while New Architecture keeps the native build path enabled.

## Memory / Resource Review

- No new timers, listeners, subscriptions, or global retained objects were introduced.
- Store reload path no longer risks a permanent loading state, reducing the chance of UI retry loops.
- File cache lifecycle already has `fileStorage.clearCache()` for cache-only cleanup without touching attachments/backups/exports.
- Image assets continue to use existing component-level rendering paths; no new large in-memory image buffers were introduced.

## Expected Impact

- More reliable cold-start/bootstrap under duplicate init calls.
- Faster large-list database access after migration v2 is applied.
- Fewer unnecessary list render function reallocations in primary list screens.
- Safer partial updates under edge-case service calls.
- Cleaner release logging baseline.
- Reproducible local Android release artifact generation with the Gradle wrapper.

## Verification Evidence

Executed from `D:\my dev\ShiguangDiary\ShiguangDiary`:

- `npm run typecheck` - passed.
- `npx eslint src --quiet` - passed.
- `npx jest __tests__/features/data-management __tests__/features/settings __tests__/features/statistics __tests__/store` - passed, 5 suites / 56 tests.
- `git diff --check` - passed.

Executed from `D:\my dev\ShiguangDiary\ShiguangDiary\android`:

- `.\gradlew.bat clean assembleRelease --no-daemon --stacktrace` - passed.
- Generated APK: `android/app/build/outputs/apk/release/app-release.apk`.
- APK size: `58,054,950` bytes.

## Known Gaps

- Physical-device FPS, memory, cold-start timing, and signed install smoke testing were not captured in this code-only session.
- ProGuard/R8 minification remains disabled until Task19 can validate native dependency keep rules on a real device.
