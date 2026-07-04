/**
 * Screen Component
 *
 * 全屏容器组件。提供统一的 SafeArea 适配、可选滚动和键盘避让。
 *
 * ## 设计规范
 *
 * - 所有页面必须使用 Screen 作为根容器，禁止自行包裹 SafeAreaView
 * - 默认填满全屏（flex: 1），背景色来自 theme.colors.semantic.bg.canvas
 * - 可选 ScrollView 模式（scroll={true}）用于内容超长页面
 * - 可选 KeyboardAvoidingView 模式用于表单页面
 *
 * ## 用法
 *
 * ```tsx
 * <Screen>
 *   <Text>内容</Text>
 * </Screen>
 *
 * <Screen scroll edges={['top', 'bottom']}>
 *   <Text>可滚动内容</Text>
 * </Screen>
 *
 * <Screen scroll keyboardAvoiding padded>
 *   <TextField />
 * </Screen>
 * ```
 */

import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@theme'
import type { ScreenProps } from './types'

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scroll = false,
  keyboardAvoiding = false,
  padded = false,
  edges = ['top', 'bottom'],
  statusBarStyle = 'dark-content',
  backgroundColor,
  testID,
}) => {
  const { colors, spacing } = useTheme()
  const bgColor = backgroundColor ?? colors.semantic.bg.canvas

  const paddedContent: ViewStyle = padded ? { paddingHorizontal: spacing.base } : {}

  const innerContent = (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={keyboardAvoiding}
    >
      {scroll ? (
        <ScrollView
          testID={testID}
          style={{ flex: 1, backgroundColor: bgColor }}
          contentContainerStyle={[paddedContent, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View testID={testID} style={[{ flex: 1, backgroundColor: bgColor }, paddedContent, style]}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  )

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={bgColor} translucent={false} />
      {innerContent}
    </SafeAreaView>
  )
}

export default Screen
