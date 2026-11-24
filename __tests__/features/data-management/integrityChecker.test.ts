/**
 * Integrity Checker 纯函数单测
 *
 * 覆盖引用一致性检查:
 *  - 全部引用合法 → ok
 *  - diary→missing notebook → issue (notebookId 非 null)
 *  - attachment→missing diary → issue
 *  - album.diaryIds JSON 引用缺失日记 → issue
 *  - album.diaryIds 非 JSON 字符串 → issue
 *  - 配置 null 可接受 / 非 null 但解析失败 → issue
 */

import { it, expect, describe } from '@jest/globals'

import { checkIntegrity } from '../../../src/features/data-management/utils/integrityChecker'
import type { DiaryModel, NotebookModel, AlbumModel, AttachmentModel } from '@database'

const diary = (id: string, notebookId: string | null = null): DiaryModel =>
  ({
    id,
    notebookId,
    title: '',
    content: '',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    isPinned: 0,
    isEncrypted: 0,
    isDraft: 0,
    createdAt: 1,
    updatedAt: 1,
    deletedAt: null,
  }) as DiaryModel

const notebook = (id: string): NotebookModel =>
  ({
    id,
    name: id,
    description: null,
    cover: null,
    color: null,
    sortOrder: 0,
    diaryCount: 0,
    createdAt: 1,
    updatedAt: 1,
    deletedAt: null,
  }) as NotebookModel

const album = (id: string, diaryIds: string[]): AlbumModel =>
  ({
    id,
    name: id,
    description: null,
    cover: null,
    diaryIds: JSON.stringify(diaryIds),
    createdAt: 1,
    updatedAt: 1,
    deletedAt: null,
  }) as AlbumModel

const attachment = (id: string, diaryId: string): AttachmentModel =>
  ({
    id,
    diaryId,
    type: 'image',
    url: '/tmp/' + id,
    thumbnail: null,
    size: 0,
    createdAt: 1,
  }) as AttachmentModel

const allValid = {
  diaries: [diary('d1', 'nb1'), diary('d2', 'nb1')],
  notebooks: [notebook('nb1')],
  albums: [album('a1', ['d1', 'd2'])],
  tags: [{ id: 't1' }],
  attachments: [attachment('att1', 'd1')],
  drafts: [],
  config: {
    app: null,
    preferences: '{"themeMode":"system"}',
    session: null,
    editorDrafts: null,
    searchHistory: null,
  },
}

describe('checkIntegrity', () => {
  it('returns ok when all references valid', () => {
    const r = checkIntegrity({ ...allValid, at: 1000 })
    expect(r.ok).toBe(true)
    expect(r.issues).toEqual([])
    expect(r.checkedAt).toBe(1000)
    expect(r.stats.diaries).toBe(2)
  })

  it('flags diary referencing missing notebook', () => {
    const r = checkIntegrity({
      ...allValid,
      diaries: [diary('d1', 'nb-missing')],
      notebooks: [],
      attachments: [],
    })
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.kind === 'notebook-missing')).toBe(true)
  })

  it('accepts diary with notebookId null (unassigned)', () => {
    const r = checkIntegrity({
      ...allValid,
      diaries: [diary('d1', null)],
      attachments: [],
      albums: [],
    })
    expect(r.issues.some(i => i.kind === 'notebook-missing')).toBe(false)
  })

  it('flags orphan attachment (missing diary)', () => {
    const r = checkIntegrity({
      ...allValid,
      diaries: [diary('d1', 'nb1')],
      attachments: [attachment('att1', 'd-missing')],
    })
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.kind === 'attachment-orphan')).toBe(true)
  })

  it('flags album referencing missing diary', () => {
    const r = checkIntegrity({
      ...allValid,
      albums: [album('a1', ['d1', 'd-missing'])],
    })
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.kind === 'album-diary-missing')).toBe(true)
  })

  it('flags album with malformed diaryIds JSON', () => {
    const badAlbum = { ...album('a1', []), diaryIds: 'not-json' } as AlbumModel
    const r = checkIntegrity({ ...allValid, albums: [badAlbum] })
    expect(r.ok).toBe(false)
    expect(
      r.issues.some(i => i.kind === 'album-diary-missing' && i.message.includes('malformed')),
    ).toBe(true)
  })

  it('accepts null config stores as empty (no issue)', () => {
    const r = checkIntegrity({
      ...allValid,
      config: {
        app: null,
        preferences: null,
        session: null,
        editorDrafts: null,
        searchHistory: null,
      },
    })
    expect(r.issues.some(i => i.kind === 'config-corrupted')).toBe(false)
  })

  it('flags config store with non-JSON value', () => {
    const r = checkIntegrity({
      ...allValid,
      config: { ...allValid.config, preferences: '{not valid json' },
    })
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.kind === 'config-corrupted')).toBe(true)
  })

  it('reasoning: stats reflect input sizes', () => {
    const r = checkIntegrity({
      ...allValid,
      diaries: [diary('d1', 'nb1'), diary('d2', 'nb1'), diary('d3', 'nb1')],
      attachments: [attachment('a1', 'd1'), attachment('a2', 'd1')],
      drafts: [{ id: 'dr1', content: '', title: null, updatedAt: 1 }] as never,
    })
    expect(r.stats.diaries).toBe(3)
    expect(r.stats.attachments).toBe(2)
    expect(r.stats.drafts).toBe(1)
  })
})
