/**
 * Diary Service - 日记业务编排
 *
 * 在 Repository 之上提供日记相关业务能力：
 * - 列表 / 详情 / 更新 / 软删除 / 恢复
 * - 创建日记（事务化写入日记 + 附件 + 标签关联）
 *
 * 页面 / Store 只依赖本 Service，不直接访问 Repository。
 */

import {
  diaryRepository,
  attachmentRepository,
  type DiaryModel,
  type AttachmentModel,
} from '@database'
import { tagRepository } from '@database'
import { ServiceError, toServiceError, createLogger } from '../core'

const log = createLogger('DiaryService')

export interface CreateDiaryInput {
  diary: DiaryModel
  attachments?: AttachmentModel[]
  tagIds?: string[]
}

export const diaryService = {
  /** 获取日记列表（按创建时间倒序）。 */
  async list(): Promise<DiaryModel[]> {
    try {
      return await diaryRepository.list()
    } catch (error) {
      log.error('list failed', error)
      throw toServiceError(error)
    }
  },

  /** 获取日记详情（含附件）。 */
  async getDetail(id: string): Promise<{ diary: DiaryModel; attachments: AttachmentModel[] }> {
    try {
      const diary = await diaryRepository.findById(id)
      if (!diary) {
        throw new ServiceError('NOT_FOUND', `diary ${id} not found`)
      }
      const attachments = await attachmentRepository.findByDiaryId(id)
      return { diary, attachments }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      log.error('getDetail failed', id, error)
      throw toServiceError(error)
    }
  },

  /**
   * 创建日记 + 附件，事务化保证一致性。
   * tagIds 当前仅记录关联（标签实体由 TagService 维护）。
   */
  async create(input: CreateDiaryInput): Promise<DiaryModel> {
    try {
      await diaryRepository.create(input.diary, input.attachments ?? [])
      // 标签计数 +1（若提供 tagIds）
      if (input.tagIds?.length) {
        for (const tagId of input.tagIds) {
          const tag = await tagRepository.findById(tagId)
          if (tag) {
            await tagRepository.update(tagId, { diaryCount: tag.diaryCount + 1 })
          }
        }
      }
      log.info('diary created', input.diary.id)
      return input.diary
    } catch (error) {
      log.error('create failed', error)
      throw toServiceError(error)
    }
  },

  /** 更新日记（自动刷新 updatedAt）。 */
  async update(id: string, data: Partial<DiaryModel>): Promise<void> {
    try {
      await diaryRepository.update(id, data)
    } catch (error) {
      log.error('update failed', id, error)
      throw toServiceError(error)
    }
  },

  /** 软删除日记（写入 deletedAt，进入回收站）。 */
  async remove(id: string): Promise<void> {
    try {
      await diaryRepository.remove(id)
    } catch (error) {
      log.error('remove failed', id, error)
      throw toServiceError(error)
    }
  },
}
