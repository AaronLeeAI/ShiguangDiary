/**
 * Preferences Screen 类型定义
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '@navigation/types'

export type PreferencesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preferences'>

export interface PreferencesScreenProps {
  navigation: PreferencesNavigationProp
  route: RouteProp<RootStackParamList, 'Preferences'>
}
