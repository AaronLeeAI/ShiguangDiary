/**
 * useEditor - 编辑器视图模型 Hook
 *
 * 桥接 EditorScreen 与 editorStore + diaryStore + editorDraftStore，
 * 封装 hydrate / 自动保存草稿 / 保存 / 删除 / 退出确认 等编排逻辑。
 *
 * EditorScreen 只消费本 hook，不直接处理编辑逻辑。
 *
 * 数据流：EditorScreen → useEditor → diaryStore → diaryService → repository
 */

import { useCallback, useEffect, useRef } from 'react'

import { useDiaryStore } from '@store/diaryStore'
import { useEditorDraftStore } from '@store/editorDraftStore'
import { useEditorStore } from '../store/editorStore'
import { charCount, draftKey, isDirty, validateEditor } from '../services/editorEngine'
import { EDITOR_LIMITS } from '../types'
import type { EditorSnapshot } from '../types'

export interface UseEditorResult {
  mode: 'create' | 'edit'
  hydrated: boolean
  saving: boolean
  title: string
  content: string
  weather: string | null
  mood: string | null
  location: string | null
  dirty: boolean
  charCount: number
  lastSavedAt: number | null
  error: string | null

  setTitle: (t: string) => void
  setContent: (c: string) => void
  setWeather: (w: string | null) => void
  setMood: (m: string | null) => void
  setLocation: (l: string | null) => void

  /** 保存（新建或更新）。返回是否成功。 */
  save: () => Promise<boolean>
  /** 删除当前编辑的日记（仅 edit 模式）。 */
  remove: () => Promise<boolean>
  /** 退出编辑：有改动则存草稿。返回是否应退出。 */
  exit: () => boolean
  /** 丢弃草稿并重置。 */
  discard: () => void
}

/**
 * @param diaryId null 表示新建。
 */
export function useEditor(diaryId: string | null): UseEditorResult {
  const snapshot = useEditorStore(s => s.snapshot)
  const mode = useEditorStore(s => s.mode)
  const hydrated = useEditorStore(s => s.hydrated)
  const saving = useEditorStore(s => s.saving)
  const lastSavedAt = useEditorStore(s => s.lastSavedAt)
  const error = useEditorStore(s => s.error)
  const original = useEditorStore(s => s.original)
  const hydrate = useEditorStore(s => s.hydrate)
  const setTitle = useEditorStore(s => s.setTitle)
  const setContent = useEditorStore(s => s.setContent)
  const setWeather = useEditorStore(s => s.setWeather)
  const setMood = useEditorStore(s => s.setMood)
  const setLocation = useEditorStore(s => s.setLocation)
  const markSaved = useEditorStore(s => s.markSaved)
  const reset = useEditorStore(s => s.reset)

  const createDiary = useDiaryStore(s => s.createDiary)
  const updateDiary = useDiaryStore(s => s.updateDiary)
  const removeDiary = useDiaryStore(s => s.removeDiary)

  const setSnapshot = useEditorDraftStore(s => s.setSnapshot)
  const removeDraft = useEditorDraftStore(s => s.removeDraft)

  // 1. 首次挂载：hydrate
  useEffect(() => {
    hydrate(diaryId)
  }, [diaryId, hydrate])

  // 2. 自动保存草稿（防抖）：dirty 且内容变化后写入 draft store
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!hydrated) {
      return
    }
    const dirty = isDirty(snapshot, original)
    if (!dirty) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setSnapshot(draftKey(diaryId), {
        title: snapshot.title,
        content: snapshot.content,
        weather: snapshot.weather,
        mood: snapshot.mood,
        location: snapshot.location,
      })
    }, EDITOR_LIMITS.AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [snapshot, original, hydrated, diaryId, setSnapshot])

  const save = useCallback(async (): Promise<boolean> => {
    const result = validateEditor(snapshot)
    if (!result.valid) {
      useEditorStore.setState({ error: result.errors[0]?.message ?? '校验失败' })
      return false
    }

    useEditorStore.setState({ saving: true, error: null })
    try {
      if (mode === 'create') {
        await createDiary({
          notebookId: 'nb-1',
          title: snapshot.title.trim(),
          summary: snapshot.content.slice(0, 80),
          content: snapshot.content,
          cover: null,
          weather: snapshot.weather,
          location: snapshot.location,
          mood: snapshot.mood,
          isPinned: false,
          isEncrypted: false,
          isDraft: false,
          deletedAt: null,
        })
      } else if (diaryId) {
        await updateDiary(diaryId, {
          title: snapshot.title.trim(),
          content: snapshot.content,
          weather: snapshot.weather,
          location: snapshot.location,
          mood: snapshot.mood,
        })
      }
      // 保存成功 → 清除草稿
      removeDraft(draftKey(diaryId))
      markSaved()
      return true
    } catch (e) {
      useEditorStore.setState({
        saving: false,
        error: e instanceof Error ? e.message : '保存失败',
      })
      return false
    }
  }, [snapshot, mode, diaryId, createDiary, updateDiary, removeDraft, markSaved])

  const remove = useCallback(async (): Promise<boolean> => {
    if (mode !== 'edit' || !diaryId) {
      return false
    }
    try {
      await removeDiary(diaryId)
      removeDraft(draftKey(diaryId))
      return true
    } catch (e) {
      useEditorStore.setState({
        error: e instanceof Error ? e.message : '删除失败',
      })
      return false
    }
  }, [mode, diaryId, removeDiary, removeDraft])

  const exit = useCallback((): boolean => {
    // 有改动则存草稿（同步写入，避免导航丢失）
    if (isDirty(snapshot, original)) {
      setSnapshot(draftKey(diaryId), {
        title: snapshot.title,
        content: snapshot.content,
        weather: snapshot.weather,
        mood: snapshot.mood,
        location: snapshot.location,
      })
    }
    reset()
    return true
  }, [snapshot, original, diaryId, setSnapshot, reset])

  const discard = useCallback(() => {
    removeDraft(draftKey(diaryId))
    reset()
  }, [diaryId, removeDraft, reset])

  const current: EditorSnapshot = snapshot
  return {
    mode,
    hydrated,
    saving,
    title: current.title,
    content: current.content,
    weather: current.weather,
    mood: current.mood,
    location: current.location,
    dirty: isDirty(snapshot, original),
    charCount: charCount(current.content),
    lastSavedAt,
    error,
    setTitle,
    setContent,
    setWeather,
    setMood,
    setLocation,
    save,
    remove,
    exit,
    discard,
  }
}
