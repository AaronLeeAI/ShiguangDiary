import type { StyleProp, ViewStyle } from 'react-native'

export type TagVariant = 'default' | 'primary' | 'danger' | 'warning' | 'success'

export interface TagProps {
  label?: string
  children?: string
  variant?: TagVariant
  selected?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
