/**
 * Attachment Service - 附件业务编排
 *
 * 在 attachmentRepository 之上提供附件能力，并联动 fileStorage 落盘。
 * 附件文件物理存储经 fileStorage，元数据经 Repository。
 */

import { attachmentRepository, fileStorage, type AttachmentModel, type FileBucket } from '@database'
import { toServiceError, createLogger } from '../core'

const log = createLogger('AttachmentService')

export const attachmentService = {
  /** 列出日记的附件。 */
  async listByDiary(diaryId: string): Promise<AttachmentModel[]> {
    try {
      return await attachmentRepository.findByDiaryId(diaryId)
    } catch (error) {
      log.error('listByDiary failed', diaryId, error)
      throw toServiceError(error)
    }
  },

  /**
   * 导入附件：将源文件复制到 attachments bucket，并写入元数据。
   * @returns 写入后的附件元数据（含最终 url 路径）。
   */
  async import(
    attachment: Omit<AttachmentModel, 'url'> & { sourcePath: string; filename: string },
  ): Promise<AttachmentModel> {
    try {
      const storedPath = await fileStorage.copyFromPath(
        'attachments' as FileBucket,
        attachment.sourcePath,
        attachment.filename,
      )
      const record: AttachmentModel = {
        id: attachment.id,
        diaryId: attachment.diaryId,
        type: attachment.type,
        url: storedPath,
        thumbnail: attachment.thumbnail,
        size: attachment.size,
        createdAt: attachment.createdAt,
      }
      await attachmentRepository.create(record)
      return record
    } catch (error) {
      log.error('import failed', error)
      throw toServiceError(error)
    }
  },

  /** 删除附件元数据 + 物理文件。 */
  async remove(id: string, filename?: string): Promise<void> {
    try {
      await attachmentRepository.remove(id)
      if (filename) {
        await fileStorage.remove('attachments' as FileBucket, filename)
      }
    } catch (error) {
      log.error('remove failed', id, error)
      throw toServiceError(error)
    }
  },

  /** 删除日记下全部附件。 */
  async removeByDiary(diaryId: string): Promise<void> {
    try {
      await attachmentRepository.removeByDiaryId(diaryId)
    } catch (error) {
      log.error('removeByDiary failed', diaryId, error)
      throw toServiceError(error)
    }
  },
}
