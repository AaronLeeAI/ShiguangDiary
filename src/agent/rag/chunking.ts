import type { DiaryRecord } from '../tools/context'

export interface DiaryChunk {
  diaryId: string
  chunkIndex: number
  embeddingText: string
  content: string
}

const SENTENCE_BOUNDARY = /[。！？!?；;\n]/

export function normalizeDiaryContent(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function findChunkEnd(text: string, start: number, maxChars: number): number {
  const hardEnd = Math.min(text.length, start + maxChars)
  if (hardEnd >= text.length) {
    return text.length
  }

  const minimumEnd = start + Math.floor(maxChars * 0.6)
  for (let cursor = hardEnd; cursor >= minimumEnd; cursor--) {
    if (SENTENCE_BOUNDARY.test(text[cursor - 1] ?? '')) {
      return cursor
    }
  }
  return hardEnd
}

export function chunkDiary(
  diary: DiaryRecord,
  options: { maxChars?: number; overlapChars?: number } = {},
): DiaryChunk[] {
  const maxChars = Math.max(120, options.maxChars ?? 420)
  const overlapChars = Math.max(0, Math.min(maxChars - 1, options.overlapChars ?? 60))
  const content = normalizeDiaryContent(diary.content ?? '')
  const source = content || normalizeDiaryContent(diary.title ?? '')
  if (!source) {
    return []
  }

  const metadata = [
    `标题：${diary.title || '未命名日记'}`,
    diary.mood ? `心情：${diary.mood}` : '',
    `日期：${new Date(diary.createdAt).toISOString().slice(0, 10)}`,
  ]
    .filter(Boolean)
    .join('；')

  const chunks: DiaryChunk[] = []
  let start = 0
  while (start < source.length) {
    const end = findChunkEnd(source, start, maxChars)
    const text = source.slice(start, end).trim()
    if (text) {
      chunks.push({
        diaryId: diary.id,
        chunkIndex: chunks.length,
        embeddingText: `${metadata}\n正文：${text}`,
        content: text,
      })
    }
    if (end >= source.length) {
      break
    }
    start = Math.max(start + 1, end - overlapChars)
  }
  return chunks
}

export function diarySourceHash(diary: DiaryRecord): string {
  const input = [
    diary.title,
    diary.content,
    diary.mood ?? '',
    diary.createdAt,
    diary.updatedAt ?? '',
  ].join('\u241f')

  const modulus = 4294967291
  let first = 2166136261
  let second = 2654435761
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index)
    first = (first * 131 + code) % modulus
    second = (second * 137 + code + index) % modulus
  }
  return `${first.toString(16).padStart(8, '0')}${second.toString(16).padStart(8, '0')}`
}
