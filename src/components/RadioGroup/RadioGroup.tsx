/**
 * RadioGroup
 *
 * 单选组
 *
 * 当前 Task1 阶段仅为骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react'
import { View, Text, ViewStyle } from 'react-native'

export interface RadioGroupProps {
  /** 业务侧传入的数据 */
  // TODO: 根据实际需求补充 Props
  testID?: string
  style?: ViewStyle
}

/**
 * RadioGroup 组件
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({ testID, style }) => {
  return (
    <View testID={testID} style={style}>
      <Text>RadioGroup Skeleton</Text>
    </View>
  )
}

export default RadioGroup
