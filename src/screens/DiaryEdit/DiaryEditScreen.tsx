/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据流：EditorScreen → useEditor → editorStore + diaryStore → diaryService → repository
 * 页面只做展示与交互，编辑逻辑（dirty / 自动保存 / 校验 / 草稿）由编辑引擎负责。
 */

import React, { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActionSheet } from '@/components/ActionSheet'
import { EditorToolbar } from '@/components/EditorToolbar'
import { Icon } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { TextArea } from '@/components/TextArea'
import { TopBar } from '@/components/TopBar'
import { toast } from '@/components/Toast'
import { EDITOR_LIMITS, useEditor } from '@features/editor'
import { colors, spacing, typography } from '@theme'

import { styles } from './styles'
import type { DiaryEditScreenProps } from './types'

const WEATHERS = ['晴', '多云', '阴', '小雨', '大雨', '雪']
const MOODS = ['😊', '😢', '😡', '😴', '😍', '🤔', '😎', '🥰']
const LOCATIONS = ['北京·朝阳公园', '北京·三里屯', '上海·外滩', '杭州·西湖', '成都·宽窄巷子']

export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets()
  const { id } = route.params
  const isNew = !id

  const editor = useEditor(id ?? null)
  const {
    title,
    content,
    weather,
    mood,
    location,
    hydrated,
    saving,
    error,
    setTitle,
    setContent,
    setWeather,
    setMood,
    setLocation,
    save,
    exit,
  } = editor

  const [activeTools, setActiveTools] = useState<string[]>([])
  const [pickedAction, setPickedAction] = useState<'weather' | 'mood' | 'location' | null>(null)

  // 退出时统一走 editor.exit（处理草稿）
  const handleBack = useCallback(() => {
    exit()
    navigation.goBack()
  }, [exit, navigation])

  const handleSave = useCallback(async () => {
    const ok = await save()
    if (ok) {
      toast.success(isNew ? '日记已创建' : '已保存')
      setTimeout(() => navigation.goBack(), 300)
    } else if (error) {
      toast.error(error)
    } else {
      toast.error('内容不能为空')
    }
  }, [save, isNew, error, navigation])

  const handleToolPress = useCallback((tool: string) => {
    if (tool === 'weather') {
      setPickedAction('weather')
    } else if (tool === 'mood') {
      setPickedAction('mood')
    } else if (tool === 'location') {
      setPickedAction('location')
    } else if (tool === 'image') {
      toast.info('图片选择器待实现')
    } else if (tool === 'mic') {
      toast.info('录音功能待实现')
    } else if (tool === 'link') {
      toast.info('链接插入待实现')
    } else if (tool === 'lock') {
      toast.info('加密功能待实现')
    } else {
      setActiveTools(prev => (prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]))
    }
  }, [])

  const handleWeatherPick = useCallback(
    (w: string) => {
      setWeather(w)
      setPickedAction(null)
    },
    [setWeather],
  )
  const handleMoodPick = useCallback(
    (m: string) => {
      setMood(m)
      setPickedAction(null)
    },
    [setMood],
  )
  const handleLocationPick = useCallback(
    (l: string) => {
      setLocation(l)
      setPickedAction(null)
    },
    [setLocation],
  )

  const today = new Date()
  const todayLabel = `${today.getMonth() + 1}月${today.getDate()}日`

  if (!hydrated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TopBar showBack onBackPress={handleBack} />
        <Loading variant="full" visible={true} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        showBack
        onBackPress={handleBack}
        right={
          <Pressable
            hitSlop={12}
            onPress={handleSave}
            disabled={saving}
            style={{ paddingHorizontal: spacing.sm }}
          >
            <Text
              style={{
                color: saving ? colors.semantic.icon.tertiary : colors.brand.primary,
                ...typography.titleS,
              }}
            >
              {saving ? '保存中' : '保存'}
            </Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.metaCard}>
            <View style={styles.metaChip}>
              <Icon name="calendar" size={14} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaChipText}>{todayLabel}</Text>
            </View>
            {weather ? (
              <Pressable onPress={() => setWeather(null)} style={styles.metaChip}>
                <Icon name="weather" size={14} color={colors.semantic.icon.secondary} />
                <Text style={styles.metaChipText}>{weather}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setPickedAction('weather')} style={styles.metaChip}>
                <Text style={[styles.metaChipText, styles.metaChipPlaceholder]}>+ 天气</Text>
              </Pressable>
            )}
            {mood ? (
              <Pressable onPress={() => setMood(null)} style={styles.metaChip}>
                <Text style={styles.metaChipText}>{mood}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setPickedAction('mood')} style={styles.metaChip}>
                <Text style={[styles.metaChipText, styles.metaChipPlaceholder]}>+ 心情</Text>
              </Pressable>
            )}
            {location ? (
              <Pressable onPress={() => setLocation(null)} style={styles.metaChip}>
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
            maxLength={EDITOR_LIMITS.TITLE_MAX}
          />
          <View style={styles.titleSeparator} />

          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder="今天发生了什么..."
            minHeight={280}
            maxHeight={600}
            showCount
            maxLength={EDITOR_LIMITS.CONTENT_MAX}
          />
        </ScrollView>

        <EditorToolbar activeTools={activeTools as never} onToolPress={handleToolPress} />
      </KeyboardAvoidingView>

      <ActionSheet
        visible={pickedAction === 'weather'}
        onClose={() => setPickedAction(null)}
        title="选择天气"
        items={WEATHERS.map(w => ({ key: w, label: w, onPress: () => handleWeatherPick(w) }))}
      />
      <ActionSheet
        visible={pickedAction === 'mood'}
        onClose={() => setPickedAction(null)}
        title="选择心情"
        items={MOODS.map(m => ({ key: m, label: m, onPress: () => handleMoodPick(m) }))}
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
  )
}

export default DiaryEditScreen
