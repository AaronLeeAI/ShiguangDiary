/**
 * Editor Module - 日记编辑器
 *
 * 项目编辑引擎模块：编辑态 / 草稿 / 自动保存 / 校验。
 *
 * 数据流：EditorScreen → useEditor → editorStore（编辑态）
 *                                  └→ diaryStore → diaryService → repository
 *
 * 草稿经 editorDraftStore（MMKV 持久化）。
 */

export { useEditorStore } from './store/editorStore'
export type { EditorState } from './store/editorStore'
export { useEditor } from './hooks/useEditor'
export type { UseEditorResult } from './hooks/useEditor'
export { isDirty, validateEditor, draftKey, charCount } from './services/editorEngine'
export type { EditorSnapshot, EditorMode, EditorFieldError, EditorValidationResult } from './types'
export { EDITOR_LIMITS } from './types'
export { WebMarkdownEditor } from './components/WebMarkdownEditor'
export type {
  WebMarkdownEditorHandle,
  WebMarkdownFormatCommand,
} from './components/WebMarkdownEditor'
