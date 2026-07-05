/**
 * Data Management Store - 数据管理运行时态
 *
 * 持有备份/恢复/导入/导出/完整性检查的运行时状态(busy/progress/lastError)
 * 与最近一次完整性报告 + 同步状态快照。不持久化(派生/瞬时态,见 DECISIONS 033 范式)。
 *
 * 数据流:useDataManagement 调 backupService/syncService/integrityChecker 后写回本 store。
 * 真正持久化(备份文件落盘 / MMKV 配置)由 backupService 负责,本 store 不重复持久化。
 */

import { create } from 'zustand'

import type {
  BackupMetadata,
  BackupProgress,
  IntegrityReport,
  SyncStatus,
  ConflictStrategy,
} from '../types'

const INITIAL_SYNC_STATUS: SyncStatus = {
  providerId: 'local',
  lastSyncedAt: null,
  pending: 0,
  conflictStrategy: 'lastModified',
  isConfigured: true,
}

/** 运行时态(不含 actions)。 */
interface DataManagementRuntimeState {
  lastBackupAt: number | null
  busy: 'idle' | 'backup' | 'restore' | 'export' | 'import' | 'integrity'
  progress: BackupProgress | null
  lastError: string | null
  integrity: IntegrityReport | null
  sync: SyncStatus
  /** 备份列表缓存(由 hook 拉取后写入)。 */
  backups: BackupMetadata[]
}

interface DataManagementActions {
  setBusy: (busy: DataManagementRuntimeState['busy']) => void
  setProgress: (progress: BackupProgress | null) => void
  setLastError: (message: string | null) => void
  setIntegrity: (report: IntegrityReport | null) => void
  setSync: (status: Partial<SyncStatus>) => void
  setConflictStrategy: (strategy: ConflictStrategy) => void
  setBackups: (backups: BackupMetadata[]) => void
  markBackupDone: (at: number) => void
  reset: () => void
}

export interface DataManagementState extends DataManagementRuntimeState, DataManagementActions {}

const initialState: DataManagementRuntimeState = {
  lastBackupAt: null,
  busy: 'idle',
  progress: null,
  lastError: null,
  integrity: null,
  sync: INITIAL_SYNC_STATUS,
  backups: [],
}

export const useDataManagementStore = create<DataManagementState>((set, get) => ({
  ...initialState,

  setBusy: busy => set({ busy, progress: busy === 'idle' ? null : get().progress }),
  setProgress: progress => set({ progress }),
  setLastError: message => set({ lastError: message }),
  setIntegrity: report => set({ integrity: report }),
  setSync: status => set({ sync: { ...get().sync, ...status } }),
  setConflictStrategy: strategy => set({ sync: { ...get().sync, conflictStrategy: strategy } }),
  setBackups: backups => set({ backups }),
  markBackupDone: at => set({ lastBackupAt: at, busy: 'idle', progress: null }),
  reset: () => set({ ...initialState }),
}))

export default useDataManagementStore
