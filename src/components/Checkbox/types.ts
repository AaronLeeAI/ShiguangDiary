import type { StyleProp, ViewStyle } from 'react-native'

export interface CheckboxProps {
  checked?: boolean
  value?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  onValueChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}
