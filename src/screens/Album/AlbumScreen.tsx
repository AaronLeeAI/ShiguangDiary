/**
 * Album Screen - P003 相册列表
 *
 * 整合组件：
 * - TopBar：标题"相册"
 * - AlbumCard：2 列网格
 * - EmptyState（album 变体）：空状态
 * - FloatingActionButton：新建相册入口
 * - BottomTabBar
 *
 * 当前使用 mock 数据。
 */

import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {AlbumCard} from '@/components/AlbumCard';
import {BottomTabBar} from '@/components/BottomTabBar';
import {EmptyState} from '@/components/EmptyState';
import {FloatingActionButton} from '@/components/FloatingActionButton';
import {Loading} from '@/components/Loading';
import {TopBar} from '@/components/TopBar';
import {ROUTES} from '@constants/routes';
import type {Album} from '@types';

import {styles} from './styles';
import type {AlbumScreenProps} from './types';

const MOCK_ALBUMS: Album[] = [
  {
    id: 'al-1',
    name: '樱花季',
    description: '2025 年春天',
    cover: null,
    diaryIds: ['d1', 'd2', 'd3', 'd4'],
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: 'al-2',
    name: '夏日海边',
    description: null,
    cover: null,
    diaryIds: ['d5', 'd6'],
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    deletedAt: null,
  },
  {
    id: 'al-3',
    name: '深夜咖啡',
    description: null,
    cover: null,
    diaryIds: ['d7'],
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
    deletedAt: null,
  },
  {
    id: 'al-4',
    name: '远方',
    description: '那些去过和将去的地方',
    cover: null,
    diaryIds: ['d8', 'd9', 'd10', 'd11', 'd12'],
    createdAt: Date.now() - 120 * 86400000,
    updatedAt: Date.now() - 21 * 86400000,
    deletedAt: null,
  },
];

/**
 * AlbumScreen 组件
 */
export const AlbumScreen: React.FC<AlbumScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlbums(MOCK_ALBUMS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleItemPress = useCallback((item: Album) => {
    console.log('open album:', item.id);
  }, []);

  const handleItemLongPress = useCallback((item: Album) => {
    console.log('long press album:', item.id);
  }, []);

  const handleNew = useCallback(() => {
    navigation.navigate(ROUTES.ALBUM_CREATE);
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Album') return;
      navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
    },
    [navigation],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar title="相册" />

      <View style={styles.body}>
        {loading ? (
          <Loading variant="full" visible={loading} />
        ) : albums.length === 0 ? (
          <EmptyState
            variant="album"
            actionLabel="新建相册"
            onAction={handleNew}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.gridContent}>
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                item={album}
                onPress={() => handleItemPress(album)}
                onLongPress={() => handleItemLongPress(album)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <FloatingActionButton onPress={handleNew} />

      <BottomTabBar currentTab="Album" onTabPress={handleTabPress} />
    </View>
  );
};

export default AlbumScreen;