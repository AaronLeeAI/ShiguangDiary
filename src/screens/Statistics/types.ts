/**
 * Statistics Screen - 类型定义
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@navigation/types'

export type StatisticsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Statistics'>

export interface StatisticsScreenProps {
  navigation: StatisticsNavigationProp
  route: RouteProp<RootStackParamList, 'Statistics'>
}
