import type { StyleProp, ViewStyle } from 'react-native'

export interface ListStyleCardProps {
  title?: string
  description?: string
  selected?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
