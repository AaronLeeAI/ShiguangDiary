/**
 * Backup Schema 校验纯函数单测
 *
 * 覆盖 validateBackupPayload 关键场景:
 *  - 非对象/缺字段 → invalid + errors
 *  - schemaVersion 高于/低于当前 → invalid
 *  - 合法完整 payload → valid + normalized
 *  - 集合非数组 → 回填空数组并 errors
 *  - config 字段类型错 → errors
 *
 * 相对路径 import(纯函数,运行时无别名解析),与 insightsEngine 范式一致。
 */

import { it, expect, describe } from '@jest/globals'

import { validateBackupPayload } from '../../../src/features/data-management/utils/backupSchema'
import { BACKUP_SCHEMA_VERSION } from '../../../src/features/data-management/types'
import { buildBackupPayload } from '../../../src/features/data-management/utils/dataExportEngine'

const validPayload = () =>
  buildBackupPayload({
    notebooks: [],
    diaries: [],
    albums: [],
    tags: [],
    attachments: [],
    drafts: [],
    config: {
      app: null,
      preferences: '{"themeMode":"system"}',
      session: null,
      editorDrafts: null,
      searchHistory: null,
    },
    appVersion: '0.1.0',
    at: 1_700_000_000_000,
  })

describe('validateBackupPayload', () => {
  it('accepts a fully valid payload', () => {
    const { valid, errors, payload } = validateBackupPayload(validPayload())
    expect(valid).toBe(true)
    expect(errors).toEqual([])
    expect(payload).not.toBeNull()
    expect(payload?.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(payload?.stats.diaries).toBe(0)
  })

  it('rejects non-object input', () => {
    const { valid, errors } = validateBackupPayload('hello')
    expect(valid).toBe(false)
    expect(errors[0]).toMatch(/not an object/)
  })

  it('rejects missing schemaVersion', () => {
    const { valid, errors } = validateBackupPayload({ createdAt: 1, appVersion: '0.1.0' })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('schemaVersion'))).toBe(true)
  })

  it('rejects schemaVersion higher than current', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({ ...p, schemaVersion: BACKUP_SCHEMA_VERSION + 1 })
    expect(valid).toBe(false)
    expect(errors[0]).toMatch(/unsupported/)
  })

  it('rejects legacy schemaVersion (no migration yet)', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({ ...p, schemaVersion: BACKUP_SCHEMA_VERSION - 1 })
    expect(valid).toBe(false)
    expect(errors[0]).toMatch(/legacy/)
  })

  it('rejects missing createdAt', () => {
    const p = validPayload()
    const { createdAt, ...rest } = p
    void createdAt
    const { valid, errors } = validateBackupPayload({ ...rest })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('createdAt'))).toBe(true)
  })

  it('rejects non-string appVersion', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({ ...p, appVersion: 123 })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('appVersion'))).toBe(true)
  })

  it('collects errors for non-array collections', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({
      ...p,
      notebooks: 'not-array',
      diaries: 42,
    })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('notebooks'))).toBe(true)
    expect(errors.some(e => e.includes('diaries'))).toBe(true)
  })

  it('rejects malformed config block', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({ ...p, config: 'nope' })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('config'))).toBe(true)
  })

  it('flags non-string config field', () => {
    const p = validPayload()
    const { valid, errors } = validateBackupPayload({
      ...p,
      config: { ...p.config, app: 123 },
    })
    expect(valid).toBe(false)
    expect(errors.some(e => e.includes('app'))).toBe(true)
  })

  it('accepts null config values (empty store)', () => {
    const p = validPayload()
    const { valid } = validateBackupPayload({ ...p, config: { app: null, preferences: null, session: null, editorDrafts: null, searchHistory: null } })
    expect(valid).toBe(true)
  })
})
