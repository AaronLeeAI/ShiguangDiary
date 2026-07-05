/**
 * Skeleton types.
 */

import type { StyleProp, ViewStyle } from 'react-native'

export type SkeletonVariant = 'line' | 'circle' | 'card'

export interface SkeletonProps {
  /** Shape: line text, circle avatar/icon, or card placeholder. */
  variant?: SkeletonVariant
  /** Width. Defaults to 100%. */
  width?: number | `${number}%`
  /** Height. Defaults by variant. */
  height?: number
  /** Border radius. Defaults to Design Tokens. */
  radius?: number
  /** Enable shimmer. Reduce Motion automatically forces static mode. */
  animated?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

export interface SkeletonState {
  reduceMotion: boolean
}

export type SkeletonRef = unknown
