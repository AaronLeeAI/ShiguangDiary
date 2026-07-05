/**
 * Backup Schema - 导入校验纯函数
 *
 * 校验未知来源数据为合法 BackupPayload:版本检查 + 结构检查 + 字段类型检查,
 * 非法/缺失字段收集为 errors,可解析则归一化为 payload。全纯函数零 IO,可单测。
 *
 * 当前版本:BACKUP_SCHEMA_VERSION=1。未来版本递增在此分支。
 */

import {
  BACKUP_SCHEMA_VERSION,
  type BackupPayload,
  type ImportValidation,
  type BackupStats,
} from '../types'

const EMPTY_STATS: BackupStats = {
  notebooks: 0,
  diaries: 0,
  albums: 0,
  tags: 0,
  attachments: 0,
  drafts: 0,
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const isArray = (v: unknown): v is unknown[] => Array.isArray(v)

/**
 * 校验并归一化一段原始数据为 BackupPayload。
 * @returns ImportValidation(valid/errors/payload)
 */
export function validateBackupPayload(raw: unknown): ImportValidation {
  const errors: string[] = []

  if (!isObject(raw)) {
    return { valid: false, errors: ['payload is not an object'], payload: null }
  }

  // schemaVersion
  if (!isNumber(raw.schemaVersion)) {
    errors.push('missing or invalid field: schemaVersion')
    return { valid: false, errors, payload: null }
  }
  if (raw.schemaVersion > BACKUP_SCHEMA_VERSION) {
    errors.push(
      `unsupported schemaVersion ${raw.schemaVersion} (current ${BACKUP_SCHEMA_VERSION}); upgrade app and retry`,
    )
    return { valid: false, errors, payload: null }
  }
  if (raw.schemaVersion < BACKUP_SCHEMA_VERSION) {
    // 初版允许向前兼容:未来此处加入逐版本迁移。
    // 暂直接拒绝,避免静默导入旧结构。
    errors.push(
      `legacy schemaVersion ${raw.schemaVersion}; migration to ${BACKUP_SCHEMA_VERSION} not implemented yet`,
    )
    return { valid: false, errors, payload: null }
  }

  // createdAt
  if (!isNumber(raw.createdAt)) {
    errors.push('missing or invalid field: createdAt')
    return { valid: false, errors, payload: null }
  }

  // appVersion
  if (typeof raw.appVersion !== 'string') {
    errors.push('missing or invalid field: appVersion')
    return { valid: false, errors, payload: null }
  }

  // 集合数组字段
  const collections: Array<
    keyof Pick<
      BackupPayload,
      'notebooks' | 'diaries' | 'albums' | 'tags' | 'attachments' | 'drafts'
    >
  > = ['notebooks', 'diaries', 'albums', 'tags', 'attachments', 'drafts']
  const picked: Record<string, unknown[]> = {}
  for (const key of collections) {
    const v = raw[key]
    if (!isArray(v)) {
      errors.push(`field must be array: ${String(key)}`)
      picked[key] = []
    } else {
      picked[key] = v
    }
  }

  // config 快照
  if (!isObject(raw.config)) {
    errors.push('missing or invalid field: config')
    return { valid: false, errors, payload: null }
  }
  const cfg = raw.config as Record<string, unknown>
  const configKeys = ['app', 'preferences', 'session', 'editorDrafts', 'searchHistory'] as const
  const config: Record<string, string | null> = {}
  for (const k of configKeys) {
    const v = cfg[k]
    if (v !== null && typeof v !== 'string') {
      errors.push(`config field must be string|null: ${k}`)
      config[k] = null
    } else {
      config[k] = v as string | null
    }
  }

  // stats(若缺失则按集合长度回填,便于诊断)
  let stats: BackupStats = EMPTY_STATS
  if (isObject(raw.stats)) {
    stats = {
      notebooks: isNumber(raw.stats.notebooks)
        ? (raw.stats.notebooks as number)
        : picked.notebooks.length,
      diaries: isNumber(raw.stats.diaries) ? (raw.stats.diaries as number) : picked.diaries.length,
      albums: isNumber(raw.stats.albums) ? (raw.stats.albums as number) : picked.albums.length,
      tags: isNumber(raw.stats.tags) ? (raw.stats.tags as number) : picked.tags.length,
      attachments: isNumber(raw.stats.attachments)
        ? (raw.stats.attachments as number)
        : picked.attachments.length,
      drafts: isNumber(raw.stats.drafts) ? (raw.stats.drafts as number) : picked.drafts.length,
    }
  } else {
    stats = {
      notebooks: picked.notebooks.length,
      diaries: picked.diaries.length,
      albums: picked.albums.length,
      tags: picked.tags.length,
      attachments: picked.attachments.length,
      drafts: picked.drafts.length,
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, payload: null }
  }

  const payload: BackupPayload = {
    schemaVersion: raw.schemaVersion as number,
    createdAt: raw.createdAt as number,
    appVersion: raw.appVersion as string,
    stats,
    notebooks: picked.notebooks as NotebookModel[],
    diaries: picked.diaries as DiaryModel[],
    albums: picked.albums as AlbumModel[],
    tags: picked.tags as TagModel[],
    attachments: picked.attachments as AttachmentModel[],
    drafts: picked.drafts as DraftModel[],
    config: {
      app: config.app ?? null,
      preferences: config.preferences ?? null,
      session: config.session ?? null,
      editorDrafts: config.editorDrafts ?? null,
      searchHistory: config.searchHistory ?? null,
    },
  }

  return { valid: true, errors: [], payload }
}

// 类型仅用于 as 断言,避免运行时引用循环;实际模型由 @database 提供。
import type {
  NotebookModel,
  DiaryModel,
  AlbumModel,
  TagModel,
  AttachmentModel,
  DraftModel,
} from '@database'
