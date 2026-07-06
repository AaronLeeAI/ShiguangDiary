/**
 * Album Screen - P003 相册列表
 *
 * 数据源：useDiaryStore
 */

import React, { useCallback, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AlbumCard } from '@/components/AlbumCard'
import { BottomTabBar } from '@/components/BottomTabBar'
import { EmptyState } from '@/components/EmptyState'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { Loading } from '@/components/Loading'
import { TopBar } from '@/components/TopBar'
import { ROUTES } from '@constants/routes'
import { useDiaryStore } from '@store/diaryStore'
import { toast } from '@/components/Toast'

import { styles } from './styles'
import type { AlbumScreenProps } from './types'

export const AlbumScreen: React.FC<AlbumScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const albums = useDiaryStore(s => s.albums)
  const initialized = useDiaryStore(s => s.initialized)
  const loading = useDiaryStore(s => s.loading)
  const init = useDiaryStore(s => s.init)
  const createAlbum = useDiaryStore(s => s.createAlbum)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.ALBUM_DETAIL, { id })
    },
    [navigation],
  )

  const handleItemLongPress = useCallback((id: string) => {
    toast.info(`长按相册: ${id}`)
  }, [])

  const handleNew = useCallback(async () => {
    try {
      const al = await createAlbum(`新相册 ${albums.length + 1}`)
      toast.success(`已创建: ${al.name}`)
    } catch (e) {
      toast.error('创建失败')
    }
  }, [createAlbum, albums.length])

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Album') {
        return
      }
      navigation.navigate(ROUTES.MAIN_TABS, { screen: tab })
    },
    [navigation],
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar title="相册" />

      <View style={styles.body}>
        {loading || !initialized ? (
          <Loading variant="full" visible={true} />
        ) : albums.length === 0 ? (
          <EmptyState variant="album" actionLabel="新建相册" onAction={handleNew} />
        ) : (
          <ScrollView contentContainerStyle={styles.gridContent}>
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                item={album}
                onPress={() => handleItemPress(album.id)}
                onLongPress={() => handleItemLongPress(album.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <FloatingActionButton onPress={handleNew} />

      <BottomTabBar currentTab="Album" onTabPress={handleTabPress} />
    </View>
  )
}

export default AlbumScreen
