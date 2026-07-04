/**
 * Notebook Screen 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
  },
  body: {
    flex: 1,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md,
  },
})

export default styles
