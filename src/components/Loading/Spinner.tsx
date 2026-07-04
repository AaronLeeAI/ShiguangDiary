/**
 * Spinner - 弧形旋转图标
 *
 * 加载图标组件（基于 react-native-reanimated 旋转动画）。
 * 设计：绿色不闭合圆弧（2 段）。
 */

import React, { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@theme'

const ARC_TIMING = {
  duration: 1000,
  easing: Easing.linear,
}

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 28, color }) => {
  const theme = useTheme()
  const strokeColor = color ?? theme.colors.brand.primary
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, ARC_TIMING), -1)
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const r = size / 2 - 3
  const cx = size / 2
  const cy = size / 2

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${r * 1.2} ${r * 5}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  )
}

export default Spinner
