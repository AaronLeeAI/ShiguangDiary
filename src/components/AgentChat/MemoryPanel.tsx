import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Icon } from '@/components/Icon'
import { useTheme, type Theme } from '@theme'
import type { AgentMemory, MemoryCategory, MemoryRepositoryAdapter } from '../../agent'

interface Props {
  memory?: MemoryRepositoryAdapter
  refreshKey?: number
  onOpenDiary?: (id: string) => void
}

const CATEGORIES: Array<{ key: MemoryCategory; label: string }> = [
  { key: 'person', label: '人物' },
  { key: 'goal', label: '目标' },
  { key: 'preference', label: '偏好' },
  { key: 'habit', label: '习惯' },
  { key: 'context', label: '背景' },
]

const categoryLabel = (category: MemoryCategory) =>
  CATEGORIES.find(item => item.key === category)?.label ?? '背景'

export default function MemoryPanel({ memory, refreshKey = 0, onOpenDiary }: Props) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])
  const [items, setItems] = useState<AgentMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState('')
  const [category, setCategory] = useState<MemoryCategory>('context')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const refresh = useCallback(async () => {
    if (!memory) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setItems(await memory.list())
    } finally {
      setLoading(false)
    }
  }, [memory])

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [refresh, refreshKey])

  const addMemory = async () => {
    const content = draft.trim()
    if (!memory || !content || saving) {
      return
    }
    setSaving(true)
    try {
      await memory.create({ content, category })
      setDraft('')
      await refresh()
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (item: AgentMemory) => {
    const content = editingText.trim()
    if (!memory || !content || saving) {
      return
    }
    setSaving(true)
    try {
      await memory.update(item.id, { content })
      setEditingId(null)
      setEditingText('')
      await refresh()
    } catch (error) {
      Alert.alert('修改失败', error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (item: AgentMemory) => {
    if (!memory || saving) {
      return
    }
    Alert.alert('忘记这条信息？', item.content, [
      { text: '取消', style: 'cancel' },
      {
        text: '忘记',
        style: 'destructive',
        onPress: async () => {
          setSaving(true)
          try {
            await memory.remove(item.id)
            await refresh()
          } catch (error) {
            Alert.alert('删除失败', error instanceof Error ? error.message : String(error))
          } finally {
            setSaving(false)
          }
        },
      },
    ])
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Icon name="bookmark" size={24} color={theme.colors.brand.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>拾光记得的你</Text>
          <Text style={styles.heroDescription}>
            这里只保存你确认过的重要人物、目标和偏好。它与原始日记分开，随时可以修改或忘记。
          </Text>
        </View>
      </View>

      {!!memory && (
        <View style={styles.addCard}>
          <Text style={styles.sectionTitle}>手动添加一条记忆</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="例如：我希望今年坚持每周跑步三次"
            placeholderTextColor={theme.colors.semantic.text.tertiary}
            style={styles.addInput}
            multiline
            maxLength={240}
          />
          <View style={styles.categoryRow}>
            {CATEGORIES.map(item => {
              const selected = item.key === category
              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => setCategory(item.key)}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                >
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={!draft.trim() || saving}
            onPress={addMemory}
            style={[styles.addButton, (!draft.trim() || saving) && styles.disabled]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>加入长期记忆</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>已确认的记忆</Text>
        <Text style={styles.count}>{items.length} 条</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.brand.primary} />
          <Text style={styles.loadingText}>正在读取本地记忆…</Text>
        </View>
      ) : !memory ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>长期记忆暂不可用</Text>
          <Text style={styles.emptyText}>数据层尚未准备好，请稍后再试。</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Icon name="bookmark" size={30} color={theme.colors.semantic.icon.tertiary} />
          <Text style={styles.emptyTitle}>还没有长期记忆</Text>
          <Text style={styles.emptyText}>聊天时拾光发现值得长期保留的信息，会先征求你的同意。</Text>
        </View>
      ) : (
        items.map(item => {
          const editing = editingId === item.id
          return (
            <View key={item.id} style={styles.memoryCard}>
              <View style={styles.memoryTopRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{categoryLabel(item.category)}</Text>
                </View>
                <View style={styles.memoryActions}>
                  {editing ? (
                    <>
                      <TouchableOpacity
                        accessibilityLabel="取消修改"
                        onPress={() => setEditingId(null)}
                        style={styles.iconButton}
                      >
                        <Icon name="close" size={17} color={theme.colors.semantic.icon.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityLabel="保存修改"
                        onPress={() => saveEdit(item)}
                        style={styles.iconButton}
                      >
                        <Icon name="check" size={17} color={theme.colors.brand.primary} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        accessibilityLabel="修改记忆"
                        onPress={() => {
                          setEditingId(item.id)
                          setEditingText(item.content)
                        }}
                        style={styles.iconButton}
                      >
                        <Icon name="edit" size={16} color={theme.colors.semantic.icon.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityLabel="删除记忆"
                        onPress={() => requestDelete(item)}
                        style={styles.iconButton}
                      >
                        <Icon name="delete" size={16} color={theme.colors.semantic.text.danger} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              {editing ? (
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  style={styles.editInput}
                  multiline
                  autoFocus
                  maxLength={240}
                />
              ) : (
                <Text style={styles.memoryText}>{item.content}</Text>
              )}
              <View style={styles.memoryMeta}>
                <Text style={styles.memoryDate}>
                  {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
                </Text>
                {!!item.sourceDiaryId && !!onOpenDiary && (
                  <TouchableOpacity
                    accessibilityRole="link"
                    onPress={() => onOpenDiary(item.sourceDiaryId!)}
                    style={styles.sourceLink}
                  >
                    <Icon name="doc" size={14} color={theme.colors.brand.primary} />
                    <Text style={styles.sourceLinkText}>查看来源日记</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

function createStyles(theme: Theme) {
  const { semantic, brand } = theme.colors
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: semantic.bg.subtle },
    content: { padding: 16, paddingBottom: 36 },
    heroCard: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 18,
      backgroundColor: brand.primaryLight,
      marginBottom: 14,
    },
    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: semantic.bg.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    heroCopy: { flex: 1 },
    heroTitle: { fontSize: 17, fontWeight: '700', color: semantic.text.primary },
    heroDescription: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 20,
      color: semantic.text.secondary,
    },
    addCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
      marginBottom: 20,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: semantic.text.primary },
    addInput: {
      minHeight: 78,
      marginTop: 12,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 14,
      backgroundColor: semantic.bg.input,
      color: semantic.text.primary,
      fontSize: 14,
      lineHeight: 20,
      textAlignVertical: 'top',
    },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    categoryChip: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: semantic.bg.subtle,
      marginRight: 7,
      marginBottom: 7,
    },
    categoryChipSelected: { backgroundColor: brand.primaryLight },
    categoryText: { fontSize: 12, color: semantic.text.secondary },
    categoryTextSelected: { color: brand.primary, fontWeight: '600' },
    addButton: {
      minHeight: 42,
      marginTop: 6,
      borderRadius: 14,
      backgroundColor: brand.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
    disabled: { opacity: 0.45 },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    count: { fontSize: 12, color: semantic.text.tertiary },
    loading: { alignItems: 'center', paddingVertical: 36 },
    loadingText: { marginTop: 10, fontSize: 13, color: semantic.text.tertiary },
    emptyCard: {
      minHeight: 150,
      borderRadius: 18,
      padding: 24,
      backgroundColor: semantic.bg.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
    },
    emptyTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: semantic.text.primary,
    },
    emptyText: {
      marginTop: 6,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 20,
      color: semantic.text.tertiary,
    },
    memoryCard: {
      padding: 15,
      borderRadius: 17,
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
      marginBottom: 10,
    },
    memoryTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    categoryBadge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: brand.primaryLight,
    },
    categoryBadgeText: { fontSize: 11, fontWeight: '600', color: brand.primary },
    memoryActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: {
      width: 32,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
    memoryText: {
      marginTop: 11,
      fontSize: 15,
      lineHeight: 23,
      color: semantic.text.primary,
    },
    editInput: {
      marginTop: 10,
      minHeight: 60,
      padding: 10,
      borderRadius: 12,
      backgroundColor: semantic.bg.input,
      color: semantic.text.primary,
      fontSize: 14,
      lineHeight: 21,
      textAlignVertical: 'top',
    },
    memoryMeta: {
      marginTop: 11,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: semantic.divider.subtle,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    memoryDate: { fontSize: 11, color: semantic.text.tertiary },
    sourceLink: { flexDirection: 'row', alignItems: 'center' },
    sourceLinkText: { marginLeft: 4, fontSize: 12, color: brand.primary },
  })
}
