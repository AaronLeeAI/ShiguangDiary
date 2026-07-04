/**
 * ActionSheet 样式
 *
 * 颜色/间距/字号严格遵循 @theme。
 */
import {StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '@theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.semantic.bg.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.semantic.bg.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  header: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  title: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
  },
  description: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemLabel: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    flex: 1,
  },
  itemLabelDisabled: {
    color: colors.semantic.text.disabled,
  },
  itemLabelDestructive: {
    color: colors.func.danger,
  },
  itemPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.subtle,
    marginVertical: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelLabel: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
  },
});

export default styles;