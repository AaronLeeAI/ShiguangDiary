# Task17 Motion Specification

Date: 2026-07-05
Project: Shiguang Diary
Task: Task17 - UX Polish & Motion System

## Scope

This document records the implemented Task17 motion baseline. It does not add business features.

## Motion Tokens

Source of truth in code: `src/theme/animation.ts`.

- Page push: native stack `slide_from_right`, 300ms, gestures enabled.
- Modal/sheet baseline: native Modal slide/fade plus component-level press feedback.
- Press feedback: `PressableScale`, default scale `0.98`, Reanimated spring (`motion.spring.default`).
- Toast: Reanimated enter/exit, 250ms in and 200ms out; Reduce Motion falls back to fade.
- Loading spinner: uses `motion.duration.arcRotate`; Reduce Motion disables continuous rotation.
- Skeleton: shimmer uses `motion.duration.breathLoop`; Reduce Motion disables shimmer.

## Haptic Intents

Source of truth in code: `src/animations/haptics.ts`.

| Intent      | Native type         | Use cases                              |
| ----------- | ------------------- | -------------------------------------- |
| tap         | selection           | tab, card, normal button, settings row |
| toggle      | impactLight         | pin/unpin, toggle-style actions        |
| saveSuccess | notificationSuccess | save, backup, export                   |
| delete      | impactHeavy         | destructive confirm/execute            |
| warning     | notificationWarning | dangerous confirmation entry           |
| error       | notificationError   | operation failure                      |
| longPress   | longPress           | long press menu                        |
| complete    | notificationSuccess | restore/sync/check complete            |

The wrapper is lazy-loaded and returns `false` instead of throwing when the native module is unavailable.

## Accessibility Rules

- `useReduceMotion()` reads `AccessibilityInfo.isReduceMotionEnabled()` and subscribes to changes.
- Components that animate repeatedly or transform content must degrade when Reduce Motion is enabled.
- Touch targets use hitSlop where small icon targets are involved.

## Current Integration Points

- Navigation: stack transition duration and gestures; tab press haptic.
- Components: `PrimaryButton`, `TextButton`, `FloatingActionButton`, `DiaryCard`, `SettingsRow`, `BottomTabBar`, `ActionSheet`, `ToastView`, `Spinner`, `Skeleton`, `PressableScale`.
- Screens/workflows: diary save/delete/pin/unlock; data backup/export/restore/delete/integrity/sync.

## Non-goals

- No new business pages.
- No database/network protocol changes.
- No broad performance optimization; Task18 remains dedicated to performance/stability.
