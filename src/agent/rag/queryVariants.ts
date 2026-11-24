/**
 * 多问法改写（multi-query retrieval 的轻量版）
 *
 * 用户提问往往带口语外壳、时间状语或复合从句，直接拿去检索会稀释语义：
 * "你还记得前段时间我去环球影城那次吗" 里的"你还记得…吗"对召回毫无帮助，
 * 反而拉低了与日记正文的相似度。
 *
 * 这里做确定性的规则改写，不额外调用 LLM：
 * 1. 去掉提问外壳（"帮我找找"、"你记得…吗"）
 * 2. 去掉时间状语（时间范围已经由结构化参数处理，留在查询里会误导语义匹配）
 * 3. 拆复合句，让每个子问题独立召回
 *
 * 相比让 LLM 生成改写，这样做零成本、零延迟、可测试；
 * 真正的 HyDE（先生成假设答案再检索）需要额外的 LLM 调用，留作后续可选项。
 */

const LEADING_PATTERNS: readonly RegExp[] = [
  /^(请问|请帮我|请帮我找|帮我|帮忙|麻烦|能不能|可不可以|可以|我想知道|我想问一下|我想问|我想|想问|告诉我|说说|讲讲|聊聊)/,
  /^(你还?记不记得|你还?记得|你知不知道|你知道)/,
  /^(有没有|是否)(过|曾经)?/,
]

const TRAILING_PATTERN = /(吗|呢|吧|呀|啊|嘛|哦|的|了|？|\?|。|！|!|~)+$/u

const TIME_PHRASE_PATTERN =
  /(最近|近期|这几天|这阵子|这段时间|前段时间|上个月|上个星期|上周|去年|今年|前年|从前|以前|小时候|那阵子|\d{4}\s*年|\d{1,2}\s*月份?|\d{1,2}\s*月\s*\d{1,2}\s*[日号])/gu

const CLAUSE_SEPARATOR = /[，,。；;、\n]+/

function stripLeading(text: string): string {
  let current = text.trim()
  for (let guard = 0; guard < 4; guard++) {
    let changed = false
    for (const pattern of LEADING_PATTERNS) {
      const next = current.replace(pattern, '').trim()
      if (next && next !== current) {
        current = next
        changed = true
      }
    }
    if (!changed) {
      break
    }
  }
  return current
}

/** 归一化用于去重：去掉空白与标点，只比语义骨架。 */
function fingerprint(text: string): string {
  return text.replace(/[\s，,。；;、？?！!~～"'“”‘’]+/g, '').toLowerCase()
}

/**
 * 生成多种问法。返回的第一项始终是原始查询，保证融合时原文不被丢掉。
 * @param maxVariants 最多返回几条（含原始查询），默认 3
 */
export function queryVariants(query: string, maxVariants = 3): string[] {
  const original = query.trim()
  if (!original) {
    return []
  }

  const limit = Math.max(1, Math.floor(maxVariants))
  const cleaned = original.replace(TRAILING_PATTERN, '').trim()
  const stripped = stripLeading(cleaned) || cleaned || original
  const withoutTime = stripped.replace(TIME_PHRASE_PATTERN, ' ').replace(/\s+/g, ' ').trim()

  const candidates: string[] = [original, stripped, withoutTime]

  // 复合问句拆成子问题，各自召回后再融合
  const clauses = cleaned
    .split(CLAUSE_SEPARATOR)
    .map(clause => stripLeading(clause.replace(TRAILING_PATTERN, '').trim()))
    .filter(clause => clause.length >= 4)
  if (clauses.length > 1) {
    candidates.push(...clauses)
  }

  const seen = new Set<string>()
  const variants: string[] = []
  for (const candidate of candidates) {
    const key = fingerprint(candidate)
    if (key.length < 2 || seen.has(key)) {
      continue
    }
    seen.add(key)
    variants.push(candidate)
    if (variants.length >= limit) {
      break
    }
  }
  return variants
}
