/**
 * ShiguangDiary - App Entry
 *
 * 拾光日记 - 顶层入口。
 * 这里只做最薄的一层：注册 Provider、挂载 Navigator、初始化全局资源。
 *
 * 各 Provider 的顺序（外 → 内）：
 * 1. GestureHandlerRootView（手势系统根）
 * 2. SafeAreaProvider（安全区）
 * 3. ThemeProvider（主题）
 * 4. ToastProvider（全局 Toast - 必须在 App 内部以使用 useTheme）
 * 5. AppNavigator（路由）
 * 6. AppBootstrap（启动初始化 Store/DB）
 */

import React, { useEffect } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppNavigator } from '@navigation'
import { ThemeProvider, useTheme } from '@theme'
import { ToastProvider } from '@/components/Toast'
import { useDiaryStore } from '@store/diaryStore'

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppRoot />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

/** 启动初始化：触发 Store init（幂等） */
const AppBootstrap: React.FC = () => {
  const init = useDiaryStore(s => s.init)
  useEffect(() => {
    init()
  }, [init])
  return null
}

const AppRoot: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.mode === 'dark'

  return (
    <ToastProvider defaultDuration={2000} defaultPosition="top">
      <View style={[styles.root, { backgroundColor: theme.colors.semantic.bg.canvas }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.semantic.bg.canvas}
        />
        <AppBootstrap />
        <AppNavigator />
      </View>
    </ToastProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})

// 保留导出便于外部 Storybook / 测试使用
export { AppRoot }
export default App
