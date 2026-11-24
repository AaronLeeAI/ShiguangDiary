/**
 * Repository - 数据库仓储层
 *
 * Repository 在 DAO 之上提供业务层友好的数据访问 API。
 * 业务层（Store / 页面）只依赖 Repository，禁止直接访问 DAO / SQLite。
 *
 * 所有方法返回 Promise，异常统一归一化为 DatabaseError。
 */

import {
  diaryDao,
  notebookDao,
  albumDao,
  tagDao,
  attachmentDao,
  draftDao,
  preferenceDao,
  diaryEmbeddingDao,
  agentMemoryDao,
} from '../dao'
import { withTransaction } from '../core/transaction'
import { toDatabaseError } from '../core/errors'
import type {
  DiaryModel,
  NotebookModel,
  AlbumModel,
  TagModel,
  AttachmentModel,
  DraftModel,
  PreferenceModel,
  DiaryEmbeddingModel,
  AgentMemoryModel,
} from '../models'

/** 包装 Repository 方法，归一化底层异常为 DatabaseError。 */
async function wrap<T>(
  code: Parameters<typeof toDatabaseError>[1],
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw toDatabaseError(error, code)
  }
}

/**
 * 日记仓储
 */
export const diaryRepository = {
  list: () => wrap('QUERY_FAILED', () => diaryDao.findAll()),
  findById: (id: string) => wrap('QUERY_FAILED', () => diaryDao.findById(id)),
  update: (id: string, data: Partial<DiaryModel>) =>
    wrap('UPDATE_FAILED', () => diaryDao.update(id, data)),
  remove: (id: string) => wrap('DELETE_FAILED', () => diaryDao.delete(id)),

  /**
   * 创建日记 + 附件，在单一事务中执行，保证一致性。
   */
  async create(diary: DiaryModel, attachments: AttachmentModel[] = []): Promise<void> {
    try {
      await withTransaction(tx => {
        tx.executeSql(
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
        for (const a of attachments) {
          tx.executeSql(
            'INSERT INTO attachment (id, diaryId, type, url, thumbnail, size, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [a.id, a.diaryId, a.type, a.url, a.thumbnail, a.size, a.createdAt],
          )
        }
      })
    } catch (error) {
      throw toDatabaseError(error, 'TRANSACTION_FAILED')
    }
  },
}

/**
 * 日记本仓储
 */
export const notebookRepository = {
  list: () => wrap('QUERY_FAILED', () => notebookDao.findAll()),
  findById: (id: string) => wrap('QUERY_FAILED', () => notebookDao.findById(id)),
  create: (notebook: NotebookModel) => wrap('INSERT_FAILED', () => notebookDao.insert(notebook)),
  update: (id: string, data: Partial<NotebookModel>) =>
    wrap('UPDATE_FAILED', () => notebookDao.update(id, data)),
  remove: (id: string) => wrap('DELETE_FAILED', () => notebookDao.delete(id)),
}

/**
 * 相册仓储
 */
export const albumRepository = {
  list: () => wrap('QUERY_FAILED', () => albumDao.findAll()),
  create: (album: AlbumModel) => wrap('INSERT_FAILED', () => albumDao.insert(album)),
}

/**
 * 标签仓储
 */
export const tagRepository = {
  list: () => wrap('QUERY_FAILED', () => tagDao.findAll()),
  findById: (id: string) => wrap('QUERY_FAILED', () => tagDao.findById(id)),
  findByName: (name: string) => wrap('QUERY_FAILED', () => tagDao.findByName(name)),
  create: (tag: TagModel) => wrap('INSERT_FAILED', () => tagDao.insert(tag)),
  update: (id: string, data: Partial<TagModel>) =>
    wrap('UPDATE_FAILED', () => tagDao.update(id, data)),
  remove: (id: string) => wrap('DELETE_FAILED', () => tagDao.delete(id)),
}

/**
 * 附件仓储
 */
export const attachmentRepository = {
  findByDiaryId: (diaryId: string) =>
    wrap('QUERY_FAILED', () => attachmentDao.findByDiaryId(diaryId)),
  create: (attachment: AttachmentModel) =>
    wrap('INSERT_FAILED', () => attachmentDao.insert(attachment)),
  remove: (id: string) => wrap('DELETE_FAILED', () => attachmentDao.delete(id)),
  removeByDiaryId: (diaryId: string) =>
    wrap('DELETE_FAILED', () => attachmentDao.deleteByDiaryId(diaryId)),
}

/**
 * 草稿仓储
 */
export const draftRepository = {
  list: () => wrap('QUERY_FAILED', () => draftDao.findAll()),
  findById: (id: string) => wrap('QUERY_FAILED', () => draftDao.findById(id)),
  upsert: (draft: DraftModel) => wrap('INSERT_FAILED', () => draftDao.upsert(draft)),
  remove: (id: string) => wrap('DELETE_FAILED', () => draftDao.delete(id)),
}

/**
 * 用户偏好仓储（SQLite key-value）
 */
export const preferenceRepository = {
  get: (key: string) => wrap('QUERY_FAILED', () => preferenceDao.get(key)),
  set: (preference: PreferenceModel) => wrap('INSERT_FAILED', () => preferenceDao.set(preference)),
  remove: (key: string) => wrap('DELETE_FAILED', () => preferenceDao.delete(key)),
}

/**
 * 本地语义索引仓储。
 * 每篇日记的旧分块与新分块在同一事务中替换，避免留下半套向量。
 */
export const diaryEmbeddingRepository = {
  listByModel: (modelId: string) =>
    wrap('QUERY_FAILED', () => diaryEmbeddingDao.findByModel(modelId)),

  async replaceDiary(
    modelId: string,
    diaryId: string,
    sourceHash: string,
    sourceUpdatedAt: number,
    vectors: readonly string[],
  ): Promise<void> {
    try {
      await withTransaction(tx => {
        tx.executeSql('DELETE FROM diary_embedding WHERE modelId = ? AND diaryId = ?', [
          modelId,
          diaryId,
        ])
        for (let chunkIndex = 0; chunkIndex < vectors.length; chunkIndex++) {
          tx.executeSql(
            `INSERT INTO diary_embedding
             (diaryId, chunkIndex, modelId, sourceHash, sourceUpdatedAt, vector)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [diaryId, chunkIndex, modelId, sourceHash, sourceUpdatedAt, vectors[chunkIndex]],
          )
        }
      })
    } catch (error) {
      throw toDatabaseError(error, 'TRANSACTION_FAILED')
    }
  },

  removeDiary: (modelId: string, diaryId: string) =>
    wrap('DELETE_FAILED', () => diaryEmbeddingDao.deleteByDiary(modelId, diaryId)),

  clear: (modelId: string) => wrap('DELETE_FAILED', () => diaryEmbeddingDao.clear(modelId)),
}

/** AI 助手长期记忆仓储。 */
export const agentMemoryRepository = {
  list: () => wrap('QUERY_FAILED', () => agentMemoryDao.findAll()),
  create: (memory: AgentMemoryModel) => wrap('INSERT_FAILED', () => agentMemoryDao.insert(memory)),
  update: (id: string, memory: Partial<AgentMemoryModel>) =>
    wrap('UPDATE_FAILED', () => agentMemoryDao.update(id, memory)),
  remove: (id: string) => wrap('DELETE_FAILED', () => agentMemoryDao.delete(id)),
}

export type { AgentMemoryModel, DiaryEmbeddingModel }
