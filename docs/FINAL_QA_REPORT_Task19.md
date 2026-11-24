# Task19 Final QA Report

Date: 2026-07-06
Version: v1.0.0-rc.1
Scope: Release Candidate & Final QA for Android

## Summary

Task19 completed a release-candidate readiness pass across code, docs, build output, regression tests, accessibility/security basics, and package metadata. The project is frozen at `1.0.0-rc.1` for RC validation.

## Previous Task Audit

Task18 was verified before starting Task19:

- Git history contains `e5f64ac Task18: Performance, Stability & Reliability`.
- Task18 reports are present:
  - `docs/PERFORMANCE_REPORT_Task18.md`
  - `docs/STABILITY_REPORT_Task18.md`
  - `docs/RELEASE_BUILD_Task18.md`
- Current codebase still passes Jest, TypeScript, ESLint error gate, and Android release build.

## Code QA Findings and Fixes

| Area                        | Finding                                                                                                   | Action                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release metadata            | User-facing version was still `0.1.0` in About/Profile/data management surfaces.                          | Added shared app constants and aligned package, lockfile, Android `versionName`, About, Profile, Data Management labels to `1.0.0-rc.1`.          |
| Placeholder route exposure  | Several incomplete secondary pages were reachable from settings/profile menus.                            | Disabled RC-incomplete entries and marked them `敬请期待` to avoid shipping dead-end stub routes.                                                 |
| Test/runtime mocks          | App smoke test and persistence-related unit tests depended on native modules without complete Jest setup. | Added `jest.setup.js` with safe mocks for RNFS, MMKV, SQLite, haptics, safe area, navigation smoke-test isolation.                                |
| Android release permissions | Merged APK initially included unused permissions injected by optional native modules.                     | Hardened `AndroidManifest.xml` with manifest-merger removals; final APK only exposes INTERNET, VIBRATE, and AndroidX dynamic receiver permission. |
| Android label               | APK label was `ShiguangDiary` while product language is Chinese.                                          | Updated Android `app_name` to `拾光日记`.                                                                                                         |
| Backup/export copy          | Export completion copy mentioned a future share panel rather than actual generated path.                  | Updated dialog copy to show generated file path.                                                                                                  |

## Verification Evidence

| Check               | Command / Evidence                                         | Result                                                                                 |
| ------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Unit tests          | `npm test -- --runInBand`                                  | PASS: 6 suites, 57 tests                                                               |
| TypeScript          | `npm run typecheck`                                        | PASS: no errors                                                                        |
| ESLint              | `npm run lint`                                             | PASS: 0 errors; existing warnings documented, non-blocking                             |
| Diff hygiene        | `git diff --check`                                         | PASS                                                                                   |
| Release build       | `cd android && .\gradlew.bat assembleRelease --no-daemon`  | PASS                                                                                   |
| APK metadata        | `aapt dump badging app-release.apk`                        | package `com.shiguangdiary`, versionName `1.0.0-rc.1`, label `拾光日记`                |
| APK signature       | `apksigner verify --verbose --print-certs app-release.apk` | PASS: v2 signed with debug RC key                                                      |
| Device availability | `adb devices`; `emulator -list-avds`                       | No attached device / no local AVD; install smoke test not executed in this environment |

## Release APK

- Path: `android/app/build/outputs/apk/release/app-release.apk`
- Size: 58,054,646 bytes
- SHA-256: `43A42C620775EC0AD149D17AF1CE06B0652FECB52FB42DED3C451DEAC7DE91C8`
- Signing: debug keystore for RC only; production v1.0.0 must use a private release keystore.

## Final QA Verdict

RC status: **Ready for device smoke test / stakeholder review**.

Blocking P0/P1 issues found during automated and static QA: **none**.

Known release-gate note: physical device or emulator installation/upgrade/uninstall validation remains environment-dependent and must be executed before promoting `v1.0.0-rc.1` to final `v1.0.0`.
