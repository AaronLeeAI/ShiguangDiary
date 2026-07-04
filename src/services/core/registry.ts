/**
 * Service Registry - 服务注册中心（轻量依赖注入）
 *
 * 集中管理所有业务 Service 的单例，避免页面 / Store 自行创建 Service。
 *
 * 用法：
 *   - 启动时调用 registerService(key, instance) 注册。
 *   - 业务层通过 getService(key) 获取已注册实例。
 *   - 开发模式可调用 overrideService 注入 Mock。
 *
 * 禁止：页面 new XxxService()。必须经 registry 获取。
 */

export type ServiceKey = string

const registry = new Map<ServiceKey, unknown>()
const factories = new Map<ServiceKey, () => unknown>()

/**
 * 注册单例服务。
 */
export function registerService<T>(key: ServiceKey, instance: T): void {
  registry.set(key, instance)
  factories.delete(key)
}

/**
 * 注册懒加载服务工厂（首次 getService 时实例化）。
 */
export function registerFactory<T>(key: ServiceKey, factory: () => T): void {
  factories.set(key, factory as () => unknown)
}

/**
 * 获取服务实例。
 * 优先返回已注册单例；否则触发工厂；未注册抛错。
 */
export function getService<T>(key: ServiceKey): T {
  if (registry.has(key)) {
    return registry.get(key) as T
  }
  const factory = factories.get(key)
  if (factory) {
    const instance = factory()
    registry.set(key, instance)
    factories.delete(key)
    return instance as T
  }
  throw new Error(`[ServiceRegistry] service "${key}" is not registered`)
}

/**
 * 测试 / 开发模式下覆盖服务实例（如注入 Mock）。
 */
export function overrideService<T>(key: ServiceKey, instance: T): void {
  registry.set(key, instance)
}

/**
 * 重置注册中心（仅用于测试）。
 */
export function resetRegistry(): void {
  registry.clear()
  factories.clear()
}

/**
 * 服务 Key 常量，统一命名避免拼写漂移。
 */
export const SERVICE_KEYS = {
  diary: 'diaryService',
  tag: 'tagService',
  attachment: 'attachmentService',
  settings: 'settingsService',
  sync: 'syncService',
  backup: 'backupService',
} as const

export type ServiceKeyName = keyof typeof SERVICE_KEYS
