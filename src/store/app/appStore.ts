/**
 * App Store
 *
 * Runtime lifecycle state for application startup and readiness.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createStoreStorage, storePersistKeys } from '../persist'
import type { AppState } from '../types'

const initialState = {
  isFirstLaunch: true,
  lifecycleStatus: 'idle' as const,
  initializedAt: null,
  networkStatus: 'unknown' as const,
  error: null,
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      ...initialState,
      startInitialization: () => set({ lifecycleStatus: 'initializing', error: null }),
      markReady: () =>
        set({
          lifecycleStatus: 'ready',
          initializedAt: Date.now(),
          isFirstLaunch: false,
          error: null,
        }),
      markError: message => set({ lifecycleStatus: 'error', error: message }),
      setFirstLaunch: isFirstLaunch => set({ isFirstLaunch }),
      setNetworkStatus: networkStatus => set({ networkStatus }),
      resetAppState: () => set(initialState),
    }),
    {
      name: storePersistKeys.app,
      storage: createStoreStorage(),
      partialize: state => ({
        isFirstLaunch: state.isFirstLaunch,
        initializedAt: state.initializedAt,
        networkStatus: state.networkStatus,
      }),
    },
  ),
)

export default useAppStore
