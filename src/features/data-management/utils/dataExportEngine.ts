/**
 * Data Export Engine - 备份载荷组装纯函数
 *
 * 输入各业务表数组 + 配置快照,组装成 BackupPayload(纯数据 JSON)。
 * 零 IO(不读 Repository/磁盘):service 层先收集数据再调用本引擎组装。
 * 后续 ZIP 打包/附件二进制拷贝由 backupService 在本引擎产物上扩展。
 */

import {
  BACKUP_SCHEMA_VERSION,
  type BackupPayload,
  type BackupStats,
  type ConfigSnapshot,
} from '../types'
import type {
  DiaryModel,
  NotebookModel,
  AlbumModel,
  TagModel,
  AttachmentModel,
  DraftModel,
} from '@database'

export interface BuildPayloadInput {
  notebooks: NotebookModel[]
  diaries: DiaryModel[]
  albums: AlbumModel[]
  tags: TagModel[]
  attachments: AttachmentModel[]
  drafts: DraftModel[]
  config: ConfigSnapshot
  appVersion: string
  at?: number
}

const computeStats = (i: BuildPayloadInput): BackupStats => ({
  notebooks: i.notebooks.length,
  diaries: i.diaries.length,
  albums: i.albums.length,
  tags: i.tags.length,
  attachments: i.attachments.length,
  drafts: i.drafts.length,
})

/** 组装 BackupPayload。不修改入参。 */
export function buildBackupPayload(input: BuildPayloadInput): BackupPayload {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt: input.at ?? Date.now(),
    appVersion: input.appVersion,
    stats: computeStats(input),
    notebooks: input.notebooks,
    diaries: input.diaries,
    albums: input.albums,
    tags: input.tags,
    attachments: input.attachments,
    drafts: input.drafts,
    config: input.config,
  }
}

/** 序列化为 JSON 字符串(pretty 便于诊断;service 决定落盘格式)。 */
export function serializePayload(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2)
}

/** 反序列化原始字符串(不校验;校验由 backupSchema.validateBackupPayload 完成)。 */
export function parseRawPayload(json: string): unknown {
  return JSON.parse(json)
}
