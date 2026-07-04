/**
 * 数据模型 - 类型定义
 *
 * 数据库表与业务模型的映射。
 */

/**
 * 日记
 */
export interface DiaryModel {
  id: string;
  notebookId: string | null;
  title: string;
  content: string;
  cover: string | null;
  weather: string | null;
  location: string | null;
  mood: string | null;
  isPinned: 0 | 1;
  isEncrypted: 0 | 1;
  isDraft: 0 | 1;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

/**
 * 日记本
 */
export interface NotebookModel {
  id: string;
  name: string;
  description: string | null;
  cover: string | null;
  color: string | null;
  sortOrder: number;
  diaryCount: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

/**
 * 相册
 */
export interface AlbumModel {
  id: string;
  name: string;
  description: string | null;
  cover: string | null;
  diaryIds: string; // JSON array
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

/**
 * 标签
 */
export interface TagModel {
  id: string;
  name: string;
  color: string | null;
  diaryCount: number;
  createdAt: number;
}

/**
 * 附件
 */
export interface AttachmentModel {
  id: string;
  diaryId: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnail: string | null;
  size: number;
  createdAt: number;
}

/**
 * 草稿
 */
export interface DraftModel {
  id: string;
  content: string;
  title: string | null;
  updatedAt: number;
}

/**
 * 用户偏好
 */
export interface PreferenceModel {
  key: string;
  value: string;
  updatedAt: number;
}