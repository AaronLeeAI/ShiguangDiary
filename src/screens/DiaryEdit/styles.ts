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
  liveEditor: {
    flex: 1,
    position: 'relative',
  },
  livePreviewScroller: {
    ...StyleSheet.absoluteFillObject,
  },
  livePreviewContent: {
    paddingTop: spacing.xs,
    paddingHorizontal: 0,
    paddingBottom: spacing.base,
  },
  livePlaceholder: {
    ...typography.bodyM,
    color: colors.semantic.text.tertiary,
  },
  contentInput: {
    ...StyleSheet.absoluteFillObject,
    ...typography.bodyM,
    color: 'transparent',
    paddingTop: spacing.xs,
    paddingHorizontal: 0,
    paddingBottom: spacing.base,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
  },
  liveMarkdownParagraph: {
    ...typography.bodyM,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xs,
  },
  liveMarkdownBold: {
    fontWeight: '700',
  },
  liveMarkdownItalic: {
    fontStyle: 'italic',
  },
  liveMarkdownUnderline: {
    textDecorationLine: 'underline',
  },
  liveMarkdownStrike: {
    textDecorationLine: 'line-through',
  },
  liveMarkdownLink: {
    color: colors.brand.primary,
    textDecorationLine: 'underline',
  },
  liveMarkdownHeading1: {
    ...typography.titleL,
    color: colors.semantic.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  liveMarkdownHeading2: {
    ...typography.titleM,
    color: colors.semantic.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  liveMarkdownHeading3: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  liveMarkdownFontIncrease: {
    fontSize: typography.titleL.fontSize,
    lineHeight: typography.titleL.lineHeight,
    fontWeight: '700',
  },
  liveMarkdownFontDecrease: {
    fontSize: typography.bodyS.fontSize,
    lineHeight: typography.bodyS.lineHeight,
  },
  liveMarkdownInlineHeading: {
    fontWeight: '700',
  },
  liveMarkdownIndented: {
    paddingLeft: spacing.xl,
  },
  liveMarkdownCenter: {
    textAlign: 'center',
  },
  liveMarkdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.default,
    marginVertical: spacing.md,
  },
  liveMarkdownQuote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.divider.default,
    paddingLeft: spacing.sm,
    marginVertical: spacing.xs,
  },
  liveMarkdownList: {
    gap: spacing.xxs,
    marginVertical: spacing.xs,
  },
  liveMarkdownListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  liveMarkdownListMarker: {
    width: 30,
    color: colors.semantic.text.secondary,
  },
  liveMarkdownListText: {
    flex: 1,
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
    backgroundColor: colors.brand.primary + '1A',
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
    color: colors.brand.primary,
  },
})

export default styles
