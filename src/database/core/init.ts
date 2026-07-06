/**
 * Database Bootstrap - 统一初始化流程
 *
 * 应用启动时调用一次：
 *   openDatabase → runMigrations → fileStorage.init
 *
 * 任何步骤失败抛出 DatabaseError(INIT_FAILED)，上层应捕获并保证应用可启动。
 */

import { openDatabase } from '../connection'
import { runMigrations } from '../migration'
import { fileStorage } from '../storage/fileStorage'
import { DatabaseError, toDatabaseError } from './errors'

let initialized = false
let initializing: Promise<void> | null = null

/**
 * 初始化数据层。幂等，重复调用直接返回。
 */
export async function initDatabase(): Promise<void> {
  if (initialized) {
    return
  }
  if (initializing) {
    return initializing
  }

  initializing = (async () => {
    try {
      await openDatabase()
      await runMigrations()
      await fileStorage.init()
      initialized = true
    } catch (error) {
      // Normalize to INIT_FAILED while preserving the original cause.
      if (error instanceof DatabaseError) {
        throw error
      }
      throw toDatabaseError(error, 'INIT_FAILED')
    } finally {
      initializing = null
    }
  })()

  return initializing
}

/** Whether the data layer has been initialized. */
export function isDatabaseReady(): boolean {
  return initialized
}
