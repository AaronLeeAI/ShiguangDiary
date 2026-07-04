/**
 * Preferences Store
 *
 * Persisted user preferences that affect app presentation and editing defaults.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createStoreStorage, storePersistKeys } from '../persist'
import type { EditorPreferenceState, PreferenceState } from '../types'

const defaultEditorPreferences: EditorPreferenceState = {
  fontScale: 1,
  toolbarEnabled: true,
  autoSaveInterval: 3000,
}

const initialState = {
  themeMode: 'system' as const,
  homeListStyle: 'timeline' as const,
  diarySortOrder: 'updatedDesc' as const,
  editor: defaultEditorPreferences,
}

export const usePreferencesStore = create<PreferenceState>()(
  persist(
    set => ({
      ...initialState,
      setThemeMode: themeMode => set({ themeMode }),
      setHomeListStyle: homeListStyle => set({ homeListStyle }),
      setDiarySortOrder: diarySortOrder => set({ diarySortOrder }),
      setEditorPreferences: preferences =>
        set(state => ({ editor: { ...state.editor, ...preferences } })),
      resetPreferences: () => set(initialState),
    }),
    {
      name: storePersistKeys.preferences,
      storage: createStoreStorage(),
    },
  ),
)

export default usePreferencesStore
