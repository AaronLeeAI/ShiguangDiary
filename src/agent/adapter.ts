/**
 * Agent ↔ 拾光日记真实数据层 适配器
 *
 * 把项目的 diaryRepository 包装成 Agent 需要的 DiaryRepositoryAdapter。
 * 关键点：真实 DiaryModel 的 createdAt/updatedAt 是 number 毫秒时间戳，
 *         且 create() 需要完整字段（含 isPinned/isDraft 等 0|1 标志）。
 */
import { diaryRepository } from '../database/repository'
import type { DiaryModel } from '../database/models'
import type { DiaryRepositoryAdapter, DiaryRecord } from './tools/context'

/** 兼容早期数据中使用 Unix 秒的时间戳，Agent 内部统一使用毫秒。 */
function normalizeTimestamp(value: number): number {
  return value > 0 && value < 1e12 ? value * 1000 : value
}

/** DiaryModel → Agent 用的精简记录（字段几乎一一对应） */
function toRecord(d: DiaryModel): DiaryRecord {
  return {
    id: d.id,
    title: d.title,
    content: d.content,
    mood: d.mood,
    weather: d.weather,
    location: d.location,
    createdAt: normalizeTimestamp(d.createdAt),
    updatedAt: normalizeTimestamp(d.updatedAt),
    notebookId: d.notebookId,
    isEncrypted: d.isEncrypted === 1,
  }
}

export const repoAdapter: DiaryRepositoryAdapter = {
  async list() {
    const all = await diaryRepository.list()
    // 加密日记不进入远端 Agent 上下文；本地 RAG 也遵循同一边界。
    return all.filter(d => d.deletedAt == null && d.isEncrypted === 0).map(toRecord)
  },

  async findById(id) {
    const d = await diaryRepository.findById(id)
    return d && d.isEncrypted === 0 ? toRecord(d) : null
  },

  async create(input) {
    const now = Date.now()
    const id = `diary-${now}-${Math.random().toString(36).slice(2, 8)}`
    const full: DiaryModel = {
      id,
      notebookId: null,
      title: input.title,
      content: input.content,
      cover: null,
      weather: null,
      location: null,
      mood: input.mood ?? null,
      isPinned: 0,
      isEncrypted: 0,
      isDraft: 0,
      createdAt: typeof input.createdAt === 'number' ? input.createdAt : now,
      updatedAt: now,
      deletedAt: null,
    }
    await diaryRepository.create(full)
    return id
  },

  async update(id, patch) {
    await diaryRepository.update(id, patch as Partial<DiaryModel>)
  },

  async remove(id) {
    await diaryRepository.remove(id)
  },
}
