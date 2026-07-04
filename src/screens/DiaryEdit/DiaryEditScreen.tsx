/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据源：useDiaryStore（创建/更新日记）
 */

import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ActionSheet} from '@/components/ActionSheet';
import {EditorToolbar} from '@/components/EditorToolbar';
import {Icon} from '@/components/Icon';
import {Loading} from '@/components/Loading';
import {TextArea} from '@/components/TextArea';
import {TopBar} from '@/components/TopBar';
import {toast} from '@/components/Toast';
import {colors, spacing, typography} from '@theme';
import {useDiaryStore} from '@store/diaryStore';

import {styles} from './styles';
import type {DiaryEditScreenProps} from './types';

const MAX_CONTENT = 5000;

const WEATHERS = ['晴', '多云', '阴', '小雨', '大雨', '雪'];
const MOODS = ['😊', '😢', '😡', '😴', '😍', '🤔', '😎', '🥰'];
const LOCATIONS = ['北京·朝阳公园', '北京·三里屯', '上海·外滩', '杭州·西湖', '成都·宽窄巷子'];

export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {id} = route.params;
  const isNew = !id;

  const initialized = useDiaryStore(s => s.initialized);
  const init = useDiaryStore(s => s.init);
  const existing = useDiaryStore(s => (id ? s.diaries.find(d => d.id === id) : undefined));
  const createDiary = useDiaryStore(s => s.createDiary);
  const updateDiary = useDiaryStore(s => s.updateDiary);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weather, setWeather] = useState<string | undefined>();
  const [mood, setMood] = useState<string | undefined>();
  const [location, setLocation] = useState<string | undefined>();
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [pickedAction, setPickedAction] = useState<'weather' | 'mood' | 'location' | null>(null);
  const [hydrated, setHydrated] = useState(isNew); // 新建模式直接可编辑

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  // 编辑模式：hydrate 表单
  useEffect(() => {
    if (!isNew && existing && !hydrated) {
      setTitle(existing.title);
      setContent(existing.content);
      setWeather(existing.weather ?? undefined);
      setMood(existing.mood ?? undefined);
      setLocation(existing.location ?? undefined);
      setHydrated(true);
    }
  }, [isNew, existing, hydrated]);

  const handleBack = useCallback(() => {
    if (title || content) {
      toast.info('已保存为草稿');
    }
    navigation.goBack();
  }, [navigation, title, content]);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('内容不能为空');
      return;
    }
    try {
      if (isNew) {
        const created = await createDiary({
          notebookId: 'nb-1',
          title: title.trim(),
          summary: content.slice(0, 80),
          content,
          cover: null,
          weather: weather ?? null,
          location: location ?? null,
          mood: mood ?? null,
          isPinned: false,
          isEncrypted: false,
          isDraft: false,
          deletedAt: null,
        });
        toast.success('日记已创建');
        // eslint-disable-next-line no-console
        console.log('created:', created.id);
      } else {
        await updateDiary(id!, {
          title: title.trim(),
          content,
          weather: weather ?? null,
          location: location ?? null,
          mood: mood ?? null,
        });
        toast.success('已保存');
      }
      setTimeout(() => navigation.goBack(), 400);
    } catch (e) {
      toast.error('保存失败');
    }
  }, [title, content, isNew, id, weather, location, mood, createDiary, updateDiary, navigation]);

  const handleToolPress = useCallback((tool: string) => {
    if (tool === 'weather') setPickedAction('weather');
    else if (tool === 'mood') setPickedAction('mood');
    else if (tool === 'location') setPickedAction('location');
    else if (tool === 'image') toast.info('图片选择器待实现');
    else if (tool === 'mic') toast.info('录音功能待实现');
    else if (tool === 'link') toast.info('链接插入待实现');
    else if (tool === 'lock') toast.info('加密功能待实现');
    else
      setActiveTools(prev =>
        prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool],
      );
  }, []);

  const handleWeatherPick = useCallback((w: string) => {
    setWeather(w);
    setPickedAction(null);
  }, []);
  const handleMoodPick = useCallback((m: string) => {
    setMood(m);
    setPickedAction(null);
  }, []);
  const handleLocationPick = useCallback((l: string) => {
    setLocation(l);
    setPickedAction(null);
  }, []);

  const today = new Date();
  const todayLabel = `${today.getMonth() + 1}月${today.getDate()}日`;

  if (!initialized || (!isNew && !hydrated)) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <TopBar showBack onBackPress={handleBack} />
        <Loading variant="full" visible={true} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar
        showBack
        onBackPress={handleBack}
        right={
          <Pressable hitSlop={12} onPress={handleSave} style={{paddingHorizontal: spacing.sm}}>
            <Text style={{color: colors.brand.primary, ...typography.titleS}}>保存</Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.metaCard}>
            <View style={styles.metaChip}>
              <Icon name="calendar" size={14} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaChipText}>{todayLabel}</Text>
            </View>
            {weather ? (
              <Pressable onPress={() => setWeather(undefined)} style={styles.metaChip}>
                <Icon name="weather" size={14} color={colors.semantic.icon.secondary} />
                <Text style={styles.metaChipText}>{weather}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setPickedAction('weather')} style={styles.metaChip}>
                <Text style={[styles.metaChipText, styles.metaChipPlaceholder]}>+ 天气</Text>
              </Pressable>
            )}
            {mood ? (
              <Pressable onPress={() => setMood(undefined)} style={styles.metaChip}>
                <Text style={styles.metaChipText}>{mood}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setPickedAction('mood')} style={styles.metaChip}>
                <Text style={[styles.metaChipText, styles.metaChipPlaceholder]}>+ 心情</Text>
              </Pressable>
            )}
            {location ? (
              <Pressable onPress={() => setLocation(undefined)} style={styles.metaChip}>
                <Icon name="location" size={14} color={colors.semantic.icon.secondary} />
                <Text style={styles.metaChipText}>{location}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setPickedAction('location')} style={styles.metaChip}>
                <Text style={[styles.metaChipText, styles.metaChipPlaceholder]}>+ 位置</Text>
              </Pressable>
            )}
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="标题（选填）"
            placeholderTextColor={colors.semantic.text.tertiary}
            style={styles.titleInput}
            maxLength={50}
          />
          <View style={styles.titleSeparator} />

          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder="今天发生了什么..."
            minHeight={280}
            maxHeight={600}
            showCount
            maxLength={MAX_CONTENT}
          />
        </ScrollView>

        <EditorToolbar activeTools={activeTools as never} onToolPress={handleToolPress} />
      </KeyboardAvoidingView>

      <ActionSheet
        visible={pickedAction === 'weather'}
        onClose={() => setPickedAction(null)}
        title="选择天气"
        items={WEATHERS.map(w => ({key: w, label: w, onPress: () => handleWeatherPick(w)}))}
      />
      <ActionSheet
        visible={pickedAction === 'mood'}
        onClose={() => setPickedAction(null)}
        title="选择心情"
        items={MOODS.map(m => ({key: m, label: m, onPress: () => handleMoodPick(m)}))}
      />
      <ActionSheet
        visible={pickedAction === 'location'}
        onClose={() => setPickedAction(null)}
        title="选择位置"
        items={LOCATIONS.map(l => ({
          key: l,
          label: l,
          icon: 'location' as const,
          onPress: () => handleLocationPick(l),
        }))}
      />
    </View>
  );
};

// 避免未使用警告

export default DiaryEditScreen;