import type { LLMConfig } from './types'

/**
 * Public model defaults. Secrets must never be added to this file because it is
 * bundled with the application.
 */
export const LLM_DEFAULTS: Pick<LLMConfig, 'baseURL' | 'model'> = {
  baseURL: 'https://tokenhub.tencentmaas.com/v1',
  model: 'hy4-flash',
}
