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
    zIndex: 0,
  },
  liveImageInteractionScroller: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
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
    zIndex: 1,
    color: 'transparent',
    paddingTop: spacing.xs,
    paddingHorizontal: 0,
    paddingBottom: spacing.base,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
  },
  contentInputBold: {
    fontWeight: '700',
  },
  contentInputItalic: {
    fontStyle: 'italic',
  },
  contentInputCenter: {
    textAlign: 'center',
  },
  contentInputQuoteOffset: {
    paddingLeft: spacing.sm + 3,
  },
  contentInputIndentOffset: {
    paddingLeft: spacing.xl,
  },
  contentInputListOffset: {
    paddingLeft: 30,
  },
  contentInputListIndentOffset: {
    paddingLeft: 30 + spacing.xl,
  },
  liveMarkdownParagraph: {
    ...typography.bodyM,
    color: colors.semantic.text.primary,
  },
  liveMarkdownBold: {
    fontWeight: '700',
  },
  liveMarkdownItalic: {
    fontStyle: 'italic',
    transform: [{ skewX: '-8deg' }],
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
  liveMarkdownIndented: {
    paddingLeft: spacing.xl,
  },
  liveMarkdownCenter: {
    textAlign: 'center',
  },
  liveMarkdownDividerRow: {
    height: typography.bodyM.lineHeight,
    justifyContent: 'center',
  },
  liveMarkdownImageBlock: {
    width: '100%',
    alignSelf: 'stretch',
    height: 168,
    overflow: 'hidden',
    marginVertical: spacing.xs,
    backgroundColor: colors.semantic.bg.subtle,
  },
  liveMarkdownImage: {
    width: '100%',
    height: '100%',
  },
  liveMarkdownImagePreviewPlaceholder: {
    opacity: 0,
  },
  liveMarkdownImageTouchBlock: {
    width: '100%',
  },
  liveMarkdownImageTailTouchBlock: {
    width: '100%',
    minHeight: 280,
  },
  liveMarkdownImageTouchBlockPressed: {
    opacity: 0.92,
  },
  liveMarkdownInteractionPlaceholder: {
    opacity: 0,
  },
  liveMarkdownImageCaretLine: {
    minHeight: typography.bodyM.lineHeight,
    justifyContent: 'center',
  },
  imagePreviewModal: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  imagePreviewViewer: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  imagePreviewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    minHeight: 86,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewIndicator: {
    ...typography.bodyM,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  imagePreviewCloseButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  imagePreviewCloseText: {
    color: colors.neutral.white,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },
  imageActionDialogBackdrop: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.bg.scrim,
  },
  imageActionDialogCard: {
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.semantic.bg.card,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  imageActionDialogTitle: {
    ...typography.titleS,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    color: colors.semantic.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  imageActionDialogDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
    backgroundColor: colors.semantic.divider.subtle,
  },
  imageActionDialogItem: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageActionDialogItemPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  imageActionDialogIconSlot: {
    width: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  imageActionDialogLabel: {
    ...typography.bodyM,
    flex: 1,
    color: colors.semantic.text.primary,
  },
  imageActionDialogLabelDestructive: {
    color: colors.func.danger,
  },
  imageActionDialogCancelSeparator: {
    height: spacing.xs,
    backgroundColor: colors.semantic.bg.subtle,
  },
  imageActionDialogCancelButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActionDialogCancelLabel: {
    ...typography.bodyM,
    color: colors.semantic.text.secondary,
    fontWeight: '600',
  },
  liveMarkdownFakeCaret: {
    width: 2,
    height: typography.bodyM.lineHeight - 4,
    borderRadius: 1,
    backgroundColor: colors.neutral.black,
  },
  liveMarkdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.default,
  },
  liveMarkdownQuote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.semantic.divider.default,
    paddingLeft: spacing.sm,
    marginVertical: 0,
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
  liveMarkdownUnorderedMarker: {
    textAlign: 'center',
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
  infoBlockCompact: {
    minHeight: 38,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 6,
  },
  infoRowPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  infoRowDisabled: {
    opacity: 0.72,
  },
  infoText: {
    flex: 1,
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  infoCompactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoCompactText: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyButton: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  historyButtonPressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  historyButtonDisabled: {
    opacity: 0.45,
  },
  historyButtonText: {
    ...typography.bodyM,
    color: colors.neutral.gray50,
    fontWeight: '600',
  },
  historyButtonTextDisabled: {
    color: colors.semantic.text.tertiary,
  },
  toolbar: {
    backgroundColor: colors.semantic.bg.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.semantic.divider.subtle,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },
  toolbarContent: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: spacing.xxs,
  },
  toolbarButton: {
    width: 34,
    height: 34,
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
