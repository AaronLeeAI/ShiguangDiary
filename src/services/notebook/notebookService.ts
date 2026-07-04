/**
 * Notebook Service - 日记本业务编排
 *
 * 在 notebookRepository 之上提供日记本业务能力。
 */

import { notebookRepository, type NotebookModel } from '@database'
import { toServiceError, createLogger } from '../core'

const log = createLogger('NotebookService')

export const notebookService = {
  async list(): Promise<NotebookModel[]> {
    try {
      return await notebookRepository.list()
    } catch (error) {
      log.error('list failed', error)
      throw toServiceError(error)
    }
  },

  async findById(id: string): Promise<NotebookModel | null> {
    try {
      return await notebookRepository.findById(id)
    } catch (error) {
      log.error('findById failed', id, error)
      throw toServiceError(error)
    }
  },

  async create(notebook: NotebookModel): Promise<NotebookModel> {
    try {
      await notebookRepository.create(notebook)
      return notebook
    } catch (error) {
      log.error('create failed', error)
      throw toServiceError(error)
    }
  },

  async update(id: string, data: Partial<NotebookModel>): Promise<void> {
    try {
      await notebookRepository.update(id, data)
    } catch (error) {
      log.error('update failed', id, error)
      throw toServiceError(error)
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await notebookRepository.remove(id)
    } catch (error) {
      log.error('remove failed', id, error)
      throw toServiceError(error)
    }
  },
}
