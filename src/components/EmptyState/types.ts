/**
 * EmptyState 类型定义
 *
 * 基于设计规范 docs/project-设计-docs/components/EmptyState.md
 *
 * 5 种预设变体 + 1 种自定义：
 * - notebook | album | noDiaryToday | noDraft | search | custom
 */
import type {ReactNode} from 'react';

export type EmptyStateVariant =
  | 'notebook'
  | 'album'
  | 'noDiaryToday'
  | 'noDraft'
  | 'search'
  | 'custom';

export interface EmptyStateConfig {
  title: string;
  subtitle?: string;
}

export const EMPTY_STATE_PRESETS: Record<Exclude<EmptyStateVariant, 'custom'>, EmptyStateConfig> = {
  notebook: {
    title: '没有属于自己的日记本',
    subtitle: '赶紧点击右上角的加号创建吧',
  },
  album: {
    title: '没有属于自己的相册',
    subtitle: '赶紧点击右上角的加号创建吧',
  },
  noDiaryToday: {
    title: '没有记录内容',
  },
  noDraft: {
    title: '草稿箱空空如也',
    subtitle: '已保存的草稿会自动显示在这里',
  },
  search: {
    title: '没有找到相关日记',
    subtitle: '试试别的关键词',
  },
};

export interface EmptyStateProps {
  /** 变体预设 */
  variant: EmptyStateVariant;
  /** 自定义标题（custom 必填，其余覆盖预设） */
  title?: string;
  /** 自定义副标题 */
  subtitle?: string;
  /** 自定义图标（custom 时显示） */
  customIcon?: ReactNode;
  /** 行动按钮文案 */
  actionLabel?: string;
  /** 行动按钮点击回调 */
  onAction?: () => void;
  /** 测试 ID */
  testID?: string;
}
