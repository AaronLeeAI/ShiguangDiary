/**
 * DiaryEdit Screen 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.semantic.bg.canvas,
  },
  headerDate: {
    ...typography.titleS,
    color: colors.neutral.black,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconButton: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  editorArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  titleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    flex: 1,
    ...typography.titleL,
    color: colors.neutral.black,
    fontWeight: '600',
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  titleCount: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
    marginLeft: spacing.sm,
  },
  contentInput: {
    flex: 1,
    ...typography.bodyM,
    color: colors.semantic.text.primary,
    paddingTop: spacing.xs,
    paddingHorizontal: 0,
    paddingBottom: spacing.base,
    textAlignVertical: 'top',
  },
  bottomSection: {
    backgroundColor: colors.semantic.bg.canvas,
  },
  infoBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  infoRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  toolbar: {
    backgroundColor: colors.semantic.bg.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.semantic.divider.subtle,
  },
  toolbarContent: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
  },
  toolbarButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  toolbarButtonActive: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  toolbarButtonPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  toolbarText: {
    ...typography.bodyM,
    color: colors.neutral.gray50,
    fontWeight: '400',
  },
  toolbarTextBold: {
    fontWeight: '700',
  },
  toolbarTextItalic: {
    fontStyle: 'italic',
  },
  toolbarTextUnderline: {
    textDecorationLine: 'underline',
  },
  toolbarTextStrike: {
    textDecorationLine: 'line-through',
  },
  toolbarTextActive: {
    color: colors.neutral.gray70,
  },
})

export default styles
