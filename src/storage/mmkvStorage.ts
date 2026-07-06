/**
 * MMKV Storage Adapter for Zustand persist middleware
 *
 * 使用 react-native-mmkv 提供高性能持久化存储（替代 AsyncStorage）。
 * 适配 Zustand 的 StateStorage 接口。
 */

import { MMKV } from 'react-native-mmkv'
import type { StateStorage } from 'zustand/middleware'

let mmkv: MMKV | null = null

const getMMKV = () => {
  if (!mmkv) {
    try {
      mmkv = new MMKV({ id: 'shiguang-storage' })
    } catch {
      return null
    }
  }
  return mmkv
}

/**
 * Zustand persist 用的 MMKV Storage
 *
 * 用法：
 * ```ts
 * import {mmkvStorage} from '@storage/mmkvStorage';
 *
 * persist(someStore, {
 *   name: 'my-store',
 *   storage: mmkvStorage,
 * })
 * ```
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const storage = getMMKV()
      if (!storage) {
        return null
      }
      return storage.getString(name) ?? null
    } catch {
      return null
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      const storage = getMMKV()
      if (!storage) {
        return
      }
      storage.set(name, value)
    } catch {
      // silent fail
    }
  },

  removeItem: (name: string): void => {
    try {
      const storage = getMMKV()
      if (!storage) {
        return
      }
      storage.delete(name)
    } catch {
      // silent fail
    }
  },
}
