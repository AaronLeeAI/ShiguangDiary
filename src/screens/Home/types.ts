/**
 * Home Screen 类型定义
 *
 * P001 首页（日记列表）的 Props。
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, TabParamList } from '@navigation/types'
import type { Diary } from '@types'

export type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>

export interface HomeScreenProps {
  navigation: HomeNavigationProp
  route: RouteProp<TabParamList, 'Home'>
}

export type { Diary }
