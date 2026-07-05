/**
 * Data Management Feature - 类型定义
 *
 * 复用 @database 模型(DiaryModel/NotebookModel/...),不重复定义业务实体。
 * 本文件仅定义数据生命周期相关结构:备份载荷/元数据/同步框架/完整性报告。
 *
 * 数据流:DataManagementScreen → useDataManagement → backupService/registerService(SERVICE_KEYS.backup)
 * ── dataExportEngine/backupSchema/integrityChecker 纯函数 ── @database Repository/fileStorage/mmkvStorage。
 * 页面/store 不直访 @database,经本 feature 的 service 层。
 */

import type {
  DiaryModel,
  NotebookModel,
  AlbumModel,
  TagModel,
  AttachmentModel,
  DraftModel,
} from '@database'

/** 备份/导出载荷 Schema 版本(随结构演进递增,导入时校验)。 */
export const BACKUP_SCHEMA_VERSION = 1

/** 备份包含的全部数据集合(纯数据,无文件二进制;附件仍以元数据 + 引用 url 表示)。 */
export interface BackupPayload {
  /** 载荷结构版本号。 */
  schemaVersion: number
  /** 备份生成时间( epoch ms)。 */
  createdAt: number
  /** 应用/数据版本(预留:应用版本号字符串)。 */
  appVersion: string
  /** 备份包含数据集的统计摘要。 */
  stats: BackupStats
  /** 业务数据。 */
  notebooks: NotebookModel[]
  diaries: DiaryModel[]
  albums: AlbumModel[]
  tags: TagModel[]
  attachments: AttachmentModel[]
  drafts: DraftModel[]
  /** 配置快照(MMKV 持久化的 5 个 store 的原始 JSON 字符串)。 */
  config: ConfigSnapshot
}

/** 备份统计摘要。 */
export interface BackupStats {
  notebooks: number
  diaries: number
  albums: number
  tags: number
  attachments: number
  drafts: number
}

/** 配置快照(MMKV 各 store persist name → 该 store 的 JSON 字符串)。 */
export interface ConfigSnapshot {
  app: string | null
  preferences: string | null
  session: string | null
  editorDrafts: string | null
  searchHistory: string | null
}

/** 备份文件元数据(单条备份记录)。 */
export interface BackupMetadata {
  /** 文件名(backups bucket 内)。 */
  filename: string
  /** 完整路径。 */
  path: string
  /** 创建时间(epoch ms)。 */
  createdAt: number
  /** 文件大小(字节)。 */
  size: number
  /** 载荷 schema 版本。 */
  schemaVersion: number
  /** 应用版本。 */
  appVersion: string
  /** 统计摘要。 */
  stats: BackupStats
}

/** 备份创建进度。 */
export interface BackupProgress {
  /** 0~1。 */
  value: number
  /** 当前阶段描述。 */
  stage: string
}

// 同步框架类型复用 service 层契约(单一真源在 @services/sync,避免重复定义)。
import type { SyncStatusSnapshot as SyncStatus } from '@services/sync'

export type {
  ConflictStrategy,
  SyncProvider,
  SyncPushResult,
  SyncPullResult,
  SyncResult,
} from '@services/sync'

/** 同步状态视图(供 UI 展示;等同 service 的 SyncStatusSnapshot)。 */
export type { SyncStatusSnapshot } from '@services/sync'
export type { SyncStatus }

/** 数据完整性问题(被破坏的引用等)。 */
export interface IntegrityIssue {
  kind:
    | 'notebook-missing' // diary.notebookId 指向不存在的 notebook
    | 'attachment-orphan' // attachment.diaryId 指向不存在的 diary
    | 'album-diary-missing' // album.diaryIds 引用了不存在的 diary
    | 'config-corrupted' // MMKV 某 store JSON 解析失败
  message: string
  /** 相关实体 id(诊断用)。 */
  refId?: string
}

/** 完整性检查报告。 */
export interface IntegrityReport {
  checkedAt: number
  ok: boolean
  issues: IntegrityIssue[]
  stats: BackupStats
}

/** 导入校验结果。 */
export interface ImportValidation {
  valid: boolean
  /** 检测到的问题(版本不支持/schema 不符/字段缺失等)。 */
  errors: string[]
  /** 归一化后的载荷(若可解析;否则 null)。 */
  payload: BackupPayload | null
}
