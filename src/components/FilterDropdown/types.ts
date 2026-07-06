import type { StyleProp, ViewStyle } from 'react-native'

export interface FilterOption<T extends string = string> {
  label: string
  value: T
  count?: number
}

export interface FilterDropdownProps<T extends string = string> {
  label?: string
  value?: T
  options?: FilterOption<T>[]
  onChange?: (value: T) => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
