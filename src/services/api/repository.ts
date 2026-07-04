/**
 * Remote Repository - 远程 API 仓储层（预留）
 *
 * 与本地数据层 Repository（@database）区分：本模块封装远端 REST 端点，
 * 供 SyncService 在未来云同步阶段使用。命名加 remote 前缀以避免与
 * 本地 Repository 同名冲突。
 *
 * 当前 Task08 阶段仅建立骨架，端点地址待真实接口确认后填充。
 */

import { get, post, put, del } from './request'

/**
 * Remote Diary Repository
 */
export const remoteDiaryRepository = {
  list: (params?: { page?: number; pageSize?: number; notebookId?: string }) =>
    get('/diaries', { params }),
  detail: (id: string) => get(`/diaries/${id}`),
  create: (data: unknown) => post('/diaries', data),
  update: (id: string, data: unknown) => put(`/diaries/${id}`, data),
  remove: (id: string) => del(`/diaries/${id}`),
}

/**
 * Remote Notebook Repository
 */
export const remoteNotebookRepository = {
  list: () => get('/notebooks'),
  detail: (id: string) => get(`/notebooks/${id}`),
  create: (data: unknown) => post('/notebooks', data),
  update: (id: string, data: unknown) => put(`/notebooks/${id}`, data),
  remove: (id: string) => del(`/notebooks/${id}`),
}

/**
 * Remote Album Repository
 */
export const remoteAlbumRepository = {
  list: () => get('/albums'),
  detail: (id: string) => get(`/albums/${id}`),
  create: (data: unknown) => post('/albums', data),
  update: (id: string, data: unknown) => put(`/albums/${id}`, data),
  remove: (id: string) => del(`/albums/${id}`),
}

/**
 * Remote User Repository
 */
export const remoteUserRepository = {
  login: (data: { username: string; password: string }) => post('/user/login', data),
  register: (data: { username: string; password: string; nickname: string }) =>
    post('/user/register', data),
  logout: () => post('/user/logout'),
  profile: () => get('/user/profile'),
  updateProfile: (data: unknown) => put('/user/profile', data),
}

/**
 * Remote Sync Repository
 */
export const remoteSyncRepository = {
  upload: (data: unknown) => post('/sync/upload', data),
  download: (params: { since: number }) => get('/sync/download', { params }),
}
