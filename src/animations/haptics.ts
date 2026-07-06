/**
 * Haptics — 统一触觉反馈封装(Task17 Motion System)
 *
 * 单一可信来源:docs/project-设计-docs/docs/06_Interaction.md §6.1.3 + 08_Animation.md。
 * 底层 react-native-haptic-feedback(已装),Android/iOS 原生触发;Web/no-native 环境静默跳过。
 *
 * 命名意图 → haptic 类型映射(见 HapticIntent 联合):
 *  - tap        selection        轻点选择(Tab/列表项轻点)
 *  - toggle     impactLight      开关切换
 *  - saveSuccess  notificationSuccess 保存/导出/备份/恢复完成
 *  - delete     impactHeavy      删除确认/执行
 *  - warning    notificationWarning 危险确认前的提示(二级确认入场)
 *  - error      notificationError 错误反馈
 *  - longPress  longPress        长按菜单触发
 *  - complete   notificationSuccess 通用完成
 *
 * 业务统一调 `haptic(intent)`,禁止在页面/service 散落裸 trigger — 便于后续维护与替换实现。
 */

import { Platform } from 'react-native'

// react-native-haptic-feedback 的 `trigger` 在无原生模块时不可用,故 lazy import 兜底。
// 仅取触发函数;类型常量以字符串字面量使用,避免引入 enum 运行时依赖。
type TriggerFn = (
  type?: string,
  options?: { enableVibrateFallback?: boolean; ignoreAndroidSystemSettings?: boolean },
) => void
let _trigger: TriggerFn | null = null
let _importFailed = false

async function loadTrigger(): Promise<void> {
  if (_trigger || _importFailed) {
    return
  }
  try {
    // require 避免 top-level import 在 jest 下触发原生模块解析失败
    const mod = require('react-native-haptic-feedback')
    _trigger = (typeof mod.trigger === 'function' ? mod.trigger : mod.default?.trigger) ?? null
  } catch {
    _trigger = null
    _importFailed = true
  }
}

/** 触觉反馈意图(业务层只关心"做什么",映射复用)。 */
export type HapticIntent =
  | 'tap'
  | 'toggle'
  | 'saveSuccess'
  | 'delete'
  | 'warning'
  | 'error'
  | 'longPress'
  | 'complete'

/** 意图 → 原生 haptic 类型字面量(纯函数,可单测)。 */
export const HAPTIC_TYPE_MAP: Record<HapticIntent, string> = {
  tap: 'selection',
  toggle: 'impactLight',
  saveSuccess: 'notificationSuccess',
  delete: 'impactHeavy',
  warning: 'notificationWarning',
  error: 'notificationError',
  longPress: 'longPress',
  complete: 'notificationSuccess',
}

/** 是否在支持触觉的平台(Android / iOS)。 */
export const hapticSupported = (): boolean => Platform.OS === 'android' || Platform.OS === 'ios'

/**
 * 触发触觉反馈。意图 → 类型(经 HAPTIC_TYPE_MAP)→ 原生 trigger。
 * 不支持平台或原生模块不可用时静默跳过(返回 false),绝不抛错避免影响业务。
 */
export const haptic = (intent: HapticIntent): boolean => {
  if (!hapticSupported()) {
    return false
  }
  if (!_trigger) {
    // 同步路径:首次未加载则尝试同步 require(已加载时 _trigger 非 null)。
    // 注:loadTrigger 异步,首次调用可能未就绪;在 App 启动时预热(见 useHapticWarmup 或 index)。
    void loadTrigger()
    if (!_trigger) {
      return false
    }
  }
  const type = HAPTIC_TYPE_MAP[intent]
  try {
    _trigger(type)
    return true
  } catch {
    return false
  }
}

/** 预热:在应用启动时调用一次,确保 require 完成(避免首次 haptic 延迟)。 */
export const warmupHaptics = (): void => {
  void loadTrigger()
}
