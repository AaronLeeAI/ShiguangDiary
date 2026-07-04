/**
 * DiaryView Screen - 日记详情页
 *
 * 从 DiaryCard 点击进入，展示单条日记完整内容。
 *
 * 整合组件：
 * - TopBar：返回 + 更多
 * - ActionSheet：更多操作（编辑/分享/删除等）
 * - PrimaryButton：解锁加密日记
 * - Toast：操作反馈
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ActionSheet} from '@/components/ActionSheet';
import {Icon} from '@/components/Icon';
import {Loading} from '@/components/Loading';
import {PrimaryButton} from '@/components/PrimaryButton';
import {TopBar} from '@/components/TopBar';
import {toast} from '@/components/Toast';
import {ROUTES} from '@constants/routes';
import {colors, spacing} from '@theme';
import type {Diary} from '@types';

import {styles} from './styles';
import type {DiaryViewScreenProps} from './types';

const MOCK_DIARY: Diary = {
  id: '1',
  notebookId: 'nb-1',
  title: '今天天气真好',
  summary: '下午和朋友们去公园散步，看到了盛开的樱花，心情非常愉快。',
  content:
    '今天下午和朋友们约着去朝阳公园走走。刚到门口就闻到了花香，原来是樱花开了。\n\n粉白色的花瓣在阳光下透出淡淡的粉色，风一吹就飘落下来，像下了一场樱花雨。\n\n我们在草坪上铺了野餐垫，晒着太阳聊天。小朋友们在旁边放风筝，笑声很清脆。\n\n突然觉得，能这样无拘无束地度过一个下午，真是一件幸福的事情。',
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
};

/**
 * DiaryViewScreen 组件
 */
export const DiaryViewScreen: React.FC<DiaryViewScreenProps> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {id} = route.params;
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setDiary(MOCK_DIARY);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    if (!diary) return;
    navigation.replace(ROUTES.DIARY_EDIT, {id: diary.id});
  }, [diary, navigation]);

  const handleShare = useCallback(() => {
    toast.success('已生成分享图片');
  }, []);

  const handleTogglePin = useCallback(() => {
    toast.success(diary?.isPinned ? '已取消置顶' : '已置顶');
  }, [diary]);

  const handleDelete = useCallback(() => {
    toast.success('已移至回收站');
    setTimeout(() => navigation.goBack(), 500);
  }, [navigation]);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    toast.success('已解锁');
  }, []);

  if (loading || !diary) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <TopBar showBack onBackPress={handleBack} />
        <Loading variant="full" visible={true} />
      </View>
    );
  }

  const showFullContent = !diary.isEncrypted || unlocked;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar
        showBack
        onBackPress={handleBack}
        right={
          <Pressable hitSlop={12} onPress={() => setActionSheetVisible(true)} style={{padding: spacing.sm}}>
            <Icon name="more" size={22} color={colors.semantic.icon.primary} />
          </Pressable>
        }
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.date}>
            {diary.monthYear} {diary.timestamp}
          </Text>
          {(diary.isPinned || diary.isEncrypted) && (
            <View style={styles.badges}>
              {diary.isPinned && (
                <View style={styles.badge}>
                  <Icon name="bookmark" size={12} color={colors.semantic.text.secondary} />
                  <Text style={styles.badgeText}>已置顶</Text>
                </View>
              )}
              {diary.isEncrypted && (
                <View style={styles.badge}>
                  <Icon name="moon" size={12} color={colors.semantic.text.secondary} />
                  <Text style={styles.badgeText}>已加密</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 标题 */}
        {!!diary.title && <Text style={styles.title}>{diary.title}</Text>}

        {/* 内容 / 加密遮罩 */}
        {showFullContent ? (
          <Text style={styles.content}>{diary.content}</Text>
        ) : (
          <View style={styles.encryptedMask}>
            <View style={styles.encryptedIcon}>
              <Icon name="moon" size={48} color={colors.semantic.icon.tertiary} />
            </View>
            <Text style={styles.encryptedTitle}>这篇日记已加密</Text>
            <Text style={styles.encryptedHint}>请解锁后查看完整内容</Text>
            <PrimaryButton
              title="解锁"
              onPress={handleUnlock}
              variant="primary"
              size="medium"
              fullWidth={false}
            />
          </View>
        )}

        {/* 元信息 */}
        <View style={styles.meta}>
          {!!diary.weather && (
            <View style={styles.metaItem}>
              <Icon name="weather" size={16} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaText}>{diary.weather}</Text>
            </View>
          )}
          {!!diary.location && (
            <View style={styles.metaItem}>
              <Icon name="location" size={16} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaText}>{diary.location}</Text>
            </View>
          )}
          {!!diary.mood && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{diary.mood}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        items={[
          {key: 'edit', label: '编辑', icon: 'edit', onPress: handleEdit},
          {
            key: 'pin',
            label: diary.isPinned ? '取消置顶' : '置顶',
            icon: 'bookmark',
            onPress: handleTogglePin,
          },
          {key: 'share', label: '分享', icon: 'share', onPress: handleShare},
          {key: 'delete', label: '删除', icon: 'trash', destructive: true, onPress: handleDelete},
        ]}
      />
    </View>
  );
};

export default DiaryViewScreen;