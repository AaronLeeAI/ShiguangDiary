import type { StyleProp, ViewStyle } from 'react-native'

export interface SwitchProps {
  value: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean
  trackColorOn?: string
  trackColorOff?: string
  thumbColor?: string
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}
