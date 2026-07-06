/**
 * Integrity Checker - 数据完整性检查纯函数
 *
 * 检查业务数据集合内部的引用一致性:diary→notebook、attachment→diary、album→diary、
 * 配置 JSON 可解析性。全纯函数零 IO,可单测。
 */

import type { DiaryModel, NotebookModel, AlbumModel, AttachmentModel } from '@database'
import type { IntegrityReport, IntegrityIssue, BackupStats, ConfigSnapshot } from '../types'

const computeStats = (
  diaries: DiaryModel[],
  notebooks: NotebookModel[],
  albums: AlbumModel[],
  tags: { id: string }[],
  attachments: AttachmentModel[],
  drafts: unknown[],
): BackupStats => ({
  notebooks: notebooks.length,
  diaries: diaries.length,
  albums: albums.length,
  tags: tags.length,
  attachments: attachments.length,
  drafts: drafts.length,
})

/** JSON.parse 守卫。 */
const safeParse = (s: string | null): { ok: boolean } => {
  if (s === null) {
    return { ok: false }
  }
  try {
    JSON.parse(s)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/**
 * 检查数据集合完整性。返回 IntegrityReport。
 * 不修改入参,纯派生。
 */
export function checkIntegrity(args: {
  diaries: DiaryModel[]
  notebooks: NotebookModel[]
  albums: AlbumModel[]
  tags: { id: string }[]
  attachments: AttachmentModel[]
  drafts: unknown[]
  config: ConfigSnapshot
  at?: number
}): IntegrityReport {
  const { diaries, notebooks, albums, tags, attachments, drafts, config } = args
  const checkedAt = args.at ?? Date.now()
  const issues: IntegrityIssue[] = []

  const notebookIds = new Set(notebooks.map(n => n.id))
  const diaryIds = new Set(diaries.map(d => d.id))

  // diary.notebookId 指向不存在的 notebook(null ok=未分配)
  for (const d of diaries) {
    if (d.notebookId !== null && !notebookIds.has(d.notebookId)) {
      issues.push({
        kind: 'notebook-missing',
        message: `diary ${d.id} references missing notebook ${d.notebookId}`,
        refId: d.id,
      })
    }
  }

  // attachment.diaryId 指向不存在的 diary
  for (const a of attachments) {
    if (!diaryIds.has(a.diaryId)) {
      issues.push({
        kind: 'attachment-orphan',
        message: `attachment ${a.id} references missing diary ${a.diaryId}`,
        refId: a.id,
      })
    }
  }

  // album.diaryIds(JSON 数组字符串)引用不存在的 diary
  for (const album of albums) {
    let ids: string[] = []
    try {
      ids = JSON.parse(album.diaryIds) as string[]
    } catch {
      issues.push({
        kind: 'album-diary-missing',
        message: `album ${album.id} has malformed diaryIds: ${album.diaryIds}`,
        refId: album.id,
      })
      continue
    }
    for (const did of ids) {
      if (!diaryIds.has(did)) {
        issues.push({
          kind: 'album-diary-missing',
          message: `album ${album.id} references missing diary ${did}`,
          refId: album.id,
        })
      }
    }
  }

  // 配置 JSON 可解析性
  const configEntries: Array<[keyof ConfigSnapshot, string | null]> = [
    ['app', config.app],
    ['preferences', config.preferences],
    ['session', config.session],
    ['editorDrafts', config.editorDrafts],
    ['searchHistory', config.searchHistory],
  ]
  for (const [k, v] of configEntries) {
    if (!safeParse(v).ok && v !== null) {
      // null 视为该 store 未持久化(可接受);非 null 但解析失败视为损坏。
      issues.push({
        kind: 'config-corrupted',
        message: `config store ${k} JSON parse failed`,
      })
    }
    // null 本身可接受(空 store),不报。
  }

  const stats = computeStats(diaries, notebooks, albums, tags, attachments, drafts)

  return {
    checkedAt,
    ok: issues.length === 0,
    issues,
    stats,
  }
}
