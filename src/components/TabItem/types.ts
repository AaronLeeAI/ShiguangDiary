import type { StyleProp, ViewStyle } from 'react-native'
import type { IconName } from '@/components/Icon'

export interface TabItemProps {
  label?: string
  icon?: IconName
  activeIcon?: IconName
  active?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
