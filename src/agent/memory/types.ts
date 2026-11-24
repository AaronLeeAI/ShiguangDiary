export type MemoryCategory = 'person' | 'goal' | 'preference' | 'habit' | 'context'

export interface AgentMemory {
  id: string
  content: string
  category: MemoryCategory
  sourceDiaryId?: string | null
  createdAt: number
  updatedAt: number
}

export interface MemoryRepositoryAdapter {
  list(): Promise<AgentMemory[]>
  create(input: {
    content: string
    category: MemoryCategory
    sourceDiaryId?: string | null
  }): Promise<string>
  update(
    id: string,
    patch: Partial<Pick<AgentMemory, 'content' | 'category' | 'sourceDiaryId'>>,
  ): Promise<void>
  remove(id: string): Promise<void>
}
