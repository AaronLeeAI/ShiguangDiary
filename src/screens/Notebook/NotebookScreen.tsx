/**
 * Notebook Screen - P002 日记本列表
 *
 * 整合组件：
 * - TopBar：标题"日记本" + 右侧排序图标
 * - DiaryBookCard：日记本卡片
 * - EmptyState（notebook 变体）：空状态
 * - FloatingActionButton：新建日记本入口
 * - BottomTabBar
 *
 * 当前使用 mock 数据，后续接入数据库。
 */

import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BottomTabBar} from '@/components/BottomTabBar';
import {DiaryBookCard} from '@/components/DiaryBookCard';
import {EmptyState} from '@/components/EmptyState';
import {FloatingActionButton} from '@/components/FloatingActionButton';
import {Icon} from '@/components/Icon';
import {Loading} from '@/components/Loading';
import {TopBar} from '@/components/TopBar';
import {ROUTES} from '@constants/routes';
import {colors, spacing} from '@theme';
import type {Notebook} from '@types';

import {styles} from './styles';
import type {NotebookScreenProps} from './types';

const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-1',
    name: '生活随笔',
    description: '记录日常点滴',
    cover: null,
    color: '#1AAD66',
    sortOrder: 0,
    diaryCount: 24,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: 'nb-2',
    name: '工作思考',
    description: '产品设计、技术学习',
    cover: null,
    color: '#1488EE',
    sortOrder: 1,
    diaryCount: 18,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 172800000,
    deletedAt: null,
  },
  {
    id: 'nb-3',
    name: '旅行回忆',
    description: '2025年所有的远方',
    cover: null,
    color: '#FFB400',
    sortOrder: 2,
    diaryCount: 7,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    deletedAt: null,
  },
];

/**
 * NotebookScreen 组件
 */
export const NotebookScreen: React.FC<NotebookScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotebooks(MOCK_NOTEBOOKS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleItemPress = useCallback(
    (item: Notebook) => {
      // 暂时 toast，后续跳转到 NotebookDetail
      // navigation.navigate('NotebookDetail', {id: item.id});
      console.log('open notebook:', item.id);
    },
    [],
  );

  const handleItemLongPress = useCallback((item: Notebook) => {
    console.log('long press notebook:', item.id);
  }, []);

  const handleNew = useCallback(() => {
    navigation.navigate(ROUTES.NOTEBOOK_CREATE);
  }, [navigation]);

  const handleSort = useCallback(() => {
    console.log('sort notebooks');
  }, []);

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Notebook') return;
      navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
    },
    [navigation],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar
        title="日记本"
        right={
          <Pressable hitSlop={12} onPress={handleSort} style={{padding: spacing.sm}}>
            <Icon name="tune" size={22} color={colors.semantic.icon.primary} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        {loading ? (
          <Loading variant="full" visible={loading} />
        ) : notebooks.length === 0 ? (
          <EmptyState
            variant="notebook"
            actionLabel="新建日记本"
            onAction={handleNew}
          />
        ) : (
          <FlatList
            data={notebooks}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <DiaryBookCard
                item={item}
                onPress={() => handleItemPress(item)}
                onLongPress={() => handleItemLongPress(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FloatingActionButton onPress={handleNew} />

      <BottomTabBar currentTab="Notebook" onTabPress={handleTabPress} />
    </View>
  );
};

export default NotebookScreen;