import {
  describeToolAction,
  isConcurrencySafeTool,
  toolNeedsConfirmation,
} from '../../src/agent/tools/policy'

describe('Agent tool policy', () => {
  it('只允许读取工具并行', () => {
    expect(isConcurrencySafeTool('search_diaries')).toBe(true)
    expect(isConcurrencySafeTool('semantic_search_diaries')).toBe(true)
    expect(isConcurrencySafeTool('mood_statistics')).toBe(true)
    expect(isConcurrencySafeTool('create_diary')).toBe(false)
  })

  it('日记写操作必须确认', () => {
    expect(toolNeedsConfirmation('create_diary')).toBe(true)
    expect(toolNeedsConfirmation('update_diary_mood')).toBe(true)
    expect(toolNeedsConfirmation('get_diary')).toBe(false)
    expect(describeToolAction('create_diary', { title: '今天' })).toContain('《今天》')
  })
})
