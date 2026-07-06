import type { StyleProp, ViewStyle } from 'react-native'

export interface DiaryListItemProps {
  title?: string
  content?: string
  date?: string
  mood?: string
  imageCount?: number
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
