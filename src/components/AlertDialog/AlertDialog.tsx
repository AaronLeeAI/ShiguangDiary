import React, { useCallback } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, func, neutral, radius, semantic, shadow, spacing, typography } from '@theme'
import type { AlertDialogProps } from './types'

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible = false,
  title = '',
  description,
  children,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  variant = 'confirm',
  style,
  testID,
}) => {
  const handleConfirm = useCallback(() => {
    haptic(variant === 'danger' ? 'delete' : 'tap')
    onConfirm?.()
  }, [onConfirm, variant])

  const handleCancel = useCallback(() => {
    haptic('tap')
    onCancel?.()
  }, [onCancel])

  const showCancel = variant !== 'info'

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop} testID={testID}>
        <View style={[styles.dialog, style]}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {children}
          <View style={styles.actions}>
            {showCancel ? (
              <Pressable style={styles.actionButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </Pressable>
            ) : null}
            {showCancel ? <View style={styles.verticalDivider} /> : null}
            <Pressable style={styles.actionButton} onPress={handleConfirm}>
              <Text style={[styles.confirmText, variant === 'danger' && styles.dangerText]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: semantic.bg.scrim,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dialog: {
    ...shadow('lg'),
    backgroundColor: neutral.white,
    borderRadius: radius.lg,
    maxWidth: 320,
    overflow: 'hidden',
    width: '100%',
  },
  title: {
    ...typography.titleL,
    color: neutral.gray90,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyM,
    color: neutral.gray70,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    textAlign: 'center',
  },
  actions: {
    borderTopColor: neutral.gray20,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  verticalDivider: {
    backgroundColor: neutral.gray20,
    width: StyleSheet.hairlineWidth,
  },
  cancelText: {
    ...typography.titleS,
    color: neutral.gray80,
  },
  confirmText: {
    ...typography.titleS,
    color: brand.primary,
  },
  dangerText: {
    color: func.danger,
  },
})

export default AlertDialog
