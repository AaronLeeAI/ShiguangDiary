/**
 * Album Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Album} from '@types';

export type AlbumNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Album'>;

export interface AlbumScreenProps {
  navigation: AlbumNavigationProp;
  route?: RouteProp<RootStackParamList, 'Album'>;
}

export type {Album};