/**
 * Theme Context
 *
 * 提供 Light/Dark 主题切换能力。
 *
 * 主题持久化(DECISIONS 034):mode 由 `preferencesStore.themeMode`('system'|'light'|'dark')
 * 派生,'system' 时跟随系统 useColorScheme;setMode/toggleMode 写回 preferencesStore(MMKV 持久化),
 * 重启后从 MMKV 恢复,即时生效。forcedMode(测试用)优先级最高,覆盖一切。
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { darkTheme, lightTheme, type Theme, type ThemeMode } from './theme'
import { usePreferencesStore } from '@store/preferences'

interface ThemeContextValue {
  theme: Theme
  mode: ThemeMode
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  /** 强制指定模式(优先级最高,测试用;覆盖 preferencesStore)。 */
  forcedMode?: ThemeMode
  /** 自定义初始模式(已弃用:mode 现由 preferencesStore.themeMode 决定,保留 prop 兼容)。 */
  initialMode?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, forcedMode }) => {
  const systemScheme = useColorScheme()
  const themeModePref = usePreferencesStore(s => s.themeMode)
  const setThemeModePref = usePreferencesStore(s => s.setThemeMode)

  // 'system' → 跟随系统;否则用显式 light/dark。
  const persistedMode: ThemeMode =
    themeModePref === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeModePref
  const currentMode = forcedMode ?? persistedMode

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: currentMode === 'dark' ? darkTheme : lightTheme,
      mode: currentMode,
      toggleMode: () => setThemeModePref(currentMode === 'dark' ? 'light' : 'dark'),
      setMode: (m: ThemeMode) => setThemeModePref(m),
    }),
    [currentMode, setThemeModePref],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * 获取当前主题
 *
 * 安全降级：未找到 Context 时返回 lightTheme，避免 null 引用。
 */
export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return lightTheme as Theme
  }
  return ctx.theme
}

/**
 * 获取主题模式及切换能力
 */
export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: lightTheme,
      mode: 'light',
      toggleMode: () => {},
      setMode: () => {},
    }
  }
  return ctx
}
