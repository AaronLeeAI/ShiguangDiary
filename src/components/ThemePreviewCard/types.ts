import type { StyleProp, ViewStyle } from 'react-native'

export interface ThemePreviewCardProps {
  title?: string
  primaryColor?: string
  backgroundColor?: string
  selected?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
