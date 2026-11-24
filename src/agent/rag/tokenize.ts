/**
 * 中文/英文混排分词（给 BM25 用）
 *
 * 为什么不用空格切词：中文没有词边界，"安静的咖啡馆" 用空格切会变成 0 个词。
 * 这里用 Lucene CJKBigram 的思路：连续汉字切 2-gram（"安静"，"静的"，"的咖"…），
 * 拉丁字母/数字按非字母数字边界切词并小写。
 *
 * 选 2-gram 而不是引入 jieba 词典：
 * 1. 词典动辄几 MB，模型已经占 130 MiB，端上体积敏感；
 * 2. 2-gram 不需要词典，召回率高（"咖啡馆" 一定包含 "咖啡"），代价是索引略大；
 * 3. BM25 的 IDF 会自动压低 "的一"、"是在" 这类高频组合的权重。
 */

const CJK_PATTERN = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/

const LATIN_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'was',
  'were',
  'with',
  'you',
])

/** 单字虚词：单独成词时几乎没有检索价值（2-gram 里仍然保留，交给 IDF 处理）。 */
const CJK_FILLERS = new Set([
  '的',
  '了',
  '是',
  '在',
  '和',
  '就',
  '也',
  '都',
  '很',
  '我',
  '你',
  '他',
])

export function isCjk(char: string): boolean {
  return CJK_PATTERN.test(char)
}

/**
 * 把文本切成检索 token。
 * - 连续汉字：长度 1 保留单字，长度 >= 2 输出全部 2-gram
 * - 连续拉丁/数字：按非 [a-z0-9] 切分，过滤停用词
 */
export function tokenize(text: string): string[] {
  if (!text) {
    return []
  }

  const normalized = text.toLowerCase()
  const tokens: string[] = []
  let latinBuffer = ''

  const flushLatin = () => {
    if (!latinBuffer) {
      return
    }
    for (const word of latinBuffer.split(/[^a-z0-9]+/)) {
      if (word.length >= 2 && !LATIN_STOPWORDS.has(word)) {
        tokens.push(word)
      }
    }
    latinBuffer = ''
  }

  let index = 0
  while (index < normalized.length) {
    const char = normalized[index]

    if (isCjk(char)) {
      flushLatin()
      let end = index
      while (end < normalized.length && isCjk(normalized[end])) {
        end++
      }
      const run = normalized.slice(index, end)
      if (run.length === 1) {
        if (!CJK_FILLERS.has(run)) {
          tokens.push(run)
        }
      } else {
        for (let cursor = 0; cursor + 1 < run.length; cursor++) {
          tokens.push(run.slice(cursor, cursor + 2))
        }
      }
      index = end
      continue
    }

    latinBuffer += char
    index++
  }
  flushLatin()
  return tokens
}

/** 查询侧去重：同一个 token 重复出现不重复计分（BM25 的 tf 只应反映文档内部频率）。 */
export function tokenizeQuery(text: string): string[] {
  return [...new Set(tokenize(text))]
}
