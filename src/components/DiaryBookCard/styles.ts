/**
 * DiaryBookCard 样式
 */
import {StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '@theme';

export const DIARY_BOOK_COVER_DEFAULT_COLORS = [
  '#1AAD66', // 品牌绿
  '#1488EE', // info
  '#FA5151', // danger
  '#FF8800', // warning
  '#A259FF', // 紫
  '#FFB400', // 金
] as const;

export const DIARY_BOOK_SIZE = 96; // 封面方形尺寸

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    backgroundColor: colors.semantic.bg.subtle,
  },
  cover: {
    width: DIARY_BOOK_SIZE,
    height: DIARY_BOOK_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  coverInitial: {
    ...typography.titleXL,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: DIARY_BOOK_SIZE,
  },
  name: {
    ...typography.titleM,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xxs,
  },
  description: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.text.tertiary,
  },
});

export default styles;