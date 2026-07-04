/**
 * 数据库配置
 *
 * 使用 react-native-sqlite-storage 作为底层存储。
 * Database 名：shiguang.db
 */

export const DATABASE_CONFIG = {
  name: 'shiguang.db',
  version: '1.0.0',
  displayName: 'ShiguangDiary',
  size: 20 * 1024 * 1024, // 20MB
  location: 'default',
} as const

/**
 * 表名常量
 */
export const TABLES = {
  DIARY: 'diary',
  NOTEBOOK: 'notebook',
  ALBUM: 'album',
  TAG: 'tag',
  DIARY_TAG: 'diary_tag',
  ATTACHMENT: 'attachment',
  DRAFT: 'draft',
  RECYCLE: 'recycle',
  USER: 'user',
  PREFERENCE: 'preference',
} as const

export type TableName = (typeof TABLES)[keyof typeof TABLES]
