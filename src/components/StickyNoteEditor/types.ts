import type { StyleProp, ViewStyle } from 'react-native'

export interface StickyNoteEditorProps {
  value?: string
  onChangeText?: (value: string) => void
  placeholder?: string
  maxLength?: number
  editable?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
}
