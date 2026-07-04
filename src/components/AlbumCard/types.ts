/**
 * AlbumCard 类型定义
 */

import type { ViewStyle } from 'react-native'
import type { Album } from '@types'

export interface AlbumCardProps {
  item: Album
  onPress?: () => void
  onLongPress?: () => void
  style?: ViewStyle
  testID?: string
}
