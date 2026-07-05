/**
 * diaryStore 纯函数辅助单测(Task16 集成修复)
 *
 * 覆盖:
 *  - applyDiaryUpdate: 编辑 content 时刷新 summary,不动 content 时保留旧 summary,
 *    updatedAt 总是更新;day/monthYear/timestamp 维持不变(因源自 createdAt)。
 *  - bumpNotebookCount: interval +1/negative delta,不改 notebook 其余字段。
 *
 * 只测纯函数(applyDiaryUpdate / bumpNotebookCount,来自 diaryStorePure 零副作用模块),
 * 不 import 整个 zustand store,避免触发 @database / initDatabase / react-native-fs 原生模块加载。
 */

import { it, expect, describe } from '@jest/globals'

import {
  applyDiaryUpdate,
  bumpNotebookCount,
} from '../../src/store/diaryStorePure'
import type { Diary, Notebook } from '../../src/types/models'

const baseDiary = (overrides: Partial<Diary> = {}): Diary => ({
  id: 'd-1',
  notebookId: 'nb-1',
  title: '旧标题',
  summary: '旧摘要不超长',
  content: '旧正文',
  cover: null,
  weather: null,
  location: null,
  mood: null,
  day: '04',
  monthYear: '07月·周四',
  timestamp: '14:30',
  isPinned: false,
  isEncrypted: false,
  isDraft: false,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  deletedAt: null,
  ...overrides,
})

const baseNotebook = (overrides: Partial<Notebook> = {}): Notebook => ({
  id: 'nb-1',
  name: '默认日记本',
  description: null,
  cover: null,
  color: null,
  sortOrder: 0,
  diaryCount: 2,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  deletedAt: null,
  ...overrides,
})

describe('applyDiaryUpdate', () => {
  it('content 变更时刷新 summary 为新 content 前 80 字符', () => {
    const now = 1700000010000
    const result = applyDiaryUpdate(baseDiary(), { content: '全新的正文内容' }, now)
    expect(result.summary).toBe('全新的正文内容')
    expect(result.content).toBe('全新的正文内容')
    expect(result.updatedAt).toBe(now)
  })

  it('content 长度超过 80 时 summary 截断至 80', () => {
    const long = 'A'.repeat(120)
    const result = applyDiaryUpdate(baseDiary(), { content: long }, 1)
    expect(result.summary.length).toBe(80)
    expect(result.summary).toBe('A'.repeat(80))
  })

  it('传 content 为空字符串时 summary 归空(同步 content)', () => {
    const result = applyDiaryUpdate(baseDiary(), { content: '' }, 1)
    expect(result.summary).toBe('')
  })

  it('不传 content 时保留旧 summary', () => {
    const before = baseDiary({ summary: '保留旧摘要' })
    const result = applyDiaryUpdate(before, { title: '新标题' }, 1)
    expect(result.summary).toBe('保留旧摘要')
    expect(result.title).toBe('新标题')
  })

  it('保留 day/monthYear/timestamp(源自 createdAt,编辑不应改变)', () => {
    const before = baseDiary({ day: '04', monthYear: '07月·周四', timestamp: '14:30' })
    const result = applyDiaryUpdate(before, { content: '改正文' }, 1)
    expect(result.day).toBe(before.day)
    expect(result.monthYear).toBe(before.monthYear)
    expect(result.timestamp).toBe(before.timestamp)
  })
})

describe('bumpNotebookCount', () => {
  it('默认 +1 递增 diaryCount', () => {
    const result = bumpNotebookCount(baseNotebook({ diaryCount: 2 }))
    expect(result.diaryCount).toBe(3)
  })

  it('支持自定义 delta(含负值)', () => {
    expect(bumpNotebookCount(baseNotebook({ diaryCount: 5 }), -1).diaryCount).toBe(4)
    expect(bumpNotebookCount(baseNotebook({ diaryCount: 5 }), 2).diaryCount).toBe(7)
  })

  it('不改 notebook 其余字段', () => {
    const before = baseNotebook({ diaryCount: 1 })
    const result = bumpNotebookCount(before)
    const { diaryCount, ...restBefore } = before
    const { diaryCount: _after, ...restAfter } = result
    expect(restAfter).toEqual(restBefore)
  })
})
