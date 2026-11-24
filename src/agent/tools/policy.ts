export type ToolPolicy = 'read' | 'write' | 'device'

const TOOL_POLICIES: Record<string, ToolPolicy> = {
  search_diaries: 'read',
  semantic_search_diaries: 'read',
  get_diary: 'read',
  mood_statistics: 'read',
  list_memories: 'read',
  create_diary: 'write',
  update_diary_mood: 'write',
  remember_user_fact: 'write',
  forget_memory: 'write',
  read_aloud: 'device',
}

export function getToolPolicy(name: string): ToolPolicy | null {
  return TOOL_POLICIES[name] ?? null
}

/** 只有无副作用的读取工具可以并行。 */
export function isConcurrencySafeTool(name: string): boolean {
  return getToolPolicy(name) === 'read'
}

export function toolNeedsConfirmation(name: string): boolean {
  return getToolPolicy(name) === 'write'
}

export function describeToolAction(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'create_diary':
      return `新建日记《${String(args.title ?? '未命名日记')}》`
    case 'update_diary_mood':
      return `把日记 ${String(args.id ?? '')} 的心情改为「${String(args.mood ?? '')}」`
    case 'remember_user_fact':
      return `保存长期记忆：${String(args.content ?? '').slice(0, 120)}`
    case 'forget_memory':
      return `删除长期记忆 ${String(args.memoryId ?? '')}`
    default:
      return `执行 ${name}`
  }
}
