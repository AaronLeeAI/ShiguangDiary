# Project Postmortem — 拾光日记 v1.0.0 RC

Date: 2026-07-06
Version: v1.0.0-rc.1

## Project Overview

拾光日记 is a documentation-driven React Native + TypeScript Android diary application. The project rebuilt a diary product from design and APK-analysis references into a maintainable, component-driven mobile client.

## Task Timeline

| Task   | Outcome                                                              |
| ------ | -------------------------------------------------------------------- |
| Task00 | APK reverse-engineering knowledge base completed.                    |
| Task01 | Product/design specifications completed.                             |
| Task02 | React Native foundation completed.                                   |
| Task03 | Asset pipeline completed.                                            |
| Task04 | Shared component library completed.                                  |
| Task05 | Navigation framework completed.                                      |
| Task06 | Global state completed.                                              |
| Task07 | Database layer completed.                                            |
| Task08 | API/service layer completed.                                         |
| Task09 | Home module completed.                                               |
| Task10 | Diary editor completed.                                              |
| Task11 | Calendar/timeline completed.                                         |
| Task12 | Search completed.                                                    |
| Task13 | Statistics completed.                                                |
| Task14 | Settings/configuration center completed.                             |
| Task15 | Data management/backup/sync framework completed.                     |
| Task16 | Business workflow integration completed.                             |
| Task17 | UX polish and motion system completed.                               |
| Task18 | Performance/stability/release configuration completed.               |
| Task19 | Release Candidate and Final QA completed for automated/static gates. |

## Architecture Review

The project kept clear separation between:

- `screens/`: composition and navigation-facing pages.
- `components/`: reusable UI primitives and product components.
- `features/`: feature-level logic, hooks, and pure engines.
- `store/`: Zustand state and persisted preferences/session state.
- `database/`: SQLite DAO/repository layer.
- `services/`: backup, sync, logging, API, and storage facades.
- `theme/`: design tokens for colors, typography, spacing, radius, shadow, and motion.

This separation allowed late QA fixes (version labels, disabled placeholder entries, manifest hardening, Jest setup) without broad architecture churn.

## Key Decisions

- Local-first data remains the source of truth; cloud sync is abstracted and deferred beyond the local-first RC scope.
- Configuration uses MMKV through Zustand persist rather than SQLite.
- Backup/export uses JSON for v1.0 RC; ZIP/attachments/import picker remain roadmap items.
- Release-incomplete features stay in route/type architecture but are hidden/disabled from RC user flows.
- Android production signing material is not committed; RC uses debug signing only.

## Major Issues Resolved

- Native-module Jest fragility was solved with explicit mocks in `jest.setup.js`.
- User-facing version drift was solved through shared app constants.
- Optional native modules injected excessive permissions; manifest-merger removal rules reduced the APK to a minimal permission surface.
- Placeholder route exposure was reduced by disabling visible entries that lead to deferred pages.
- Android app label was localized to `拾光日记`.

## Performance and Stability Outcome

Task18 produced the performance/stability foundation and Task19 reconfirmed:

- TypeScript passes with no errors.
- Jest regression suite passes.
- ESLint has no errors.
- Android release build succeeds.
- APK metadata/signature verification succeeds.

## Known Limitations

- Final device install/upgrade/uninstall verification requires an Android device or configured AVD.
- The RC APK is debug-key signed.
- Several advanced settings/profile features are intentionally disabled for RC.
- Real cloud sync, ZIP backup with binary attachments, and import file picker remain future work.
- Pixel-perfect screenshot overlay validation requires a device capture pipeline.

## Roadmap Recommendations

- v1.0.0 final: production signing, device smoke test, release tag, artifact archival.
- v1.1.0: complete disabled secondary feature pages or remove routes from release navigation.
- v1.1.x: implement attachment-inclusive backup/import and optional sync providers.
- Future: iOS validation, accessibility device testing, screenshot regression pipeline.

## Reusable Practices

- Keep release metadata in one app constants module.
- Run `aapt dump badging` as part of security QA to catch merged permission drift.
- Treat route stubs as architecture internals; do not expose them from RC-visible UI.
- Keep automated tests isolated from native modules through explicit Jest setup.
- Record environment-dependent verification gaps honestly in release reports.
