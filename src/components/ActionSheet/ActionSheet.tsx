/**
 * ActionSheet - 底部操作菜单
 *
 * 从底部弹出的操作列表：标题 + 选项列表 + 取消按钮。
 * 使用 RN Modal 实现（避免与原生 ActionSheet.iOS 冲突）。
 */

import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { colors } from '@theme'
import { styles } from './styles'
import type { ActionSheetProps } from './types'

/**
 * ActionSheet 组件
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  description,
  items,
  cancelLabel = '取消',
  backdropDismiss = true,
  style,
  testID,
}) => {
  const handleBackdropPress = () => {
    if (backdropDismiss) {
      onClose()
    }
  }

  const handleItemPress = (onPress?: () => void) => {
    if (onPress) {
      onPress()
    }
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
        accessibilityLabel="关闭操作菜单"
      >
        {/* 阻止点击穿透到 backdrop */}
        <Pressable onPress={() => {}}>
          <View style={[styles.sheet, style]} testID={testID}>
            {(title || description) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {description && <Text style={styles.description}>{description}</Text>}
              </View>
            )}
            {items.map((item, index) => (
              <View key={item.key}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !!item.disabled }}
                  disabled={item.disabled}
                  onPress={() => handleItemPress(item.onPress)}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                >
                  {item.icon && (
                    <View style={styles.itemIcon}>
                      <Icon
                        name={item.icon}
                        size={22}
                        color={
                          item.disabled
                            ? colors.semantic.icon.disabled
                            : item.destructive
                            ? colors.func.danger
                            : colors.semantic.icon.primary
                        }
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.itemLabel,
                      item.disabled && styles.itemLabelDisabled,
                      item.destructive && styles.itemLabelDestructive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default ActionSheet
