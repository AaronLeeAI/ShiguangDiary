import type { StyleProp, ViewStyle } from 'react-native'

export interface LockPatternProps {
  value?: number[]
  onChange?: (value: number[]) => void
  onComplete?: (value: number[]) => void
  disabled?: boolean
  size?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}
