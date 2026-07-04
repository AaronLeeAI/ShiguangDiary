/**
 * Editor Draft Store
 *
 * Persisted draft snippets used by future editor tasks.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createStoreStorage, storePersistKeys } from './persist'
import type { EditorDraftState } from './types'

export const useEditorDraftStore = create<EditorDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (key, content) =>
        set(state => ({
          drafts: { ...state.drafts, [key]: { content, updatedAt: Date.now() } },
        })),
      getDraft: key => get().drafts[key]?.content,
      setSnapshot: (key, snapshot) =>
        set(state => ({
          drafts: {
            ...state.drafts,
            [key]: { ...snapshot, updatedAt: Date.now() },
          },
        })),
      getSnapshot: key => get().drafts[key],
      removeDraft: key =>
        set(state => {
          const drafts = { ...state.drafts }
          delete drafts[key]
          return { drafts }
        }),
      clearDrafts: () => set({ drafts: {} }),
    }),
    {
      name: storePersistKeys.editorDrafts,
      storage: createStoreStorage(),
    },
  ),
)

export default useEditorDraftStore
