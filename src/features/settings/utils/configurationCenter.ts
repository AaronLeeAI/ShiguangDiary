/**
 * Configuration Center - 配置管理纯函数
 *
 * 文档 Configuration Center 的纯函数核心:默认值/校验/迁移/比较。
 * 全纯函数,零 IO,可单测。settingsService 调用本模块包装 preferencesStore。
 *
 * **DEFAULT_CONFIG 须与 `src/store/preferences/preferencesStore.ts` 的 initialState 保持一致**
 * (单测 `configurationCenter.test.ts` 断言对齐)。两个真值源并行声明,避免 feature 与 store 循环依赖;
 * 修改任一处须同步另一处。
 *
 * 配置走 preferencesStore(MMKV),不走 SQLite(DECISIONS 034)。
 */

import type {
  ConfigSnapshot,
  ThemeModePref,
  HomeListStyle,
  DiarySortOrder,
  EditorPreferenceState,
  ConfigChange,
} from '../types'

/** 当前配置版本号(升级时递增;旧版本数据经 migrateConfig 迁移到 current)。 */
export const CURRENT_CONFIG_VERSION = 1

/** 合法主题模式偏好值。 */
const VALID_THEME_MODES: ReadonlyArray<ThemeModePref> = ['system', 'light', 'dark']

/** 合法首页列表样式。 */
const VALID_HOME_LIST_STYLES: ReadonlyArray<HomeListStyle> = ['timeline', 'card', 'compact']

/** 合法日记排序。 */
const VALID_DIARY_SORT_ORDERS: ReadonlyArray<DiarySortOrder> = [
  'updatedDesc',
  'createdDesc',
  'createdAsc',
]

/**
 * 默认配置(单一默认值来源,DECISIONS 034)。
 * 与 preferencesStore initialState 值部分一致。
 */
export const DEFAULT_CONFIG: ConfigSnapshot = {
  themeMode: 'system',
  homeListStyle: 'timeline',
  diarySortOrder: 'updatedDesc',
  editor: {
    fontScale: 1,
    toolbarEnabled: true,
    autoSaveInterval: 3000,
  },
}

/** 当前配置版本(供 settingsService 判断是否需要迁移)。 */
export function configVersion(): number {
  return CURRENT_CONFIG_VERSION
}

/** 是否为合法 editor 子配置。 */
const isValidEditor = (e: unknown): e is EditorPreferenceState =>
  typeof e === 'object' &&
  e !== null &&
  'fontScale' in e &&
  'toolbarEnabled' in e &&
  'autoSaveInterval' in e &&
  typeof (e as Record<string, unknown>).fontScale === 'number' &&
  typeof (e as Record<string, unknown>).toolbarEnabled === 'boolean' &&
  typeof (e as Record<string, unknown>).autoSaveInterval === 'number' &&
  (e as EditorPreferenceState).fontScale > 0 &&
  (e as EditorPreferenceState).autoSaveInterval > 0

/**
 * 校验一段原始数据为合法 ConfigSnapshot;非法/缺失字段用 DEFAULT 回填。
 * 返回归一化结果 + 是否改动过 + 校验是否完全通过(无回填)。
 */
export function validateConfig(raw: unknown): {
  normalized: ConfigSnapshot
  changed: boolean
  valid: boolean
} {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  let changed = false
  const out: ConfigSnapshot = { ...DEFAULT_CONFIG, editor: { ...DEFAULT_CONFIG.editor } }

  // themeMode
  if (VALID_THEME_MODES.includes(src.themeMode as ThemeModePref)) {
    out.themeMode = src.themeMode as ThemeModePref
  } else {
    changed = true
  }
  // homeListStyle
  if (VALID_HOME_LIST_STYLES.includes(src.homeListStyle as HomeListStyle)) {
    out.homeListStyle = src.homeListStyle as HomeListStyle
  } else {
    changed = true
  }
  // diarySortOrder
  if (VALID_DIARY_SORT_ORDERS.includes(src.diarySortOrder as DiarySortOrder)) {
    out.diarySortOrder = src.diarySortOrder as DiarySortOrder
  } else {
    changed = true
  }
  // editor
  if (isValidEditor(src.editor)) {
    out.editor = { ...src.editor }
  } else {
    changed = true
  }

  return { normalized: out, changed, valid: !changed }
}

/**
 * 迁移入口:任意未知结构 → 合法 ConfigSnapshot。
 * 初版迁移策略:无版本号 / 版本 < current → 全字段 validate(补默认值);
 * 版本 = current → 直接 validate。
 * 未来版本递增在此函数内追加分支(升序迁移)。
 */
export function migrateConfig(raw: unknown): { config: ConfigSnapshot; changed: boolean } {
  // 初版无版本字段存储在 preferencesStore(只有值),故统一走 validate。
  // 未来引入 __version 字段时,按版本号分段迁移。
  const { normalized, changed } = validateConfig(raw)
  return { config: normalized, changed }
}

/**
 * 比较两份配置,列出变更键(供 settingsService 配置变更通知)。
 */
export function diffConfig(prev: ConfigSnapshot, next: ConfigSnapshot): ConfigChange {
  const keys: Array<keyof ConfigSnapshot> = []
  if (prev.themeMode !== next.themeMode) keys.push('themeMode')
  if (prev.homeListStyle !== next.homeListStyle) keys.push('homeListStyle')
  if (prev.diarySortOrder !== next.diarySortOrder) keys.push('diarySortOrder')
  if (
    prev.editor.fontScale !== next.editor.fontScale ||
    prev.editor.toolbarEnabled !== next.editor.toolbarEnabled ||
    prev.editor.autoSaveInterval !== next.editor.autoSaveInterval
  ) {
    keys.push('editor')
  }
  return { keys, prev, next }
}
