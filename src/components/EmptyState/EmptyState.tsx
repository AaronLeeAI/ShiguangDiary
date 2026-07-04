/**
 * EmptyState Component
 *
 * 空状态占位。沙漏图 + 提示文案 + 行动引导。
 * 基于设计规范 docs/project-设计-docs/components/EmptyState.md
 */

import React from 'react';
import {View, Text} from 'react-native';

import {Icon} from '@components/Icon';
import {PrimaryButton} from '@components/PrimaryButton';
import {useTheme} from '@theme';
import type {IconName} from '@components/Icon/paths';

import {
  EMPTY_STATE_PRESETS,
  type EmptyStateProps,
  type EmptyStateVariant,
} from './types';
import {styles, VARIANT_ICON_SIZE} from './styles';

const VARIANT_ICON_NAME: Record<Exclude<EmptyStateVariant, 'custom'>, IconName> = {
  notebook: 'book',
  album: 'album',
  noDiaryToday: 'hourglass',
  noDraft: 'edit',
  search: 'search',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  subtitle,
  customIcon,
  actionLabel,
  onAction,
  testID,
}) => {
  const theme = useTheme();
  const preset = variant !== 'custom' ? EMPTY_STATE_PRESETS[variant] : undefined;
  const finalTitle = title ?? preset?.title ?? '';
  const finalSubtitle = subtitle ?? preset?.subtitle;

  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    if (variant !== 'custom') {
      return (
        <Icon
          name={VARIANT_ICON_NAME[variant]}
          size={VARIANT_ICON_SIZE[variant]}
          color={theme.colors.brand.primary}
          variant="filled"
        />
      );
    }
    return null;
  };

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.iconCircle}>{renderIcon()}</View>
      {!!finalTitle && <Text style={styles.title}>{finalTitle}</Text>}
      {!!finalSubtitle && <Text style={styles.subtitle}>{finalSubtitle}</Text>}
      {!!actionLabel && !!onAction && (
        <View style={styles.actionButton}>
          <PrimaryButton
            title={actionLabel}
            onPress={onAction}
            variant="ghost"
            size="medium"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
};

export default EmptyState;
