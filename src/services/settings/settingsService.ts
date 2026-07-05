/**
 * Settings Service - 配置门面(Configuration Center 的运行时入口)
 *
 * 包装 `preferencesStore`(MMKV-backed zustand persist)提供统一配置管理:
 * 默认值/校验/版本迁移/变更通知,均经 `configurationCenter` 纯函数(DECISIONS 034)。
 *
 * **不访问 SQLite_preferenceRepository**:配置走 MMKV(preferencesStore 持久化),
 * 满足 Task14"配置不得写入 SQLite""页面不得直接访问 MMKV"——页面经 useSettings
 * 调本 service / preferencesStore actions。
 *
 * 调用方:useSettings hook、AppBootstrap(启动 migrate)、ThemeContext(读 themeMode)。
 * 注册到全局 ServiceRegistry(SERVICE_KEYS.settings,Task08 已注册),签名从 async 改同步
 * (旧 async 调用方无,已审计)。
 */

import { usePreferencesStore } from '@store/preferences'
import type {
  ConfigSnapshot,
  ThemeModePref,
  HomeListStyle,
  DiarySortOrder,
  EditorPreferenceState,
  ConfigChange,
} from '@features/settings/types'
import { migrateConfig, diffConfig } from '@features/settings/utils/configurationCenter'
import { createLogger } from '../core'

const log = createLogger('SettingsService')

/** 取当前配置快照(值子集)。 */
export function getConfig(): ConfigSnapshot {
  const s = usePreferencesStore.getState()
  return {
    themeMode: s.themeMode,
    homeListStyle: s.homeListStyle,
    diarySortOrder: s.diarySortOrder,
    editor: { ...s.editor },
  }
}

/**
 * 单字段写入:经 migrateConfig 校验后写回(非法值被回填为默认,保证 store 始终合法)。
 * 返回实际写入值(供 UI 反馈;若与输入不同说明输入被纠正)。
 */
const writeValidated = <K extends keyof ConfigSnapshot>(
  key: K,
  value: ConfigSnapshot[K],
  apply: (v: ConfigSnapshot[K]) => void,
): ConfigSnapshot[K] => {
  const probe: Partial<ConfigSnapshot> = { [key]: value } as Partial<ConfigSnapshot>
  const { config } = migrateConfig({ ...getConfig(), ...probe })
  const finalValue = config[key]
  apply(finalValue)
  return finalValue
}

export const settingsService = {
  getConfig,

  setThemeMode(mode: ThemeModePref): ThemeModePref {
    return writeValidated('themeMode', mode, v => usePreferencesStore.getState().setThemeMode(v))
  },

  setHomeListStyle(style: HomeListStyle): HomeListStyle {
    return writeValidated('homeListStyle', style, v =>
      usePreferencesStore.getState().setHomeListStyle(v),
    )
  },

  setDiarySortOrder(order: DiarySortOrder): DiarySortOrder {
    return writeValidated('diarySortOrder', order, v =>
      usePreferencesStore.getState().setDiarySortOrder(v),
    )
  },

  setEditorPreferences(patch: Partial<EditorPreferenceState>): EditorPreferenceState {
    const merged = { ...getConfig().editor, ...patch }
    return writeValidated('editor', merged, v =>
      usePreferencesStore.getState().setEditorPreferences(v),
    )
  },

  /** 重置全部偏好为默认值。 */
  resetConfig(): void {
    usePreferencesStore.getState().resetPreferences()
    log.info('config reset to defaults')
  },

  /**
   * 启动迁移:校验当前配置,若有非法/缺失字段则补默认值回写。幂等。
   * @returns 是否进行了迁移(发生回写)。
   */
  migrate(): boolean {
    try {
      const cur = getConfig()
      const { config, changed } = migrateConfig(cur)
      if (!changed) {
        return false
      }
      // 回写迁移后的配置(逐字段经 actions,保证持久化)。
      usePreferencesStore.getState().setThemeMode(config.themeMode)
      usePreferencesStore.getState().setHomeListStyle(config.homeListStyle)
      usePreferencesStore.getState().setDiarySortOrder(config.diarySortOrder)
      usePreferencesStore.getState().setEditorPreferences(config.editor)
      log.info('config migrated to defaults for invalid fields')
      return true
    } catch (e) {
      log.error('migrate failed', e)
      return false
    }
  },

  /**
   * 订阅配置变更。listener 收 diffConfig 结果(变更键 + prev/next)。
   * 返回取消订阅函数。
   */
  subscribe(listener: (change: ConfigChange) => void): () => void {
    let prev = getConfig()
    return usePreferencesStore.subscribe(() => {
      const next = getConfig()
      const change = diffConfig(prev, next)
      if (change.keys.length > 0) {
        prev = next
        listener(change)
      }
    })
  },
}

export default settingsService
