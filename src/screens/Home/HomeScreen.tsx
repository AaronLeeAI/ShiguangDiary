/**
 * Home Screen - P001 首页（日记列表）
 *
 * 整合组件：
 * - TopBar：日期 + 标题 + 右侧菜单
 * - BottomTabBar：底部 4 Tab 切换
 * - DiaryCard：日记列表项
 * - EmptyState：空状态
 * - FloatingActionButton：新建入口
 * - Loading：加载态
 *
 * 当前实现：使用 mock 数据展示，后续接入数据库（src/database）。
 */

import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BottomTabBar} from '@/components/BottomTabBar';
import {DiaryCard} from '@/components/DiaryCard';
import {EmptyState} from '@/components/EmptyState';
import {FloatingActionButton} from '@/components/FloatingActionButton';
import {Icon} from '@/components/Icon';
import {Loading} from '@/components/Loading';
import {TopBar} from '@/components/TopBar';
import {ROUTES} from '@constants/routes';
import {colors, spacing} from '@theme';
import type {Diary} from '@types';

import {styles} from './styles';
import type {HomeScreenProps} from './types';

/** Mock 数据（待接入数据库） */
const MOCK_DIARIES: Diary[] = [
  {
    id: '1',
    notebookId: 'nb-1',
    title: '今天天气真好',
    summary: '下午和朋友们去公园散步，看到了盛开的樱花，心情非常愉快。',
    content: '',
    cover: null,
    weather: '晴',
    location: '北京·朝阳公园',
    mood: '😊',
    day: '04',
    monthYear: '07月·周四',
    timestamp: '14:30',
    isPinned: true,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: '2',
    notebookId: 'nb-1',
    title: '',
    summary: '项目进入关键阶段，团队加班到深夜，终于把核心功能跑通了。',
    content: '',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '03',
    monthYear: '07月·周三',
    timestamp: '23:15',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    deletedAt: null,
  },
  {
    id: '3',
    notebookId: 'nb-2',
    title: '深夜随想',
    summary: '有些事情过去就过去了，不必执着，也不必后悔。',
    content: '',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '02',
    monthYear: '07月·周二',
    timestamp: '01:20',
    isPinned: false,
    isEncrypted: true,
    isDraft: false,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    deletedAt: null,
  },
];

/**
 * HomeScreen 组件
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟加载（待接入数据库）
  useEffect(() => {
    const timer = setTimeout(() => {
      setDiaries(MOCK_DIARIES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleItemPress = useCallback(
    (item: Diary) => {
      navigation.navigate(ROUTES.DIARY_VIEW, {id: item.id});
    },
    [navigation],
  );

  const handleNewDiary = useCallback(() => {
    navigation.navigate(ROUTES.DIARY_EDIT, {});
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Home') return; // 已在首页
      navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
    },
    [navigation],
  );

  // 当前日期显示
  const today = new Date();
  const monthDay = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar
        title={monthDay}
        right={
          <View style={{flexDirection: 'row'}}>
            <Pressable hitSlop={12} style={{padding: spacing.sm}}>
              <Icon name="search" size={22} color={colors.semantic.icon.primary} />
            </Pressable>
            <Pressable hitSlop={12} style={{padding: spacing.sm}}>
              <Icon name="more" size={22} color={colors.semantic.icon.primary} />
            </Pressable>
          </View>
        }
      />

      <View style={styles.body}>
        {loading ? (
          <Loading variant="full" visible={loading} />
        ) : diaries.length === 0 ? (
          <EmptyState variant="noDiaryToday" />
        ) : (
          <FlatList
            data={diaries}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <DiaryCard item={item} onPress={() => handleItemPress(item)} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FloatingActionButton onPress={handleNewDiary} />

      <BottomTabBar currentTab="Home" onTabPress={handleTabPress} />
    </View>
  );
};

export default HomeScreen;