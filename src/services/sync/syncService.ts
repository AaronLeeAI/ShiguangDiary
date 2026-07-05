/**
 * Sync Service - 同步框架运行时入口
 *
 * Task15 同步框架:SyncProvider 接口(见 ./providers) + 冲突解决策略 + 生命周期。
 * 当前阶段 LocalProvider 占位(Local First 无远端),未来 WebDAV/Git/Cloud Provider
 * 实现 SyncProvider 接口并在此 setProvider 即可,业务代码不变。
 *
 * 同步入口统一经本 Service,禁止页面直接调用 HTTP Client。
 */

import { toServiceError, createLogger } from '../core'
import { type SyncProvider, type ConflictStrategy, localSyncProvider } from './providers'

const log = createLogger('SyncService')

export type { SyncProvider, ConflictStrategy, SyncPushResult, SyncPullResult } from './providers'

export interface SyncResult {
  pushed: number
  pulled: number
  conflicts: number
  failed: number
  strategy: ConflictStrategy
  providerId: string
}

export interface SyncStatusSnapshot {
  providerId: string
  lastSyncedAt: number | null
  pending: number
  conflictStrategy: ConflictStrategy
  isConfigured: boolean
}

interface SyncRuntime {
  provider: SyncProvider
  conflictStrategy: ConflictStrategy
  lastSyncedAt: number | null
  pending: number
}

const runtime: SyncRuntime = {
  provider: localSyncProvider,
  conflictStrategy: 'lastModified',
  lastSyncedAt: null,
  pending: 0,
}

export const syncService = {
  /** 当前提供者(默认 local)。 */
  getProvider(): SyncProvider {
    return runtime.provider
  },

  /** 切换同步提供者(未来接入 WebDAV/Git 时调用)。 */
  setProvider(provider: SyncProvider): void {
    runtime.provider = provider
    log.info(`provider switched to ${provider.id}`)
  },

  /** 设置冲突解决策略。 */
  setConflictStrategy(strategy: ConflictStrategy): void {
    runtime.conflictStrategy = strategy
    log.info(`conflict strategy set to ${strategy}`)
  },

  /** 同步状态查询快照。 */
  async getStatus(): Promise<SyncStatusSnapshot> {
    return {
      providerId: runtime.provider.id,
      lastSyncedAt: runtime.lastSyncedAt,
      pending: runtime.pending,
      conflictStrategy: runtime.conflictStrategy,
      isConfigured: runtime.provider.isConfigured(),
    }
  },

  /** 触发一次同步(push + pull)。 */
  async sync(): Promise<SyncResult> {
    const provider = runtime.provider
    const strategy = runtime.conflictStrategy
    try {
      const push = await provider.push()
      const pull = await provider.pull()
      runtime.lastSyncedAt = Date.now()
      runtime.pending = 0
      log.info('sync completed', { provider: provider.id, push, pull })
      return {
        pushed: push.pushed,
        pulled: pull.pulled,
        conflicts: pull.conflicts,
        failed: push.failed + pull.failed,
        strategy,
        providerId: provider.id,
      }
    } catch (error) {
      log.error('sync failed', error)
      throw toServiceError(error, 'REMOTE_ERROR')
    }
  },
}

export default syncService
