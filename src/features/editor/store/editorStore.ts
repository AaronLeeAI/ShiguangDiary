/**
 * Editor Store - 编辑会话运行时状态
 *
 * 仅持有当前编辑会话的状态（字段值 / dirty / 保存中 / 错误）。
 * 不持久化——草稿恢复与自动保存由 useEditor hook 经 editorDraftStore 处理。
 *
 * 数据流：EditorScreen → useEditor → editorStore（编辑态）
 *                              └→ diaryStore（持久化，经 diaryService）
 */

import { create } from 'zustand'

import { useDiaryStore } from '@store/diaryStore'
import { useEditorDraftStore } from '@store/editorDraftStore'
import { draftKey } from '../services/editorEngine'
import type { EditorMode, EditorSnapshot } from '../types'

const EMPTY_SNAPSHOT: EditorSnapshot = {
  title: '',
  content: '',
  weather: null,
  mood: null,
  location: null,
}

export interface EditorState {
  mode: EditorMode
  diaryId: string | null
  /** 当前编辑快照。 */
  snapshot: EditorSnapshot
  /** 原始快照（hydrate 时记录，用于 dirty 检测）。null = 新建模式无原始。 */
  original: EditorSnapshot | null
  hydrated: boolean
  saving: boolean
  lastSavedAt: number | null
  error: string | null

  /** 载入既有日记或新建；新建模式会尝试恢复草稿。 */
  hydrate: (diaryId: string | null) => void
  setTitle: (title: string) => void
  setContent: (content: string) => void
  setWeather: (weather: string | null) => void
  setMood: (mood: string | null) => void
  setLocation: (location: string | null) => void
  /** 标记保存成功，刷新 original 快照。 */
  markSaved: () => void
  /** 重置为初始空状态（退出编辑时）。 */
  reset: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'create',
  diaryId: null,
  snapshot: { ...EMPTY_SNAPSHOT },
  original: null,
  hydrated: false,
  saving: false,
  lastSavedAt: null,
  error: null,

  hydrate: diaryId => {
    if (get().hydrated && get().diaryId === diaryId) {
      return
    }

    if (!diaryId) {
      // 新建模式：尝试恢复草稿
      const draft = useEditorDraftStore.getState().getSnapshot(draftKey(null))
      const snapshot: EditorSnapshot = draft
        ? {
            title: draft.title ?? '',
            content: draft.content,
            weather: draft.weather ?? null,
            mood: draft.mood ?? null,
            location: draft.location ?? null,
          }
        : { ...EMPTY_SNAPSHOT }
      set({
        mode: 'create',
        diaryId: null,
        snapshot,
        original: null,
        hydrated: true,
        saving: false,
        error: null,
      })
      return
    }

    // 编辑模式：从日记缓存载入
    const existing = useDiaryStore.getState().diaries.find(d => d.id === diaryId)
    const snapshot: EditorSnapshot = existing
      ? {
          title: existing.title,
          content: existing.content,
          weather: existing.weather,
          mood: existing.mood,
          location: existing.location,
        }
      : { ...EMPTY_SNAPSHOT }

    // 编辑模式也检查是否有未保存草稿（崩溃恢复）
    const draft = useEditorDraftStore.getState().getSnapshot(draftKey(diaryId))
    const restored = draft
      ? {
          title: draft.title ?? snapshot.title,
          content: draft.content,
          weather: draft.weather ?? snapshot.weather,
          mood: draft.mood ?? snapshot.mood,
          location: draft.location ?? snapshot.location,
        }
      : snapshot

    set({
      mode: 'edit',
      diaryId,
      snapshot: restored,
      original: snapshot,
      hydrated: true,
      saving: false,
      error: null,
    })
  },

  setTitle: title => set(state => ({ snapshot: { ...state.snapshot, title } })),
  setContent: content => set(state => ({ snapshot: { ...state.snapshot, content } })),
  setWeather: weather => set(state => ({ snapshot: { ...state.snapshot, weather } })),
  setMood: mood => set(state => ({ snapshot: { ...state.snapshot, mood } })),
  setLocation: location => set(state => ({ snapshot: { ...state.snapshot, location } })),

  markSaved: () =>
    set(state => ({
      original: { ...state.snapshot },
      saving: false,
      lastSavedAt: Date.now(),
      error: null,
    })),

  reset: () =>
    set({
      mode: 'create',
      diaryId: null,
      snapshot: { ...EMPTY_SNAPSHOT },
      original: null,
      hydrated: false,
      saving: false,
      lastSavedAt: null,
      error: null,
    }),
}))

export default useEditorStore
