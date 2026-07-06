/**
 * DiaryStore - 日记/日记本/相册状态
 *
 * 经 Service Layer 访问数据，提供 reactive 数据访问。
 * 失败时降级到内存 mock（数据库初始化失败、依赖未装等场景）。
 *
 * 数据流：HomeScreen → DiaryStore → DiaryService → DiaryRepository → SQLite
 * 禁止直接 import @database Repository。
 */

import { create } from 'zustand'

import { diaryService, notebookService, albumService, createLogger } from '@services'
import { applyDiaryUpdate, bumpNotebookCount } from './diaryStorePure'
import type { DiaryModel, NotebookModel, AlbumModel } from '@database'
import { initDatabase } from '@database'
import type { Diary, Notebook, Album } from '@types'

const log = createLogger('DiaryStore')

// ========== Model <-> Domain 转换 ==========

const toDiaryDomain = (m: DiaryModel): Diary => {
  const d = new Date(m.createdAt)
  return {
    id: m.id,
    notebookId: m.notebookId,
    title: m.title,
    summary: m.content.slice(0, 80),
    content: m.content,
    cover: m.cover,
    weather: m.weather,
    location: m.location,
    mood: m.mood,
    day: String(d.getDate()).padStart(2, '0'),
    monthYear: `${d.getMonth() + 1}月·${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`,
    timestamp: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
      2,
      '0',
    )}`,
    isPinned: m.isPinned === 1,
    isEncrypted: m.isEncrypted === 1,
    isDraft: m.isDraft === 1,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    deletedAt: m.deletedAt,
  }
}

const toNotebookDomain = (m: NotebookModel): Notebook => ({
  id: m.id,
  name: m.name,
  description: m.description,
  cover: m.cover,
  color: m.color,
  sortOrder: m.sortOrder,
  diaryCount: m.diaryCount,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  deletedAt: m.deletedAt,
})

const toAlbumDomain = (m: AlbumModel): Album => ({
  id: m.id,
  name: m.name,
  description: m.description,
  cover: m.cover,
  diaryIds: m.diaryIds ? JSON.parse(m.diaryIds) : [],
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  deletedAt: m.deletedAt,
})

const diaryModelFromDomain = (d: Partial<Diary>): Partial<DiaryModel> => {
  const out: Partial<DiaryModel> = {}
  if (d.id !== undefined) {
    out.id = d.id
  }
  if (d.notebookId !== undefined) {
    out.notebookId = d.notebookId
  }
  if (d.title !== undefined) {
    out.title = d.title
  }
  if (d.content !== undefined) {
    out.content = d.content
  }
  if (d.cover !== undefined) {
    out.cover = d.cover
  }
  if (d.weather !== undefined) {
    out.weather = d.weather
  }
  if (d.location !== undefined) {
    out.location = d.location
  }
  if (d.mood !== undefined) {
    out.mood = d.mood
  }
  if (d.isPinned !== undefined) {
    out.isPinned = d.isPinned ? 1 : 0
  }
  if (d.isEncrypted !== undefined) {
    out.isEncrypted = d.isEncrypted ? 1 : 0
  }
  if (d.isDraft !== undefined) {
    out.isDraft = d.isDraft ? 1 : 0
  }
  return out
}

// ========== 种子数据（数据库为空时填充） ==========

const SEED_DIARIES: Diary[] = [
  {
    id: 'seed-1',
    notebookId: 'nb-1',
    title: '\u968f\u8bb0',
    summary:
      '\u5ffd\u77e5\u5ffd\u89c9\uff0c\u4f3c\u4e4e\u6211\u5df2\u7ecf\u7ed3\u675f\u8bfe\u7a0b...',
    content:
      '\u5ffd\u77e5\u5ffd\u89c9\uff0c\u4f3c\u4e4e\u6211\u5df2\u7ecf\u7ed3\u675f\u8bfe\u7a0b\uff0c\u65f6\u95f4\u4e00\u4e0b\u5b50\u7a7a\u4e86\u51fa\u6765\u3002',
    cover: null,
    weather: '\u6674',
    location: '\u5e7f\u5dde\u00b7\u5bbf\u820d',
    mood: '\u5e73\u9759',
    day: '15',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u516d',
    timestamp: '14:30',
    isPinned: true,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-2',
    notebookId: 'nb-1',
    title: '\u968f\u8bb0',
    summary: '\u6700\u8fd1\u8fd8\u662f\u5728\u8eba\u5e73...',
    content:
      '\u6700\u8fd1\u8fd8\u662f\u5728\u8eba\u5e73\uff0c\u4f46\u6bcf\u5929\u4e5f\u4f1a\u7ed9\u81ea\u5df1\u7559\u4e00\u70b9\u70b9\u8ba1\u5212\u3002',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '11',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u4e8c',
    timestamp: '20:10',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-3',
    notebookId: 'nb-2',
    title: '\u968f\u611f\u968f\u8bb0',
    summary: '\u6210\u957f\u7684\u70e6\u607c\u597d\u591a\u554a...',
    content:
      '\u6210\u957f\u7684\u70e6\u607c\u597d\u591a\u554a\uff0c\u5f88\u591a\u4e8b\u60c5\u90fd\u6ca1\u6709\u6807\u51c6\u7b54\u6848\u3002',
    cover: null,
    weather: '\u9634',
    location: null,
    mood: '\u601d\u8003',
    day: '05',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u4e09',
    timestamp: '22:08',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-4',
    notebookId: 'nb-3',
    title: '\u6e38\u620f\u622a\u56fe',
    summary:
      '\u4eca\u665a\u548c\u670b\u53cb\u8054\u673a\uff0c\u622a\u5230\u4e86\u4e00\u5f20\u5f88\u559c\u6b22\u7684\u753b\u9762\u3002',
    content:
      '\u4eca\u665a\u548c\u670b\u53cb\u8054\u673a\uff0c\u622a\u5230\u4e86\u4e00\u5f20\u5f88\u559c\u6b22\u7684\u753b\u9762\u3002\n\n![\u6e38\u620f\u622a\u56fe](home-reference-game-card)',
    cover: null,
    weather: null,
    location: null,
    mood: '\u5f00\u5fc3',
    day: '02',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u65e5',
    timestamp: '23:12',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-5',
    notebookId: 'nb-1',
    title: '\u6e05\u6668\u8ba1\u5212',
    summary:
      '\u65e9\u8d77\u540e\u628a\u4eca\u5929\u8981\u505a\u7684\u4e8b\u60c5\u5199\u5728\u4fbf\u5229\u8d34\u4e0a\u3002',
    content:
      '\u65e9\u8d77\u540e\u628a\u4eca\u5929\u8981\u505a\u7684\u4e8b\u60c5\u5199\u5728\u4fbf\u5229\u8d34\u4e0a\u3002',
    cover: null,
    weather: '\u591a\u4e91',
    location: '\u5bb6',
    mood: '\u671f\u5f85',
    day: '30',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u56db',
    timestamp: '08:05',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-6',
    notebookId: 'nb-2',
    title: '\u6280\u672f\u7b14\u8bb0',
    summary:
      '\u628a\u9996\u9875\u5217\u8868\u62c6\u6210\u66f4\u6e05\u6670\u7684\u5c55\u793a\u72b6\u6001\u3002',
    content:
      '\u628a\u9996\u9875\u5217\u8868\u62c6\u6210\u66f4\u6e05\u6670\u7684\u5c55\u793a\u72b6\u6001\u3002',
    cover: null,
    weather: null,
    location: '\u529e\u516c\u5ba4',
    mood: '\u4e13\u6ce8',
    day: '29',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u4e09',
    timestamp: '19:40',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 6 * 86400000,
    updatedAt: Date.now() - 6 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-7',
    notebookId: 'nb-3',
    title: '\u76f8\u518c\u6574\u7406',
    summary:
      '\u7ffb\u5230\u51e0\u5f20\u65e7\u622a\u56fe\uff0c\u7a81\u7136\u60f3\u8d77\u5f53\u65f6\u4e00\u8d77\u73a9\u7684\u591c\u665a\u3002',
    content:
      '\u7ffb\u5230\u51e0\u5f20\u65e7\u622a\u56fe\uff0c\u7a81\u7136\u60f3\u8d77\u5f53\u65f6\u4e00\u8d77\u73a9\u7684\u591c\u665a\u3002\n\n<img src="home-reference-game-card" />',
    cover: null,
    weather: null,
    location: null,
    mood: '\u6000\u5ff5',
    day: '26',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u65e5',
    timestamp: '21:18',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-8',
    notebookId: 'nb-1',
    title: '\u5348\u540e\u5496\u5561',
    summary:
      '\u5496\u5561\u5e97\u9760\u7a97\u7684\u4f4d\u7f6e\u5f88\u5b89\u9759\uff0c\u9002\u5408\u53d1\u5446\u3002',
    content:
      '\u5496\u5561\u5e97\u9760\u7a97\u7684\u4f4d\u7f6e\u5f88\u5b89\u9759\uff0c\u9002\u5408\u53d1\u5446\u3002',
    cover: null,
    weather: '\u6674',
    location: '\u8857\u89d2\u5496\u5561',
    mood: '\u653e\u677e',
    day: '23',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u56db',
    timestamp: '15:26',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-9',
    notebookId: 'nb-2',
    title: '\u79c1\u5bc6\u60f3\u6cd5',
    summary:
      '\u8fd9\u662f\u4e00\u6761\u52a0\u5bc6\u8bb0\u5f55\uff0c\u9996\u9875\u9ed8\u8ba4\u4e0d\u5c55\u793a\u3002',
    content:
      '\u8fd9\u662f\u4e00\u6761\u52a0\u5bc6\u8bb0\u5f55\uff0c\u9996\u9875\u9ed8\u8ba4\u4e0d\u5c55\u793a\u3002',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '21',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u4e8c',
    timestamp: '00:30',
    isPinned: false,
    isEncrypted: true,
    isDraft: false,
    createdAt: Date.now() - 9 * 86400000,
    updatedAt: Date.now() - 9 * 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-10',
    notebookId: 'nb-3',
    title: '\u5468\u672b\u5c0f\u7ed3',
    summary:
      '\u628a\u623f\u95f4\u6536\u62fe\u5e72\u51c0\u4ee5\u540e\uff0c\u6574\u4e2a\u4eba\u4e5f\u8f7b\u677e\u4e86\u4e00\u4e9b\u3002',
    content:
      '\u628a\u623f\u95f4\u6536\u62fe\u5e72\u51c0\u4ee5\u540e\uff0c\u6574\u4e2a\u4eba\u4e5f\u8f7b\u677e\u4e86\u4e00\u4e9b\u3002',
    cover: 'home-reference-game-card',
    weather: '\u96e8',
    location: '\u5bb6',
    mood: '\u6ee1\u8db3',
    day: '19',
    monthYear: '\u5341\u6708\u2022\u661f\u671f\u65e5',
    timestamp: '22:45',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
    deletedAt: null,
  },
]
const SEED_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-1',
    name: '生活随笔',
    description: '记录日常点滴',
    cover: null,
    color: '#1AAD66',
    sortOrder: 0,
    diaryCount: 4,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: 'nb-2',
    name: '工作思考',
    description: '产品设计、技术学习',
    cover: null,
    color: '#1488EE',
    sortOrder: 1,
    diaryCount: 3,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 259200000,
    deletedAt: null,
  },
  {
    id: 'nb-3',
    name: '旅行回忆',
    description: '2025年所有的远方',
    cover: null,
    color: '#FFB400',
    sortOrder: 2,
    diaryCount: 3,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    deletedAt: null,
  },
]

const SEED_ALBUMS: Album[] = [
  {
    id: 'al-1',
    name: '樱花季',
    description: '2025 年春天',
    cover: null,
    diaryIds: ['seed-1'],
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: 'al-2',
    name: '深夜咖啡',
    description: null,
    cover: null,
    diaryIds: ['seed-3'],
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
    deletedAt: null,
  },
]

// ========== Store 类型 ==========

interface DiaryStoreState {
  // 数据
  diaries: Diary[]
  notebooks: Notebook[]
  albums: Album[]
  // 状态
  loading: boolean
  initialized: boolean
  /** 是否使用 mock 降级（数据库失败） */
  useFallback: boolean
  // 错误
  error: string | null

  // Actions
  init: () => Promise<void>
  reload: () => Promise<void>

  // Diary
  getDiaryById: (id: string) => Diary | undefined
  createDiary: (
    data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'day' | 'monthYear' | 'timestamp'>,
  ) => Promise<Diary>
  updateDiary: (id: string, data: Partial<Diary>) => Promise<void>
  removeDiary: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>

  // Notebook
  createNotebook: (name: string, description?: string, color?: string) => Promise<Notebook>
  updateNotebook: (id: string, data: Partial<Notebook>) => Promise<void>
  removeNotebook: (id: string) => Promise<void>

  // Album
  createAlbum: (name: string, description?: string) => Promise<Album>
}

// ========== 工具：生成 ID ==========

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ========== 种子写入（数据库版本） ==========

const seedDatabase = async () => {
  for (const d of SEED_DIARIES) {
    await diaryService.create({ diary: diaryModelFromDomain(d) as DiaryModel })
  }
  for (const n of SEED_NOTEBOOKS) {
    await notebookService.create({
      ...n,
      diaryIds: undefined,
    } as unknown as NotebookModel)
  }
  for (const a of SEED_ALBUMS) {
    await albumService.create({
      ...a,
      diaryIds: JSON.stringify(a.diaryIds),
    } as unknown as AlbumModel)
  }
}

// ========== Store 实现 ==========

export const useDiaryStore = create<DiaryStoreState>((set, get) => ({
  diaries: [],
  notebooks: [],
  albums: [],
  loading: false,
  initialized: false,
  useFallback: false,
  error: null,

  init: async () => {
    if (get().initialized || get().loading) {
      return
    }
    set({ loading: true, error: null })

    try {
      // 1. 初始化数据层（openDB → migrations → fileStorage）
      await initDatabase()

      // 2. 加载数据（经 Service Layer）
      const [diaries, notebooks, albums] = await Promise.all([
        diaryService.list(),
        notebookService.list(),
        albumService.list(),
      ])

      // 3. 空库则填充种子
      if (diaries.length === 0 && notebooks.length === 0 && albums.length === 0) {
        await seedDatabase()
        const [d2, n2, a2] = await Promise.all([
          diaryService.list(),
          notebookService.list(),
          albumService.list(),
        ])
        set({
          diaries: d2.map(toDiaryDomain),
          notebooks: n2.map(toNotebookDomain),
          albums: a2.map(toAlbumDomain),
          initialized: true,
          loading: false,
          useFallback: false,
        })
        return
      }

      set({
        diaries: diaries.map(toDiaryDomain),
        notebooks: notebooks.map(toNotebookDomain),
        albums: albums.map(toAlbumDomain),
        initialized: true,
        loading: false,
        useFallback: false,
      })
    } catch (e: unknown) {
      // 数据库失败 → 降级到 mock

      log.warn('DB init failed, fallback to mock', e)
      set({
        diaries: SEED_DIARIES,
        notebooks: SEED_NOTEBOOKS,
        albums: SEED_ALBUMS,
        initialized: true,
        loading: false,
        useFallback: true,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  },

  reload: async () => {
    set({ initialized: false, loading: false, error: null })
    await get().init()
  },

  getDiaryById: id => get().diaries.find(d => d.id === id),

  createDiary: async data => {
    const now = Date.now()
    const d = new Date(now)
    const newDiary: Diary = {
      ...data,
      id: genId('diary'),
      createdAt: now,
      updatedAt: now,
      day: String(d.getDate()).padStart(2, '0'),
      monthYear: `${d.getMonth() + 1}月·${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`,
      timestamp: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
        2,
        '0',
      )}`,
    }

    if (get().useFallback) {
      set(state => ({
        diaries: [newDiary, ...state.diaries],
        // 同步内存 notebook diaryCount(与 service 写库一致,Task16 集成修复)
        notebooks: state.notebooks.map(n => (n.id === data.notebookId ? bumpNotebookCount(n) : n)),
      }))
      return newDiary
    }

    try {
      await diaryService.create({ diary: diaryModelFromDomain(newDiary) as DiaryModel })
      set(state => ({
        diaries: [newDiary, ...state.diaries],
        notebooks: state.notebooks.map(n => (n.id === data.notebookId ? bumpNotebookCount(n) : n)),
      }))
      return newDiary
    } catch (e) {
      log.warn('createDiary failed', e)
      set(state => ({
        diaries: [newDiary, ...state.diaries],
        notebooks: state.notebooks.map(n => (n.id === data.notebookId ? bumpNotebookCount(n) : n)),
      }))
      return newDiary
    }
  },

  updateDiary: async (id, data) => {
    const now = Date.now()
    const apply = (d: Diary): Diary => applyDiaryUpdate(d, data, now)
    if (get().useFallback) {
      set(state => ({
        diaries: state.diaries.map(d => (d.id === id ? apply(d) : d)),
      }))
      return
    }
    try {
      await diaryService.update(id, diaryModelFromDomain(data))
      set(state => ({
        diaries: state.diaries.map(d => (d.id === id ? apply(d) : d)),
      }))
    } catch (e) {
      log.warn('updateDiary failed', e)
      set(state => ({
        diaries: state.diaries.map(d => (d.id === id ? apply(d) : d)),
      }))
    }
  },

  removeDiary: async id => {
    if (get().useFallback) {
      set(state => ({ diaries: state.diaries.filter(d => d.id !== id) }))
      return
    }
    try {
      await diaryService.remove(id)
      set(state => ({ diaries: state.diaries.filter(d => d.id !== id) }))
    } catch (e) {
      log.warn('removeDiary failed', e)
      set(state => ({ diaries: state.diaries.filter(d => d.id !== id) }))
    }
  },

  togglePin: async id => {
    const cur = get().diaries.find(d => d.id === id)
    if (!cur) {
      return
    }
    await get().updateDiary(id, { isPinned: !cur.isPinned })
  },

  createNotebook: async (name, description, color) => {
    const now = Date.now()
    const nb: Notebook = {
      id: genId('nb'),
      name,
      description: description ?? null,
      cover: null,
      color: color ?? '#1AAD66',
      sortOrder: get().notebooks.length,
      diaryCount: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    if (get().useFallback) {
      set(state => ({ notebooks: [nb, ...state.notebooks] }))
      return nb
    }
    try {
      await notebookService.create(nb as unknown as NotebookModel)
      set(state => ({ notebooks: [nb, ...state.notebooks] }))
      return nb
    } catch (e) {
      log.warn('createNotebook failed', e)
      set(state => ({ notebooks: [nb, ...state.notebooks] }))
      return nb
    }
  },

  updateNotebook: async (id, data) => {
    const now = Date.now()
    if (get().useFallback) {
      set(state => ({
        notebooks: state.notebooks.map(n => (n.id === id ? { ...n, ...data, updatedAt: now } : n)),
      }))
      return
    }
    try {
      await notebookService.update(id, data as Partial<NotebookModel>)
      set(state => ({
        notebooks: state.notebooks.map(n => (n.id === id ? { ...n, ...data, updatedAt: now } : n)),
      }))
    } catch (e) {
      log.warn('updateNotebook failed', e)
      set(state => ({
        notebooks: state.notebooks.map(n => (n.id === id ? { ...n, ...data, updatedAt: now } : n)),
      }))
    }
  },

  removeNotebook: async id => {
    if (get().useFallback) {
      set(state => ({ notebooks: state.notebooks.filter(n => n.id !== id) }))
      return
    }
    try {
      await notebookService.remove(id)
      set(state => ({ notebooks: state.notebooks.filter(n => n.id !== id) }))
    } catch (e) {
      log.warn('removeNotebook failed', e)
      set(state => ({ notebooks: state.notebooks.filter(n => n.id !== id) }))
    }
  },

  createAlbum: async (name, description) => {
    const now = Date.now()
    const al: Album = {
      id: genId('al'),
      name,
      description: description ?? null,
      cover: null,
      diaryIds: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    if (get().useFallback) {
      set(state => ({ albums: [al, ...state.albums] }))
      return al
    }
    try {
      await albumService.create({
        ...al,
        diaryIds: JSON.stringify(al.diaryIds),
      } as unknown as AlbumModel)
      set(state => ({ albums: [al, ...state.albums] }))
      return al
    } catch (e) {
      log.warn('createAlbum failed', e)
      set(state => ({ albums: [al, ...state.albums] }))
      return al
    }
  },
}))

export default useDiaryStore
