/**
 * TextField 样式
 *
 * 颜色/间距/字号严格遵循 @theme。
 */
import {StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '@theme';

export const TEXT_FIELD_HEIGHT = {
  large: 52,
  medium: 44,
  small: 36,
} as const;

export const TEXT_FIELD_FONT_SIZE = {
  large: typography.bodyL,
  medium: typography.bodyM,
  small: typography.bodyS,
} as const;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.bg.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.semantic.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  containerFocused: {
    borderColor: colors.semantic.border.focused,
    borderWidth: 1,
  },
  containerError: {
    borderColor: colors.func.danger,
    borderWidth: 1,
  },
  containerDisabled: {
    backgroundColor: colors.semantic.bg.subtle,
    opacity: 0.7,
  },
  label: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    marginBottom: spacing.xs,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.semantic.text.primary,
    paddingVertical: 0, // RN 中 TextInput 默认有 padding，手动归零以保证固定高度
  },
  clearButton: {
    padding: spacing.xxs,
    marginLeft: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.func.danger,
    marginTop: spacing.xs,
  },
});

export default styles;