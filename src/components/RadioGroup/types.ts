import type { StyleProp, ViewStyle } from 'react-native'

export interface RadioOption<T extends string = string> {
  label: string
  value: T
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps<T extends string = string> {
  options?: RadioOption<T>[]
  value?: T
  onChange?: (value: T) => void
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
}
