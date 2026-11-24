import { agentMemoryRepository } from '../../database/repository'
import type { AgentMemoryModel } from '../../database/models'
import type { AgentMemory, MemoryCategory, MemoryRepositoryAdapter } from './types'

const CATEGORIES: readonly MemoryCategory[] = ['person', 'goal', 'preference', 'habit', 'context']

export function normalizeMemoryCategory(value: unknown): MemoryCategory {
  const category = String(value ?? '').trim() as MemoryCategory
  return CATEGORIES.includes(category) ? category : 'context'
}

function toMemory(model: AgentMemoryModel): AgentMemory {
  return {
    id: model.id,
    content: model.content,
    category: normalizeMemoryCategory(model.category),
    sourceDiaryId: model.sourceDiaryId,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}

export const memoryAdapter: MemoryRepositoryAdapter = {
  async list() {
    return (await agentMemoryRepository.list()).map(toMemory)
  },

  async create(input) {
    const content = input.content.trim().slice(0, 240)
    if (!content) {
      throw new Error('记忆内容不能为空')
    }
    const now = Date.now()
    const id = `memory-${now}-${Math.random().toString(36).slice(2, 8)}`
    await agentMemoryRepository.create({
      id,
      content,
      category: normalizeMemoryCategory(input.category),
      sourceDiaryId: input.sourceDiaryId?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    return id
  },

  async update(id, patch) {
    const next: Partial<AgentMemoryModel> = {}
    if (patch.content !== undefined) {
      const content = patch.content.trim().slice(0, 240)
      if (!content) {
        throw new Error('记忆内容不能为空')
      }
      next.content = content
    }
    if (patch.category !== undefined) {
      next.category = normalizeMemoryCategory(patch.category)
    }
    if (patch.sourceDiaryId !== undefined) {
      next.sourceDiaryId = patch.sourceDiaryId?.trim() || null
    }
    await agentMemoryRepository.update(id, next)
  },

  async remove(id) {
    await agentMemoryRepository.remove(id)
  },
}
