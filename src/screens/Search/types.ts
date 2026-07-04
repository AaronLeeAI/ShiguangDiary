/**
 * Search Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Diary} from '@types';

export type SearchNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export interface SearchScreenProps {
  navigation: SearchNavigationProp;
  route?: RouteProp<RootStackParamList, 'Search'>;
}

export type {Diary};