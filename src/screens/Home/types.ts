/**
 * Home Screen 类型定义
 *
 * P001 首页（日记列表）的 Props。
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Diary} from '@types';

export type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export interface HomeScreenProps {
  navigation: HomeNavigationProp;
  route?: RouteProp<RootStackParamList, 'Home'>;
}

export type {Diary};