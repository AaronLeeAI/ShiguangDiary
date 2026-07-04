/**
 * Profile Screen 类型定义
 */

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import type {IconName} from '@/components/Icon';

export type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export interface ProfileScreenProps {
  navigation: ProfileNavigationProp;
  route?: RouteProp<RootStackParamList, 'Profile'>;
}

/** 单个设置项 */
export interface ProfileMenuItem {
  key: string;
  label: string;
  icon: IconName;
  /** 右侧副文本（如数量、状态） */
  hint?: string;
  /** 点击跳转（路由名） */
  route?: keyof RootStackParamList;
  /** 是否显示右侧箭头 */
  showArrow?: boolean;
  /** 自定义点击 */
  onPress?: () => void;
  /** 危险项（红色） */
  destructive?: boolean;
}