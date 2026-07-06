import type { StyleProp, ViewStyle } from 'react-native'

export interface EventReminderDialogProps {
  visible?: boolean
  title?: string
  description?: string
  dateText?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
