/**
 * AlbumCard - 相册卡片
 *
 * 在 Album 页面以 2 列网格展示相册：方形封面 + 名称 + 日记数量。
 */

import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {Icon} from '@/components/Icon';
import {colors} from '@theme';
import {styles} from './styles';
import type {AlbumCardProps} from './types';

/**
 * AlbumCard 组件
 */
export const AlbumCard: React.FC<AlbumCardProps> = ({
  item,
  onPress,
  onLongPress,
  style,
  testID,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`相册：${item.name}`}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({pressed}) => [styles.container, pressed && styles.pressed, style]}>
      <View style={styles.cover}>
        <View style={styles.coverIconWrap}>
          <Icon name="album" size={56} color={colors.semantic.icon.tertiary} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.count}>{item.diaryIds.length} 篇日记</Text>
    </Pressable>
  );
};

export default AlbumCard;