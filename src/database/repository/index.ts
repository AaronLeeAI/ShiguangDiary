/**
 * Repository - 数据库仓储层
 *
 * Repository 在 DAO 之上提供业务层友好的数据访问 API。
 */

import {diaryDao, notebookDao, albumDao} from '../dao';
import type {DiaryModel, NotebookModel, AlbumModel} from '../models';

/**
 * 日记仓储
 */
export const diaryRepository = {
  list: () => diaryDao.findAll(),
  findById: (id: string) => diaryDao.findById(id),
  create: (diary: DiaryModel) => diaryDao.insert(diary),
  update: (id: string, data: Partial<DiaryModel>) => diaryDao.update(id, data),
  remove: (id: string) => diaryDao.delete(id),
};

/**
 * 日记本仓储
 */
export const notebookRepository = {
  list: () => notebookDao.findAll(),
  findById: (id: string) => notebookDao.findById(id),
  create: (notebook: NotebookModel) => notebookDao.insert(notebook),
  update: (id: string, data: Partial<NotebookModel>) => notebookDao.update(id, data),
  remove: (id: string) => notebookDao.delete(id),
};

/**
 * 相册仓储
 */
export const albumRepository = {
  list: () => albumDao.findAll(),
  create: (album: AlbumModel) => albumDao.insert(album),
};