/**
 * Services - 服务层公共导出
 *
 * 业务层（Store / 页面）只依赖本 barrel 获取 Service 实例。
 * 禁止直接导入 @database Repository 或 @services/api HTTP client。
 *
 * 核心设施（error / logger / registry）在此导出，
 * 业务 Service 通过 registerServices() 注册到 registry。
 */

export * from './core'

export * from './diary'
export * from './notebook'
export * from './album'
export * from './tag'
export * from './attachment'
export * from './settings'
export * from './sync'

// HTTP / API foundation（远程访问预留，业务层不直接依赖）
export { apiClient } from './api/client'
export type { RequestConfig, ApiResponse } from './api/client'

import { registerService, SERVICE_KEYS } from './core'
import { diaryService } from './diary'
import { notebookService } from './notebook'
import { albumService } from './album'
import { tagService } from './tag'
import { attachmentService } from './attachment'
import { settingsService } from './settings'
import { syncService } from './sync'

let registered = false

/**
 * 注册全部业务 Service 到 Service Registry。
 * 应用启动时调用一次。幂等。
 */
export function registerServices(): void {
  if (registered) {
    return
  }
  registerService(SERVICE_KEYS.diary, diaryService)
  registerService(SERVICE_KEYS.notebook, notebookService)
  registerService(SERVICE_KEYS.album, albumService)
  registerService(SERVICE_KEYS.tag, tagService)
  registerService(SERVICE_KEYS.attachment, attachmentService)
  registerService(SERVICE_KEYS.settings, settingsService)
  registerService(SERVICE_KEYS.sync, syncService)
  registered = true
}
