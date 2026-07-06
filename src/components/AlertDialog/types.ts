import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type AlertDialogVariant = 'confirm' | 'danger' | 'info'

export interface AlertDialogProps {
  visible?: boolean
  title?: string
  description?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: AlertDialogVariant
  style?: StyleProp<ViewStyle>
  testID?: string
}
