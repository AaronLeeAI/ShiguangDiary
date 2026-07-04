/**
 * Loading 类型定义
 *
 * 基于设计规范 docs/project-设计-docs/components/Loading.md
 *
 * 三种形态：
 * - full：全屏（P001 开屏 + 内容加载）
 * - dialog：弹窗（会员中心加载等）
 * - inline：内联（按钮内或固定区域）
 */
import type {StyleProp, ViewStyle} from 'react-native';

export type LoadingVariant = 'full' | 'dialog' | 'inline';

export interface LoadingProps {
  /** 加载变体 */
  variant: LoadingVariant;
  /** 是否显示 */
  visible: boolean;
  /** 提示文案（dialog/full 可选） */
  text?: string;
  /** 弧形旋转图标尺寸 */
  iconSize?: number;
  /** 弹窗点击背景是否关闭 */
  backdropDismiss?: boolean;
  /** 关闭回调（仅 dialog + backdropDismiss） */
  onDismiss?: () => void;
  /** 外部容器样式 */
  style?: StyleProp<ViewStyle>;
  /** 测试 ID */
  testID?: string;
}
