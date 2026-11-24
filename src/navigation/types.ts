/**
 * Navigation Types
 *
 * Type definitions for all navigation stacks and tabs.
 */

import type { NavigatorScreenParams } from '@react-navigation/native'

// Root Stack 参数列表
export type RootStackParamList = {
  // 启动
  Splash: undefined
  MainTabs: NavigatorScreenParams<TabParamList> | undefined

  // 主 Tab 页
  Home: undefined
  Notebook: undefined
  Album: undefined
  Profile: undefined

  // 搜索
  Search: undefined

  // 二级页面（Modal Stack）
  DiaryView: { id: string }
  DiaryEdit: { id?: string; notebookId?: string }
  NotebookCreate: undefined
  NotebookDetail: { id: string }
  NotebookSort: undefined
  AlbumCreate: undefined
  AlbumDetail: { id: string }
  Account: undefined
  Settings: undefined
  About: undefined
  Recycle: undefined
  DarkMode: undefined
  Export: undefined
  VIP: undefined
  Statistics: undefined
  Drafts: undefined
  Preferences: undefined
  ListStyle: undefined
  ThemeBackground: undefined
  EditorToolbarPicker: undefined
  FontManagement: undefined
  AppLock: undefined
  AppLockGesture: undefined
  StickyNote: undefined
  AgentChat: undefined

  // 对话框/弹层
  Modal: { type: string; props?: unknown }
}

// Tab 参数列表
export type TabParamList = {
  Home: undefined
  Notebook: undefined
  Album: undefined
  Profile: undefined
}

// Modal 类型枚举
export type ModalType =
  | 'DiaryView'
  | 'DiaryEdit'
  | 'NotebookCreate'
  | 'NotebookDetail'
  | 'NotebookSort'
  | 'AlbumCreate'
  | 'AlbumDetail'
  | 'Account'
  | 'About'
  | 'Recycle'
  | 'DarkMode'
  | 'Export'
  | 'Statistics'
  | 'Drafts'
  | 'Preferences'
  | 'NotebookFilter'
  | 'DiaryLongPress'
  | 'DiaryBottomList'
  | 'EditExit'
  | 'EditTarget'
  | 'EventReminder'
  | 'TimePicker'
  | 'ChangeBackground'
  | 'DraftActions'
  | 'LoadingDialog'
  | 'FontCard'
  | 'ListStyleCard'
  | 'ThemePreviewCard'
  | 'ColorSwatch'
  | 'EventReminderDialog'
  | 'FilterDropdown'
  | 'DateTimePicker'
  | 'Switch'
  | 'RadioGroup'
  | 'Checkbox'
  | 'Tag'
  | 'Avatar'
  | 'Loading'
  | 'Toast'
  | 'Skeleton'
  | 'DiaryBookCard'
  | 'AlbumCard'
  | 'SettingsRow'
  | 'SettingsGroup'
  | 'LockPattern'
  | 'PrimaryButton'
  | 'IconButton'
  | 'TopBar'
  | 'BottomTabBar'
  | 'DiaryCard'
  | 'DateBlock'
  | 'EmptyState'
  | 'Calendar'
  | 'EditorToolbar'
  | 'TextField'
  | 'TextArea'
  | 'ActionSheet'
  | 'AlertDialog'
  | 'BottomSheet'
  | 'ModalHost'
