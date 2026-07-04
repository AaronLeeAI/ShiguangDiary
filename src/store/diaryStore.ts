/**
 * DiaryStore - 日记/日记本/相册状态
 *
 * 包装 database/repository，提供 reactive 数据访问。
 * 失败时降级到内存 mock（数据库初始化失败、依赖未装等场景）。
 */

import {create} from 'zustand';

import {diaryRepository, notebookRepository, albumRepository, runMigrations} from '@database';
import type {DiaryModel, NotebookModel, AlbumModel} from '@database';
import type {Diary, Notebook, Album} from '@types';

// ========== Model <-> Domain 转换 ==========

const toDiaryDomain = (m: DiaryModel): Diary => {
  const d = new Date(m.createdAt);
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
    timestamp: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    isPinned: m.isPinned === 1,
    isEncrypted: m.isEncrypted === 1,
    isDraft: m.isDraft === 1,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    deletedAt: m.deletedAt,
  };
};

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
});

const toAlbumDomain = (m: AlbumModel): Album => ({
  id: m.id,
  name: m.name,
  description: m.description,
  cover: m.cover,
  diaryIds: m.diaryIds ? JSON.parse(m.diaryIds) : [],
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  deletedAt: m.deletedAt,
});

const diaryModelFromDomain = (d: Partial<Diary>): Partial<DiaryModel> => {
  const out: Partial<DiaryModel> = {};
  if (d.id !== undefined) out.id = d.id;
  if (d.notebookId !== undefined) out.notebookId = d.notebookId;
  if (d.title !== undefined) out.title = d.title;
  if (d.content !== undefined) out.content = d.content;
  if (d.cover !== undefined) out.cover = d.cover;
  if (d.weather !== undefined) out.weather = d.weather;
  if (d.location !== undefined) out.location = d.location;
  if (d.mood !== undefined) out.mood = d.mood;
  if (d.isPinned !== undefined) out.isPinned = d.isPinned ? 1 : 0;
  if (d.isEncrypted !== undefined) out.isEncrypted = d.isEncrypted ? 1 : 0;
  if (d.isDraft !== undefined) out.isDraft = d.isDraft ? 1 : 0;
  return out;
};

// ========== 种子数据（数据库为空时填充） ==========

const SEED_DIARIES: Diary[] = [
  {
    id: 'seed-1',
    notebookId: 'nb-1',
    title: '今天天气真好',
    summary: '下午和朋友们去公园散步，看到了盛开的樱花。',
    content: '今天下午和朋友们约着去朝阳公园走走。刚到门口就闻到了花香，原来是樱花开了。\n\n粉白色的花瓣在阳光下透出淡淡的粉色。',
    cover: null,
    weather: '晴',
    location: '北京·朝阳公园',
    mood: '😊',
    day: '04',
    monthYear: '07月·周四',
    timestamp: '14:30',
    isPinned: true,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: 'seed-2',
    notebookId: 'nb-1',
    title: '',
    summary: '项目进入关键阶段，团队加班到深夜。',
    content: '技术债总是要还的。',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '03',
    monthYear: '07月·周三',
    timestamp: '23:15',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    deletedAt: null,
  },
  {
    id: 'seed-3',
    notebookId: 'nb-2',
    title: '深夜随想',
    summary: '有些事情过去就过去了，不必执着。',
    content: '夜深人静的时候容易想太多。',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '02',
    monthYear: '07月·周二',
    timestamp: '01:20',
    isPinned: false,
    isEncrypted: true,
    isDraft: false,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    deletedAt: null,
  },
];

const SEED_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-1',
    name: '生活随笔',
    description: '记录日常点滴',
    cover: null,
    color: '#1AAD66',
    sortOrder: 0,
    diaryCount: 2,
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
    diaryCount: 1,
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
    diaryCount: 0,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    deletedAt: null,
  },
];

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
];

// ========== Store 类型 ==========

interface DiaryStoreState {
  // 数据
  diaries: Diary[];
  notebooks: Notebook[];
  albums: Album[];
  // 状态
  loading: boolean;
  initialized: boolean;
  /** 是否使用 mock 降级（数据库失败） */
  useFallback: boolean;
  // 错误
  error: string | null;

  // Actions
  init: () => Promise<void>;
  reload: () => Promise<void>;

  // Diary
  getDiaryById: (id: string) => Diary | undefined;
  createDiary: (data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'day' | 'monthYear' | 'timestamp'>) => Promise<Diary>;
  updateDiary: (id: string, data: Partial<Diary>) => Promise<void>;
  removeDiary: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  // Notebook
  createNotebook: (name: string, description?: string, color?: string) => Promise<Notebook>;
  updateNotebook: (id: string, data: Partial<Notebook>) => Promise<void>;
  removeNotebook: (id: string) => Promise<void>;

  // Album
  createAlbum: (name: string, description?: string) => Promise<Album>;
}

// ========== 工具：生成 ID ==========

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ========== 种子写入（数据库版本） ==========

const seedDatabase = async () => {
  for (const d of SEED_DIARIES) {
    await diaryRepository.create(diaryModelFromDomain(d) as DiaryModel);
  }
  for (const n of SEED_NOTEBOOKS) {
    await notebookRepository.create({
      ...n,
      diaryIds: undefined,
    } as unknown as NotebookModel);
  }
  for (const a of SEED_ALBUMS) {
    await albumRepository.create({
      ...a,
      diaryIds: JSON.stringify(a.diaryIds),
    } as unknown as AlbumModel);
  }
};

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
    if (get().initialized || get().loading) return;
    set({loading: true, error: null});

    try {
      // 1. 跑迁移
      await runMigrations();

      // 2. 加载数据
      const [diaries, notebooks, albums] = await Promise.all([
        diaryRepository.list(),
        notebookRepository.list(),
        albumRepository.list(),
      ]);

      // 3. 空库则填充种子
      if (diaries.length === 0 && notebooks.length === 0 && albums.length === 0) {
        await seedDatabase();
        const [d2, n2, a2] = await Promise.all([
          diaryRepository.list(),
          notebookRepository.list(),
          albumRepository.list(),
        ]);
        set({
          diaries: d2.map(toDiaryDomain),
          notebooks: n2.map(toNotebookDomain),
          albums: a2.map(toAlbumDomain),
          initialized: true,
          loading: false,
          useFallback: false,
        });
        return;
      }

      set({
        diaries: diaries.map(toDiaryDomain),
        notebooks: notebooks.map(toNotebookDomain),
        albums: albums.map(toAlbumDomain),
        initialized: true,
        loading: false,
        useFallback: false,
      });
    } catch (e: unknown) {
      // 数据库失败 → 降级到 mock
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] DB init failed, fallback to mock:', e);
      set({
        diaries: SEED_DIARIES,
        notebooks: SEED_NOTEBOOKS,
        albums: SEED_ALBUMS,
        initialized: true,
        loading: false,
        useFallback: true,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  },

  reload: async () => {
    set({initialized: false, loading: true});
    await get().init();
  },

  getDiaryById: (id) => get().diaries.find(d => d.id === id),

  createDiary: async (data) => {
    const now = Date.now();
    const d = new Date(now);
    const newDiary: Diary = {
      ...data,
      id: genId('diary'),
      createdAt: now,
      updatedAt: now,
      day: String(d.getDate()).padStart(2, '0'),
      monthYear: `${d.getMonth() + 1}月·${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`,
      timestamp: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };

    if (get().useFallback) {
      set(state => ({diaries: [newDiary, ...state.diaries]}));
      return newDiary;
    }

    try {
      await diaryRepository.create(diaryModelFromDomain(newDiary) as DiaryModel);
      set(state => ({diaries: [newDiary, ...state.diaries]}));
      return newDiary;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] createDiary failed:', e);
      set(state => ({diaries: [newDiary, ...state.diaries]}));
      return newDiary;
    }
  },

  updateDiary: async (id, data) => {
    const now = Date.now();
    if (get().useFallback) {
      set(state => ({
        diaries: state.diaries.map(d =>
          d.id === id ? {...d, ...data, updatedAt: now} : d,
        ),
      }));
      return;
    }
    try {
      await diaryRepository.update(id, diaryModelFromDomain(data));
      set(state => ({
        diaries: state.diaries.map(d =>
          d.id === id ? {...d, ...data, updatedAt: now} : d,
        ),
      }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] updateDiary failed:', e);
      set(state => ({
        diaries: state.diaries.map(d =>
          d.id === id ? {...d, ...data, updatedAt: now} : d,
        ),
      }));
    }
  },

  removeDiary: async (id) => {
    if (get().useFallback) {
      set(state => ({diaries: state.diaries.filter(d => d.id !== id)}));
      return;
    }
    try {
      await diaryRepository.remove(id);
      set(state => ({diaries: state.diaries.filter(d => d.id !== id)}));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] removeDiary failed:', e);
      set(state => ({diaries: state.diaries.filter(d => d.id !== id)}));
    }
  },

  togglePin: async (id) => {
    const cur = get().diaries.find(d => d.id === id);
    if (!cur) return;
    await get().updateDiary(id, {isPinned: !cur.isPinned});
  },

  createNotebook: async (name, description, color) => {
    const now = Date.now();
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
    };
    if (get().useFallback) {
      set(state => ({notebooks: [nb, ...state.notebooks]}));
      return nb;
    }
    try {
      await notebookRepository.create(nb as unknown as NotebookModel);
      set(state => ({notebooks: [nb, ...state.notebooks]}));
      return nb;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] createNotebook failed:', e);
      set(state => ({notebooks: [nb, ...state.notebooks]}));
      return nb;
    }
  },

  updateNotebook: async (id, data) => {
    const now = Date.now();
    if (get().useFallback) {
      set(state => ({
        notebooks: state.notebooks.map(n =>
          n.id === id ? {...n, ...data, updatedAt: now} : n,
        ),
      }));
      return;
    }
    try {
      await notebookRepository.update(id, data as Partial<NotebookModel>);
      set(state => ({
        notebooks: state.notebooks.map(n =>
          n.id === id ? {...n, ...data, updatedAt: now} : n,
        ),
      }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] updateNotebook failed:', e);
      set(state => ({
        notebooks: state.notebooks.map(n =>
          n.id === id ? {...n, ...data, updatedAt: now} : n,
        ),
      }));
    }
  },

  removeNotebook: async (id) => {
    if (get().useFallback) {
      set(state => ({notebooks: state.notebooks.filter(n => n.id !== id)}));
      return;
    }
    try {
      await notebookRepository.remove(id);
      set(state => ({notebooks: state.notebooks.filter(n => n.id !== id)}));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] removeNotebook failed:', e);
      set(state => ({notebooks: state.notebooks.filter(n => n.id !== id)}));
    }
  },

  createAlbum: async (name, description) => {
    const now = Date.now();
    const al: Album = {
      id: genId('al'),
      name,
      description: description ?? null,
      cover: null,
      diaryIds: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    if (get().useFallback) {
      set(state => ({albums: [al, ...state.albums]}));
      return al;
    }
    try {
      await albumRepository.create({...al, diaryIds: JSON.stringify(al.diaryIds)} as unknown as AlbumModel);
      set(state => ({albums: [al, ...state.albums]}));
      return al;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DiaryStore] createAlbum failed:', e);
      set(state => ({albums: [al, ...state.albums]}));
      return al;
    }
  },
}));

export default useDiaryStore;