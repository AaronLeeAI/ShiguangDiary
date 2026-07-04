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

/**
 * 初始化数据层。幂等，重复调用直接返回。
 */
export async function initDatabase(): Promise<void> {
  if (initialized) {
    return
  }

  try {
    await openDatabase()
    await runMigrations()
    await fileStorage.init()
    initialized = true
  } catch (error) {
    // 归一化为 INIT_FAILED；保留原始 cause 便于排查
    if (error instanceof DatabaseError) {
      throw error
    }
    throw toDatabaseError(error, 'INIT_FAILED')
  }
}

/** 数据层是否已初始化。 */
export function isDatabaseReady(): boolean {
  return initialized
}
