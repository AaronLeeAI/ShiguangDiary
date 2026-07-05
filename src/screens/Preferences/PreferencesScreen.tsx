/**
 * Preferences Screen - 偏好设置(列表样式/排序/编辑器)
 *
 * 数据流:PreferencesScreen → useSettings → preferencesStore(MMKV 持久化、即时生效)。
 * 仅本 Task 核心设置;字体管理/工具栏定制留 stub(Out of Scope)。
 */

import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, Switch, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActionSheet } from '@/components/ActionSheet'
import { SettingsGroup } from '@/components/SettingsGroup'
import { SettingsRow } from '@/components/SettingsRow'
import { TopBar } from '@/components/TopBar'
import { useSettings, Stepper } from '@features/settings'
import type { HomeListStyle, DiarySortOrder } from '@store/types'

import { styles } from './styles'
import type { PreferencesScreenProps } from './types'

const HOME_LIST_STYLE_OPTIONS: Array<{ value: HomeListStyle; label: string }> = [
  { value: 'timeline', label: '时间轴' },
  { value: 'card', label: '卡片' },
  { value: 'compact', label: '紧凑' },
]

const DIARY_SORT_OPTIONS: Array<{ value: DiarySortOrder; label: string }> = [
  { value: 'updatedDesc', label: '最近更新' },
  { value: 'createdDesc', label: '创建时间 新→旧' },
  { value: 'createdAsc', label: '创建时间 旧→新' },
]

const FONT_SCALE_MIN = 0.8
const FONT_SCALE_MAX = 1.6
const FONT_SCALE_STEP = 0.1
const AUTOSAVE_MIN = 1000
const AUTOSAVE_MAX = 10000
const AUTOSAVE_STEP = 1000

const round1 = (n: number) => Math.round(n * 10) / 10

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const {
    homeListStyle,
    diarySortOrder,
    editor,
    setHomeListStyle,
    setDiarySortOrder,
    setEditorPreferences,
    resetPreferences,
  } = useSettings()

  const [listSheetVisible, setListSheetVisible] = useState(false)
  const [sortSheetVisible, setSortSheetVisible] = useState(false)

  const listLabel = useMemo(
    () => HOME_LIST_STYLE_OPTIONS.find(o => o.value === homeListStyle)?.label ?? '',
    [homeListStyle],
  )
  const sortLabel = useMemo(
    () => DIARY_SORT_OPTIONS.find(o => o.value === diarySortOrder)?.label ?? '',
    [diarySortOrder],
  )

  const handleListPress = useCallback(
    (v: HomeListStyle) => {
      setHomeListStyle(v)
      setListSheetVisible(false)
    },
    [setHomeListStyle],
  )
  const handleSortPress = useCallback(
    (v: DiarySortOrder) => {
      setDiarySortOrder(v)
      setSortSheetVisible(false)
    },
    [setDiarySortOrder],
  )

  const handleToolbarToggle = useCallback(
    (v: boolean) => setEditorPreferences({ toolbarEnabled: v }),
    [setEditorPreferences],
  )
  const handleFontDec = useCallback(
    () =>
      setEditorPreferences({
        fontScale: round1(Math.max(FONT_SCALE_MIN, editor.fontScale - FONT_SCALE_STEP)),
      }),
    [editor.fontScale, setEditorPreferences],
  )
  const handleFontInc = useCallback(
    () =>
      setEditorPreferences({
        fontScale: round1(Math.min(FONT_SCALE_MAX, editor.fontScale + FONT_SCALE_STEP)),
      }),
    [editor.fontScale, setEditorPreferences],
  )
  const handleAutosaveDec = useCallback(
    () =>
      setEditorPreferences({
        autoSaveInterval: Math.max(AUTOSAVE_MIN, editor.autoSaveInterval - AUTOSAVE_STEP),
      }),
    [editor.autoSaveInterval, setEditorPreferences],
  )
  const handleAutosaveInc = useCallback(
    () =>
      setEditorPreferences({
        autoSaveInterval: Math.min(AUTOSAVE_MAX, editor.autoSaveInterval + AUTOSAVE_STEP),
      }),
    [editor.autoSaveInterval, setEditorPreferences],
  )
  const handleReset = useCallback(() => resetPreferences(), [resetPreferences])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar title="偏好设置" onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        <SettingsGroup title="通用">
          <SettingsRow
            icon="list"
            label="列表样式"
            hint={listLabel}
            onPress={() => setListSheetVisible(true)}
          />
          <SettingsRow
            icon="swap"
            label="排序方式"
            hint={sortLabel}
            onPress={() => setSortSheetVisible(true)}
          />
        </SettingsGroup>

        <SettingsGroup title="编辑器">
          <SettingsRow
            icon="tune"
            label="工具栏"
            right={<Switch value={editor.toolbarEnabled} onValueChange={handleToolbarToggle} />}
            showArrow={false}
          />
          <SettingsRow
            icon="edit"
            label="字体大小"
            showArrow={false}
            right={
              <Stepper
                value={editor.fontScale}
                format={v => `${round1(v)}x`}
                onDecrement={handleFontDec}
                onIncrement={handleFontInc}
                canDecrement={editor.fontScale > FONT_SCALE_MIN}
                canIncrement={editor.fontScale < FONT_SCALE_MAX}
              />
            }
          />
          <SettingsRow
            icon="clock"
            label="自动保存间隔"
            showArrow={false}
            right={
              <Stepper
                value={editor.autoSaveInterval}
                format={v => `${(v / 1000).toFixed(0)}s`}
                onDecrement={handleAutosaveDec}
                onIncrement={handleAutosaveInc}
                canDecrement={editor.autoSaveInterval > AUTOSAVE_MIN}
                canIncrement={editor.autoSaveInterval < AUTOSAVE_MAX}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon="trash" label="重置所有偏好" destructive onPress={handleReset} />
        </SettingsGroup>
      </ScrollView>

      <ActionSheet
        visible={listSheetVisible}
        title="列表样式"
        items={HOME_LIST_STYLE_OPTIONS.map(o => ({
          key: o.value,
          label: o.label,
          onPress: () => handleListPress(o.value),
        }))}
        onClose={() => setListSheetVisible(false)}
      />
      <ActionSheet
        visible={sortSheetVisible}
        title="排序方式"
        items={DIARY_SORT_OPTIONS.map(o => ({
          key: o.value,
          label: o.label,
          onPress: () => handleSortPress(o.value),
        }))}
        onClose={() => setSortSheetVisible(false)}
      />
    </View>
  )
}

export default PreferencesScreen
