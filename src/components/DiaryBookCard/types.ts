/**
 * DiaryBookCard 类型定义
 *
 * 日记本卡片：在 Notebook 页面展示一个日记本。
 */

import type { ViewStyle } from 'react-native'
import type { Notebook } from '@types'

export interface DiaryBookCardProps {
  /** 日记本数据 */
  item: Notebook
  /** 点击回调（进入日记本内页） */
  onPress?: () => void
  /** 长按回调（弹出 ActionSheet：编辑/排序/删除） */
  onLongPress?: () => void
  /** 自定义封面颜色（覆盖 item.color） */
  coverColor?: string
  /** 容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
