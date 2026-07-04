/**
 * Store Public API
 *
 * Central export surface for Zustand stores and selectors.
 */

import { usePreferencesStore } from './preferences'
import { useSessionStore } from './session'

export * from './app'
export * from './ui'
export * from './preferences'
export * from './session'
export * from './editorDraftStore'
export * from './persist'
export * from './selectors'
export * from './types'
export * from './diaryStore'
export * as diaryStore from './diaryStore'

/**
 * Backward-compatible session facade kept for older screen imports.
 * New code should use `useSessionStore` directly.
 */
export const useUserStore = useSessionStore

/**
 * Backward-compatible theme facade kept for previous Task code.
 * New code should use `usePreferencesStore`.
 */
export const useThemeStore = usePreferencesStore
