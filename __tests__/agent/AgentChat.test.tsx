import React from 'react'
import { Text, TextInput } from 'react-native'
import renderer, { act } from 'react-test-renderer'

import AgentChat from '../../src/components/AgentChat/AgentChat'
import { runAgent } from '../../src/agent'

jest.mock('../../src/agent', () => ({
  runAgent: jest.fn(),
  loadAgentSession: jest.fn(async () => []),
  saveAgentSession: jest.fn(async () => undefined),
  clearAgentSession: jest.fn(async () => undefined),
}))

const repo = {
  list: jest.fn(async () => []),
  findById: jest.fn(async () => null),
  create: jest.fn(async () => 'id'),
  update: jest.fn(async () => undefined),
  remove: jest.fn(async () => undefined),
}

describe('AgentChat', () => {
  beforeEach(() => {
    const mockedRunAgent = runAgent as jest.Mock
    mockedRunAgent.mockReset()
  })

  it('把模型回复写入对应的助手气泡', async () => {
    const mockedRunAgent = runAgent as jest.Mock
    mockedRunAgent.mockImplementation(async (_question, _deps, onEvent) => {
      onEvent({ type: 'thinking' })
      onEvent({ type: 'done', answer: '你好，我是拾光。', steps: 1 })
      return '你好，我是拾光。'
    })

    let tree: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(<AgentChat repo={repo} />)
    })

    const input = tree!.root.findByType(TextInput)
    await act(async () => {
      input.props.onChangeText('hello')
    })
    await act(async () => {
      await input.props.onSubmitEditing()
    })

    const texts = tree!.root.findAllByType(Text).map(node => node.props.children)
    expect(texts).toContain('hello')
    expect(texts).toContain('你好，我是拾光。')

    await act(async () => {
      tree!.unmount()
    })
  })

  it('模型限流时回退到本地语义检索并展示来源日记', async () => {
    const mockedRunAgent = runAgent as jest.Mock
    mockedRunAgent.mockImplementation(async (_question, _deps, onEvent) => {
      onEvent({ type: 'error', message: 'Request failed with status code 429' })
      throw new Error('Request failed with status code 429')
    })
    const rag = {
      getStatus: jest.fn(async () => ({
        state: 'ready' as const,
        modelId: 'test-model',
        modelBytes: 1,
        indexedDiaries: 1,
        indexedChunks: 1,
      })),
      prepare: jest.fn(),
      clearIndex: jest.fn(),
      search: jest.fn(async () => ({
        available: true,
        retrieval: 'local_semantic' as const,
        query: '哪里让我放松',
        count: 1,
        indexedDiaries: 1,
        indexedChunks: 1,
        diaries: [
          {
            id: 'diary-1',
            title: '午后咖啡',
            content: '很安静，适合发呆。',
            createdAt: new Date(1700000000000).toISOString(),
            score: 0.9,
            chunkIndex: 0,
          },
        ],
      })),
    }

    let tree: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(<AgentChat repo={repo} rag={rag} />)
    })
    const input = tree!.root.findByType(TextInput)
    await act(async () => {
      input.props.onChangeText('哪里让我放松')
    })
    await act(async () => {
      await input.props.onSubmitEditing()
    })

    const texts = tree!.root.findAllByType(Text).map(node => node.props.children)
    expect(texts).toContain('午后咖啡')
    expect(texts).toContain(
      '模型服务暂时忙，我先在本机找到这些可能相关的日记。你可以直接打开原文查看；稍后重试，我再帮你把它们整理成完整回答。',
    )

    await act(async () => {
      tree!.unmount()
    })
  })
})
