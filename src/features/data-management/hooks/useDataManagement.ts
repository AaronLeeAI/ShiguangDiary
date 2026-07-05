/**
 * useDataManagement - 数据管理视图模型 Hook
 *
 * 桥接 backupService/syncService 与 dataManagementStore:
 *  - 加载备份列表、同步状态
 *  - 创建/删除备份、导出/导入、完整性检查
 *  - 进度与错误写回 store,供 DataManagementScreen 渲染
 *
 * 页面只消费本 hook,不直访 @services 的 service 实例之外的 @database。
 */

import { useCallback, useEffect } from 'react'

import { backupService, syncService } from '@services'
import { checkIntegrity } from '../utils/integrityChecker'
import { useDataManagementStore } from '../store/dataManagementStore'
import type { BackupMetadata, IntegrityReport, BackupProgress } from '../types'

export interface UseDataManagementResult {
  // 状态
  busy: 'idle' | 'backup' | 'restore' | 'export' | 'import' | 'integrity'
  progress: BackupProgress | null
  lastError: string | null
  lastBackupAt: number | null
  backups: BackupMetadata[]
  integrity: IntegrityReport | null
  // sync 快照
  syncProviderId: string | null
  syncLastSyncedAt: number | null
  syncIsConfigured: boolean

  // actions
  refreshBackups: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  createBackup: () => Promise<BackupMetadata | null>
  deleteBackup: (filename: string) => Promise<void>
  exportJSON: () => Promise<{ filename: string; content: string } | null>
  runIntegrityCheck: () => Promise<IntegrityReport | null>
  validateImport: (json: string) => ReturnType<typeof backupService.validateImport>
  clearError: () => void
}

const tick = (stage: string, value: number) => ({ stage, value })

export function useDataManagement(): UseDataManagementResult {
  const store = useDataManagementStore()

  // 加载备份列表 + 同步状态(挂载时)
  const refreshBackups = useCallback(async () => {
    try {
      const metas = await backupService.listBackups()
      store.setBackups(metas)
      if (metas.length > 0) {
        store.markBackupDone(metas[0].createdAt)
      }
    } catch (e) {
      store.setLastError(e instanceof Error ? e.message : String(e))
    }
  }, [store])

  const refreshSyncStatus = useCallback(async () => {
    try {
      const status = await syncService.getStatus()
      store.setSync({
        providerId: status.providerId,
        lastSyncedAt: status.lastSyncedAt,
        pending: status.pending,
        conflictStrategy: status.conflictStrategy,
        isConfigured: status.isConfigured,
      })
    } catch (e) {
      store.setLastError(e instanceof Error ? e.message : String(e))
    }
  }, [store])

  useEffect(() => {
    refreshBackups()
    refreshSyncStatus()
  }, [refreshBackups, refreshSyncStatus])

  const createBackup = useCallback(async () => {
    store.setBusy('backup')
    store.setProgress(tick('收集数据', 0.1))
    try {
      const meta = await backupService.createBackup()
      store.setProgress(tick('写入备份', 1))
      store.markBackupDone(meta.createdAt)
      await refreshBackups()
      return meta
    } catch (e) {
      store.setLastError(e instanceof Error ? e.message : String(e))
      store.setBusy('idle')
      return null
    }
  }, [store, refreshBackups])

  const deleteBackup = useCallback(
    async (filename: string) => {
      store.setBusy('backup')
      try {
        await backupService.deleteBackup(filename)
        await refreshBackups()
        store.setBusy('idle')
      } catch (e) {
        store.setLastError(e instanceof Error ? e.message : String(e))
        store.setBusy('idle')
      }
    },
    [store, refreshBackups],
  )

  const exportJSON = useCallback(async () => {
    store.setBusy('export')
    store.setProgress(tick('收集数据', 0.1))
    try {
      const file = await backupService.exportJSON()
      store.setProgress(tick('生成 JSON', 1))
      store.setBusy('idle')
      store.setProgress(null)
      return file
    } catch (e) {
      store.setLastError(e instanceof Error ? e.message : String(e))
      store.setBusy('idle')
      return null
    }
  }, [store])

  const runIntegrityCheck = useCallback(async () => {
    store.setBusy('integrity')
    store.setProgress(tick('收集数据', 0.1))
    try {
      const payload = await backupService.collectSnapshot()
      store.setProgress(tick('检查引用', 0.5))
      const report = checkIntegrity({
        diaries: payload.diaries,
        notebooks: payload.notebooks,
        albums: payload.albums,
        tags: payload.tags,
        attachments: payload.attachments,
        drafts: payload.drafts,
        config: payload.config,
      })
      store.setIntegrity(report)
      store.setBusy('idle')
      store.setProgress(null)
      return report
    } catch (e) {
      store.setLastError(e instanceof Error ? e.message : String(e))
      store.setBusy('idle')
      return null
    }
  }, [store])

  const validateImport = useCallback((json: string) => backupService.validateImport(json), [])

  const clearError = useCallback(() => store.setLastError(null), [store])

  return {
    busy: store.busy,
    progress: store.progress,
    lastError: store.lastError,
    lastBackupAt: store.lastBackupAt,
    backups: store.backups,
    integrity: store.integrity,
    syncProviderId: store.sync.providerId,
    syncLastSyncedAt: store.sync.lastSyncedAt,
    syncIsConfigured: store.sync.isConfigured,
    refreshBackups,
    refreshSyncStatus,
    createBackup,
    deleteBackup,
    exportJSON,
    runIntegrityCheck,
    validateImport,
    clearError,
  }
}
