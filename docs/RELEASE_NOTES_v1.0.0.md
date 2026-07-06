# Release Notes — 拾光日记 v1.0.0-rc.1

Date: 2026-07-06
Release type: Android Release Candidate

## Overview

`v1.0.0-rc.1` is the first release candidate for 拾光日记. It freezes the React Native Android client after Tasks 00–18 and completes the Task19 final QA/build-readiness pass.

## Highlights

- Full Android React Native client foundation with TypeScript.
- Home, diary view/edit, notebook, album, search, calendar/timeline, statistics, settings, backup/export, profile/about flows.
- Local-first data model using SQLite + MMKV.
- Component-driven UI with shared design tokens and motion/haptic wrappers.
- JSON backup/export and integrity-checking foundation.
- Release candidate build configured as `1.0.0-rc.1`.

## QA / Release Hardening

- Aligned package, Android, About/Profile/Data Management version labels.
- Disabled release-incomplete placeholder entries from visible settings/profile menus.
- Added stable Jest setup for native module mocks.
- Reduced merged Android permissions to the minimal RC set.
- Updated Android app label to `拾光日记`.
- Verified Jest, TypeScript, ESLint error gate, Gradle release build, APK metadata, and APK signature.

## Known Limitations

- RC APK is debug-key signed; final production release requires a private release keystore.
- Device install/upgrade/uninstall smoke test was not executed in this environment because no Android device/AVD was available.
- Some future features remain intentionally disabled with `敬请期待`, including theme background, list-style detail page, editor toolbar customization, font management, recycle bin, drafts, and account editing.
- Cloud sync, ZIP backup with attachments, and file-picker import remain future roadmap items.

## Artifact

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- SHA-256: `43A42C620775EC0AD149D17AF1CE06B0652FECB52FB42DED3C451DEAC7DE91C8`

## Next Step

Run device smoke testing for `v1.0.0-rc.1`. If no P0/P1 issues are found, create the final production-signed `v1.0.0` build and tag.
