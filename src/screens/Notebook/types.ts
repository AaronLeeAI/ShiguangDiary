/**
 * Notebook Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {Notebook} from '@types';

export type NotebookNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notebook'>;

export interface NotebookScreenProps {
  navigation: NotebookNavigationProp;
  route?: RouteProp<RootStackParamList, 'Notebook'>;
}

export type {Notebook};