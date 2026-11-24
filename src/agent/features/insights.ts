/**
 * 高层业务能力（单次 LLM 调用，不进入 Agent 工具循环）
 * 这些能力可挂在"日记详情页 / 统计页 / 后台定时任务"上，
 * 与对话式 Agent 互补，体现 AI 能力矩阵。
 */
import { llmConfig } from '../config'
import { complete } from '../llm/client'
import { MOOD_ANALYSIS_PROMPT, WEEKLY_REPORT_PROMPT, TAG_PROMPT } from '../prompts'
import type { DiaryRepositoryAdapter } from '../tools/context'
import { toExcerpt, toMillis } from '../tools/context'

export interface MoodInsight {
  mood: string
  score: number
  keywords: string[]
  summary: string
}

/** 单篇情绪分析（可用于保存日记时自动填 mood） */
export async function analyzeMood(title: string, content: string): Promise<MoodInsight> {
  const res = await complete(llmConfig, {
    messages: [{ role: 'user', content: MOOD_ANALYSIS_PROMPT(title, content) }],
    toolChoice: 'none',
  })
  return parseJson<MoodInsight>(res.message.content ?? '{}', {
    mood: 'neutral',
    score: 0,
    keywords: [],
    summary: '',
  })
}

/** 自动打标签 */
export async function autoTag(title: string, content: string): Promise<string[]> {
  const res = await complete(llmConfig, {
    messages: [{ role: 'user', content: TAG_PROMPT(title, content) }],
    toolChoice: 'none',
  })
  return parseJson<string[]>(res.message.content ?? '[]', [])
}

/** 本周回顾报告 */
export async function weeklyReport(repo: DiaryRepositoryAdapter): Promise<string> {
  const all = await repo.list()
  const since = Date.now() - 7 * 86400000
  const week = all
    .filter(d => toMillis(d.createdAt) >= since)
    .sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt))
    .map(d => toExcerpt(d, 200))
  if (!week.length) {
    return '这一周还没有日记，抽空记一笔吧 ✨'
  }
  const digest = week.map(d => `[${d.createdAt.slice(0, 10)}] ${d.title}：${d.content}`).join('\n')
  const res = await complete(llmConfig, {
    messages: [{ role: 'user', content: WEEKLY_REPORT_PROMPT(digest) }],
    toolChoice: 'none',
  })
  return res.message.content ?? ''
}

/** 容错 JSON 解析：模型偶尔会带 ```json 包裹或多余文本 */
function parseJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim()
    const start = cleaned.search(/[[{]/)
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
    if (start < 0 || end < start) {
      return fallback
    }
    return JSON.parse(cleaned.slice(start, end + 1)) as T
  } catch {
    return fallback
  }
}
