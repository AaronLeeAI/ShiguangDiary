/**
 * Store Types
 *
 * Application-wide Zustand state contracts.
 */

import type { ThemeMode } from '@theme'

export type AppLifecycleStatus = 'idle' | 'initializing' | 'ready' | 'error'

export type NetworkStatus = 'unknown' | 'online' | 'offline'

export interface AppState {
  isFirstLaunch: boolean
  lifecycleStatus: AppLifecycleStatus
  initializedAt: number | null
  networkStatus: NetworkStatus
  error: string | null
  startInitialization: () => void
  markReady: () => void
  markError: (message: string) => void
  setFirstLaunch: (isFirstLaunch: boolean) => void
  setNetworkStatus: (status: NetworkStatus) => void
  resetAppState: () => void
}

export interface GlobalDialogState {
  type: string
  payload?: unknown
}

export interface GlobalLoadingState {
  visible: boolean
  message?: string
}

export interface UiState {
  loading: GlobalLoadingState
  dialog: GlobalDialogState | null
  bottomSheet: GlobalDialogState | null
  language: 'zh-CN'
  showLoading: (message?: string) => void
  hideLoading: () => void
  openDialog: (dialog: GlobalDialogState) => void
  closeDialog: () => void
  openBottomSheet: (sheet: GlobalDialogState) => void
  closeBottomSheet: () => void
  resetUiState: () => void
}

export type HomeListStyle = 'timeline' | 'card' | 'compact'

export type DiarySortOrder = 'updatedDesc' | 'createdDesc' | 'createdAsc'

export interface EditorPreferenceState {
  fontScale: number
  toolbarEnabled: boolean
  autoSaveInterval: number
}

export interface PreferenceState {
  themeMode: ThemeMode | 'system'
  homeListStyle: HomeListStyle
  diarySortOrder: DiarySortOrder
  editor: EditorPreferenceState
  setThemeMode: (mode: ThemeMode | 'system') => void
  setHomeListStyle: (style: HomeListStyle) => void
  setDiarySortOrder: (order: DiarySortOrder) => void
  setEditorPreferences: (preferences: Partial<EditorPreferenceState>) => void
  resetPreferences: () => void
}

export interface SessionUser {
  userId: string
  nickname: string
  avatar: string | null
}

export interface SessionState {
  token: string | null
  user: SessionUser | null
  isAuthenticated: boolean
  login: (token: string, userId: string, nickname: string, avatar?: string | null) => void
  logout: () => void
  updateProfile: (data: Partial<Pick<SessionUser, 'nickname' | 'avatar'>>) => void
}

export interface EditorDraft {
  content: string
  /** 完整编辑快照（Task10 编辑引擎使用；旧数据可缺省） */
  title?: string
  weather?: string | null
  mood?: string | null
  location?: string | null
  updatedAt: number
}

export interface EditorDraftState {
  drafts: Record<string, EditorDraft>
  setDraft: (key: string, content: string) => void
  getDraft: (key: string) => string | undefined
  /** 写入完整编辑快照（标题/正文/天气/心情/位置）。 */
  setSnapshot: (key: string, snapshot: Omit<EditorDraft, 'updatedAt'>) => void
  /** 读取完整编辑快照。 */
  getSnapshot: (key: string) => EditorDraft | undefined
  removeDraft: (key: string) => void
  clearDrafts: () => void
}
