/**
 * Settings Feature - 类型定义
 *
 * 偏好值类型**复用 `@store/types`**(PreferenceState 的值子集),不在本 feature 重复定义,
 * 避免"配置分散/重复默认值"(Task14 Risks)。本文件仅新增 Settings 模块 UI 语义类型与
 * Configuration Center 用结构类型。
 *
 * 数据流:SettingsScreen → useSettings → preferencesStore(MMKV 持久化) ── settingsService(门面:校验/迁移/通知)
 * 页面不直接访问 MMKV,统一经 useSettings(preferencesStore actions 的语义封装)。
 */

import type { IconName } from '@/components/Icon'
import type { ThemeMode } from '@theme'
import type {
  HomeListStyle,
  DiarySortOrder,
  EditorPreferenceState,
  PreferenceState,
} from '@store/types'

// 偏好值类型 re-export,供 feature 内外便捷引用。
export type { ThemeMode, HomeListStyle, DiarySortOrder, EditorPreferenceState }

/** 主题模式偏好(允许 'system' 跟随系统,与 ThemeMode 区分)。 */
export type ThemeModePref = ThemeMode | 'system'

/** 配置快照:preferencesStore 中"值"的部分(不含 actions)。用于校验/迁移/通知。 */
export interface ConfigSnapshot {
  themeMode: ThemeModePref
  homeListStyle: HomeListStyle
  diarySortOrder: DiarySortOrder
  editor: EditorPreferenceState
}

/** 配置版本(迁移用,初版 current=1)。 */
export interface SettingsVersion {
  current: number
}

/** 设置分类(对应文档 Preference Categories,本 Task 实现其中一部分)。 */
export type SettingsCategoryId = 'general' | 'appearance' | 'editor' | 'sorting' | 'about'

/** 设置项种类(驱动页面渲染)。 */
export type SettingsEntryKind = 'route' | 'toggle' | 'select' | 'stepper'

/** 单个设置项描述(页面据此渲染,集中声明避免散落)。 */
export interface SettingsEntry {
  id: string
  label: string
  icon: IconName
  category: SettingsCategoryId
  kind: SettingsEntryKind
  /** kind='route' 时跳转的路由名。 */
  route?: string
  /** 绑定的 preferencesStore 偏好键(用于 toggle/select/stepper)。 */
  prefKey?: keyof ConfigSnapshot
  /** select 选项的合法值列表。 */
  options?: ReadonlyArray<{ value: string; label: string }>
  /** stepper 的步长与上下限。 */
  step?: number
  min?: number
  max?: number
  /** 副文案(显示当前值摘要)。 */
  hint?: string
}

/** 配置变更通知(diffConfig 产物)。 */
export interface ConfigChange {
  /** 变更的偏好键集合。 */
  keys: Array<keyof ConfigSnapshot>
  prev: ConfigSnapshot
  next: ConfigSnapshot
}

/** preferencesStore 的值子集选取工具类型。 */
export type PreferenceValues = Pick<PreferenceState, keyof ConfigSnapshot>
