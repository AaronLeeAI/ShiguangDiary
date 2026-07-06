/**
 * 数据库迁移
 *
 * 升级数据库结构时，在此添加迁移脚本。
 */

import { getDatabase } from '../connection'
import { applyMigrations } from '../core/versioning'

export interface Migration {
  version: number
  description: string
  up: () => Promise<void>
}

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    up: async () => {
      const db = await getDatabase()
      // 日记表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS diary (
          id TEXT PRIMARY KEY,
          notebookId TEXT,
          title TEXT NOT NULL DEFAULT '',
          content TEXT NOT NULL DEFAULT '',
          cover TEXT,
          weather TEXT,
          location TEXT,
          mood TEXT,
          isPinned INTEGER NOT NULL DEFAULT 0,
          isEncrypted INTEGER NOT NULL DEFAULT 0,
          isDraft INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          deletedAt INTEGER
        )
      `)
      // 日记本表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS notebook (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          cover TEXT,
          color TEXT,
          sortOrder INTEGER NOT NULL DEFAULT 0,
          diaryCount INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          deletedAt INTEGER
        )
      `)
      // 相册表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS album (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          cover TEXT,
          diaryIds TEXT NOT NULL DEFAULT '[]',
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          deletedAt INTEGER
        )
      `)
      // 标签表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS tag (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT,
          diaryCount INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL
        )
      `)
      // 日记-标签关联表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS diary_tag (
          diaryId TEXT NOT NULL,
          tagId TEXT NOT NULL,
          PRIMARY KEY (diaryId, tagId)
        )
      `)
      // 附件表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS attachment (
          id TEXT PRIMARY KEY,
          diaryId TEXT NOT NULL,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          thumbnail TEXT,
          size INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL
        )
      `)
      // 草稿表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS draft (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL DEFAULT '',
          title TEXT,
          updatedAt INTEGER NOT NULL
        )
      `)
      // 回收站表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS recycle (
          id TEXT PRIMARY KEY,
          originalType TEXT NOT NULL,
          data TEXT NOT NULL,
          deletedAt INTEGER NOT NULL
        )
      `)
      // 用户偏好表
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS preference (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updatedAt INTEGER NOT NULL
        )
      `)
    },
  },
  {
    version: 2,
    description: 'Task18 performance indexes',
    up: async () => {
      const db = await getDatabase()
      const statements = [
        // Home/Search/Calendar load active diaries by time while excluding soft-deleted rows.
        'CREATE INDEX IF NOT EXISTS idx_diary_active_created ON diary (deletedAt, createdAt DESC)',
        // Notebook-scoped future queries and integrity checks.
        'CREATE INDEX IF NOT EXISTS idx_diary_notebook_active ON diary (notebookId, deletedAt, createdAt DESC)',
        // Pinned-first lists can avoid scanning all active diaries.
        'CREATE INDEX IF NOT EXISTS idx_diary_pinned_active ON diary (isPinned, deletedAt, createdAt DESC)',
        // Notebook list sort path.
        'CREATE INDEX IF NOT EXISTS idx_notebook_active_sort ON notebook (deletedAt, sortOrder)',
        // Album list sort path.
        'CREATE INDEX IF NOT EXISTS idx_album_active_created ON album (deletedAt, createdAt DESC)',
        // Attachment detail lookup and cleanup by diary.
        'CREATE INDEX IF NOT EXISTS idx_attachment_diary_created ON attachment (diaryId, createdAt ASC)',
        // Reverse tag lookup for future tag detail/search flows.
        'CREATE INDEX IF NOT EXISTS idx_diary_tag_tag ON diary_tag (tagId, diaryId)',
        // Draft/recycle maintenance paths.
        'CREATE INDEX IF NOT EXISTS idx_draft_updated ON draft (updatedAt DESC)',
        'CREATE INDEX IF NOT EXISTS idx_recycle_deleted ON recycle (deletedAt DESC)',
      ]

      for (const sql of statements) {
        await db.executeSql(sql)
      }
    },
  },
]

/**
 * 应用所有未执行的迁移（按 version 升序）。
 *
 * 委托给版本注册表，只应用比当前 schema 版本更新的迁移，
 * 并将已应用版本持久化到 schema_version 表。
 *
 * 返回本次升级的 from/to/applied 统计。
 */
export async function runMigrations() {
  return applyMigrations(migrations)
}
