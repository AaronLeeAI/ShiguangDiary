import type { ReactNode } from 'react'
import type { ModalProps as RNModalProps, StyleProp, ViewStyle } from 'react-native'

export interface ModalProps
  extends Pick<RNModalProps, 'animationType' | 'transparent' | 'onRequestClose'> {
  visible?: boolean
  children?: ReactNode
  closeOnBackdropPress?: boolean
  onClose?: () => void
  contentStyle?: StyleProp<ViewStyle>
  backdropStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  testID?: string
}
