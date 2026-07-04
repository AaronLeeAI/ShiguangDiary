/**
 * Loading 样式
 *
 * 颜色/间距/圆角必须通过 @theme 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, colors } from '@theme'

export const styles = StyleSheet.create({
  // 全屏容器
  fullContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.bg.canvas,
    paddingHorizontal: 24,
  },

  // 弹窗容器
  dialogBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.semantic.bg.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogBox: {
    minWidth: 180,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.semantic.bg.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialogText: {
    marginLeft: 12,
    fontSize: 17,
    color: colors.semantic.text.primary,
  },

  // 共享
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.semantic.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: colors.semantic.text.tertiary,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // 弧形旋转（dialog）
  arcWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
