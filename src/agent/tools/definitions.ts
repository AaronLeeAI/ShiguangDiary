/**
 * Agent 可调用的工具集（Tool Calling）
 * 每个工具 = 一个 JSON Schema 定义 + 一个执行函数
 */
import type { ToolDefinition } from '../types'
import type { RagProgress, SemanticRagAdapter } from '../rag/types'
import { normalizeMemoryCategory } from '../memory'
import type { MemoryRepositoryAdapter } from '../memory'
import type { DiaryRepositoryAdapter, TTSAdapter } from './context'
import { toExcerpt, toMillis } from './context'

/** 暴露给 LLM 的工具清单 */
export const toolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_diaries',
      description:
        '按关键词、情绪、时间范围检索用户的日记。返回匹配的日记标题、正文摘要、心情、日期。用于回答"我某段时间写了什么""找找关于XX的日记"等问题。',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '正文或标题中需包含的关键词，可为空' },
          mood: { type: 'string', description: '按心情筛选，如 happy/sad/anxious，可为空' },
          startDate: { type: 'string', description: '起始日期 YYYY-MM-DD，可为空' },
          endDate: { type: 'string', description: '结束日期 YYYY-MM-DD，可为空' },
          limit: { type: 'number', description: '最多返回条数，默认 10' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_memories',
      description:
        '读取用户已经确认的长期记忆。用于回答“你记得我什么”、核对重要人物/目标/偏好/习惯，不能把记忆当成带日期的原始日记证据。',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remember_user_fact',
      description:
        '提议把一条稳定、未来有帮助的用户信息保存为长期记忆。调用后 App 会向用户展示具体内容并等待确认；不要保存临时情绪、敏感身份推断或医学诊断。',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '简短、客观的一句话，最多 240 字' },
          category: {
            type: 'string',
            enum: ['person', 'goal', 'preference', 'habit', 'context'],
            description: '人物/目标/偏好/习惯/背景',
          },
          sourceDiaryId: { type: 'string', description: '可选，事实来自某篇日记时填写其 id' },
        },
        required: ['content', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'forget_memory',
      description: '删除一条长期记忆。必须先通过 list_memories 找到准确的 memoryId。',
      parameters: {
        type: 'object',
        properties: {
          memoryId: { type: 'string', description: '长期记忆 id' },
        },
        required: ['memoryId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search_diaries',
      description:
        '在设备本地按语义检索日记片段（向量 + 关键词混合召回，按名次融合）。即使用户问题与日记没有相同关键词，也能按含义找到相关记录；人名、地名、专有名词等字面信息同样能命中。用于回忆经历、查找主题、理解长期变化。返回结果带 signals 字段（dense 语义相似度 / sparse 关键词得分），并可能带 lowConfidence=true 表示证据不足。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '要检索的自然语言问题或主题' },
          mood: { type: 'string', description: '可选，只检索指定心情' },
          startDate: { type: 'string', description: '可选，起始日期 YYYY-MM-DD' },
          endDate: { type: 'string', description: '可选，结束日期 YYYY-MM-DD' },
          limit: { type: 'number', description: '最多返回条数，默认 6' },
          multiQuery: {
            type: 'boolean',
            description:
              '可选。首次检索结果很少或 lowConfidence=true 时设为 true：会去掉口语外壳、拆分复合句后多问法召回再融合',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_diary',
      description: '根据 id 读取某一篇日记的完整内容。',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: '日记 id' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_diary',
      description: '帮用户新建一篇日记。当用户说"帮我记一笔""写一篇关于X的日记"时调用。',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '日记标题' },
          content: { type: 'string', description: '日记正文' },
          mood: { type: 'string', description: '心情标签，可选' },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_diary_mood',
      description: '修改某篇日记的心情标签。',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '日记 id' },
          mood: { type: 'string', description: '新的心情标签' },
        },
        required: ['id', 'mood'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_aloud',
      description:
        '把一段文字转成语音朗读出来（用户说"读给我听""念一下""播报"时调用）。text 应是你组织好的、适合朗读的自然语言，不要传 JSON 或 markdown。',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '要朗读的文字内容' },
          voice: {
            type: 'string',
            description: '可选音色 id，如 zh-CN-XiaoxiaoMultilingualNeural',
          },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mood_statistics',
      description:
        '统计指定时间范围内各心情出现次数、日记数量、最常出现的心情。用于"我最近心情怎么样"类问题。',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: '统计最近 N 天，默认 30' },
        },
        required: [],
      },
    },
  },
]

type Args = Record<string, unknown>

interface ToolExecutorOptions {
  maxDiaryResults?: number
  rag?: SemanticRagAdapter
  memory?: MemoryRepositoryAdapter
  onRagProgress?: (progress: RagProgress) => void
}

/** 工具执行器：根据名字分发到具体实现 */
export function createToolExecutor(
  repo: DiaryRepositoryAdapter,
  tts?: TTSAdapter,
  options: ToolExecutorOptions = {},
) {
  const maxDiaryResults = Math.max(1, Math.min(50, options.maxDiaryResults ?? 12))
  const impls: Record<string, (args: Args) => Promise<unknown>> = {
    async search_diaries(a) {
      const all = await repo.list()
      const kw = String(a.keyword ?? '').toLowerCase()
      const mood = String(a.mood ?? '').toLowerCase()
      const start = a.startDate ? new Date(String(a.startDate)).getTime() : -Infinity
      const end = a.endDate ? new Date(String(a.endDate)).getTime() + 86400000 : Infinity
      const requestedLimit = Number(a.limit ?? 10)
      const limit = Number.isFinite(requestedLimit)
        ? Math.max(1, Math.min(maxDiaryResults, Math.floor(requestedLimit)))
        : 10
      const hits = all
        .filter(d => {
          const t = toMillis(d.createdAt)
          if (t < start || t > end) {
            return false
          }
          if (mood && (d.mood ?? '').toLowerCase() !== mood) {
            return false
          }
          if (kw && !`${d.title}${d.content}`.toLowerCase().includes(kw)) {
            return false
          }
          return true
        })
        .sort((x, y) => toMillis(y.createdAt) - toMillis(x.createdAt))
        .slice(0, limit)
        .map(d => toExcerpt(d))
      return { count: hits.length, diaries: hits }
    },

    async semantic_search_diaries(a) {
      const query = String(a.query ?? '').trim()
      if (!query) {
        return {
          available: Boolean(options.rag),
          retrieval: 'local_semantic',
          query,
          count: 0,
          diaries: [],
          message: '请提供要检索的问题或主题',
        }
      }
      if (!options.rag) {
        return {
          available: false,
          retrieval: 'local_semantic',
          query,
          count: 0,
          diaries: [],
          reason: 'MODEL_NOT_INSTALLED',
          message: '当前环境未启用本地语义检索',
        }
      }
      const all = await repo.list()
      const requestedLimit = Number(a.limit ?? 6)
      const limit = Number.isFinite(requestedLimit)
        ? Math.max(1, Math.min(maxDiaryResults, Math.floor(requestedLimit)))
        : 6
      return options.rag.search(
        query,
        all,
        {
          limit,
          multiQuery: a.multiQuery === true,
          ...(a.mood ? { mood: String(a.mood) } : {}),
          ...(a.startDate ? { startDate: String(a.startDate) } : {}),
          ...(a.endDate ? { endDate: String(a.endDate) } : {}),
        },
        options.onRagProgress,
      )
    },

    async get_diary(a) {
      const d = await repo.findById(String(a.id))
      return d ?? { notFound: true, id: a.id }
    },

    async list_memories() {
      if (!options.memory) {
        return { available: false, memories: [], message: '当前环境未启用长期记忆' }
      }
      const memories = await options.memory.list()
      return { available: true, count: memories.length, memories }
    },

    async remember_user_fact(a) {
      if (!options.memory) {
        return { saved: false, message: '当前环境未启用长期记忆' }
      }
      const content = String(a.content ?? '')
        .trim()
        .slice(0, 240)
      if (!content) {
        throw new Error('记忆内容不能为空')
      }
      const existing = await options.memory.list()
      const duplicate = existing.find(
        item => item.content.replace(/\s+/g, '') === content.replace(/\s+/g, ''),
      )
      if (duplicate) {
        return { saved: true, duplicate: true, memory: duplicate }
      }
      const sourceDiaryId = a.sourceDiaryId ? String(a.sourceDiaryId) : null
      const validSource = sourceDiaryId ? await repo.findById(sourceDiaryId) : null
      const id = await options.memory.create({
        content,
        category: normalizeMemoryCategory(a.category),
        sourceDiaryId: validSource?.id ?? null,
      })
      return { saved: true, id, content }
    },

    async forget_memory(a) {
      if (!options.memory) {
        return { removed: false, message: '当前环境未启用长期记忆' }
      }
      const memoryId = String(a.memoryId ?? '').trim()
      if (!memoryId) {
        throw new Error('记忆 id 不能为空')
      }
      await options.memory.remove(memoryId)
      return { removed: true, memoryId }
    },

    async create_diary(a) {
      const id = await repo.create({
        title: String(a.title),
        content: String(a.content),
        ...(a.mood ? { mood: String(a.mood) } : {}),
        createdAt: Date.now(),
      })
      return { created: true, id }
    },

    async update_diary_mood(a) {
      await repo.update(String(a.id), { mood: String(a.mood) })
      return { updated: true, id: a.id, mood: a.mood }
    },

    async read_aloud(a) {
      if (!tts) {
        return { spoken: false, message: '当前环境未启用语音输出' }
      }
      const text = String(a.text ?? '').slice(0, 3000)
      const r = await tts.speak(text, {
        ...(a.voice ? { voice: String(a.voice) } : {}),
      })
      return { spoken: r.ok, ...(r.uri ? { uri: r.uri } : {}), message: r.message }
    },

    async mood_statistics(a) {
      const requestedDays = Number(a.days ?? 30)
      const days = Number.isFinite(requestedDays)
        ? Math.max(1, Math.min(3650, Math.floor(requestedDays)))
        : 30
      const since = Date.now() - days * 86400000
      const all = await repo.list()
      const recent = all.filter(d => toMillis(d.createdAt) >= since)
      const counts: Record<string, number> = {}
      for (const d of recent) {
        const m = d.mood || '未标注'
        counts[m] = (counts[m] ?? 0) + 1
      }
      const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0]
      return {
        days,
        total: recent.length,
        byMood: counts,
        mostCommon: top ? { mood: top[0], count: top[1] } : null,
      }
    },
  }

  return async function execute(name: string, args: Args): Promise<unknown> {
    const fn = impls[name]
    if (!fn) {
      throw new Error(`未知工具: ${name}`)
    }
    return fn(args)
  }
}
