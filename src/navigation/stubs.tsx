/**
 * Secondary Screens
 *
 * 依据 docs/project-设计-docs/pages 中已定义的二级页面补齐轻量页面。
 * 这些页面保留本地状态与可交互表单，避免导航进入空白占位页。
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import {
  Checkbox,
  EmptyState,
  DiaryListItem,
  FontCard,
  Icon,
  ListStyleCard,
  LockPattern,
  PrimaryButton,
  RadioGroup,
  SettingsGroup,
  SettingsRow,
  StickyNoteEditor,
  Switch,
  TextField,
  TopBar,
  ThemePreviewCard,
} from '@components'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { ROUTES } from '@constants/routes'
import { useDiaryStore } from '@store/diaryStore'
import { neutral, semantic, spacing, typography } from '@theme'
import type { RootStackParamList } from '@navigation/types'

const SectionScreen: React.FC<React.PropsWithChildren<{ title: string; subtitle?: string }>> = ({
  title,
  subtitle,
  children,
}) => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    style={styles.screen}
    showsVerticalScrollIndicator={false}
  >
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {children}
  </ScrollView>
)

const FormScreen: React.FC<{
  title: string
  placeholder: string
  buttonTitle: string
  helper: string
}> = ({ title, placeholder, buttonTitle, helper }) => {
  const [name, setName] = useState('')
  return (
    <SectionScreen title={title} subtitle={helper}>
      <View style={styles.card}>
        <TextField value={name} onChangeText={setName} placeholder={placeholder} label="名称" />
        <PrimaryButton
          title={buttonTitle}
          onPress={() => {}}
          disabled={!name.trim()}
          style={styles.primaryButton}
        />
      </View>
    </SectionScreen>
  )
}

export const NotebookCreate: React.FC = () => (
  <FormScreen
    title="新建日记本"
    placeholder="输入日记本名称"
    buttonTitle="创建日记本"
    helper="对应 P201：提供名称输入与创建动作，后续接入持久化服务。"
  />
)

export const AlbumCreate: React.FC = () => (
  <FormScreen
    title="新建相册"
    placeholder="输入相册名称"
    buttonTitle="创建相册"
    helper="对应 P203：提供相册创建的基础交互。"
  />
)

type NotebookDetailProps = NativeStackScreenProps<RootStackParamList, 'NotebookDetail'>
type AlbumDetailProps = NativeStackScreenProps<RootStackParamList, 'AlbumDetail'>

export const NotebookDetail: React.FC<NotebookDetailProps> = ({ navigation, route }) => {
  const notebook = useDiaryStore(s => s.notebooks.find(item => item.id === route.params.id))
  const diaries = useDiaryStore(s =>
    s.diaries.filter(
      item => item.notebookId === route.params.id && !item.deletedAt && !item.isDraft,
    ),
  )

  return (
    <View style={styles.detailScreen}>
      <TopBar
        showBack
        onBackPress={navigation.goBack}
        title={notebook?.name ?? '日记本'}
        right={
          <View style={styles.topBarActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="搜索日记本"
              hitSlop={12}
              onPress={() => navigation.navigate(ROUTES.SEARCH)}
              style={styles.topBarAction}
            >
              <Icon name="search" size={20} color={semantic.icon.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="日记本更多操作"
              hitSlop={12}
              onPress={() => navigation.navigate(ROUTES.NOTEBOOK_SORT)}
              style={styles.topBarAction}
            >
              <Icon name="more" size={20} color={semantic.icon.primary} />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.detailContent}>
        {diaries.length > 0 ? (
          diaries.map(diary => (
            <DiaryListItem
              key={diary.id}
              title={diary.title || '未命名日记'}
              content={diary.summary}
              date={`${diary.monthYear} ${diary.day}日 ${diary.timestamp}`}
              mood={diary.mood ?? undefined}
              imageCount={diary.cover ? 1 : 0}
              onPress={() => navigation.navigate(ROUTES.DIARY_VIEW, { id: diary.id })}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState
              variant="custom"
              title="该日记本下还没有日记"
              subtitle="点击右下角加号开始记录"
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({ navigation, route }) => {
  const album = useDiaryStore(s => s.albums.find(item => item.id === route.params.id))
  const images = useDiaryStore(s => {
    const selectedIds = new Set(album?.diaryIds ?? [])
    return s.diaries.filter(item => selectedIds.has(item.id) && item.cover)
  })

  return (
    <View style={styles.detailScreen}>
      <TopBar
        showBack
        onBackPress={navigation.goBack}
        title={album?.name ?? '相册'}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="相册更多操作"
            hitSlop={12}
            onPress={() => navigation.navigate(ROUTES.ALBUM_CREATE)}
            style={styles.topBarAction}
          >
            <Icon name="more" size={20} color={semantic.icon.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.detailContent}>
        {images.length > 0 ? (
          <View style={styles.imageGrid}>
            {images.map(diary => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`查看 ${diary.title || '日记图片'}`}
                key={diary.id}
                onPress={() => navigation.navigate(ROUTES.DIARY_VIEW, { id: diary.id })}
                style={styles.imageTile}
              >
                <Icon name="image" size={28} color={semantic.icon.secondary} />
                <Text numberOfLines={1} style={styles.imageCaption}>
                  {diary.title || '未命名日记'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState
              variant="custom"
              title="相册中还没有图片"
              subtitle="为日记添加图片后会显示在这里"
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}
export const NotebookSort: React.FC = () => {
  const [manual, setManual] = useState(true)
  return (
    <SectionScreen title="日记本排序" subtitle="对应 P202：切换手动排序，并展示拖拽排序入口。">
      <SettingsGroup title="排序方式">
        <SettingsRow
          label="手动排序"
          showArrow={false}
          right={<Switch value={manual} onValueChange={setManual} />}
        />
        <SettingsRow label="拖拽调整顺序" hint="待接入" showArrow={false} />
      </SettingsGroup>
    </SectionScreen>
  )
}

export const Account: React.FC = () => (
  <SectionScreen title="账号管理" subtitle="对应 P101：账号资料、安全入口与退出/注销操作。">
    <SettingsGroup title="账号">
      <SettingsRow label="头像与昵称" hint="本地用户" showArrow={false} />
      <SettingsRow label="绑定手机" hint="未绑定" />
      <SettingsRow label="退出登录" destructive />
      <SettingsRow label="注销账号" destructive />
    </SettingsGroup>
  </SectionScreen>
)

export const Recycle: React.FC = () => (
  <SectionScreen title="回收站" subtitle="对应 P103：展示已删除内容并支持恢复/清空。">
    <View style={styles.emptyWrap}>
      <EmptyState variant="custom" title="回收站为空" subtitle="删除的日记会在这里保留 30 天" />
    </View>
    <PrimaryButton title="清空回收站" onPress={() => {}} variant="danger" disabled />
  </SectionScreen>
)

export const VIP: React.FC = () => (
  <SectionScreen title="会员中心" subtitle="P106 仍缺少正式权益与价格配置，当前仅展示保守入口。">
    <View style={styles.card}>
      <Text style={styles.cardTitle}>时光 Pro</Text>
      <Text style={styles.bodyText}>云同步、主题、字体等权益待产品配置确认后开放。</Text>
      <PrimaryButton title="暂未开放" onPress={() => {}} disabled style={styles.primaryButton} />
    </View>
  </SectionScreen>
)

export const Drafts: React.FC = () => (
  <SectionScreen title="草稿箱" subtitle="对应 P108：展示编辑过程中未发布的草稿。">
    <View style={styles.emptyWrap}>
      <EmptyState
        variant="custom"
        title="暂无草稿"
        subtitle="编辑日记时自动保存的内容会显示在这里"
      />
    </View>
  </SectionScreen>
)

export const ListStyle: React.FC = () => {
  const [styleValue, setStyleValue] = useState('card')
  const items = useMemo(
    () => [
      ['card', '卡片视图', '封面 + 摘要信息'],
      ['timeline', '时间轴', '按日期串联日记'],
      ['compact', '紧凑列表', '更多内容密度'],
    ],
    [],
  )
  return (
    <SectionScreen title="列表样式" subtitle="对应 P109a：选择首页日记列表展示方式。">
      <View style={styles.stack}>
        {items.map(([value, title, description]) => (
          <ListStyleCard
            key={value}
            title={title}
            description={description}
            selected={styleValue === value}
            onPress={() => setStyleValue(value)}
          />
        ))}
      </View>
    </SectionScreen>
  )
}

export const ThemeBackground: React.FC = () => {
  const [theme, setTheme] = useState('green')
  return (
    <SectionScreen title="主题背景" subtitle="对应 P109b：预览并选择应用主题与背景色。">
      <View style={styles.previewGrid}>
        <ThemePreviewCard
          title="清新绿"
          selected={theme === 'green'}
          onPress={() => setTheme('green')}
        />
        <ThemePreviewCard
          title="深色"
          backgroundColor="#1E1E1E"
          primaryColor="#1FBA70"
          selected={theme === 'dark'}
          onPress={() => setTheme('dark')}
        />
      </View>
    </SectionScreen>
  )
}

const TOOL_OPTIONS = ['图片', '天气', '心情', '位置', '标签', '提醒', '清单', '录音']

export const EditorToolbarPicker: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['图片', '心情', '标签'])
  const toggle = useCallback((tool: string, checked: boolean) => {
    setSelected(prev => (checked ? [...prev, tool] : prev.filter(item => item !== tool)))
  }, [])

  return (
    <SectionScreen title="编辑器工具栏" subtitle="对应 P109c：自定义写日记时显示的快捷工具。">
      <View style={styles.card}>
        {TOOL_OPTIONS.map(tool => (
          <Checkbox
            key={tool}
            label={tool}
            checked={selected.includes(tool)}
            onChange={checked => toggle(tool, checked)}
            style={styles.checkboxRow}
          />
        ))}
      </View>
    </SectionScreen>
  )
}

export const FontManagement: React.FC = () => {
  const [font, setFont] = useState('system')
  return (
    <SectionScreen title="字体管理" subtitle="对应 P109d：选择系统字体或已安装字体。">
      <View style={styles.stack}>
        <FontCard name="系统字体" selected={font === 'system'} onPress={() => setFont('system')} />
        <FontCard
          name="霞鹜文楷"
          sample="时光日记 Aa 123"
          selected={font === 'lxgw'}
          onPress={() => setFont('lxgw')}
        />
        <FontCard
          name="Roboto"
          sample="Shiguang Diary Aa 123"
          selected={font === 'roboto'}
          onPress={() => setFont('roboto')}
        />
      </View>
    </SectionScreen>
  )
}

export const AppLock: React.FC = () => {
  const [enabled, setEnabled] = useState(false)
  const [biometric, setBiometric] = useState(false)
  return (
    <SectionScreen title="应用锁" subtitle="对应 P110：配置手势密码与生物识别解锁。">
      <SettingsGroup title="隐私保护">
        <SettingsRow
          label="开启应用锁"
          showArrow={false}
          right={<Switch value={enabled} onValueChange={setEnabled} />}
        />
        <SettingsRow label="手势密码" hint={enabled ? '已启用' : '开启后设置'} />
        <SettingsRow
          label="指纹 / Face ID"
          showArrow={false}
          right={<Switch value={biometric} onValueChange={setBiometric} disabled={!enabled} />}
        />
      </SettingsGroup>
    </SectionScreen>
  )
}

export const AppLockGesture: React.FC = () => {
  const [pattern, setPattern] = useState<number[]>([])
  return (
    <SectionScreen title="设置手势" subtitle="至少连接 4 个点完成手势。">
      <View style={styles.centerCard}>
        <LockPattern value={pattern} onChange={setPattern} />
        <Text style={styles.patternHint}>已选择 {pattern.length} 个点</Text>
      </View>
    </SectionScreen>
  )
}

export const StickyNote: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'list'>('single')
  const [text, setText] = useState('')
  return (
    <SectionScreen title="便利贴" subtitle="对应 P111：编辑桌面便利贴内容与显示方式。">
      <View style={styles.card}>
        <RadioGroup
          direction="horizontal"
          value={mode}
          onChange={setMode}
          options={[
            { label: '单条', value: 'single' },
            { label: '列表', value: 'list' },
          ]}
        />
      </View>
      <StickyNoteEditor value={text} onChangeText={setText} style={styles.noteEditor} />
      <PrimaryButton title="保存便利贴" onPress={() => {}} disabled={!text.trim()} />
    </SectionScreen>
  )
}

const styles = StyleSheet.create({
  detailScreen: {
    backgroundColor: semantic.bg.canvas,
    flex: 1,
  },
  detailContent: {
    paddingBottom: spacing.giant,
  },
  topBarActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  topBarAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.base,
  },
  imageTile: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: semantic.bg.card,
    borderColor: semantic.border.default,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    padding: spacing.xs,
    width: '32%',
  },
  imageCaption: {
    ...typography.caption,
    color: neutral.gray60,
    marginTop: spacing.xs,
  },
  screen: {
    backgroundColor: semantic.bg.canvas,
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.giant,
  },
  title: {
    ...typography.titleL,
    color: neutral.gray90,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyM,
    color: neutral.gray60,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: semantic.bg.card,
    borderColor: semantic.border.default,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  cardTitle: {
    ...typography.titleS,
    color: neutral.gray90,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.bodyM,
    color: neutral.gray60,
  },
  primaryButton: {
    marginTop: spacing.base,
  },
  emptyWrap: {
    alignItems: 'center',
    minHeight: 240,
    justifyContent: 'center',
  },
  stack: {
    gap: spacing.md,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  checkboxRow: {
    minHeight: 44,
  },
  centerCard: {
    alignItems: 'center',
    backgroundColor: semantic.bg.card,
    borderRadius: 16,
    padding: spacing.xl,
  },
  patternHint: {
    ...typography.bodyM,
    color: neutral.gray60,
    marginTop: spacing.base,
  },
  noteEditor: {
    marginBottom: spacing.base,
  },
})
