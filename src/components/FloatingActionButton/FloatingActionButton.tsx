/**
 * FloatingActionButton - 悬浮按钮（FAB）
 *
 * 主页右下角的"新建"按钮入口。圆角 radius.full 形成圆形。
 */

import React from 'react';
import {Pressable, View} from 'react-native';

import {Icon} from '@/components/Icon';
import {colors} from '@theme';
import {FAB_ICON_SIZE, FAB_SIZE, styles} from './styles';
import type {FloatingActionButtonProps} from './types';

/**
 * FloatingActionButton 组件
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  children,
  variant = 'primary',
  size = 'large',
  accessibilityLabel,
  testID,
  style,
  disabled = false,
}) => {
  const px = FAB_SIZE[size];
  const iconPx = FAB_ICON_SIZE[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? '新建'}
      accessibilityState={{disabled}}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [
        styles.container,
        {
          width: px,
          height: px,
        },
        variant === 'danger' && styles.containerDanger,
        disabled && styles.containerDisabled,
        pressed && !disabled && {transform: [{scale: 0.96}]},
        style,
      ]}>
      <View>
        {children ?? (
          <Icon name={icon} size={iconPx} color={colors.neutral.white} variant="round" />
        )}
      </View>
    </Pressable>
  );
};

export default FloatingActionButton;