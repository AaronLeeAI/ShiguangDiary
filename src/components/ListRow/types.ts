import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { IconName } from '@/components/Icon'

export interface ListRowProps {
  title?: string
  subtitle?: string
  icon?: IconName
  left?: ReactNode
  right?: ReactNode
  showArrow?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
