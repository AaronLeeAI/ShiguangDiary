/**
 * Settings Feature - 公共导出
 *
 * 配置纯派生于 preferencesStore(MMKV,DECISIONS 034):useSettings 订阅 preferencesStore 暴露
 * 即时生效 setter;settingsService 为门面(校验/迁移/通知,见 services/settings);页面不直接访问 MMKV。
 * 偏好值类型复用 @store/types,不在本 feature 重复定义。
 */

export { useSettings } from './hooks/useSettings'
export type { UseSettingsResult } from './hooks/useSettings'

export {
  DEFAULT_CONFIG,
  CURRENT_CONFIG_VERSION,
  validateConfig,
  migrateConfig,
  diffConfig,
  configVersion,
} from './utils/configurationCenter'

export { AboutCard } from './components/AboutCard'
export type { AboutCardProps } from './components/AboutCard'
export { ThemeModeSelector } from './components/ThemeModeSelector'
export type { ThemeModeSelectorProps } from './components/ThemeModeSelector'
export { Stepper } from './components/Stepper'
export type { StepperProps } from './components/Stepper'

export type {
  ThemeModePref,
  ConfigSnapshot,
  SettingsVersion,
  SettingsCategoryId,
  SettingsEntryKind,
  SettingsEntry,
  ConfigChange,
  PreferenceValues,
} from './types'
