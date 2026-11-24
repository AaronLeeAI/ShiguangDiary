# Task19 Release Build Report

Date: 2026-07-06
Version: v1.0.0-rc.1

## Build Command

```powershell
cd "D:\my dev\ShiguangDiary\ShiguangDiary\android"
.\gradlew.bat assembleRelease --no-daemon
```

Result: **BUILD SUCCESSFUL**.

## Artifact

| Field          | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| APK            | `android/app/build/outputs/apk/release/app-release.apk`            |
| Size           | 58,054,646 bytes                                                   |
| SHA-256        | `43A42C620775EC0AD149D17AF1CE06B0652FECB52FB42DED3C451DEAC7DE91C8` |
| Application ID | `com.shiguangdiary`                                                |
| Version code   | `1`                                                                |
| Version name   | `1.0.0-rc.1`                                                       |
| Label          | `拾光日记`                                                         |
| Min SDK        | 24                                                                 |
| Target SDK     | 34                                                                 |
| Compile SDK    | 35                                                                 |

## Signature Verification

Command:

```powershell
apksigner verify --verbose --print-certs app-release.apk
```

Result: **Verifies**.

The RC artifact uses the debug keystore (`CN=Android Debug`) because production signing material is intentionally not committed. This is acceptable for internal RC validation only.

## Install Verification

Not executed: no connected Android device and no configured local AVD were available.

Commands checked:

```powershell
adb devices
emulator -list-avds
```

## Verdict

Release build: **PASS**.

Promotion to final release requires production signing and device install smoke testing.
