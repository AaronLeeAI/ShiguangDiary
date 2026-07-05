/**
 * About Screen 类型定义
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@navigation/types'

export type AboutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'About'>

export interface AboutScreenProps {
  navigation: AboutNavigationProp
  route: RouteProp<RootStackParamList, 'About'>
}
