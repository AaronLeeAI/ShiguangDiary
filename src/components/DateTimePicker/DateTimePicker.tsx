/**
 * DateTimePicker - 日期/时间选择
 *
 * 基于 @react-native-community/datetimepicker：
 * - iOS：inline 渲染（嵌入视图流）
 * - Android：modal dialog 弹出
 */

import React, { useState } from 'react'
import { Platform, View } from 'react-native'
import RNDateTimePicker from '@react-native-community/datetimepicker'

import { colors } from '@theme'
import type { DateTimePickerProps } from './types'

/**
 * DateTimePicker 组件
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  style,
  testID,
}) => {
  const [internalValue, setInternalValue] = useState(value)
  const current = value ?? internalValue

  const handleChange = (event: { type: string }, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        const ts = selected.getTime()
        setInternalValue(ts)
        onChange(ts)
      }
    } else {
      // iOS: 实时回调
      if (selected) {
        const ts = selected.getTime()
        setInternalValue(ts)
        onChange(ts)
      }
    }
  }

  return (
    <View style={style} testID={testID}>
      <RNDateTimePicker
        value={new Date(current)}
        mode={mode}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        minimumDate={minimumDate ? new Date(minimumDate) : undefined}
        maximumDate={maximumDate ? new Date(maximumDate) : undefined}
        onChange={handleChange}
        // 主题
        textColor={colors.semantic.text.primary}
        themeVariant="light"
      />
    </View>
  )
}

export default DateTimePicker
