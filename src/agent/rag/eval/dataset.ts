/**
 * 检索评测黄金集（golden set）
 *
 * 作用：把"改了检索逻辑到底有没有变好"从感觉变成数字。
 * 这里用合成的日记 + 标注好的相关问题，跑在 CI 里当门禁；
 * 换成真实用户数据时，只需替换 EVAL_DIARIES / EVAL_QUERIES 即可。
 *
 * 查询刻意分成三类：
 * - semantic：不带日记原文关键词，只能靠语义理解
 * - lexical：人名/作品名/地名等字面必须命中的
 * - mixed：两者都有一点
 *
 * 注意：这里的向量来自测试用的确定性假模型，指标只能验证"融合/排序逻辑"是否正确，
 * 不能代表真机 768 维模型的效果。真机效果需要按 docs/ai/RagRetrievalUpgrade.md
 * 里的步骤用真实模型复测。
 */
import type { DiaryRecord } from '../../tools/context'

export type EvalQueryKind = 'semantic' | 'lexical' | 'mixed'

export interface EvalQuery {
  query: string
  /** 应该被召回的日记 id（按重要性排序，第一条是最优答案） */
  relevant: string[]
  kind: EvalQueryKind
}

const DAY = 86400000
const BASE = Date.UTC(2026, 2, 1)

const diary = (
  id: string,
  title: string,
  content: string,
  mood: string,
  dayOffset: number,
): DiaryRecord => ({
  id,
  title,
  content,
  mood,
  createdAt: BASE + dayOffset * DAY,
  updatedAt: BASE + dayOffset * DAY,
})

export const EVAL_DIARIES: DiaryRecord[] = [
  diary('d-overtime', '赶项目', '连夜赶项目，凌晨两点才睡，第二天眼睛都睁不开。', '疲惫', 0),
  diary('d-universal', '环球影城', '在环球影城排了两个小时队，过山车比想象中刺激。', '兴奋', 3),
  diary('d-cafe', '午后咖啡', '在一家很安静的咖啡店发呆，什么也没做，就觉得轻松。', '平静', 5),
  diary(
    'd-hotpot',
    '和老王吃火锅',
    '和老王约了火锅，从工作聊到大学，一直聊到店里打烊。',
    '开心',
    8,
  ),
  diary('d-grandma', '回老家', '回老家看奶奶，她做了一桌菜，红烧肉还是小时候的味道。', '温暖', 12),
  diary('d-running', '夜跑', '夜跑五公里，心率一直偏高，跑完腿有点发软。', '疲惫', 15),
  diary('d-book', '读完人类简史', '读完《人类简史》，农业革命那章让我想了很久。', '平静', 18),
  diary('d-anxiety', '汇报前', '汇报前一晚特别焦虑，手心出汗，反复改稿到十二点。', '焦虑', 21),
  diary('d-moving', '搬家', '搬到新家，窗外是一排梧桐树，早上有鸟叫。', '平静', 25),
  diary('d-live', 'Livehouse', '去听了场 livehouse，很吵，但那种热闹让人上瘾。', '兴奋', 30),
]

export const EVAL_QUERIES: EvalQuery[] = [
  // 语义类：查询词与日记原文几乎不重叠
  { query: '那种一个人消磨时光的安静地方', relevant: ['d-cafe'], kind: 'semantic' },
  { query: '和家人一起吃饭的温暖时刻', relevant: ['d-grandma'], kind: 'semantic' },
  { query: '运动之后身体吃不消的感觉', relevant: ['d-running'], kind: 'semantic' },
  { query: '心里发紧、坐立不安的时候', relevant: ['d-anxiety'], kind: 'semantic' },

  // 字面类：人名、作品名、场所名必须精确命中
  { query: '环球影城', relevant: ['d-universal'], kind: 'lexical' },
  { query: '人类简史', relevant: ['d-book'], kind: 'lexical' },
  { query: 'livehouse', relevant: ['d-live'], kind: 'lexical' },

  // 混合类
  { query: '和老王吃的什么', relevant: ['d-hotpot'], kind: 'mixed' },
  { query: '搬家以后窗外能看到什么', relevant: ['d-moving'], kind: 'mixed' },
  { query: '哪次加班到很晚', relevant: ['d-overtime'], kind: 'mixed' },
]
