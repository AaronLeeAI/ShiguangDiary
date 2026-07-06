import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { AlertDialog } from '@/components/AlertDialog'
import { Icon } from '@/components/Icon'
import { brand, neutral, radius, spacing, typography } from '@theme'
import type { EventReminderDialogProps } from './types'

export const EventReminderDialog: React.FC<EventReminderDialogProps> = ({
  visible = false,
  title = '事件提醒',
  description = '设置提醒时间，避免错过重要记录。',
  dateText,
  confirmText = '保存',
  cancelText = '取消',
  onConfirm,
  onCancel,
  style,
  testID,
}) => (
  <AlertDialog
    visible={visible}
    title={title}
    description={description}
    confirmText={confirmText}
    cancelText={cancelText}
    onConfirm={onConfirm}
    onCancel={onCancel}
    style={style}
    testID={testID}
  >
    {dateText ? (
      <View style={styles.datePill}>
        <Icon name="bell" size={16} color={brand.primary} />
        <Text style={styles.dateText}>{dateText}</Text>
      </View>
    ) : null}
  </AlertDialog>
)

const styles = StyleSheet.create({
  datePill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: brand.primaryGhost,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    ...typography.bodyS,
    color: neutral.gray80,
  },
})

export default EventReminderDialog
