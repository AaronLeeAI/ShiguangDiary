import type { StyleProp, ViewStyle } from 'react-native'

export interface DateBlockProps {
  day?: string | number
  month?: string
  weekday?: string
  lunar?: string
  selected?: boolean
  hasDiary?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
