/**
 * Notebook Screen 类型定义
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, TabParamList } from '@navigation/types'
import type { Notebook } from '@types'

export type NotebookNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Notebook'>,
  NativeStackNavigationProp<RootStackParamList>
>

export interface NotebookScreenProps {
  navigation: NotebookNavigationProp
  route: RouteProp<TabParamList, 'Notebook'>
}

export type { Notebook }
