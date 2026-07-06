/**
 * DateTimePickerField - 字段式日期时间选择
 *
 * 点击输入框弹出选择器。自动展示当前值。
 */

import React, { useCallback, useState } from 'react'
import { Modal, Platform, Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { colors, radius, spacing, typography } from '@theme'
import { DateTimePicker } from './DateTimePicker'
import type { DateTimePickerFieldProps } from './types'

const defaultFormat = (ts: number, mode: 'date' | 'time' | 'datetime') => {
  const d = new Date(ts)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  if (mode === 'date') {
    return `${Y}-${M}-${D}`
  }
  if (mode === 'time') {
    return `${h}:${m}`
  }
  return `${Y}-${M}-${D} ${h}:${m}`
}

export const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({
  value,
  onChange,
  mode = 'date',
  label,
  placeholder = '请选择',
  formatValue,
  minimumDate,
  maximumDate,
  style,
  testID,
  rightIconName = 'calendar',
}) => {
  const [visible, setVisible] = useState(false)
  const hasValue = value > 0

  const handleOpen = useCallback(() => setVisible(true), [])
  const handleClose = useCallback(() => setVisible(false), [])
  const handleChange = useCallback(
    (ts: number) => {
      onChange(ts)
      if (Platform.OS === 'android') {
        setVisible(false)
      }
    },
    [onChange],
  )
  const handleConfirm = useCallback(() => {
    setVisible(false)
  }, [])

  const displayValue = hasValue ? (formatValue ?? defaultFormat)(value, mode) : placeholder

  return (
    <View style={style}>
      {label && (
        <Text
          style={{
            ...typography.bodyS,
            color: colors.semantic.text.secondary,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <Pressable
        testID={testID}
        onPress={handleOpen}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          height: 44,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.semantic.bg.card,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.semantic.border.default,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            ...typography.bodyM,
            color: hasValue ? colors.semantic.text.primary : colors.semantic.text.tertiary,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Icon name={rightIconName} size={18} color={colors.semantic.icon.tertiary} />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
          <Pressable
            onPress={handleClose}
            style={{
              flex: 1,
              backgroundColor: colors.semantic.bg.overlay,
              justifyContent: 'flex-end',
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: colors.semantic.bg.card,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingTop: spacing.md,
                paddingBottom: spacing.xl,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: spacing.base,
                  paddingBottom: spacing.md,
                }}
              >
                <Pressable onPress={handleClose} hitSlop={8}>
                  <Text style={{ ...typography.bodyL, color: colors.semantic.text.secondary }}>
                    取消
                  </Text>
                </Pressable>
                <Text style={{ ...typography.titleS, color: colors.semantic.text.primary }}>
                  {label ?? '选择日期'}
                </Text>
                <Pressable onPress={handleConfirm} hitSlop={8}>
                  <Text
                    style={{
                      ...typography.bodyL,
                      color: colors.brand.primary,
                      fontWeight: '600',
                    }}
                  >
                    确定
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={hasValue ? value : Date.now()}
                onChange={handleChange}
                mode={mode}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        // Android: 直接调用官方 dialog
        visible && (
          <DateTimePicker
            value={hasValue ? value : Date.now()}
            onChange={handleChange}
            mode={mode}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  )
}

export default DateTimePickerField
