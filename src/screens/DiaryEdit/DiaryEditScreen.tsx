/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据流：EditorScreen → useEditor → editorStore + diaryStore → diaryService → repository
 * 页面只做展示与交互，编辑逻辑（dirty / 自动保存 / 校验 / 草稿）由编辑引擎负责。
 */

import React, { useCallback, useMemo, useState } from 'react'
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

import { Icon, type IconName } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { toast } from '@/components/Toast'
import { EDITOR_LIMITS, useEditor } from '@features/editor'
import { haptic } from '@animations/haptics'
import { colors } from '@theme'

import { styles } from './styles'
import type { DiaryEditScreenProps } from './types'

const TITLE_MAX_LENGTH = 32
const DEFAULT_LOCATION = '陕西省西安市长安区东三街268号靠近万科城润园'
const DEFAULT_WEATHER = '多云 30°C'

type DiaryTool =
  | 'image'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'fontIncrease'
  | 'fontDecrease'
  | 'heading'
  | 'indent'
  | 'alignCenter'
  | 'orderedList'
  | 'unorderedList'
  | 'quote'
  | 'divider'
  | 'time'
  | 'mic'
  | 'link'

type ToolbarItem =
  | {
      key: DiaryTool
      label: string
      type: 'icon'
      icon: IconName
    }
  | {
      key: DiaryTool
      label: string
      type: 'text'
      text: string
      textStyle?: 'bold' | 'italic' | 'underline' | 'strike'
    }

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { key: 'image', label: '插入图片', type: 'icon', icon: 'image' },
  { key: 'bold', label: '加粗', type: 'text', text: 'B', textStyle: 'bold' },
  { key: 'italic', label: '斜体', type: 'text', text: 'I', textStyle: 'italic' },
  { key: 'underline', label: '下划线', type: 'text', text: 'U', textStyle: 'underline' },
  { key: 'strikethrough', label: '删除线', type: 'text', text: 'T', textStyle: 'strike' },
  { key: 'fontIncrease', label: '字号增大', type: 'text', text: 'A+' },
  { key: 'fontDecrease', label: '字号减小', type: 'text', text: 'A-' },
  { key: 'heading', label: '整行变粗', type: 'text', text: 'H', textStyle: 'bold' },
  { key: 'indent', label: '缩进两字', type: 'text', text: '↦' },
  { key: 'alignCenter', label: '居中对齐', type: 'text', text: '☰' },
  { key: 'orderedList', label: '有序列表', type: 'text', text: '1.' },
  { key: 'unorderedList', label: '无序列表', type: 'text', text: '•' },
  { key: 'quote', label: '引用', type: 'text', text: '>' },
  { key: 'divider', label: '分隔符', type: 'text', text: '—' },
  { key: 'time', label: '插入当前时间', type: 'icon', icon: 'clock' },
  { key: 'mic', label: '语音转文本', type: 'icon', icon: 'mic' },
  { key: 'link', label: '插入超链接', type: 'icon', icon: 'link' },
]

const pad2 = (n: number) => `${n}`.padStart(2, '0')

const formatHeaderTime = (date: Date) =>
  `${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(date.getHours())}:${pad2(
    date.getMinutes(),
  )}`

const formatInsertTime = (date: Date) =>
  `${date.getFullYear()}年${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}`

export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets()
  const { id } = route.params
  const isNew = !id

  const editor = useEditor(id ?? null)
  const { title, content, hydrated, saving, error, setTitle, setContent, save, exit } = editor

  const [activeTools, setActiveTools] = useState<DiaryTool[]>([])
  const headerTime = useMemo(() => formatHeaderTime(new Date()), [])

  // 退出时统一走 editor.exit（处理草稿）
  const handleBack = useCallback(() => {
    exit()
    navigation.goBack()
  }, [exit, navigation])

  const handleSave = useCallback(async () => {
    const ok = await save()
    if (ok) {
      haptic('saveSuccess')
      toast.success(isNew ? '日记已创建' : '已保存')
      setTimeout(() => navigation.goBack(), 300)
    } else if (error) {
      haptic('error')
      toast.error(error)
    } else {
      haptic('error')
      toast.error('内容不能为空')
    }
  }, [save, isNew, error, navigation])

  const toggleTool = useCallback((tool: DiaryTool) => {
    setActiveTools(prev =>
      prev.includes(tool) ? prev.filter(activeTool => activeTool !== tool) : [...prev, tool],
    )
  }, [])

  const handleToolPress = useCallback(
    (tool: DiaryTool) => {
      if (tool === 'image') {
        toast.info('图片选择器待实现')
        return
      }
      if (tool === 'mic') {
        toast.info('语音转文本需要接入原生能力，当前未开启')
        return
      }
      if (tool === 'link') {
        toast.info('链接插入待实现')
        return
      }
      if (tool === 'time') {
        const timeText = formatInsertTime(new Date())
        const separator = content.length > 0 && !content.endsWith('\n') ? '\n' : ''
        setContent(`${content}${separator}${timeText}`)
        return
      }
      toggleTool(tool)
    },
    [content, setContent, toggleTool],
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" onPress={handleBack} hitSlop={12}>
        <Text style={styles.headerDate}>{headerTime}</Text>
      </Pressable>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="日历事件提醒"
          hitSlop={10}
          style={styles.headerIconButton}
        >
          <Icon name="bell" size={22} color={colors.neutral.black} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="选择日记本"
          hitSlop={10}
          style={styles.headerIconButton}
        >
          <Icon name="tag" size={22} color={colors.neutral.black} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saving ? '保存中' : '保存日记'}
          hitSlop={10}
          onPress={handleSave}
          disabled={saving}
          style={styles.headerIconButton}
        >
          <Icon
            name="check"
            size={24}
            color={saving ? colors.semantic.icon.tertiary : colors.neutral.black}
          />
        </Pressable>
      </View>
    </View>
  )

  const renderToolbarItem = (item: ToolbarItem) => {
    const active = activeTools.includes(item.key)
    const textDecorations = [
      styles.toolbarText,
      item.type === 'text' && item.textStyle === 'bold' && styles.toolbarTextBold,
      item.type === 'text' && item.textStyle === 'italic' && styles.toolbarTextItalic,
      item.type === 'text' && item.textStyle === 'underline' && styles.toolbarTextUnderline,
      item.type === 'text' && item.textStyle === 'strike' && styles.toolbarTextStrike,
      active && styles.toolbarTextActive,
    ]

    return (
      <Pressable
        key={item.key}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        hitSlop={4}
        onPress={() => handleToolPress(item.key)}
        style={({ pressed }) => [
          styles.toolbarButton,
          pressed && styles.toolbarButtonPressed,
          active && styles.toolbarButtonActive,
        ]}
      >
        {item.type === 'icon' ? (
          <Icon
            name={item.icon}
            size={20}
            color={active ? colors.neutral.gray70 : colors.neutral.gray50}
          />
        ) : (
          <Text style={textDecorations}>{item.text}</Text>
        )}
      </Pressable>
    )
  }

  if (!hydrated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderHeader()}
        <Loading variant="full" visible={true} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View style={styles.editorArea}>
          <View style={styles.titleRow}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="标题（可选）"
              placeholderTextColor={colors.semantic.text.tertiary}
              style={styles.titleInput}
              maxLength={TITLE_MAX_LENGTH}
            />
            <Text style={styles.titleCount}>
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="请输入..."
            placeholderTextColor={colors.semantic.text.tertiary}
            multiline
            textAlignVertical="top"
            style={styles.contentInput}
            maxLength={EDITOR_LIMITS.CONTENT_MAX}
          />
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Icon name="location" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText} numberOfLines={1}>
                {DEFAULT_LOCATION}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="weather" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText}>{DEFAULT_WEATHER}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="chart" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText}>字数统计</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
            style={styles.toolbar}
            keyboardShouldPersistTaps="handled"
          >
            {TOOLBAR_ITEMS.map(renderToolbarItem)}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default DiaryEditScreen
