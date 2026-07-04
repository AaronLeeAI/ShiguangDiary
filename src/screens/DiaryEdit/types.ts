/**
 * DiaryEdit Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Diary} from '@types';

export type DiaryEditNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiaryEdit'>;

export interface DiaryEditScreenProps {
  navigation: DiaryEditNavigationProp;
  route: RouteProp<RootStackParamList, 'DiaryEdit'>;
}

export type {Diary};