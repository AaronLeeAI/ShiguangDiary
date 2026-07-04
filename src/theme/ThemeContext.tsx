/**
 * Theme Context
 *
 * 提供 Light/Dark 主题切换能力。
 */

import React, {createContext, useContext, useMemo, type ReactNode} from 'react';
import {useColorScheme} from 'react-native';
import {darkTheme, lightTheme, type Theme, type ThemeMode} from './theme';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  /** 强制指定模式（不指定时跟随系统） */
  forcedMode?: ThemeMode;
  /** 自定义初始模式 */
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  forcedMode,
  initialMode,
}) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = React.useState<ThemeMode>(
    initialMode ?? (systemScheme === 'dark' ? 'dark' : 'light'),
  );

  const value = useMemo<ThemeContextValue>(() => {
    const currentMode = forcedMode ?? mode;
    return {
      theme: currentMode === 'dark' ? darkTheme : lightTheme,
      mode: currentMode,
      toggleMode: () => setModeState(prev => (prev === 'dark' ? 'light' : 'dark')),
      setMode: setModeState,
    };
  }, [mode, forcedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * 获取当前主题
 *
 * 安全降级：未找到 Context 时返回 lightTheme，避免 null 引用。
 */
export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return lightTheme as Theme;
  }
  return ctx.theme;
};

/**
 * 获取主题模式及切换能力
 */
export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: lightTheme,
      mode: 'light',
      toggleMode: () => {},
      setMode: () => {},
    };
  }
  return ctx;
};