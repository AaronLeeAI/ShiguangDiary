/**
 * Profile Screen 类型定义
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, TabParamList } from '@navigation/types'
import type { IconName } from '@/components/Icon'

export type ProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>

export interface ProfileScreenProps {
  navigation: ProfileNavigationProp
  route: RouteProp<TabParamList, 'Profile'>
}

/** 单个设置项 */
export interface ProfileMenuItem {
  key: string
  label: string
  icon: IconName
  /** 右侧副文本（如数量、状态） */
  hint?: string
  /** 点击跳转（路由名） */
  route?: keyof RootStackParamList
  /** 是否显示右侧箭头 */
  showArrow?: boolean
  /** 自定义点击 */
  onPress?: () => void
  /** 危险项（红色） */
  destructive?: boolean
}
