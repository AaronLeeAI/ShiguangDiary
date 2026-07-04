/**
 * AlbumCard 样式
 */
import {StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '@theme';

export const ALBUM_COVER_SIZE = 144;

export const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.base,
  },
  pressed: {
    opacity: 0.7,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.semantic.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  coverIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  count: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
  },
});

export default styles;