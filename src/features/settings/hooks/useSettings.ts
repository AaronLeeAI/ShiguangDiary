/**
 * useSettings - 设置视图模型 Hook
 *
 * 订阅 preferencesStore(MMKV 持久化偏好),暴露配置值 + 即时生效的 setter。
 * SettingsScreen/PreferencesScreen 只消费本 hook,不直接读 store 内部、不直接访问 MMKV。
 *
 * 数据流:Settings 页 → useSettings → preferencesStore(MMKV) ── settingsService(门面:校验/迁移/通知)
 */

import { useColorScheme } from 'react-native'

import { usePreferencesStore } from '@store/preferences'
import type { HomeListStyle, DiarySortOrder, EditorPreferenceState } from '@store/types'
import type { ThemeModePref } from '../types'

export interface UseSettingsResult {
  // 配置值
  themeMode: ThemeModePref
  homeListStyle: HomeListStyle
  diarySortOrder: DiarySortOrder
  editor: EditorPreferenceState
  /** 是否深色(派生:显式 dark,或 system 跟随系统深色)。 */
  isDark: boolean
  /** 主题是否跟随系统。 */
  followsSystem: boolean

  // 即时生效的 setter(经 preferencesStore actions,同步持久化 MMKV)
  setThemeMode: (mode: ThemeModePref) => void
  setHomeListStyle: (style: HomeListStyle) => void
  setDiarySortOrder: (order: DiarySortOrder) => void
  setEditorPreferences: (patch: Partial<EditorPreferenceState>) => void
  /** 重置全部偏好为默认值。 */
  resetPreferences: () => void
}

export function useSettings(): UseSettingsResult {
  const themeMode = usePreferencesStore(s => s.themeMode)
  const homeListStyle = usePreferencesStore(s => s.homeListStyle)
  const diarySortOrder = usePreferencesStore(s => s.diarySortOrder)
  const editor = usePreferencesStore(s => s.editor)
  const setThemeMode = usePreferencesStore(s => s.setThemeMode)
  const setHomeListStyle = usePreferencesStore(s => s.setHomeListStyle)
  const setDiarySortOrder = usePreferencesStore(s => s.setDiarySortOrder)
  const setEditorPreferences = usePreferencesStore(s => s.setEditorPreferences)
  const resetPreferences = usePreferencesStore(s => s.resetPreferences)

  const systemScheme = useColorScheme()
  const followsSystem = themeMode === 'system'
  const isDark = followsSystem ? systemScheme === 'dark' : themeMode === 'dark'

  return {
    themeMode,
    homeListStyle,
    diarySortOrder,
    editor,
    isDark,
    followsSystem,
    setThemeMode,
    setHomeListStyle,
    setDiarySortOrder,
    setEditorPreferences,
    resetPreferences,
  }
}
