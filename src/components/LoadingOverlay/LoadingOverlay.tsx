/**
 * LoadingOverlay Component
 *
 * 全局加载遮罩。覆盖全屏，居中显示加载指示器和可选消息。
 *
 * Theme 集成：颜色、间距来自 useTheme()。
 */

import React from 'react';
import {ActivityIndicator, Modal, Text, View} from 'react-native';

import {useTheme} from '@theme';
import type {LoadingOverlayProps} from './types';

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = false,
  message,
  transparent = true,
  indicatorSize = 'large',
  indicatorColor,
  style,
  testID,
}) => {
  const {colors, typography, spacing, radius} = useTheme();

  if (!visible) return null;

  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent>
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: transparent
              ? 'rgba(0,0,0,0.35)'
              : colors.semantic.bg.canvas,
          },
          style,
        ]}>
        <View
          style={{
            backgroundColor: colors.semantic.bg.card,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            minWidth: 120,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <ActivityIndicator
            size={indicatorSize}
            color={indicatorColor ?? colors.brand.primary}
          />
          {message && (
            <Text
              style={{
                marginTop: spacing.sm,
                ...typography.bodyS,
                color: colors.semantic.text.secondary,
              }}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;