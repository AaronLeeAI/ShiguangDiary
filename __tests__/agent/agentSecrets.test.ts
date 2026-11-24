import { mmkvStorage } from '../../src/storage/mmkvStorage'
import {
  clearLLMCredentials,
  loadLLMCredentials,
  saveLLMCredentials,
} from '../../src/agent/agentSecrets'

describe('agentSecrets', () => {
  beforeEach(async () => {
    await clearLLMCredentials()
  })

  it('在系统安全存储中保存并读取模型凭据', async () => {
    await saveLLMCredentials({
      apiKey: 'test-key',
      baseURL: 'https://example.com/v1',
      model: 'test-model',
    })

    await expect(loadLLMCredentials()).resolves.toEqual({
      apiKey: 'test-key',
      baseURL: 'https://example.com/v1',
      model: 'test-model',
    })
  })

  it('把旧版 MMKV 凭据迁移后从 MMKV 删除', async () => {
    mmkvStorage.setItem('agent.llm.apiKey', 'legacy-key')
    mmkvStorage.setItem('agent.llm.baseURL', 'https://legacy.example.com/v1')
    mmkvStorage.setItem('agent.llm.model', 'legacy-model')

    await expect(loadLLMCredentials()).resolves.toEqual({
      apiKey: 'legacy-key',
      baseURL: 'https://legacy.example.com/v1',
      model: 'legacy-model',
    })
    expect(mmkvStorage.getItem('agent.llm.apiKey')).toBeNull()
    expect(mmkvStorage.getItem('agent.llm.baseURL')).toBeNull()
    expect(mmkvStorage.getItem('agent.llm.model')).toBeNull()
  })
})
