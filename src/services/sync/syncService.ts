/**
 * Sync Service - 同步服务（预留）
 *
 * 当前阶段仅建立接口骨架，不实现真实云同步逻辑。
 * 未来接入 WebDAV / REST / Git 同步时在此扩展。
 *
 * 同步入口统一经本 Service，禁止页面直接调用 HTTP Client。
 */

import { ServiceError, createLogger } from '../core'

const log = createLogger('SyncService')

export interface SyncResult {
  pushed: number
  pulled: number
  conflicts: number
}

export const syncService = {
  /** 同步状态查询（预留）。 */
  async getStatus(): Promise<{ lastSyncedAt: number | null; pending: number }> {
    return { lastSyncedAt: null, pending: 0 }
  },

  /** 触发一次同步（预留）。 */
  async sync(): Promise<SyncResult> {
    log.info('sync requested — not implemented (Task08 预留)')
    throw new ServiceError('REMOTE_ERROR', 'Sync is not implemented in the current phase')
  },
}
