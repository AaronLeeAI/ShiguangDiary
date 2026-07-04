/**
 * SettingsGroup 样式
 */
import {StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '@theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.subtle,
    marginLeft: spacing.base + 22 + spacing.md, // icon 宽度 + 左右 padding
  },
});

export default styles;