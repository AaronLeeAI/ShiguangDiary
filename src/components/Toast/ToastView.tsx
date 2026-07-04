/**
 * Toast 单条视图组件
 *
 * ToastProvider 内部使用，业务侧一般不直接引用。
 */

import React, {useEffect} from 'react';
import {Pressable, Text, View} from 'react-native';

import {Icon} from '@/components/Icon';
import type {IconName} from '@/components/Icon';
import {colors} from '@theme';
import {styles} from './styles';
import type {ToastVariant, ToastViewProps} from './types';

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'close',
  info: 'bell',
  warning: 'bell',
};

const VARIANT_STYLE = {
  success: styles.toastSuccess,
  error: styles.toastError,
  info: styles.toastInfo,
  warning: styles.toastWarning,
};

/**
 * Toast 单条视图
 */
export const ToastView: React.FC<ToastViewProps> = ({item, onDismiss}) => {
  const iconName = item.icon ?? VARIANT_ICON[item.variant];

  useEffect(() => {
    if (item.duration > 0) {
      const timer = setTimeout(() => onDismiss(item.id), item.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [item.id, item.duration, onDismiss]);

  const handleActionPress = () => {
    item.action?.onPress();
    onDismiss(item.id);
  };

  return (
    <View style={[styles.toast, VARIANT_STYLE[item.variant]]} accessibilityLiveRegion="polite">
      <View style={styles.icon}>
        <Icon name={iconName} size={20} color={colors.neutral.white} />
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {item.message}
      </Text>
      {item.action && (
        <Pressable
          accessibilityRole="button"
          onPress={handleActionPress}
          style={styles.actionButton}>
          <Text style={styles.actionLabel}>{item.action.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ToastView;