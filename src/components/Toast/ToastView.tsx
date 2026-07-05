/**
 * Toast 单条视图组件
 *
 * ToastProvider 内部使用，业务侧一般不直接引用。
 */

import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { useReduceMotion } from '@hooks/useReduceMotion'
import type { IconName } from '@/components/Icon'
import { colors } from '@theme'
import { styles } from './styles'
import type { ToastVariant, ToastViewProps } from './types'

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'close',
  info: 'bell',
  warning: 'bell',
}

const VARIANT_STYLE = {
  success: styles.toastSuccess,
  error: styles.toastError,
  info: styles.toastInfo,
  warning: styles.toastWarning,
}

/**
 * Toast 单条视图
 */
export const ToastView: React.FC<ToastViewProps> = ({ item, onDismiss }) => {
  const reduceMotion = useReduceMotion()
  const iconName = item.icon ?? VARIANT_ICON[item.variant]
  const entering = reduceMotion ? FadeIn.duration(150) : FadeInDown.duration(250)
  const exiting = reduceMotion ? FadeOut.duration(150) : FadeOutUp.duration(200)

  useEffect(() => {
    if (item.duration > 0) {
      const timer = setTimeout(() => onDismiss(item.id), item.duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [item.id, item.duration, onDismiss])

  const handleActionPress = () => {
    haptic(item.variant === 'error' ? 'error' : item.variant === 'warning' ? 'warning' : 'tap')
    item.action?.onPress()
    onDismiss(item.id)
  }

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[styles.toast, VARIANT_STYLE[item.variant]]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.icon}>
        <Icon name={iconName} size={20} color={colors.neutral.white} />
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {item.message}
      </Text>
      {item.action && (
        <Pressable
          accessibilityRole="button"
          onPress={handleActionPress}
          style={styles.actionButton}
        >
          <Text style={styles.actionLabel}>{item.action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

export default ToastView
