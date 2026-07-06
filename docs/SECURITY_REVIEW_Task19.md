# Task19 Security Review

Date: 2026-07-06
Version: v1.0.0-rc.1

## Scope

Basic release security review:

- Android permissions
- Backup/export behavior
- Logs/debug behavior
- Signing status
- Sensitive assets/secrets

## Findings

| Area | Result | Notes |
| --- | --- | --- |
| Android permissions | PASS | Merged APK now exposes only `INTERNET`, `VIBRATE`, and AndroidX dynamic receiver permission. Unused storage/notification/alarm/background permissions were removed via manifest-merger rules. |
| Backup | PASS | App manifest sets `android:allowBackup="false"`. |
| Export paths | PASS | JSON backup/export uses app document storage bucket; UI reports the generated path. |
| Logs | PASS with note | Logger disables debug/info below warn in release via `__DEV__`; errors/warnings remain for diagnostics. |
| Secrets | PASS | No release keystore or secrets were added. |
| Signing | RC ONLY | APK is signed with debug key for RC verification. Production release must use private release keystore outside git. |
| Debug/dev endpoints | PASS | Static scan found no newly introduced debug route or token. |

## Permission Evidence

`aapt dump badging app-release.apk`:

```text
uses-permission: name='android.permission.INTERNET'
uses-permission: name='android.permission.VIBRATE'
uses-permission: name='com.shiguangdiary.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
```

## Verdict

Security baseline: **PASS for RC**.

Production gate: replace debug signing with a private release key and re-run `apksigner verify`.
