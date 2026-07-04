/**
 * Zustand Store - 状态管理
 *
 * 推荐库：zustand
 * 官方文档：https://docs.pmnd.rs/zustand
 *
 * Store 设计原则：
 * - 单一数据源（Single Source of Truth）
 * - 细粒度拆分（按 Domain 切分 Store）
 * - 持久化（关键数据使用 persist middleware）
 * - 异步支持（结合 Zustand 的 async action）
 */

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';

/**
 * 用户状态
 */
interface UserState {
  userId: string | null;
  nickname: string;
  avatar: string | null;
  token: string | null;
  login: (token: string, userId: string, nickname: string, avatar?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<{nickname: string; avatar: string}>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      nickname: '',
      avatar: null,
      token: null,
      login: (token, userId, nickname, avatar) =>
        set({userId, nickname, avatar, token}),
      logout: () =>
        set({userId: null, nickname: '', avatar: null, token: null}),
      updateProfile: (data) =>
        set((state) => ({nickname: data.nickname ?? state.nickname, avatar: data.avatar ?? state.avatar})),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => ({
        getItem: () => {
          // TODO: 使用 MMKV 实现
          return null;
        },
        setItem: () => {
          // TODO: 使用 MMKV 实现
        },
        removeItem: () => {
          // TODO: 使用 MMKV 实现
        },
      })),
    },
  ),
);

/**
 * 导航状态（Tab 切换等）
 */
interface NavigationState {
  currentTab: 'home' | 'notebook' | 'album' | 'profile';
  setCurrentTab: (tab: 'home' | 'notebook' | 'album' | 'profile') => void;
  goHome: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentTab: 'home',
  setCurrentTab: (tab) => set({currentTab: tab}),
  goHome: () => set({currentTab: 'home'}),
}));

/**
 * 主题状态
 */
interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: () => void;
  setLight: () => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({isDark: !state.isDark})),
  setDark: () => set({isDark: true}),
  setLight: () => set({isDark: false}),
}));

/**
 * 编辑器草稿
 */
interface EditorDraftState {
  drafts: Record<string, {content: string; updatedAt: number}>;
  setDraft: (key: string, content: string) => void;
  getDraft: (key: string) => string | undefined;
  removeDraft: (key: string) => void;
  clearDrafts: () => void;
}

export const useEditorDraftStore = create<EditorDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (key, content) =>
        set((state) => ({
          drafts: {...state.drafts, [key]: {content, updatedAt: Date.now()}},
        })),
      getDraft: (key) => get().drafts[key]?.content,
      removeDraft: (key) =>
        set((state) => {
          const drafts = {...state.drafts};
          delete drafts[key];
          return {drafts};
        }),
      clearDrafts: () => set({drafts: {}}),
    }),
    {
      name: 'editor-drafts-store',
    },
  ),
);

/**
 * 全局 Store
 */
export {useUserStore, useNavigationStore, useThemeStore, useEditorDraftStore, useDiaryStore} from './diaryStore';
export * as diaryStore from './diaryStore';