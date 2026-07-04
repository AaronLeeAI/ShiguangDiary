/**
 * TextArea 样式
 */
import { StyleSheet } from 'react-native'
import { colors, radius, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.bg.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.semantic.border.default,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  containerFocused: {
    borderColor: colors.semantic.border.focused,
    borderWidth: 1,
  },
  containerError: {
    borderColor: colors.func.danger,
    borderWidth: 1,
  },
  input: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    padding: 0,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  countText: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
  },
  countTextWarn: {
    color: colors.func.warning,
  },
  countTextDanger: {
    color: colors.func.danger,
  },
  errorText: {
    ...typography.caption,
    color: colors.func.danger,
    marginTop: spacing.xs,
  },
})

export default styles
