/**
 * Data Management Feature - 公共导出
 *
 * 数据生命周期管理(备份/恢复/导出/导入/同步框架/完整性检查)。
 * Local First:本地数据为唯一可信来源(DECISIONS 035)。
 *
 * 数据流:DataManagementScreen → useDataManagement → dataManagementStore
 * ── backupService(SERVICE_KEYS.backup, 见 @services) ── 纯函数(dataExportEngine/backupSchema/integrityChecker)
 * ── @database Repository/fileStorage/mmkvStorage。
 *
 * 页面/store 不直访 @database,统一经本 feature service 层(backupService 经 registerServices 注册)。
 * syncService 框架(SyncProvider 接口)在 @services/sync,本 feature 复用。
 */

// 纯函数(可单测)
export {
  buildBackupPayload,
  serializePayload,
  parseRawPayload,
  type BuildPayloadInput,
} from './utils/dataExportEngine'

export { validateBackupPayload } from './utils/backupSchema'
export { checkIntegrity } from './utils/integrityChecker'

// store + hook
export { useDataManagement } from './hooks/useDataManagement'
export { useDataManagementStore } from './store/dataManagementStore'
export type { DataManagementState } from './store/dataManagementStore'

// 组件
export { BackupCard } from './components/BackupCard'
export type { BackupCardProps } from './components/BackupCard'
export { SyncStatusCard } from './components/SyncStatusCard'
export type { SyncStatusCardProps } from './components/SyncStatusCard'

// 类型
export type {
  BackupPayload,
  BackupStats,
  ConfigSnapshot,
  BackupMetadata,
  BackupProgress,
  ConflictStrategy,
  SyncProvider,
  SyncPushResult,
  SyncPullResult,
  SyncStatus,
  SyncResult,
  IntegrityIssue,
  IntegrityReport,
  ImportValidation,
} from './types'
export { BACKUP_SCHEMA_VERSION } from './types'
