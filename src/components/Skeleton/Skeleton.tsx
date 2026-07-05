/**
 * Skeleton - unified loading placeholder (Task17 Loading Polish).
 *
 * Uses Motion tokens for lightweight shimmer and respects system Reduce Motion.
 */

import React, { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { useReduceMotion } from '@hooks/useReduceMotion'
import { motion, radius as radiusTokens } from '@theme'

import { styles } from './styles'
import type { SkeletonProps } from './types'

const DEFAULT_HEIGHT = {
  line: 14,
  circle: 48,
  card: 96,
} as const

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'line',
  width = '100%',
  height,
  radius,
  animated = true,
  testID,
  style,
}) => {
  const reduceMotion = useReduceMotion()
  const progress = useSharedValue(-1)
  const shouldAnimate = animated && !reduceMotion
  const resolvedHeight = height ?? DEFAULT_HEIGHT[variant]
  const resolvedRadius = radius ?? (variant === 'circle' ? radiusTokens.full : radiusTokens.md)

  useEffect(() => {
    progress.value = shouldAnimate
      ? withRepeat(
          withTiming(1, { duration: motion.duration.breathLoop, easing: motion.easing.easeInOut }),
          -1,
        )
      : -1
  }, [progress, shouldAnimate])

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -200 + progress.value * 500 }],
  }))

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      style={[
        styles.container,
        styles[variant],
        { width, height: resolvedHeight, borderRadius: resolvedRadius },
        style,
      ]}
    >
      {shouldAnimate && <Animated.View style={[styles.shimmer, shimmerStyle]} />}
    </Animated.View>
  )
}

export default Skeleton
