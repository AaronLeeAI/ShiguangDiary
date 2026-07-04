/**
 * Editing Engine - 编辑引擎
 *
 * 纯函数模块，负责：
 * - Dirty State 检测（当前快照 vs 原始快照）
 * - Validation（标题/正文长度、空内容）
 * - 草稿键生成
 *
 * 不持有状态、不调用 IO，便于测试与复用。
 * 页面不得直接处理复杂编辑逻辑，统一经本引擎。
 */

import type { EditorSnapshot, EditorValidationResult } from '../types'
import { EDITOR_LIMITS } from '../types'

/**
 * 判断编辑器是否相对原始快照有改动（Dirty State）。
 *
 * @param current 当前快照
 * @param original 原始快照（null 表示新建模式，任何非空输入即 dirty）
 */
export function isDirty(current: EditorSnapshot, original: EditorSnapshot | null): boolean {
  if (!original) {
    // 新建模式：任一字段非空即 dirty
    return (
      current.title.trim().length > 0 ||
      current.content.trim().length > 0 ||
      current.weather !== null ||
      current.mood !== null ||
      current.location !== null
    )
  }
  return (
    current.title !== original.title ||
    current.content !== original.content ||
    current.weather !== original.weather ||
    current.mood !== original.mood ||
    current.location !== original.location
  )
}

/**
 * 保存前校验。
 *
 * 规则：
 * - 标题与正文同时为空 → 无效（不能保存空日记）
 * - 标题超长 → 无效
 * - 正文超长 → 无效
 */
export function validateEditor(snapshot: EditorSnapshot): EditorValidationResult {
  const errors: EditorValidationResult['errors'] = []

  if (!snapshot.title.trim() && !snapshot.content.trim()) {
    errors.push({ field: 'content', message: '内容不能为空' })
  }
  if (snapshot.title.length > EDITOR_LIMITS.TITLE_MAX) {
    errors.push({
      field: 'title',
      message: `标题不能超过 ${EDITOR_LIMITS.TITLE_MAX} 字`,
    })
  }
  if (snapshot.content.length > EDITOR_LIMITS.CONTENT_MAX) {
    errors.push({
      field: 'content',
      message: `正文不能超过 ${EDITOR_LIMITS.CONTENT_MAX} 字`,
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 生成草稿持久化键。
 *
 * 新建模式固定键；编辑模式按日记 id。
 */
export function draftKey(diaryId: string | null): string {
  return diaryId ? `editor:${diaryId}` : 'editor:new'
}

/** 字数统计（按字符计，含空白）。 */
export function charCount(content: string): number {
  return content.length
}
