/**
 * Album Screen 类型定义
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, TabParamList } from '@navigation/types'
import type { Album } from '@types'

export type AlbumNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Album'>,
  NativeStackNavigationProp<RootStackParamList>
>

export interface AlbumScreenProps {
  navigation: AlbumNavigationProp
  route: RouteProp<TabParamList, 'Album'>
}

export type { Album }
