import type { StyleProp, ViewStyle } from 'react-native'

export interface ColorSwatchProps {
  color?: string
  selected?: boolean
  disabled?: boolean
  size?: number
  label?: string
  onPress?: (color: string) => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
