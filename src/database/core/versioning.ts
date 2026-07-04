/**
 * Schema Versioning - 数据库版本注册表
 *
 * 维护数据库 schema 版本，保证迁移只应用一次且按序增量升级。
 *
 * 版本记录持久化在 SQLite 的 `schema_version` 表中（单行单列）。
 * 新版本迁移只需在 migrations 数组追加，不得修改已发布迁移。
 */

import { getDatabase } from '../connection'
import type { Migration } from '../migration'
import { DatabaseError, toDatabaseError } from './errors'

const VERSION_TABLE = 'schema_version'

/**
 * 确保版本表存在。
 */
async function ensureVersionTable(): Promise<void> {
  const db = await getDatabase()
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS ${VERSION_TABLE} (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL
    )`,
  )
}

/**
 * 读取当前已应用的 schema 版本；未初始化返回 0。
 */
export async function getCurrentVersion(): Promise<number> {
  try {
    await ensureVersionTable()
    const db = await getDatabase()
    const [results] = await db.executeSql(`SELECT version FROM ${VERSION_TABLE} WHERE id = 1`)
    if (results.rows.length === 0) {
      return 0
    }
    return results.rows.item(0).version as number
  } catch (error) {
    throw toDatabaseError(error, 'QUERY_FAILED')
  }
}

/**
 * 写入指定版本（upsert）。
 */
async function setVersion(version: number): Promise<void> {
  const db = await getDatabase()
  await db.executeSql(
    `INSERT INTO ${VERSION_TABLE} (id, version) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET version = excluded.version`,
    [version],
  )
}

/**
 * 应用所有比当前版本更新的迁移，按 version 升序执行。
 *
 * 每个迁移在独立事务中执行；单个迁移失败则中止并抛出
 * DatabaseError(MIGRATION 路径归入 TRANSACTION_FAILED)。
 */
export async function applyMigrations(
  migrations: readonly Migration[],
): Promise<{ from: number; to: number; applied: number }> {
  const from = await getCurrentVersion()
  const pending = [...migrations]
    .filter(m => m.version > from)
    .sort((a, b) => a.version - b.version)

  if (pending.length === 0) {
    return { from, to: from, applied: 0 }
  }

  let applied = 0
  let current = from
  for (const migration of pending) {
    try {
      await migration.up()
      await setVersion(migration.version)
      current = migration.version
      applied++
    } catch (error) {
      throw new DatabaseError(
        'TRANSACTION_FAILED',
        `Migration v${migration.version} (${migration.description}) failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error,
      )
    }
  }

  return { from, to: current, applied }
}
