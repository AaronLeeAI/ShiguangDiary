import type { StyleProp, ViewStyle } from 'react-native'

export interface FontCardProps {
  name?: string
  sample?: string
  fontFamily?: string
  selected?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
