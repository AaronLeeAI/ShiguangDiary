/**
 * Home Screen - P001 首页（日记列表）
 *
 * 数据源：useDiaryStore（Zustand）
 */

import React, {useCallback, useEffect, useMemo} from 'react';
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
import {useDiaryStore} from '@store/diaryStore';

import {styles} from './styles';
import type {HomeScreenProps} from './types';

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const diaries = useDiaryStore(s => s.diaries);
  const initialized = useDiaryStore(s => s.initialized);
  const loading = useDiaryStore(s => s.loading);
  const init = useDiaryStore(s => s.init);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.DIARY_VIEW, {id});
    },
    [navigation],
  );

  const handleNewDiary = useCallback(() => {
    navigation.navigate(ROUTES.DIARY_EDIT, {});
  }, [navigation]);

  const handleOpenSearch = useCallback(() => {
    navigation.navigate(ROUTES.SEARCH);
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Home') return;
      navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
    },
    [navigation],
  );

  const today = new Date();
  const monthDay = useMemo(
    () => `${today.getMonth() + 1}月${today.getDate()}日`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar
        title={monthDay}
        right={
          <View style={{flexDirection: 'row'}}>
            <Pressable hitSlop={12} onPress={handleOpenSearch} style={{padding: spacing.sm}}>
              <Icon name="search" size={22} color={colors.semantic.icon.primary} />
            </Pressable>
            <Pressable hitSlop={12} style={{padding: spacing.sm}}>
              <Icon name="more" size={22} color={colors.semantic.icon.primary} />
            </Pressable>
          </View>
        }
      />

      <View style={styles.body}>
        {loading || !initialized ? (
          <Loading variant="full" visible={true} />
        ) : diaries.length === 0 ? (
          <EmptyState variant="noDiaryToday" />
        ) : (
          <FlatList
            data={diaries}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <DiaryCard item={item} onPress={() => handleItemPress(item.id)} />
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