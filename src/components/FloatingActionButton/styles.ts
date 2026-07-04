/**
 * FloatingActionButton 样式
 */
import {StyleSheet} from 'react-native';
import {colors, radius} from '@theme';

export const FAB_SIZE = {
  small: 40,
  medium: 48,
  large: 56,
} as const;

export const FAB_ICON_SIZE = {
  small: 20,
  medium: 24,
  large: 28,
} as const;

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 88, // 底部 TabBar 之上留出空间
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    // shadow.lg
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  containerDanger: {
    backgroundColor: colors.func.danger,
  },
  containerDisabled: {
    opacity: 0.5,
  },
});

export default styles;