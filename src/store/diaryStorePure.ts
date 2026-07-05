/**
 * diaryStore 纯函数辅助(可单测,零副作用依赖)
 *
 * 从 diaryStore 抽出的编辑/计数派生逻辑,不引 @database / @services,
 * 便于在 jest 下直接单测(避免触发 react-native-fs 等原生模块加载)。
 */

import type { Diary, Notebook } from '@types'

/**
 * 编辑日记后的派生刷新。
 * 编辑 content 时重派 summary(否则 Home 卡片预览 / Search snippet 显旧摘要,Task16 集成修复)。
 * day/monthYear/timestamp 源自 createdAt,编辑不改 createdAt,无需刷新。
 */
export const applyDiaryUpdate = (d: Diary, data: Partial<Diary>, now: number): Diary => ({
  ...d,
  ...data,
  summary: data.content !== undefined ? data.content.slice(0, 80) : d.summary,
  updatedAt: now,
})

/** 创建日记后递增/递减归属笔记本计数(Task16 集成修复)。默认 +1。 */
export const bumpNotebookCount = (n: Notebook, delta: number = 1): Notebook => ({
  ...n,
  diaryCount: n.diaryCount + delta,
})
