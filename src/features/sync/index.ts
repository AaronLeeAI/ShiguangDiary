/**
 * Sync Feature - 公共导出
 *
 * 当前同步能力由 services/sync 承载；feature 层作为业务侧统一入口重新导出。
 */

export { syncService } from '@services/sync'
export type { SyncResult, SyncStatusSnapshot } from '@services/sync'
export { localSyncProvider } from '@services/sync'
export type { SyncProvider, ConflictStrategy, SyncPushResult, SyncPullResult } from '@services/sync'
