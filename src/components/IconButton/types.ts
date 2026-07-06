import type { StyleProp, ViewStyle } from 'react-native'
import type { IconName } from '@/components/Icon'

export type IconButtonVariant = 'ghost' | 'filled' | 'outline'

export interface IconButtonProps {
  name: IconName
  onPress?: () => void
  size?: number
  iconSize?: number
  color?: string
  disabled?: boolean
  variant?: IconButtonVariant
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}
