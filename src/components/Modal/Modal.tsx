import React from 'react'
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native'

import { semantic } from '@theme'
import type { ModalProps } from './types'

export const Modal: React.FC<ModalProps> = ({
  visible = false,
  children,
  animationType = 'fade',
  transparent = true,
  onRequestClose,
  onClose,
  closeOnBackdropPress = true,
  contentStyle,
  backdropStyle,
  style,
  testID,
}) => {
  const handleClose = onClose ?? onRequestClose
  return (
    <RNModal
      animationType={animationType}
      onRequestClose={handleClose}
      transparent={transparent}
      visible={visible}
    >
      <View style={[styles.backdrop, backdropStyle, style]} testID={testID}>
        {closeOnBackdropPress ? (
          <Pressable style={styles.dismissLayer} onPress={handleClose} />
        ) : null}
        <View style={contentStyle}>{children}</View>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: semantic.bg.scrim,
    flex: 1,
    justifyContent: 'center',
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default Modal
