/**
 * Repository - 数据仓储层
 *
 * Repository 负责聚合 API 与本地存储，作为数据的唯一访问入口。
 *
 * 当前 Task1 阶段仅建立骨架，后续 Task 在此基础上实现具体业务的 Repository。
 */

import {get, post, put, del} from './request';

/**
 * Diary Repository
 */
export const diaryRepository = {
  list: (params?: {page?: number; pageSize?: number; notebookId?: string}) =>
    get('/diaries', {params}),
  detail: (id: string) => get(`/diaries/${id}`),
  create: (data: any) => post('/diaries', data),
  update: (id: string, data: any) => put(`/diaries/${id}`, data),
  remove: (id: string) => del(`/diaries/${id}`),
};

/**
 * Notebook Repository
 */
export const notebookRepository = {
  list: () => get('/notebooks'),
  detail: (id: string) => get(`/notebooks/${id}`),
  create: (data: any) => post('/notebooks', data),
  update: (id: string, data: any) => put(`/notebooks/${id}`, data),
  remove: (id: string) => del(`/notebooks/${id}`),
};

/**
 * Album Repository
 */
export const albumRepository = {
  list: () => get('/albums'),
  detail: (id: string) => get(`/albums/${id}`),
  create: (data: any) => post('/albums', data),
  update: (id: string, data: any) => put(`/albums/${id}`, data),
  remove: (id: string) => del(`/albums/${id}`),
};

/**
 * User Repository
 */
export const userRepository = {
  login: (data: {username: string; password: string}) => post('/user/login', data),
  register: (data: {username: string; password: string; nickname: string}) => post('/user/register', data),
  logout: () => post('/user/logout'),
  profile: () => get('/user/profile'),
  updateProfile: (data: any) => put('/user/profile', data),
};

/**
 * Sync Repository
 */
export const syncRepository = {
  upload: (data: any) => post('/sync/upload', data),
  download: (params: {since: number}) => get('/sync/download', {params}),
};