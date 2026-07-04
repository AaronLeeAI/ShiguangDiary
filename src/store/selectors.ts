/**
 * Store Selectors
 *
 * Stable selector functions keep component subscriptions narrow.
 */

import { useAppStore } from './app'
import { usePreferencesStore } from './preferences'
import { useSessionStore } from './session'
import { useUiStore } from './ui'

export const selectIsAppReady = (state: ReturnType<typeof useAppStore.getState>) =>
  state.lifecycleStatus === 'ready'

export const selectGlobalLoading = (state: ReturnType<typeof useUiStore.getState>) => state.loading

export const selectThemeMode = (state: ReturnType<typeof usePreferencesStore.getState>) =>
  state.themeMode

export const selectHomeListStyle = (state: ReturnType<typeof usePreferencesStore.getState>) =>
  state.homeListStyle

export const selectDiarySortOrder = (state: ReturnType<typeof usePreferencesStore.getState>) =>
  state.diarySortOrder

export const selectSessionUser = (state: ReturnType<typeof useSessionStore.getState>) => state.user

export const selectSessionToken = (state: ReturnType<typeof useSessionStore.getState>) =>
  state.token

export const useIsAppReady = () => useAppStore(selectIsAppReady)

export const useGlobalLoading = () => useUiStore(selectGlobalLoading)

export const useThemePreference = () => usePreferencesStore(selectThemeMode)

export const useHomeListStyle = () => usePreferencesStore(selectHomeListStyle)

export const useDiarySortOrder = () => usePreferencesStore(selectDiarySortOrder)

export const useSessionUser = () => useSessionStore(selectSessionUser)

export const useSessionToken = () => useSessionStore(selectSessionToken)
