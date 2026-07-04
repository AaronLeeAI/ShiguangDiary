/**
 * TopBar Component
 *
 * 顶部导航栏（返回 + 标题 + 右侧操作）
 *
 * 当前 Task1 阶段仅骨架。后续 Task 在此基础上实现 UI 与交互。
 */

import React from 'react';
import {View, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {styles} from './styles';
import type {TopBarProps} from './types';

/**
 * TopBar - 顶部导航栏骨架
 *
 * 展示左侧/右侧操作区 + 标题，支持返回按钮。
 */
export const TopBar: React.FC<TopBarProps> = ({
  left,
  title,
  titleComponent,
  right,
  onBackPress,
  showBack,
  backgroundColor,
  style,
}) => {
  return (
    <View style={[styles.container, {backgroundColor} as ViewStyle, style]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text>{"←"}</Text>
          </TouchableOpacity>
        )}
        {left}
      </View>
      <View style={styles.center}>
        {titleComponent || <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

export default TopBar;
