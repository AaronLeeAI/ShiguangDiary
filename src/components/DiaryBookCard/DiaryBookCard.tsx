/**
 * DiaryBookCard - 日记本卡片
 *
 * 在 Notebook 页面展示一个日记本：左侧封面（颜色+首字）+ 右侧名称/描述/统计。
 */

import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {DIARY_BOOK_COVER_DEFAULT_COLORS, DIARY_BOOK_SIZE, styles} from './styles';
import type {DiaryBookCardProps} from './types';

/** 简单 hash：从 string 派生稳定的索引 */
const hashString = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const pickCoverColor = (id: string, override?: string): string => {
  if (override) return override;
  const idx = hashString(id) % DIARY_BOOK_COVER_DEFAULT_COLORS.length;
  return DIARY_BOOK_COVER_DEFAULT_COLORS[idx];
};

/**
 * DiaryBookCard 组件
 */
export const DiaryBookCard: React.FC<DiaryBookCardProps> = ({
  item,
  onPress,
  onLongPress,
  coverColor,
  style,
  testID,
}) => {
  const cover = pickCoverColor(item.id, coverColor ?? item.color ?? undefined);
  const initial = item.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`日记本：${item.name}`}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({pressed}) => [styles.container, pressed && styles.pressed, style]}>
      <View style={[styles.cover, {backgroundColor: cover, width: DIARY_BOOK_SIZE, height: DIARY_BOOK_SIZE}]}>
        <Text style={styles.coverInitial} numberOfLines={1}>
          {initial}
        </Text>
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.diaryCount} 篇日记</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>更新于最近</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default DiaryBookCard;