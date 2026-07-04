/**
 * Settings Service - 设置业务编排
 *
 * 基于 preferenceRepository（SQLite key-value）提供设置项读写。
 * 重量级偏好仍由 Zustand preferencesStore（MMKV）管理，本服务面向
 * 需要持久化到 SQLite 的设置项。
 */

import { preferenceRepository } from '@database'
import { toServiceError, createLogger } from '../core'

const log = createLogger('SettingsService')

export const settingsService = {
  async get(key: string): Promise<string | null> {
    try {
      return await preferenceRepository.get(key)
    } catch (error) {
      log.error('get failed', key, error)
      throw toServiceError(error)
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await preferenceRepository.set({ key, value, updatedAt: Date.now() })
    } catch (error) {
      log.error('set failed', key, error)
      throw toServiceError(error)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await preferenceRepository.remove(key)
    } catch (error) {
      log.error('remove failed', key, error)
      throw toServiceError(error)
    }
  },
}
