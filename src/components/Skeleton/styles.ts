/**
 * Skeleton styles.
 *
 * Colors, radius, and spacing must come from `@theme` design tokens.
 */
import { StyleSheet } from 'react-native'
import { colors, radius, spacing } from '@theme'

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.neutral.gray10,
  },
  line: {
    borderRadius: radius.full,
  },
  circle: {
    borderRadius: radius.full,
  },
  card: {
    padding: spacing.base,
    borderRadius: radius.lg,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: colors.neutral.white,
    opacity: 0.45,
  },
})

export default styles
