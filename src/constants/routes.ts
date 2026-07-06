/**
 * Routes 常量
 *
 * 单一可信来源：src/navigation/types.ts
 * 所有路由跳转请使用此处的常量，避免硬编码字符串。
 */

export const ROUTES = {
  // Root
  SPLASH: 'Splash',
  MAIN_TABS: 'MainTabs',
  MODAL: 'Modal',

  // Tabs
  HOME: 'Home',
  NOTEBOOK: 'Notebook',
  ALBUM: 'Album',
  PROFILE: 'Profile',

  // 搜索
  SEARCH: 'Search',

  // 二级页
  DIARY_VIEW: 'DiaryView',
  DIARY_EDIT: 'DiaryEdit',
  NOTEBOOK_CREATE: 'NotebookCreate',
  NOTEBOOK_DETAIL: 'NotebookDetail',
  NOTEBOOK_SORT: 'NotebookSort',
  ALBUM_CREATE: 'AlbumCreate',
  ALBUM_DETAIL: 'AlbumDetail',
  ACCOUNT: 'Account',
  SETTINGS: 'Settings',
  ABOUT: 'About',
  RECYCLE: 'Recycle',
  DARK_MODE: 'DarkMode',
  EXPORT: 'Export',
  VIP: 'VIP',
  STATISTICS: 'Statistics',
  DRAFTS: 'Drafts',
  PREFERENCES: 'Preferences',
  LIST_STYLE: 'ListStyle',
  THEME_BACKGROUND: 'ThemeBackground',
  EDITOR_TOOLBAR_PICKER: 'EditorToolbarPicker',
  FONT_MANAGEMENT: 'FontManagement',
  APP_LOCK: 'AppLock',
  APP_LOCK_GESTURE: 'AppLockGesture',
  STICKY_NOTE: 'StickyNote',
} as const

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]
