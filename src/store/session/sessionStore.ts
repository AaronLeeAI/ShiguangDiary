/**
 * Session Store
 *
 * Reserved user session state for future sync/account tasks.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createStoreStorage, storePersistKeys } from '../persist'
import type { SessionState } from '../types'

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
}

export const useSessionStore = create<SessionState>()(
  persist(
    set => ({
      ...initialState,
      login: (token, userId, nickname, avatar = null) =>
        set({
          token,
          user: { userId, nickname, avatar },
          isAuthenticated: true,
        }),
      logout: () => set(initialState),
      updateProfile: data =>
        set(state => {
          if (!state.user) {
            return state
          }

          return {
            user: {
              ...state.user,
              nickname: data.nickname ?? state.user.nickname,
              avatar: data.avatar ?? state.user.avatar,
            },
          }
        }),
    }),
    {
      name: storePersistKeys.session,
      storage: createStoreStorage(),
    },
  ),
)

export default useSessionStore
