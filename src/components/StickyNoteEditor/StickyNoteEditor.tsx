import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { neutral, radius, spacing, typography } from '@theme'
import type { StickyNoteEditorProps } from './types'

export const StickyNoteEditor: React.FC<StickyNoteEditorProps> = ({
  value = '',
  onChangeText,
  placeholder = '写下想固定到桌面的内容',
  maxLength = 200,
  editable = true,
  style,
  testID,
}) => (
  <View style={[styles.card, style]} testID={testID}>
    <TextInput
      editable={editable}
      maxLength={maxLength}
      multiline
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={neutral.gray50}
      style={styles.input}
      textAlignVertical="top"
      value={value}
    />
    <Text style={styles.counter}>
      {value.length}/{maxLength}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8D6',
    borderRadius: radius.lg,
    minHeight: 160,
    padding: spacing.base,
  },
  input: {
    ...typography.bodyL,
    color: neutral.gray90,
    flex: 1,
    minHeight: 116,
    padding: 0,
  },
  counter: {
    ...typography.caption,
    color: neutral.gray50,
    textAlign: 'right',
  },
})

export default StickyNoteEditor
