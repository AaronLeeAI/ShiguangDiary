/**
 * DiaryView Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Diary} from '@types';

export type DiaryViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiaryView'>;

export interface DiaryViewScreenProps {
  navigation: DiaryViewNavigationProp;
  route: RouteProp<RootStackParamList, 'DiaryView'>;
}

export type {Diary};