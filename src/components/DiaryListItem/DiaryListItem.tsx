/**
 * DiaryListItem
 *
 * 日记列表项（紧凑版）
 *
 * 当前 Task1 阶段仅为骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react';
import {View, Text, ViewStyle} from 'react-native';

export interface DiaryListItemProps {
  /** 业务侧传入的数据 */
  // TODO: 根据实际需求补充 Props
  testID?: string;
  style?: ViewStyle;
}

/**
 * DiaryListItem 组件
 */
export const DiaryListItem: React.FC<DiaryListItemProps> = ({testID, style}) => {
  return (
    <View testID={testID} style={style}>
      <Text>DiaryListItem Skeleton</Text>
    </View>
  );
};

export default DiaryListItem;
