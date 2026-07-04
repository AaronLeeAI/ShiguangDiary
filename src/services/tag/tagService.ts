/**
 * Tag Service - 标签业务编排
 *
 * 在 tagRepository 之上提供标签业务能力，包括按名查找 / 创建去重 / 计数维护。
 */

import { tagRepository, type TagModel } from '@database'
import { ServiceError, toServiceError, createLogger } from '../core'

const log = createLogger('TagService')

export const tagService = {
  async list(): Promise<TagModel[]> {
    try {
      return await tagRepository.list()
    } catch (error) {
      log.error('list failed', error)
      throw toServiceError(error)
    }
  },

  /** 按名查找，不存在返回 null。 */
  async findByName(name: string): Promise<TagModel | null> {
    try {
      return await tagRepository.findByName(name)
    } catch (error) {
      log.error('findByName failed', name, error)
      throw toServiceError(error)
    }
  },

  /** 创建标签；若同名已存在则返回既有标签（去重）。 */
  async create(tag: TagModel): Promise<TagModel> {
    try {
      const existing = await tagRepository.findByName(tag.name)
      if (existing) {
        return existing
      }
      await tagRepository.create(tag)
      return tag
    } catch (error) {
      log.error('create failed', error)
      throw toServiceError(error)
    }
  },

  async update(id: string, data: Partial<TagModel>): Promise<void> {
    try {
      await tagRepository.update(id, data)
    } catch (error) {
      log.error('update failed', id, error)
      throw toServiceError(error)
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await tagRepository.remove(id)
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      log.error('remove failed', id, error)
      throw toServiceError(error)
    }
  },
}
