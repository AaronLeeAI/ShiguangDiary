/**
 * Tag
 *
 * 标签
 *
 * 当前 Task1 阶段仅为骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react'
import { View, Text, ViewStyle } from 'react-native'

export interface TagProps {
  /** 业务侧传入的数据 */
  // TODO: 根据实际需求补充 Props
  testID?: string
  style?: ViewStyle
}

/**
 * Tag 组件
 */
export const Tag: React.FC<TagProps> = ({ testID, style }) => {
  return (
    <View testID={testID} style={style}>
      <Text>Tag Skeleton</Text>
    </View>
  )
}

export default Tag
