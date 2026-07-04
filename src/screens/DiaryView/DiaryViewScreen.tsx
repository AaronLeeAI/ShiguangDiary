/**
 * DiaryView Screen - 日记详情页
 *
 * 数据源：useDiaryStore
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
import {useDiaryStore} from '@store/diaryStore';

import {styles} from './styles';
import type {DiaryViewScreenProps} from './types';

export const DiaryViewScreen: React.FC<DiaryViewScreenProps> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {id} = route.params;
  const diary = useDiaryStore(s => s.diaries.find(d => d.id === id));
  const initialized = useDiaryStore(s => s.initialized);
  const init = useDiaryStore(s => s.init);
  const togglePin = useDiaryStore(s => s.togglePin);
  const removeDiary = useDiaryStore(s => s.removeDiary);
  const [unlocked, setUnlocked] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    navigation.replace(ROUTES.DIARY_EDIT, {id});
  }, [id, navigation]);

  const handleTogglePin = useCallback(async () => {
    await togglePin(id);
    toast.success(diary?.isPinned ? '已取消置顶' : '已置顶');
  }, [id, diary?.isPinned, togglePin]);

  const handleDelete = useCallback(async () => {
    await removeDiary(id);
    toast.success('已删除');
    setTimeout(() => navigation.goBack(), 400);
  }, [id, removeDiary, navigation]);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    toast.success('已解锁');
  }, []);

  if (!initialized || !diary) {
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

        {!!diary.title && <Text style={styles.title}>{diary.title}</Text>}

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
          {key: 'delete', label: '删除', icon: 'trash', destructive: true, onPress: handleDelete},
        ]}
      />
    </View>
  );
};

export default DiaryViewScreen;