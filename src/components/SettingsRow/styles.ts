/**
 * SettingsRow 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing, typography } from '@theme'

export const SETTINGS_ROW_HEIGHT = 52

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SETTINGS_ROW_HEIGHT,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
  },
  labelDestructive: {
    color: colors.func.danger,
  },
  labelDisabled: {
    color: colors.semantic.text.disabled,
  },
  hint: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    marginRight: spacing.sm,
  },
  arrowWrap: {
    marginLeft: spacing.xs,
  },
})

export default styles
