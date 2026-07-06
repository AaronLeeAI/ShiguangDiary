/**
 * DAO - 数据访问对象
 *
 * DAO 直接对数据库执行 SQL，不含业务逻辑。
 * 业务层应使用 Repository 而非 DAO。
 */

import { getDatabase } from '../connection'
import type {
  DiaryModel,
  NotebookModel,
  AlbumModel,
  TagModel,
  AttachmentModel,
  DraftModel,
  PreferenceModel,
} from '../models'

const pickUpdateEntries = <T extends object>(patch: Partial<T>): [string, unknown][] =>
  Object.entries(patch).filter(([key, value]) => key !== 'id' && value !== undefined)

/**
 * 日记 DAO
 */
export const diaryDao = {
  async findAll(): Promise<DiaryModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql(
      'SELECT * FROM diary WHERE deletedAt IS NULL ORDER BY createdAt DESC',
    )
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async findById(id: string): Promise<DiaryModel | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM diary WHERE id = ?', [id])
    return results.rows.length > 0 ? results.rows.item(0) : null
  },

  async insert(diary: DiaryModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      `INSERT INTO diary (id, notebookId, title, content, cover, weather, location, mood, isPinned, isEncrypted, isDraft, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        diary.id,
        diary.notebookId,
        diary.title,
        diary.content,
        diary.cover,
        diary.weather,
        diary.location,
        diary.mood,
        diary.isPinned,
        diary.isEncrypted,
        diary.isDraft,
        diary.createdAt,
        diary.updatedAt,
        diary.deletedAt,
      ],
    )
  },

  async update(id: string, diary: Partial<DiaryModel>): Promise<void> {
    const db = await getDatabase()
    const entries = pickUpdateEntries<DiaryModel>(diary)
    if (entries.length === 0) {
      return
    }
    const fields = entries.map(([key]) => `${key} = ?`).join(', ')
    const values = entries.map(([, value]) => value)
    await db.executeSql(`UPDATE diary SET ${fields}, updatedAt = ? WHERE id = ?`, [
      ...values,
      Date.now(),
      id,
    ])
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('UPDATE diary SET deletedAt = ? WHERE id = ?', [Date.now(), id])
  },
}

/**
 * 日记本 DAO
 */
export const notebookDao = {
  async findAll(): Promise<NotebookModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql(
      'SELECT * FROM notebook WHERE deletedAt IS NULL ORDER BY sortOrder',
    )
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async findById(id: string): Promise<NotebookModel | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM notebook WHERE id = ?', [id])
    return results.rows.length > 0 ? results.rows.item(0) : null
  },

  async insert(notebook: NotebookModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      `INSERT INTO notebook (id, name, description, cover, color, sortOrder, diaryCount, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notebook.id,
        notebook.name,
        notebook.description,
        notebook.cover,
        notebook.color,
        notebook.sortOrder,
        notebook.diaryCount,
        notebook.createdAt,
        notebook.updatedAt,
        notebook.deletedAt,
      ],
    )
  },

  async update(id: string, notebook: Partial<NotebookModel>): Promise<void> {
    const db = await getDatabase()
    const entries = pickUpdateEntries<NotebookModel>(notebook)
    if (entries.length === 0) {
      return
    }
    const fields = entries.map(([key]) => `${key} = ?`).join(', ')
    const values = entries.map(([, value]) => value)
    await db.executeSql(`UPDATE notebook SET ${fields}, updatedAt = ? WHERE id = ?`, [
      ...values,
      Date.now(),
      id,
    ])
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('UPDATE notebook SET deletedAt = ? WHERE id = ?', [Date.now(), id])
  },
}

/**
 * 相册 DAO
 */
export const albumDao = {
  async findAll(): Promise<AlbumModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql(
      'SELECT * FROM album WHERE deletedAt IS NULL ORDER BY createdAt DESC',
    )
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async insert(album: AlbumModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      `INSERT INTO album (id, name, description, cover, diaryIds, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        album.id,
        album.name,
        album.description,
        album.cover,
        album.diaryIds,
        album.createdAt,
        album.updatedAt,
        album.deletedAt,
      ],
    )
  },
}

/**
 * 标签 DAO
 */
export const tagDao = {
  async findAll(): Promise<TagModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM tag ORDER BY createdAt DESC')
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async findById(id: string): Promise<TagModel | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM tag WHERE id = ?', [id])
    return results.rows.length > 0 ? results.rows.item(0) : null
  },

  async findByName(name: string): Promise<TagModel | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM tag WHERE name = ?', [name])
    return results.rows.length > 0 ? results.rows.item(0) : null
  },

  async insert(tag: TagModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      'INSERT INTO tag (id, name, color, diaryCount, createdAt) VALUES (?, ?, ?, ?, ?)',
      [tag.id, tag.name, tag.color, tag.diaryCount, tag.createdAt],
    )
  },

  async update(id: string, tag: Partial<TagModel>): Promise<void> {
    const db = await getDatabase()
    const entries = pickUpdateEntries<TagModel>(tag)
    if (entries.length === 0) {
      return
    }
    const fields = entries.map(([key]) => `${key} = ?`).join(', ')
    const values = entries.map(([, value]) => value)
    await db.executeSql(`UPDATE tag SET ${fields} WHERE id = ?`, [...values, id])
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('DELETE FROM tag WHERE id = ?', [id])
  },
}

/**
 * 附件 DAO
 */
export const attachmentDao = {
  async findByDiaryId(diaryId: string): Promise<AttachmentModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql(
      'SELECT * FROM attachment WHERE diaryId = ? ORDER BY createdAt ASC',
      [diaryId],
    )
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async insert(attachment: AttachmentModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      'INSERT INTO attachment (id, diaryId, type, url, thumbnail, size, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        attachment.id,
        attachment.diaryId,
        attachment.type,
        attachment.url,
        attachment.thumbnail,
        attachment.size,
        attachment.createdAt,
      ],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('DELETE FROM attachment WHERE id = ?', [id])
  },

  async deleteByDiaryId(diaryId: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('DELETE FROM attachment WHERE diaryId = ?', [diaryId])
  },
}

/**
 * 草稿 DAO
 */
export const draftDao = {
  async findAll(): Promise<DraftModel[]> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM draft ORDER BY updatedAt DESC')
    return Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i))
  },

  async findById(id: string): Promise<DraftModel | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT * FROM draft WHERE id = ?', [id])
    return results.rows.length > 0 ? results.rows.item(0) : null
  },

  async upsert(draft: DraftModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      `INSERT INTO draft (id, content, title, updatedAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET content = excluded.content, title = excluded.title, updatedAt = excluded.updatedAt`,
      [draft.id, draft.content, draft.title, draft.updatedAt],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('DELETE FROM draft WHERE id = ?', [id])
  },
}

/**
 * 用户偏好 DAO（持久化在 SQLite 的 key-value 表）
 */
export const preferenceDao = {
  async get(key: string): Promise<string | null> {
    const db = await getDatabase()
    const [results] = await db.executeSql('SELECT value FROM preference WHERE key = ?', [key])
    return results.rows.length > 0 ? results.rows.item(0).value : null
  },

  async set(preference: PreferenceModel): Promise<void> {
    const db = await getDatabase()
    await db.executeSql(
      `INSERT INTO preference (key, value, updatedAt)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
      [preference.key, preference.value, preference.updatedAt],
    )
  },

  async delete(key: string): Promise<void> {
    const db = await getDatabase()
    await db.executeSql('DELETE FROM preference WHERE key = ?', [key])
  },
}
