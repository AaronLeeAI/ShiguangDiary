/**
 * EditorToolbar 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing } from '@theme'

export const EDITOR_TOOL_BUTTON_SIZE = 40

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.bg.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.semantic.divider.subtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
  },
  toolButton: {
    width: EDITOR_TOOL_BUTTON_SIZE,
    height: EDITOR_TOOL_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  toolButtonActive: {
    backgroundColor: colors.brand.primaryGhost,
  },
  toolButtonPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
})

export default styles
