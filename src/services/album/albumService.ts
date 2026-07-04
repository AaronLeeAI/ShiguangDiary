/**
 * Album Service - 相册业务编排
 *
 * 在 albumRepository 之上提供相册业务能力。
 */

import { albumRepository, type AlbumModel } from '@database'
import { toServiceError, createLogger } from '../core'

const log = createLogger('AlbumService')

export const albumService = {
  async list(): Promise<AlbumModel[]> {
    try {
      return await albumRepository.list()
    } catch (error) {
      log.error('list failed', error)
      throw toServiceError(error)
    }
  },

  async create(album: AlbumModel): Promise<AlbumModel> {
    try {
      await albumRepository.create(album)
      return album
    } catch (error) {
      log.error('create failed', error)
      throw toServiceError(error)
    }
  },
}
