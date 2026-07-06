/**
 * Configuration Center 纯函数单测
 *
 * 覆盖 validateConfig/migrateConfig/diffConfig 关键场景:
 *  - 合法配置通过校验(valid=true,changed=false)
 *  - 非法/缺失字段用 DEFAULT 回填(changed=true)
 *  - editor 子配置非法时整体回填
 *  - migrateConfig = validate 包装(初版无版本字段)
 *  - diffConfig 列出变更键;无变更返回空 keys
 *
 * 用相对路径 import(纯函数,运行时无别名解析,与 insightsEngine.test.ts 范式一致)。
 */

import { it, expect, describe } from '@jest/globals'

import {
  DEFAULT_CONFIG,
  CURRENT_CONFIG_VERSION,
  validateConfig,
  migrateConfig,
  diffConfig,
  configVersion,
} from '../../../src/features/settings/utils/configurationCenter'
import type { ConfigSnapshot } from '../../../src/features/settings/types'

const validSnapshot: ConfigSnapshot = {
  themeMode: 'dark',
  homeListStyle: 'card',
  diarySortOrder: 'createdAsc',
  editor: { fontScale: 1.2, toolbarEnabled: false, autoSaveInterval: 5000 },
}

describe('configVersion', () => {
  it('returns current version constant', () => {
    expect(configVersion()).toBe(CURRENT_CONFIG_VERSION)
    expect(CURRENT_CONFIG_VERSION).toBe(1)
  })
})

describe('validateConfig', () => {
  it('passes a fully valid snapshot unchanged', () => {
    const { normalized, changed, valid } = validateConfig(validSnapshot)
    expect(valid).toBe(true)
    expect(changed).toBe(false)
    expect(normalized).toEqual(validSnapshot)
  })

  it('normalizes an empty object to DEFAULT_CONFIG', () => {
    const { normalized, changed, valid } = validateConfig({})
    expect(valid).toBe(false)
    expect(changed).toBe(true)
    expect(normalized).toEqual(DEFAULT_CONFIG)
  })

  it('falls back per-field for invalid enum values', () => {
    const { normalized, changed, valid } = validateConfig({
      themeMode: 'pink',
      homeListStyle: 'whatever',
      diarySortOrder: 'random',
      editor: { fontScale: 1, toolbarEnabled: true, autoSaveInterval: 3000 },
    })
    expect(valid).toBe(false)
    expect(changed).toBe(true)
    expect(normalized.themeMode).toBe(DEFAULT_CONFIG.themeMode)
    expect(normalized.homeListStyle).toBe(DEFAULT_CONFIG.homeListStyle)
    expect(normalized.diarySortOrder).toBe(DEFAULT_CONFIG.diarySortOrder)
  })

  it('replaces the whole editor when its shape is invalid', () => {
    const { normalized, changed } = validateConfig({
      editor: { fontScale: 1, toolbarEnabled: true }, // missing autoSaveInterval
    })
    expect(changed).toBe(true)
    expect(normalized.editor).toEqual(DEFAULT_CONFIG.editor)
  })

  it('replaces editor when fontScale is non-positive', () => {
    const { normalized, changed } = validateConfig({
      editor: { fontScale: 0, toolbarEnabled: true, autoSaveInterval: 3000 },
    })
    expect(changed).toBe(true)
    expect(normalized.editor).toEqual(DEFAULT_CONFIG.editor)
  })

  it('treats non-object input as empty (all defaults)', () => {
    const { normalized, changed, valid } = validateConfig(null)
    expect(valid).toBe(false)
    expect(changed).toBe(true)
    expect(normalized).toEqual(DEFAULT_CONFIG)
  })
})

describe('migrateConfig', () => {
  it('returns normalized config for valid input without changes', () => {
    const { config, changed } = migrateConfig(validSnapshot)
    expect(changed).toBe(false)
    expect(config).toEqual(validSnapshot)
  })

  it('backfills defaults for invalid input (changed=true)', () => {
    const { config, changed } = migrateConfig({ themeMode: 'dark' })
    expect(changed).toBe(true)
    expect(config.themeMode).toBe('dark')
    expect(config.homeListStyle).toBe(DEFAULT_CONFIG.homeListStyle)
    expect(config.editor).toEqual(DEFAULT_CONFIG.editor)
  })
})

describe('diffConfig', () => {
  it('lists all changed keys across scalar and editor fields', () => {
    const prev: ConfigSnapshot = { ...DEFAULT_CONFIG }
    const next: ConfigSnapshot = {
      themeMode: 'dark',
      homeListStyle: DEFAULT_CONFIG.homeListStyle,
      diarySortOrder: DEFAULT_CONFIG.diarySortOrder,
      editor: { ...DEFAULT_CONFIG.editor, fontScale: 1.5 },
    }
    const { keys, prev: p, next: n } = diffConfig(prev, next)
    expect(keys).toContain('themeMode')
    expect(keys).toContain('editor')
    expect(keys).not.toContain('homeListStyle')
    expect(keys).not.toContain('diarySortOrder')
    expect(p).toEqual(prev)
    expect(n).toEqual(next)
  })

  it('returns empty keys when configs are equal', () => {
    const { keys } = diffConfig(DEFAULT_CONFIG, {
      ...DEFAULT_CONFIG,
      editor: { ...DEFAULT_CONFIG.editor },
    })
    expect(keys).toEqual([])
  })

  it('detects editor deep change (toolbarEnabled toggle)', () => {
    const prev: ConfigSnapshot = {
      ...DEFAULT_CONFIG,
      editor: { ...DEFAULT_CONFIG.editor, toolbarEnabled: true },
    }
    const next: ConfigSnapshot = {
      ...DEFAULT_CONFIG,
      editor: { ...DEFAULT_CONFIG.editor, toolbarEnabled: false },
    }
    expect(diffConfig(prev, next).keys).toEqual(['editor'])
  })
})
