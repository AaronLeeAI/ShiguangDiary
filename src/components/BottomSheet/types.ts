import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export interface BottomSheetProps {
  visible?: boolean
  title?: string
  children?: ReactNode
  onClose?: () => void
  closeOnBackdropPress?: boolean
  contentStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  testID?: string
}
