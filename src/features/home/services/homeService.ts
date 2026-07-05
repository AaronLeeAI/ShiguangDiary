/**
 * Home Service - 首页聚合加载
 *
 * 聚合日记 / 日记本 / 相册三列表，供首页一次性初始化。
 * 仅做聚合编排，不持有业务规则——单实体业务仍走各实体 Service。
 */

import { diaryService, notebookService, albumService } from '@services'
import { toServiceError, createLogger } from '@services/core'
import type { DiaryModel, NotebookModel, AlbumModel } from '@database'

const log = createLogger('HomeService')

export interface HomeBootstrapResult {
  diaries: DiaryModel[]
  notebooks: NotebookModel[]
  albums: AlbumModel[]
}

export const homeService = {
  /**
   * 首页初始化：并行拉取三列表。
   * 任一失败整体抛 ServiceError，由 store 决定是否降级 mock。
   */
  async bootstrap(): Promise<HomeBootstrapResult> {
    try {
      const [diaries, notebooks, albums] = await Promise.all([
        diaryService.list(),
        notebookService.list(),
        albumService.list(),
      ])
      return { diaries, notebooks, albums }
    } catch (error) {
      log.error('bootstrap failed', error)
      throw toServiceError(error)
    }
  },

  /** 下拉刷新：仅刷新日记列表。 */
  async refreshDiaries(): Promise<DiaryModel[]> {
    try {
      return await diaryService.list()
    } catch (error) {
      log.error('refreshDiaries failed', error)
      throw toServiceError(error)
    }
  },
}
