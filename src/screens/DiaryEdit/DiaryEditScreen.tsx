/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 写日记主流程入口。从 Home FAB / DiaryView "编辑" 进入。
 *
 * 整合组件：
 * - TopBar：返回 + 保存（带 saved 反馈）
 * - 元信息 chips：日期 / 天气 / 位置 / 心情 / 标签（点击添加）
 * - TextField：标题输入
 * - TextArea：正文多行输入（带 showCount）
 * - EditorToolbar：底部工具栏
 * - ActionSheet：tool -> 业务（天气/心情/位置）
 * - Toast：保存反馈
 *
 * 支持新建（无 id）和编辑（有 id）两种模式。
 */

import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ActionSheet} from '@/components/ActionSheet';
import {EditorToolbar} from '@/components/EditorToolbar';
import {Icon} from '@/components/Icon';
import {TextArea} from '@/components/TextArea';
import {TopBar} from '@/components/TopBar';
import {toast} from '@/components/Toast';
import {ROUTES} from '@constants/routes';
import {colors, spacing} from '@theme';
import type {Diary} from '@types';

import {styles} from './styles';
import type {DiaryEditScreenProps} from './types';

const MAX_CONTENT = 5000;

const WEATHERS = ['晴', '多云', '阴', '小雨', '大雨', '雪'];
const MOODS = ['😊', '😢', '😡', '😴', '😍', '🤔', '😎', '🥰'];
const LOCATIONS = ['北京·朝阳公园', '北京·三里屯', '上海·外滩', '杭州·西湖', '成都·宽窄巷子'];

const MOCK_DIARY_EDIT: Diary = {
  id: '1',
  notebookId: 'nb-1',
  title: '今天天气真好',
  summary: '',
  content:
    '今天下午和朋友们约着去朝阳公园走走。刚到门口就闻到了花香，原来是樱花开了。\n\n粉白色的花瓣在阳光下透出淡淡的粉色，风一吹就飘落下来，像下了一场樱花雨。',
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
 * DiaryEditScreen 组件
 */
export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {id} = route.params;
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weather, setWeather] = useState<string | undefined>();
  const [mood, setMood] = useState<string | undefined>();
  const [location, setLocation] = useState<string | undefined>();
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [pickedAction, setPickedAction] = useState<'weather' | 'mood' | 'location' | null>(null);

  // 加载已有日记（mock）
  useEffect(() => {
    if (!isNew) {
      const t = setTimeout(() => {
        setTitle(MOCK_DIARY_EDIT.title);
        setContent(MOCK_DIARY_EDIT.content);
        setWeather(MOCK_DIARY_EDIT.weather ?? undefined);
        setMood(MOCK_DIARY_EDIT.mood ?? undefined);
        setLocation(MOCK_DIARY_EDIT.location ?? undefined);
      }, 200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [id, isNew]);

  const handleBack = useCallback(() => {
    if (title || content) {
      // 简化处理：直接返回，后续接入草稿弹窗
      toast.info('已保存为草稿');
    }
    navigation.goBack();
  }, [navigation, title, content]);

  const handleSave = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      toast.error('内容不能为空');
      return;
    }
    // 模拟保存（后续接入数据库）
    toast.success(isNew ? '日记已创建' : '已保存');
    setTimeout(() => navigation.goBack(), 400);
  }, [title, content, isNew, navigation]);

  const handleToolPress = useCallback((tool: string) => {
    if (tool === 'weather') {
      setPickedAction('weather');
    } else if (tool === 'mood') {
      setPickedAction('mood');
    } else if (tool === 'location') {
      setPickedAction('location');
    } else if (tool === 'image') {
      toast.info('图片选择器待实现');
    } else if (tool === 'mic') {
      toast.info('录音功能待实现');
    } else if (tool === 'link') {
      toast.info('链接插入待实现');
    } else if (tool === 'lock') {
      toast.info('加密功能待实现');
    } else {
      // 格式化工具：切换激活态
      setActiveTools(prev =>
        prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool],
      );
    }
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
          {/* 元信息 chips */}
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

          {/* 标题 */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="标题（选填）"
            placeholderTextColor={colors.semantic.text.tertiary}
            style={styles.titleInput}
            maxLength={50}
          />
          <View style={styles.titleSeparator} />

          {/* 正文 */}
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

      {/* 选择 ActionSheet */}
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

export default DiaryEditScreen;