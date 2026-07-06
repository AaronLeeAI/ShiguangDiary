import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { neutral, radius, semantic, shadow, spacing, typography } from '@theme'
import type { BottomSheetProps } from './types'

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible = false,
  title,
  children,
  onClose,
  closeOnBackdropPress = true,
  contentStyle,
  style,
  testID,
}) => (
  <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
    <View style={styles.backdrop} testID={testID}>
      {closeOnBackdropPress ? <Pressable style={styles.dismissLayer} onPress={onClose} /> : null}
      <View style={[styles.sheet, style]}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: semantic.bg.scrim,
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    ...shadow('lg'),
    backgroundColor: neutral.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: neutral.gray30,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.base,
    width: 40,
  },
  title: {
    ...typography.titleS,
    color: neutral.gray90,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
})

export default BottomSheet
