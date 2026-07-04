/**
 * 全局类型定义
 *
 * 此文件用于定义跨模块使用的全局类型。
 * 业务相关类型请放在对应 feature 的 types.ts 中。
 */

/**
 * 日记
 */
export interface Diary {
  id: string
  notebookId: string | null
  title: string
  summary: string
  content: string
  cover: string | null
  weather: string | null
  location: string | null
  mood: string | null
  /** 日期 - 天 */
  day: string
  /** 日期 - 月.星期 */
  monthYear: string
  /** 时间戳字符串 */
  timestamp: string
  isPinned: boolean
  isEncrypted: boolean
  isDraft: boolean
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

/**
 * 日记本
 */
export interface Notebook {
  id: string
  name: string
  description: string | null
  cover: string | null
  color: string | null
  sortOrder: number
  diaryCount: number
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

/**
 * 相册
 */
export interface Album {
  id: string
  name: string
  description: string | null
  cover: string | null
  diaryIds: string[]
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

/**
 * 标签
 */
export interface Tag {
  id: string
  name: string
  color: string | null
  diaryCount: number
  createdAt: number
}

/**
 * 附件
 */
export interface Attachment {
  id: string
  diaryId: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  thumbnail: string | null
  size: number
  createdAt: number
}

/**
 * 用户
 */
export interface User {
  id: string
  nickname: string
  avatar: string | null
  email: string | null
  phone: string | null
}
