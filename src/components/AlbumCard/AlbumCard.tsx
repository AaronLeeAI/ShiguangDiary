/**
 * AlbumCard
 *
 * 相册卡片
 *
 * 当前 Task1 阶段仅为骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react';
import {View, Text, ViewStyle} from 'react-native';

export interface AlbumCardProps {
  /** 业务侧传入的数据 */
  // TODO: 根据实际需求补充 Props
  testID?: string;
  style?: ViewStyle;
}

/**
 * AlbumCard 组件
 */
export const AlbumCard: React.FC<AlbumCardProps> = ({testID, style}) => {
  return (
    <View testID={testID} style={style}>
      <Text>AlbumCard Skeleton</Text>
    </View>
  );
};

export default AlbumCard;
