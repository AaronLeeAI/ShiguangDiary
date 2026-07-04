/**
 * EmptyState 样式
 *
 * 颜色/间距/圆角必须通过 @theme 访问，禁止硬编码。
 *
 * 视觉规范（参考 docs/project-设计-docs/components/EmptyState.md）：
 * - 沙漏图标容器：120x120dp 白色圆形 + 淡阴影
 * - 沙漏图标：绿色 #1AAD66
 * - 标题：titleS (18sp medium)
 * - 副标题：bodyM (15sp)
 * - 居中展示，距顶约 35% 屏幕高度
 */
import {StyleSheet} from 'react-native';
import {radius, colors, shadow} from '@theme';

import type {EmptyStateVariant} from './types';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '35%' as unknown as number, // 设计稿：距顶 35% 屏幕高度
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadow.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.semantic.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
  },
});

export const VARIANT_ICON_SIZE: Record<EmptyStateVariant, number> = {
  notebook: 56,
  album: 56,
  noDiaryToday: 40,
  noDraft: 48,
  search: 48,
  custom: 56,
};

export default styles;
