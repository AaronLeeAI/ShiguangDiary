/**
 * Avatar 样式
 *
 * 颜色/间距/圆角必须通过 @theme 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, colors } from '@theme'

import { AVATAR_SIZE } from './types'
import type { AvatarSize } from './types'

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: AVATAR_SIZE.medium,
    height: AVATAR_SIZE.medium,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray10,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textInitial: {
    fontWeight: '600',
    color: colors.semantic.text.secondary,
    fontSize: 18,
  },
  square: {
    borderRadius: 8,
  },
  fallback: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand.primary,
    borderWidth: 2,
    borderColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: colors.neutral.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
})

export const avatarSizeStyle = (size: AvatarSize | number) => ({
  width: typeof size === 'number' ? size : AVATAR_SIZE[size],
  height: typeof size === 'number' ? size : AVATAR_SIZE[size],
})

export default styles
