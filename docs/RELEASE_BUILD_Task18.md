# Task18 Release Build Notes

Task: Task18 - Performance, Stability & Reliability
Date: 2026-07-06

## Android Release Configuration Audit

Files audited:

- `android/gradle.properties`
- `android/build.gradle`
- `android/app/build.gradle`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `package.json`
- `src/services/core/logger.ts`

Current release-relevant defaults:

| Item                      | Current State                                    | Notes                                                                             |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Hermes                    | Enabled (`hermesEnabled=true`)                   | Suitable for React Native release performance baseline                            |
| New Architecture          | Disabled (`newArchEnabled=false`)                | Chosen as the stable RN 0.76 / native dependency release baseline                 |
| Release minify / ProGuard | Disabled (`enableProguardInReleaseBuilds=false`) | Not changed in Task18 to avoid unverified native dependency breakage              |
| Release signing           | Uses debug signing placeholder                   | Production keystore must be configured outside source control before distribution |
| Logger level              | `warn` in release                                | Debug/info logs are suppressed by default                                         |
| Gradle wrapper            | Gradle 8.10.2, `networkTimeout=60000`            | Wrapper is compatible with the RN 0.76 Gradle plugin; Gradle 9.6.1 was rejected   |

## Dependency Pinning

Task18 pins native dependencies that participate in Android release codegen/CMake so future installs do not float into incompatible versions:

- `react-native-reanimated`: `3.16.0`
- `react-native-screens`: `4.1.0`
- `react-native-gesture-handler`: `2.23.1`
- `react-native-mmkv`: `2.12.2`

## Build Commands

Debug/dev:

```powershell
npm run android
```

Release APK from Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleRelease
```

Clean release verification used for Task18:

```powershell
cd android
.\gradlew.bat clean assembleRelease --no-daemon --stacktrace
```

If remote dependency downloads are needed on this workstation, use normal `HTTP_PROXY` / `HTTPS_PROXY` environment variables pointing at `http://127.0.0.1:11451`. Do not use Gradle 9.6.1 for this RN 0.76 project; the checked-in wrapper is the validated build path.

## ProGuard / R8 Decision

Task18 intentionally does not enable ProGuard/R8 minification in code.

Reason:

- The app uses several native React Native dependencies.
- Enabling minification without a full release-device validation pass can introduce runtime-only failures.
- The safer Task18 outcome is to generate a baseline release APK and leave minification enablement to a dedicated release hardening pass with APK install/smoke verification.

Recommended Task19 release hardening sequence:

1. Generate baseline release APK with current config.
2. Install on a physical Android device.
3. Smoke test app startup, navigation, diary CRUD, search, backup/restore, image/file flows.
4. Record startup timings and memory observations.
5. Enable minification in a separate commit only if native dependency keep rules are verified.
6. Rebuild, reinstall, and repeat smoke tests.

## Signing Guidance

Do not commit production keystores, passwords, or signing secrets.

Use local Gradle properties or CI secrets for:

- Keystore path.
- Store password.
- Key alias.
- Key password.

## Release Logging

`createLogger()` uses `__DEV__ ? 'debug' : 'warn'` as its default minimum level. Release builds keep warning/error diagnostics and suppress debug/info noise.

## Task18 Release Verification Status

Clean build executed on 2026-07-06:

```powershell
cd D:\my dev\ShiguangDiary\ShiguangDiary\android
.\gradlew.bat clean assembleRelease --no-daemon --stacktrace
```

Result:

- Build passed: `BUILD SUCCESSFUL in 7m 49s`.
- Generated APK: `D:\my dev\ShiguangDiary\ShiguangDiary\android\app\build\outputs\apk\release\app-release.apk`.
- APK size: `58,054,950` bytes.
- Additional release metadata generated under `android/app/build/outputs/apk/release/`.

Known release QA still deferred to Task19:

- Physical-device signed APK install smoke test.
- Cold/warm startup timing on target devices.
- Scroll FPS and memory observation on low/mid Android devices.
- Optional R8/minify experiment with device re-validation.
