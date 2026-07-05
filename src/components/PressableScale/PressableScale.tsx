/**
 * PressableScale - unified press feedback (Task17 Motion System).
 *
 * Provides scale feedback through Reanimated on the UI thread, respects system
 * Reduce Motion, and can optionally trigger a semantic haptic intent.
 */

import React, { useCallback, useRef } from 'react'
import { Pressable, PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import { haptic, type HapticIntent } from '@animations/haptics'
import { useReduceMotion } from '@hooks/useReduceMotion'
import { motion } from '@theme'

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Target scale while pressed. */
  pressedScale?: number
  /** Outer animated container style. */
  style?: StyleProp<ViewStyle>
  /** Optional haptic intent triggered before onPress. */
  hapticIntent?: HapticIntent
  /** Default hitSlop improves small icon targets. */
  hitSlop?: PressableProps['hitSlop']
  children: React.ReactNode
}

const DEFAULT_HIT_SLOP = { top: 12, right: 12, bottom: 12, left: 12 } as const

const SPRING = {
  damping: motion.spring.default.damping,
  mass: motion.spring.default.mass,
  stiffness: motion.spring.default.stiffness,
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  pressedScale = 0.98,
  style,
  hitSlop = DEFAULT_HIT_SLOP,
  onPressIn,
  onPressOut,
  onPress,
  hapticIntent,
  children,
  ...rest
}) => {
  const reduceMotion = useReduceMotion()
  const scale = useSharedValue(1)
  const propsRef = useRef({ pressedScale, reduceMotion })
  propsRef.current = { pressedScale, reduceMotion }

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    event => {
      if (!propsRef.current.reduceMotion) {
        scale.value = withSpring(propsRef.current.pressedScale, SPRING)
      }
      onPressIn?.(event)
    },
    [onPressIn, scale],
  )

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    event => {
      if (!propsRef.current.reduceMotion) {
        scale.value = withSpring(1, SPRING)
      }
      onPressOut?.(event)
    },
    [onPressOut, scale],
  )

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    event => {
      if (hapticIntent) {
        haptic(hapticIntent)
      }
      onPress?.(event)
    },
    [hapticIntent, onPress],
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]} pointerEvents="box-none">
      <Pressable
        hitSlop={hitSlop}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.04)', borderless: false }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

export default PressableScale
