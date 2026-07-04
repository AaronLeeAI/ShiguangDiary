/**
 * EditorToolbar 类型定义
 *
 * 编辑器底部工具栏。横向滚动按钮组，支持工具激活态。
 */

import type {ViewStyle} from 'react-native';
import type {IconName} from '@/components/Icon';

/** 工具名 */
export type EditorTool =
  // 格式化
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'quote'
  // 媒体
  | 'image'
  | 'mic'
  | 'link'
  // 元信息
  | 'location'
  | 'weather'
  | 'mood'
  // 其他
  | 'tag'
  | 'lock';

/** 单个工具按钮配置 */
export interface EditorToolItem {
  /** 工具名 */
  tool: EditorTool;
  /** 图标 */
  icon: IconName;
  /** 显示文案（用于无障碍） */
  label: string;
}

/** 默认工具集（按视觉顺序） */
export const DEFAULT_EDITOR_TOOLS: EditorToolItem[] = [
  {tool: 'bold', icon: 'bold', label: '粗体'},
  {tool: 'italic', icon: 'italic', label: '斜体'},
  {tool: 'underline', icon: 'underline', label: '下划线'},
  {tool: 'strikethrough', icon: 'strikethrough', label: '删除线'},
  {tool: 'quote', icon: 'quote', label: '引用'},
  {tool: 'image', icon: 'image', label: '图片'},
  {tool: 'mic', icon: 'mic', label: '录音'},
  {tool: 'link', icon: 'link', label: '链接'},
  {tool: 'location', icon: 'location', label: '位置'},
  {tool: 'weather', icon: 'weather', label: '天气'},
  {tool: 'mood', icon: 'flag', label: '心情'},
  {tool: 'tag', icon: 'tag', label: '标签'},
  {tool: 'lock', icon: 'moon', label: '加密'},
];

export interface EditorToolbarProps {
  /** 工具点击回调 */
  onToolPress?: (tool: EditorTool) => void;
  /** 当前激活的工具（用于显示选中态） */
  activeTools?: EditorTool[];
  /** 自定义工具列表 */
  tools?: EditorToolItem[];
  /** 测试 ID */
  testID?: string;
  /** 容器样式 */
  style?: ViewStyle;
}