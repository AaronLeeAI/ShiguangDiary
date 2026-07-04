/**
 * Checkbox
 *
 * 复选框
 *
 * 当前 Task1 阶段仅为骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react'
import { View, Text, ViewStyle } from 'react-native'

export interface CheckboxProps {
  /** 业务侧传入的数据 */
  // TODO: 根据实际需求补充 Props
  testID?: string
  style?: ViewStyle
}

/**
 * Checkbox 组件
 */
export const Checkbox: React.FC<CheckboxProps> = ({ testID, style }) => {
  return (
    <View testID={testID} style={style}>
      <Text>Checkbox Skeleton</Text>
    </View>
  )
}

export default Checkbox
