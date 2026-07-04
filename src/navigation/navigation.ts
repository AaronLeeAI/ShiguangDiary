/**
 * 导航工具函数
 *
 * 提供统一的导航操作封装。
 */

import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

import {RootStackParamList, TabParamList} from './types';
import {ROUTES} from '@constants/routes';

// 导航类型定义
export type AppStackNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

export type AppTabNavigationProp<T extends keyof TabParamList> =
  BottomTabNavigationProp<TabParamList, T>;

export type AppCompositeNavigationProp<T extends keyof RootStackParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList, T>,
    BottomTabNavigationProp<TabParamList>
  >;

/**
 * 导航操作封装
 */
export const nav = {
  /**
   * 跳转到指定 Tab
   * @example navigation.navigate(ROUTES.MAIN_TABS, {screen: 'Home'})
   */
  goToTab: (navigation: {navigate: (name: string, params?: any) => void}, tab: keyof TabParamList) => {
    navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
  },

  /** 返回 */
  goBack: (navigation: {goBack: () => void}) => {
    navigation.goBack();
  },

  /** 替换当前页面 */
  replace: <T extends keyof RootStackParamList>(
    navigation: {replace: (name: T, params?: RootStackParamList[T]) => void},
    route: T,
    params?: RootStackParamList[T],
  ) => {
    navigation.replace(route, params);
  },

  /** 打开 Modal */
  openModal: <T extends keyof RootStackParamList>(
    navigation: {navigate: (name: T, params?: RootStackParamList[T]) => void},
    modalType: T,
    props?: RootStackParamList[T],
  ) => {
    navigation.navigate(ROUTES.MODAL, {type: modalType, props});
  },
} as const;

/** 检查当前是否在 Tab 页面 */
export const isTabScreen = (routeName: string): boolean => {
  const tabs = [ROUTES.HOME, ROUTES.NOTEBOOK, ROUTES.ALBUM, ROUTES.PROFILE];
  return tabs.includes(routeName as any);
};

/** 检查当前是否在 Modal 页面 */
export const isModalScreen = (routeName: string): boolean => {
  const modals = [
    ROUTES.DIARY_VIEW,
    ROUTES.DIARY_EDIT,
    ROUTES.NOTEBOOK_CREATE,
    ROUTES.NOTEBOOK_SORT,
    ROUTES.ALBUM_CREATE,
    ROUTES.ACCOUNT,
    ROUTES.ABOUT,
    ROUTES.RECYCLE,
    ROUTES.DARK_MODE,
    ROUTES.EXPORT,
    ROUTES.STATISTICS,
    ROUTES.DRAFTS,
    ROUTES.PREFERENCES,
  ];
  return modals.includes(routeName as any);
};