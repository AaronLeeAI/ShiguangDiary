/**
 * Sync Framework - 同步提供者接口与冲突解决策略
 *
 * Task15 建立统一同步框架(Out of Scope:不实现真实 WebDAV/Git/Cloud 同步)。
 * 当前 LocalProvider 仅占位:本地数据为唯一真源,无远端,push/pull 返回 0。
 * 未来增加 WebDAVProvider/GitProvider/CloudProvider 时实现本接口即可,无需改业务代码。
 *
 * 冲突解决策略:即使当前无远端也保留接口设计(Task15 要求)。
 */

import { createLogger } from '../core'

const log = createLogger('SyncProvider')

/** 冲突解决策略。 */
export type ConflictStrategy = 'lastModified' | 'keepLocal' | 'keepRemote' | 'manual'

export interface SyncPushResult {
  pushed: number
  failed: number
}

export interface SyncPullResult {
  pulled: number
  conflicts: number
  failed: number
}

/** 同步提供者接口。 */
export interface SyncProvider {
  readonly id: string
  readonly displayName: string
  isConfigured(): boolean
  push(): Promise<SyncPushResult>
  pull(): Promise<SyncPullResult>
}

/**
 * Local Provider - 占位实现。
 * Local First 架构下,无远端时本地即真源,push/pull 均为 no-op,返回 0。
 */
export const localSyncProvider: SyncProvider = {
  id: 'local',
  displayName: '本地(无同步)',
  isConfigured: () => true,
  async push() {
    log.debug('local provider push — no remote, no-op')
    return { pushed: 0, failed: 0 }
  },
  async pull() {
    log.debug('local provider pull — no remote, no-op')
    return { pulled: 0, conflicts: 0, failed: 0 }
  },
}
