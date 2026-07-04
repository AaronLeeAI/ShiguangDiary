/**
 * Editor Module - 类型定义
 *
 * 编辑快照、校验结果、编辑模式等共享类型。
 */

/** 编辑器可编辑字段集合（不含 id / 时间戳等派生字段）。 */
export interface EditorSnapshot {
  title: string
  content: string
  weather: string | null
  mood: string | null
  location: string | null
}

export type EditorMode = 'create' | 'edit'

/** 单字段校验问题。 */
export interface EditorFieldError {
  field: 'title' | 'content'
  message: string
}

/** 校验结果。 */
export interface EditorValidationResult {
  valid: boolean
  errors: EditorFieldError[]
}

/** 编辑器常量。 */
export const EDITOR_LIMITS = {
  TITLE_MAX: 50,
  CONTENT_MAX: 5000,
  /** 自动保存防抖间隔（ms）。 */
  AUTOSAVE_DEBOUNCE_MS: 1500,
} as const
