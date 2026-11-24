/**
 * Backup Service - 数据生命周期门面(Backup/Restore/Export/Import)
 *
 * 在 @database Repository 之上提供数据备份/恢复/导出/导入能力。
 * - 导出/导入:JSON(本 Task);ZIP/附件二进制打包见 Out of Scope,留 TODO。
 * - 经 fileStorage 'backups' bucket 持久化备份文件(不直访文件系统)。
 * - 配置快照经 mmkvStorage 读 storePersistKeys(DECISIONS 034:配置走 MMKV)。
 *
 * 注册到 ServiceRegistry(SERVICE_KEYS.backup)。页面/store 经本 service,不直访 @database。
 */

import RNFS from 'react-native-fs'

import { APP_VERSION } from '@constants/app'
import {
  diaryRepository,
  notebookRepository,
  albumRepository,
  tagRepository,
  attachmentRepository,
  draftRepository,
  fileStorage,
  type FileBucket,
} from '@database'
import { mmkvStorage } from '@storage/mmkvStorage'
import { storePersistKeys } from '@store/persist'
import { toServiceError, createLogger } from '../core'
import {
  buildBackupPayload,
  serializePayload,
  parseRawPayload,
} from '../../features/data-management/utils/dataExportEngine'
import { validateBackupPayload } from '../../features/data-management/utils/backupSchema'
import type {
  BackupMetadata,
  BackupStats,
  ConfigSnapshot,
  BackupPayload,
} from '../../features/data-management/types'

const log = createLogger('BackupService')

const BACKUP_BUCKET: FileBucket = 'backups'

/** 读 MMKV 各 store 的原始 JSON 字符串(配置快照)。 */
async function readConfigSnapshot(): Promise<ConfigSnapshot> {
  const [app, preferences, session, editorDrafts, searchHistory] = await Promise.all([
    mmkvStorage.getItem(storePersistKeys.app),
    mmkvStorage.getItem(storePersistKeys.preferences),
    mmkvStorage.getItem(storePersistKeys.session),
    mmkvStorage.getItem(storePersistKeys.editorDrafts),
    mmkvStorage.getItem(storePersistKeys.searchHistory),
  ])
  return {
    app: app ?? null,
    preferences: preferences ?? null,
    session: session ?? null,
    editorDrafts: editorDrafts ?? null,
    searchHistory: searchHistory ?? null,
  }
}

/** 从 payload 派生统计摘要。 */
const statsFrom = (p: BackupPayload): BackupStats => ({
  notebooks: p.notebooks.length,
  diaries: p.diaries.length,
  albums: p.albums.length,
  tags: p.tags.length,
  attachments: p.attachments.length,
  drafts: p.drafts.length,
})

/**
 * 收集全量业务数据为 BackupPayload(纯数据)。
 * attachments 按 diary 迭代收集元数据(attachmentRepository 无全量 list,见 audit);
 * 附件二进制文件打包属 Out of Scope,本 Task 留 TODO。
 */
async function collectPayload(): Promise<BackupPayload> {
  const [diaries, notebooks, albums, tags, drafts] = await Promise.all([
    diaryRepository.list(),
    notebookRepository.list(),
    albumRepository.list(),
    tagRepository.list(),
    draftRepository.list(),
  ])

  const attachments = []
  for (const d of diaries) {
    const items = await attachmentRepository.findByDiaryId(d.id)
    for (const a of items) {
      attachments.push(a)
    }
  }

  const config = await readConfigSnapshot()
  return buildBackupPayload({
    notebooks,
    diaries,
    albums,
    tags,
    attachments,
    drafts,
    config,
    appVersion: APP_VERSION,
  })
}

interface BackupFile {
  filename: string
  content: string
}

/** 生成备份文件名(ISO 日期,文件名安全)。 */
function backupFilename(now: number): string {
  const iso = new Date(now).toISOString().replace(/[:.]/g, '-')
  return `backup-${iso}.json`
}

/** 把文件名+payload 转为 BackupMetadata(含文件大小)。 */
async function statToMetadata(
  filename: string,
  path: string,
  payload: BackupPayload,
): Promise<BackupMetadata> {
  let size = 0
  try {
    const stat = await RNFS.stat(path)
    size = typeof stat.size === 'number' ? stat.size : 0
  } catch (e) {
    log.warn('stat failed for backup', filename, e)
  }
  return {
    filename,
    path,
    createdAt: payload.createdAt,
    size,
    schemaVersion: payload.schemaVersion,
    appVersion: payload.appVersion,
    stats: statsFrom(payload),
  }
}

export const backupService = {
  /**
   * 创建完整备份(JSON),写入 backups bucket。
   * @returns 生成的备份元数据。
   */
  async createBackup(): Promise<BackupMetadata> {
    try {
      const payload = await collectPayload()
      const content = serializePayload(payload)
      const filename = backupFilename(payload.createdAt)
      const path = await fileStorage.writeText(BACKUP_BUCKET, filename, content)
      log.info('backup created', { filename, stats: payload.stats })
      return statToMetadata(filename, path, payload)
    } catch (error) {
      log.error('createBackup failed', error)
      throw toServiceError(error)
    }
  },

  /** 列出 backups bucket 内的备份(按创建时间倒序)。 */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const names = await fileStorage.list(BACKUP_BUCKET)
      const metas: BackupMetadata[] = []
      for (const filename of names) {
        if (!filename.endsWith('.json')) {
          continue
        }
        try {
          const content = await fileStorage.readText(BACKUP_BUCKET, filename)
          const raw = parseRawPayload(content)
          const { payload } = validateBackupPayload(raw)
          const path = `${fileStorage.dir(BACKUP_BUCKET)}/${filename}`
          if (payload) {
            metas.push(await statToMetadata(filename, path, payload))
          }
        } catch (e) {
          log.warn('skip unreadable backup', filename, e)
        }
      }
      metas.sort((a, b) => b.createdAt - a.createdAt)
      return metas
    } catch (error) {
      log.error('listBackups failed', error)
      throw toServiceError(error)
    }
  },

  /** 删除指定备份。 */
  async deleteBackup(filename: string): Promise<void> {
    try {
      await fileStorage.remove(BACKUP_BUCKET, filename)
      log.info('backup deleted', { filename })
    } catch (error) {
      log.error('deleteBackup failed', filename, error)
      throw toServiceError(error)
    }
  },

  /**
   * 导出数据为 JSON 文本(供 UI 分享/另存到 exports bucket)。
   * @returns { filename, content }。
   */
  async exportJSON(): Promise<BackupFile> {
    try {
      const payload = await collectPayload()
      return {
        filename: `shiguang-export-${payload.createdAt}.json`,
        content: serializePayload(payload),
      }
    } catch (error) {
      log.error('exportJSON failed', error)
      throw toServiceError(error)
    }
  },

  /**
   * 写导出 JSON 到 exports bucket(Task15 Out of Scope:分享面板,
   * 本方法提供落盘能力供 UI 二次确认后调用)。
   * @returns 写入后的完整路径。
   */
  async writeExport(filename: string, content: string): Promise<string> {
    try {
      return fileStorage.writeText('exports', filename, content)
    } catch (error) {
      log.error('writeExport failed', filename, error)
      throw toServiceError(error)
    }
  },

  /** 收集全量数据(供完整性检查,不落盘)。 */
  async collectSnapshot(): Promise<BackupPayload> {
    try {
      return collectPayload()
    } catch (error) {
      log.error('collectSnapshot failed', error)
      throw toServiceError(error)
    }
  },

  /**
   * 校验导入文本为合法 BackupPayload(版本/Schema/字段)。
   * 不写入数据库,仅返回校验结果 + 归一化载荷(供 UI 预览 + 二次确认)。
   */
  validateImport(json: string): {
    valid: boolean
    errors: string[]
    payload: BackupPayload | null
  } {
    try {
      const raw = parseRawPayload(json)
      return validateBackupPayload(raw)
    } catch (error) {
      log.warn('validateImport parse failed', error)
      return { valid: false, errors: ['invalid JSON'], payload: null }
    }
  },

  /**
   * 恢复备份:读取 backups bucket 内指定备份文件,校验后逐表 best-effort 恢复。
   *
   * 本 Task 实现数据级恢复骨架:逐表 upsert/insert,失败项记日志不抛(满足"不破坏原始数据")。
   * 完整事务性回滚(closeDatabase → 原子替换 SQLite → 重开)属 Out of Scope,留后续 task
   * (Task15 Risks:"恢复覆盖错误数据";当前阶段校验在前 + best-effort,避免半恢复一致性问题,
   * 但不保证强原子性)。
   *
   * 返回恢复统计;调用方(页面/hook)在成功后应刷新应用内存缓存(如 diaryStore.reload()),
   * 否则各派生视图会显示恢复前的旧数据。
   *
   * @param meta 备份元数据(filename 决定读取哪一个备份)。
   */
  async restoreBackup(meta: BackupMetadata): Promise<BackupStats> {
    try {
      const raw = await fileStorage.readText(BACKUP_BUCKET, meta.filename)
      const { valid, errors, payload } = validateBackupPayload(parseRawPayload(raw))
      if (!valid || !payload) {
        throw new Error(`备份文件校验失败:${errors.join('; ')}`)
      }
      return await backupService.restoreFromPayload(payload)
    } catch (error) {
      log.error('restoreBackup failed', meta.filename, error)
      throw toServiceError(error)
    }
  },

  /**
   * 恢复备份:将 payload 写回各 Repository(best-effort)。
   *
   * 不负责读取/校验文件(由 restoreBackup 上一层完成),也不刷新应用内存缓存
   * (调用方负责,避免 service 层依赖具体 store)。
   */
  async restoreFromPayload(payload: BackupPayload): Promise<BackupStats> {
    try {
      for (const n of payload.notebooks) {
        try {
          await notebookRepository.update(n.id, n)
        } catch {
          await notebookRepository
            .create(n)
            .catch(e => log.warn('restore notebook upsert failed', n.id, e))
        }
      }
      for (const d of payload.diaries) {
        try {
          await diaryRepository.update(d.id, d)
        } catch (e) {
          log.warn('restore diary update failed, skip', d.id, e)
        }
      }
      for (const a of payload.attachments) {
        await attachmentRepository
          .create(a)
          .catch(e => log.warn('restore attachment failed', a.id, e))
      }
      for (const al of payload.albums) {
        await albumRepository.create(al).catch(e => log.warn('restore album failed', al.id, e))
      }
      for (const t of payload.tags) {
        try {
          await tagRepository.update(t.id, t)
        } catch {
          await tagRepository.create(t).catch(e => log.warn('restore tag upsert failed', t.id, e))
        }
      }
      for (const dr of payload.drafts) {
        await draftRepository.upsert(dr).catch(e => log.warn('restore draft failed', dr.id, e))
      }

      log.info('restore applied (best-effort)', statsFrom(payload))
      return statsFrom(payload)
    } catch (error) {
      log.error('restoreFromPayload failed', error)
      throw toServiceError(error)
    }
  },
}

export default backupService
