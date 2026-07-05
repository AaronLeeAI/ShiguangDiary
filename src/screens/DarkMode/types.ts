/**
 * DarkMode Screen 类型定义
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@navigation/types'

export type DarkModeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DarkMode'>

export interface DarkModeScreenProps {
  navigation: DarkModeNavigationProp
  route: RouteProp<RootStackParamList, 'DarkMode'>
}
