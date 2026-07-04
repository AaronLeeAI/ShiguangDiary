/**
 * UI Store
 *
 * Ephemeral global UI state. This store is intentionally not persisted.
 */

import { create } from 'zustand'

import type { GlobalDialogState, UiState } from '../types'

const initialState = {
  loading: { visible: false },
  dialog: null,
  bottomSheet: null,
  language: 'zh-CN' as const,
}

export const useUiStore = create<UiState>()(set => ({
  ...initialState,
  showLoading: message => set({ loading: { visible: true, message } }),
  hideLoading: () => set({ loading: { visible: false } }),
  openDialog: (dialog: GlobalDialogState) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
  openBottomSheet: (bottomSheet: GlobalDialogState) => set({ bottomSheet }),
  closeBottomSheet: () => set({ bottomSheet: null }),
  resetUiState: () => set(initialState),
}))

export default useUiStore
