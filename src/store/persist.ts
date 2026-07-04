/**
 * Store Persistence
 *
 * Shared MMKV-backed persist helpers for Zustand stores.
 */

import { createJSONStorage, type StateStorage } from 'zustand/middleware'

import { mmkvStorage } from '@storage/mmkvStorage'

export const storeStorage: StateStorage = mmkvStorage

export const createStoreStorage = () => createJSONStorage(() => storeStorage)

export const storePersistKeys = {
  app: 'app-store',
  preferences: 'preferences-store',
  session: 'session-store',
  editorDrafts: 'editor-drafts-store',
} as const
