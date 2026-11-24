import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { useTheme, type Theme } from '@theme'
import { clearAgentSession, loadAgentSession, runAgent, saveAgentSession } from '../../agent'
import type {
  AgentEvent,
  ChatMessage,
  DiaryRepositoryAdapter,
  DiarySource,
  LocalRagStatus,
  MemoryRepositoryAdapter,
  RagProgress,
  SemanticRagAdapter,
  ToolApprovalRequest,
  TTSAdapter,
} from '../../agent'
import MemoryPanel from './MemoryPanel'

interface Props {
  repo: DiaryRepositoryAdapter
  tts?: TTSAdapter
  rag?: SemanticRagAdapter
  memory?: MemoryRepositoryAdapter
  onOpenDiary?: (id: string) => void
}

interface Bubble {
  id: string
  role: 'user' | 'assistant'
  text: string
  sources?: DiarySource[]
}

interface QuickAction {
  icon: IconName
  title: string
  hint: string
  prompt: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: 'calendar',
    title: '回顾这一周',
    hint: '看看发生了什么',
    prompt: '结合我的日记，帮我回顾这一周。请引用作为依据的日记。',
  },
  {
    icon: 'search',
    title: '寻找温暖时刻',
    hint: '从旧日记里找一找',
    prompt: '从我的日记里找找最近让我感到放松或温暖的时刻。',
  },
  {
    icon: 'chart',
    title: '情绪小结',
    hint: '理解最近的起伏',
    prompt: '根据最近 30 天的日记，帮我看看情绪有什么变化。',
  },
  {
    icon: 'edit',
    title: '陪我写日记',
    hint: '从一个问题开始',
    prompt: '我想写一篇今天的日记，请用温和的问题一步步引导我。',
  },
]

const TOOL_STATUS: Record<string, string> = {
  search_diaries: '正在翻找相关日记…',
  semantic_search_diaries: '正在理解并匹配你的回忆…',
  get_diary: '正在阅读日记原文…',
  mood_statistics: '正在整理情绪记录…',
  list_memories: '正在读取长期记忆…',
  remember_user_fact: '正在保存你确认的记忆…',
  forget_memory: '正在忘记这条信息…',
  create_diary: '正在写入本地日记…',
  update_diary_mood: '正在更新日记心情…',
  read_aloud: '正在准备朗读…',
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '夜深了，我陪你慢慢说'
  }
  if (hour < 11) {
    return '早上好，今天想聊点什么？'
  }
  if (hour < 14) {
    return '中午好，来回望一下最近吧'
  }
  if (hour < 18) {
    return '下午好，想起哪段时光了？'
  }
  return '晚上好，把今天轻轻放在这里吧'
}

function mergeSources(current: DiarySource[] = [], incoming: DiarySource[] = []) {
  const map = new Map(current.map(source => [source.id, source]))
  for (const source of incoming) {
    map.set(source.id, source)
  }
  return [...map.values()].slice(0, 6)
}

function formatSourceDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function friendlyModelError(message: string): string {
  if (/\b429\b|rate.?limit|too many requests/i.test(message)) {
    return '模型服务现在有点忙，请稍后再试，或在右上角设置中换一个可用模型。你的日记和本地索引没有受到影响。'
  }
  if (/\b401\b|\b403\b|unauthorized|forbidden|api.?key/i.test(message)) {
    return '模型连接没有通过验证，请在右上角设置中检查 API Key、接口地址和模型名称。'
  }
  if (/network|timeout|timed out|ECONN|连接/i.test(message)) {
    return '暂时连接不上模型服务，请检查网络后再试。本地日记和语义索引仍然安全保存在设备上。'
  }
  return `刚才没有完成：${message}`
}

function shouldUseLocalFallback(question: string): boolean {
  return !/写一篇|帮我写|记一笔|新建|删除|修改|改成|朗读|念给我听/.test(question)
}

export default function AgentChat({ repo, tts, rag, memory, onOpenDiary }: Props) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])
  const [activeView, setActiveView] = useState<'chat' | 'memory'>('chat')
  const [input, setInput] = useState('')
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [ragStatus, setRagStatus] = useState<LocalRagStatus | null>(null)
  const [ragProgress, setRagProgress] = useState<RagProgress | null>(null)
  const [ragBusy, setRagBusy] = useState(false)
  const [memoryRefreshKey, setMemoryRefreshKey] = useState(0)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const historyRef = useRef<ChatMessage[]>([])
  const scrollRef = useRef<ScrollView>(null)

  const speak = async (text: string, id: string) => {
    if (!tts || speakingId) {
      return
    }
    setSpeakingId(id)
    try {
      await tts.speak(text)
    } finally {
      setSpeakingId(null)
    }
  }

  useEffect(() => {
    let active = true
    loadAgentSession()
      .then(messages => {
        if (!active) {
          return
        }
        historyRef.current = messages
        setBubbles(
          messages.map((message, index) => ({
            id: `restored-${index}`,
            role: message.role as 'user' | 'assistant',
            text: message.content ?? '',
            sources: message.sources,
          })),
        )
      })
      .finally(() => {
        if (active) {
          setHydrated(true)
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!rag) {
      setRagStatus(null)
      return () => {
        active = false
      }
    }
    rag
      .getStatus()
      .then(next => {
        if (active) {
          setRagStatus(next)
        }
      })
      .catch(error => {
        if (!active) {
          return
        }
        setRagStatus({
          state: 'error',
          modelId: 'local-semantic-model',
          modelBytes: 136313389,
          indexedDiaries: 0,
          indexedChunks: 0,
          message: error instanceof Error ? error.message : String(error),
        })
      })
    return () => {
      active = false
    }
  }, [rag])

  const prepareLocalRag = async () => {
    if (!rag || ragBusy) {
      return
    }
    setRagBusy(true)
    setRagProgress(null)
    try {
      const diaries = await repo.list()
      const next = await rag.prepare(diaries, progress => {
        setRagProgress(progress)
        setRagStatus(previous =>
          previous
            ? { ...previous, state: 'working', message: progress.message }
            : {
                state: 'working',
                modelId: 'local-semantic-model',
                modelBytes: 136313389,
                indexedDiaries: 0,
                indexedChunks: 0,
                message: progress.message,
              },
        )
      })
      setRagStatus(next)
      setRagProgress(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRagStatus(previous => ({
        state: 'error',
        modelId: previous?.modelId ?? 'local-semantic-model',
        modelBytes: previous?.modelBytes ?? 136313389,
        indexedDiaries: previous?.indexedDiaries ?? 0,
        indexedChunks: previous?.indexedChunks ?? 0,
        message,
      }))
      Alert.alert('本地语义检索启用失败', message)
    } finally {
      setRagBusy(false)
    }
  }

  const requestPrepareLocalRag = () => {
    if (!rag || ragBusy) {
      return
    }
    if (ragStatus?.state === 'ready') {
      prepareLocalRag().catch(() => undefined)
      return
    }
    const megabytes = Math.ceil((ragStatus?.modelBytes ?? 136313389) / 1024 / 1024)
    Alert.alert(
      '启用本地语义检索？',
      `将下载约 ${megabytes} MB 的多语言语义模型，建议使用 Wi-Fi。建索引和匹配都在本机进行；为了组织回答，命中的必要片段会发送给你配置的模型服务。加密日记不会进入索引。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '下载并启用', onPress: () => prepareLocalRag().catch(() => undefined) },
      ],
    )
  }

  const confirmTool = useCallback(
    (request: ToolApprovalRequest) =>
      new Promise<boolean>(resolve => {
        let settled = false
        const finish = (approved: boolean) => {
          if (settled) {
            return
          }
          settled = true
          resolve(approved)
        }
        const isMemory = request.name === 'remember_user_fact'
        const isForget = request.name === 'forget_memory'
        Alert.alert(
          isMemory ? '加入长期记忆？' : isForget ? '忘记这条信息？' : '确认日记操作',
          `${request.description}\n\n${
            isMemory
              ? '保存后，拾光会在相关对话中参考它；你可以随时在“记忆”中修改或删除。'
              : '确认后才会修改本地数据。'
          }`,
          [
            { text: '取消', style: 'cancel', onPress: () => finish(false) },
            { text: isMemory ? '确认保存' : '确认执行', onPress: () => finish(true) },
          ],
          { cancelable: true, onDismiss: () => finish(false) },
        )
      }),
    [],
  )

  const clearConversation = async () => {
    if (busy) {
      return
    }
    await clearAgentSession()
    historyRef.current = []
    setBubbles([])
    setStatus('')
  }

  const requestClearConversation = () => {
    if (busy) {
      return
    }
    Alert.alert('清空本地对话？', '只清除助手聊天记录，不会删除日记或长期记忆。', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => clearConversation().catch(() => undefined),
      },
    ])
  }

  const submit = async (question?: string) => {
    const q = (question ?? input).trim()
    if (!q || busy || ragBusy || !hydrated) {
      return
    }
    const now = Date.now()
    const uid = `u${now}`
    const aid = `a${now}`
    setInput('')
    setBubbles(previous => [
      ...previous,
      { id: uid, role: 'user', text: q },
      { id: aid, role: 'assistant', text: '', sources: [] },
    ])
    setBusy(true)
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
    let lastError = ''
    let currentSources: DiarySource[] = []

    const handle = (event: AgentEvent) => {
      switch (event.type) {
        case 'thinking':
          setStatus('正在理解你想说的…')
          break
        case 'tool_start':
          setStatus(TOOL_STATUS[event.name] ?? '正在整理相关信息…')
          break
        case 'tool_end':
          setStatus(event.ok ? '已经找到线索，正在整理…' : '没查到，正在换个方式…')
          if (event.sources?.length) {
            currentSources = mergeSources(currentSources, event.sources)
            setBubbles(previous =>
              previous.map(bubble =>
                bubble.id === aid ? { ...bubble, sources: currentSources } : bubble,
              ),
            )
          }
          if (event.ok && (event.name === 'remember_user_fact' || event.name === 'forget_memory')) {
            setMemoryRefreshKey(value => value + 1)
          }
          break
        case 'approval_required':
          setStatus(event.name === 'remember_user_fact' ? '等你确认是否记住…' : '等待你确认…')
          break
        case 'approval_result':
          setStatus(event.approved ? '收到，正在执行…' : '已取消，继续整理回复…')
          break
        case 'context_compacted':
          setStatus(`已在本地整理 ${event.omittedMessages} 条较早对话…`)
          break
        case 'rag_progress':
          setStatus(event.message)
          setRagProgress(event)
          break
        case 'token':
          setStatus('')
          setBubbles(previous =>
            previous.map(bubble =>
              bubble.id === aid ? { ...bubble, text: bubble.text + event.text } : bubble,
            ),
          )
          scrollRef.current?.scrollToEnd({ animated: true })
          break
        case 'done': {
          const answer = event.answer.trim() || '模型没有返回可显示的内容，请重试。'
          setBubbles(previous =>
            previous.map(bubble => (bubble.id === aid ? { ...bubble, text: answer } : bubble)),
          )
          const nextHistory: ChatMessage[] = [
            ...historyRef.current,
            { role: 'user', content: q },
            { role: 'assistant', content: answer, sources: currentSources },
          ]
          historyRef.current = nextHistory
          saveAgentSession(nextHistory).catch(() => undefined)
          rag
            ?.getStatus()
            .then(next => setRagStatus(next))
            .catch(() => undefined)
          setBusy(false)
          setStatus('')
          break
        }
        case 'error':
          lastError = event.message
          setBubbles(previous =>
            previous.map(bubble =>
              bubble.id === aid ? { ...bubble, text: friendlyModelError(event.message) } : bubble,
            ),
          )
          setBusy(false)
          setStatus('')
          break
      }
    }

    try {
      await runAgent(q, { repo, history: historyRef.current, tts, rag, memory }, handle, {
        confirmTool,
      })
    } catch (cause) {
      const rawMessage =
        lastError || (cause instanceof Error ? cause.message : String(cause ?? '未知错误'))
      let usedLocalFallback = false
      if (rag && shouldUseLocalFallback(q)) {
        try {
          const localStatus = await rag.getStatus()
          if (localStatus.state === 'ready') {
            setBusy(true)
            setStatus('模型暂时不可用，正在改用本地语义检索…')
            const response = await rag.search(q, await repo.list(), { limit: 4 })
            if (response.diaries.length > 0) {
              usedLocalFallback = true
              const sources: DiarySource[] = response.diaries.map(item => ({
                id: item.id,
                title: item.title,
                createdAt: item.createdAt,
                excerpt: item.content,
                mood: item.mood,
                score: item.score,
              }))
              currentSources = sources
              const answer =
                '模型服务暂时忙，我先在本机找到这些可能相关的日记。你可以直接打开原文查看；稍后重试，我再帮你把它们整理成完整回答。'
              setBubbles(previous =>
                previous.map(bubble =>
                  bubble.id === aid ? { ...bubble, text: answer, sources } : bubble,
                ),
              )
              const nextHistory: ChatMessage[] = [
                ...historyRef.current,
                { role: 'user', content: q },
                { role: 'assistant', content: answer, sources },
              ]
              historyRef.current = nextHistory
              saveAgentSession(nextHistory).catch(() => undefined)
            }
          }
        } catch {
          usedLocalFallback = false
        }
      }
      if (!usedLocalFallback) {
        setBubbles(previous =>
          previous.map(bubble =>
            bubble.id === aid ? { ...bubble, text: friendlyModelError(rawMessage) } : bubble,
          ),
        )
      }
      setBusy(false)
      setStatus('')
    }
  }

  const ragReady = ragStatus?.state === 'ready' && ragStatus.indexedDiaries > 0
  const ragLabel =
    ragBusy || ragStatus?.state === 'working'
      ? `${ragProgress?.percent ?? 0}%`
      : ragReady
      ? `${ragStatus.indexedDiaries} 篇已连接`
      : ragStatus?.state === 'error'
      ? '需要重试'
      : '尚未启用'

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
    >
      <View style={styles.viewSwitcherWrap}>
        <View style={styles.viewSwitcher}>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeView === 'chat' }}
            onPress={() => setActiveView('chat')}
            style={[styles.viewTab, activeView === 'chat' && styles.viewTabActive]}
          >
            <Text style={[styles.viewTabText, activeView === 'chat' && styles.viewTabTextActive]}>
              对话
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeView === 'memory' }}
            onPress={() => setActiveView('memory')}
            style={[styles.viewTab, activeView === 'memory' && styles.viewTabActive]}
          >
            <Text style={[styles.viewTabText, activeView === 'memory' && styles.viewTabTextActive]}>
              记忆
            </Text>
          </TouchableOpacity>
        </View>
        {activeView === 'chat' && !!rag && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={requestPrepareLocalRag}
            disabled={ragBusy || ragStatus?.state === 'working'}
            style={styles.ragPill}
          >
            {ragBusy || ragStatus?.state === 'working' ? (
              <ActivityIndicator size="small" color={theme.colors.brand.primary} />
            ) : (
              <View style={[styles.statusDot, ragReady && styles.statusDotReady]} />
            )}
            <Text style={styles.ragPillText}>{ragLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {activeView === 'memory' ? (
        <MemoryPanel memory={memory} refreshKey={memoryRefreshKey} onOpenDiary={onOpenDiary} />
      ) : (
        <>
          {bubbles.length > 0 && (
            <View style={styles.sessionBar}>
              <View style={styles.localOnly}>
                <Icon name="bookmark" size={13} color={theme.colors.semantic.icon.tertiary} />
                <Text style={styles.sessionHint}>对话保存在本机</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={busy}
                onPress={requestClearConversation}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>新对话</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            ref={scrollRef}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              bubbles.length === 0 && styles.emptyListContent,
            ]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (bubbles.length > 0) {
                scrollRef.current?.scrollToEnd({ animated: false })
              }
            }}
          >
            {bubbles.length === 0 ? (
              <View style={styles.welcome}>
                <View style={styles.orbOuter}>
                  <View style={styles.orbInner}>
                    <Text style={styles.orbText}>拾</Text>
                  </View>
                </View>
                <Text style={styles.welcomeTitle}>{greeting()}</Text>
                <Text style={styles.welcomeText}>
                  我可以从你的日记中寻找旧时光、整理情绪，也会在保存长期记忆前先问你。
                </Text>
                <View style={styles.privacyRow}>
                  <View style={styles.privacyItem}>
                    <View style={styles.privacyDot} />
                    <Text style={styles.privacyText}>语义匹配在本机</Text>
                  </View>
                  <View style={styles.privacyDivider} />
                  <Text style={styles.privacyText}>回答附原文依据</Text>
                </View>
                <View style={styles.quickGrid}>
                  {QUICK_ACTIONS.map(action => (
                    <TouchableOpacity
                      key={action.title}
                      accessibilityRole="button"
                      disabled={busy || !hydrated}
                      onPress={() => submit(action.prompt)}
                      style={styles.quickCard}
                    >
                      <View style={styles.quickIcon}>
                        <Icon name={action.icon} size={19} color={theme.colors.brand.primary} />
                      </View>
                      <Text style={styles.quickTitle}>{action.title}</Text>
                      <Text style={styles.quickHint}>{action.hint}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {!!rag && !ragReady && ragStatus?.state !== 'working' && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={requestPrepareLocalRag}
                    style={styles.enableRagCard}
                  >
                    <View style={styles.enableRagIcon}>
                      <Icon name="search" size={20} color={theme.colors.brand.primary} />
                    </View>
                    <View style={styles.enableRagCopy}>
                      <Text style={styles.enableRagTitle}>开启更懂你的本地回忆</Text>
                      <Text style={styles.enableRagText}>下载一次模型，即可按含义寻找日记</Text>
                    </View>
                    <Icon
                      name="chevronRight"
                      size={18}
                      color={theme.colors.semantic.icon.tertiary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              bubbles.map(bubble => (
                <View
                  key={bubble.id}
                  style={[
                    styles.messageRow,
                    bubble.role === 'user' ? styles.userMessageRow : styles.aiMessageRow,
                  ]}
                >
                  {bubble.role === 'assistant' && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>拾</Text>
                    </View>
                  )}
                  <View style={styles.messageColumn}>
                    <View
                      style={[
                        styles.bubble,
                        bubble.role === 'user' ? styles.userBubble : styles.aiBubble,
                      ]}
                    >
                      {bubble.text ? (
                        <Text style={bubble.role === 'user' ? styles.userText : styles.aiText}>
                          {bubble.text}
                        </Text>
                      ) : (
                        <View style={styles.typingDots}>
                          <View style={styles.typingDot} />
                          <View style={styles.typingDot} />
                          <View style={styles.typingDot} />
                        </View>
                      )}
                    </View>
                    {bubble.role === 'assistant' && !!bubble.sources?.length && (
                      <View style={styles.sourcesWrap}>
                        <View style={styles.sourcesHeading}>
                          <Icon name="book" size={14} color={theme.colors.brand.primary} />
                          <Text style={styles.sourcesTitle}>依据这些日记</Text>
                        </View>
                        {bubble.sources.map(source => (
                          <TouchableOpacity
                            key={source.id}
                            accessibilityRole="link"
                            onPress={() => onOpenDiary?.(source.id)}
                            disabled={!onOpenDiary}
                            style={styles.sourceCard}
                          >
                            <View style={styles.sourceAccent} />
                            <View style={styles.sourceCopy}>
                              <View style={styles.sourceTopRow}>
                                <Text style={styles.sourceTitle} numberOfLines={1}>
                                  {source.title}
                                </Text>
                                <Text style={styles.sourceDate}>
                                  {formatSourceDate(source.createdAt)}
                                </Text>
                              </View>
                              {!!source.excerpt && (
                                <Text style={styles.sourceExcerpt} numberOfLines={2}>
                                  {source.excerpt}
                                </Text>
                              )}
                            </View>
                            {!!onOpenDiary && (
                              <Icon
                                name="chevronRight"
                                size={16}
                                color={theme.colors.semantic.icon.tertiary}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {bubble.role === 'assistant' && !!tts && !!bubble.text && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => speak(bubble.text, bubble.id)}
                        style={styles.speakButton}
                      >
                        <Icon name="mic" size={14} color={theme.colors.semantic.icon.secondary} />
                        <Text style={styles.speakText}>
                          {speakingId === bubble.id ? '朗读中…' : '听一听'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
            {busy && !!status && bubbles.length > 0 && (
              <View style={styles.statusCard}>
                <ActivityIndicator size="small" color={theme.colors.brand.primary} />
                <Text style={styles.statusText}>{status}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.composerWrap}>
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="说说此刻，或问问过去的自己…"
                placeholderTextColor={theme.colors.semantic.text.tertiary}
                onSubmitEditing={() => submit()}
                editable={hydrated && !busy && !ragBusy}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="发送"
                onPress={() => submit()}
                disabled={busy || !hydrated || ragBusy || !input.trim()}
                style={[
                  styles.sendButton,
                  (busy || !hydrated || ragBusy || !input.trim()) && styles.sendButtonDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="chevronUp" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.composerHint}>拾光可能会出错，重要结论请回看原文</Text>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  )
}

function createStyles(theme: Theme) {
  const { semantic, brand } = theme.colors
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: semantic.bg.canvas },
    viewSwitcherWrap: {
      minHeight: 52,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: semantic.border.subtle,
      backgroundColor: semantic.bg.card,
    },
    viewSwitcher: {
      padding: 3,
      borderRadius: 13,
      flexDirection: 'row',
      backgroundColor: semantic.bg.input,
    },
    viewTab: {
      minWidth: 62,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
      alignItems: 'center',
    },
    viewTabActive: { backgroundColor: semantic.bg.card },
    viewTabText: { fontSize: 13, color: semantic.text.tertiary },
    viewTabTextActive: { color: semantic.text.primary, fontWeight: '600' },
    ragPill: {
      maxWidth: 150,
      minHeight: 30,
      paddingHorizontal: 10,
      borderRadius: 15,
      backgroundColor: brand.primaryGhost,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 6,
      backgroundColor: semantic.icon.tertiary,
    },
    statusDotReady: { backgroundColor: brand.primary },
    ragPillText: { marginLeft: 5, fontSize: 11, color: brand.primary, fontWeight: '600' },
    sessionBar: {
      minHeight: 36,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: semantic.bg.subtle,
    },
    localOnly: { flexDirection: 'row', alignItems: 'center' },
    sessionHint: { marginLeft: 5, color: semantic.text.tertiary, fontSize: 11 },
    clearButton: { paddingHorizontal: 6, paddingVertical: 7 },
    clearText: { color: brand.primary, fontSize: 12, fontWeight: '600' },
    list: { flex: 1, backgroundColor: semantic.bg.subtle },
    listContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 22 },
    emptyListContent: { flexGrow: 1, justifyContent: 'center' },
    welcome: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center' },
    orbOuter: {
      width: 78,
      height: 78,
      borderRadius: 39,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primaryGhost,
      marginBottom: 16,
    },
    orbInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    orbText: { color: '#fff', fontSize: 23, fontWeight: '700' },
    welcomeTitle: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '700',
      color: semantic.text.primary,
      textAlign: 'center',
    },
    welcomeText: {
      maxWidth: 330,
      marginTop: 8,
      fontSize: 14,
      lineHeight: 22,
      color: semantic.text.secondary,
      textAlign: 'center',
    },
    privacyRow: {
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      backgroundColor: brand.primaryGhost,
    },
    privacyItem: { flexDirection: 'row', alignItems: 'center' },
    privacyDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
      backgroundColor: brand.primary,
    },
    privacyDivider: {
      width: StyleSheet.hairlineWidth,
      height: 12,
      marginHorizontal: 9,
      backgroundColor: semantic.border.default,
    },
    privacyText: { color: semantic.text.secondary, fontSize: 11 },
    quickGrid: {
      width: '100%',
      marginTop: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickCard: {
      width: '48.5%',
      minHeight: 116,
      marginBottom: 10,
      padding: 14,
      borderRadius: 17,
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
    },
    quickIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primaryLight,
    },
    quickTitle: { marginTop: 10, fontSize: 14, fontWeight: '600', color: semantic.text.primary },
    quickHint: { marginTop: 3, fontSize: 11, color: semantic.text.tertiary },
    enableRagCard: {
      width: '100%',
      minHeight: 66,
      marginTop: 2,
      paddingHorizontal: 13,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: brand.primaryLight,
    },
    enableRagIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: semantic.bg.card,
    },
    enableRagCopy: { flex: 1, marginHorizontal: 10 },
    enableRagTitle: { fontSize: 13, fontWeight: '700', color: semantic.text.primary },
    enableRagText: { marginTop: 3, fontSize: 11, color: semantic.text.secondary },
    messageRow: { width: '100%', flexDirection: 'row', marginBottom: 18 },
    userMessageRow: { justifyContent: 'flex-end' },
    aiMessageRow: { justifyContent: 'flex-start', alignItems: 'flex-start' },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 10,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    messageColumn: { maxWidth: '84%', alignItems: 'flex-start' },
    bubble: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 17 },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: brand.primary,
      borderBottomRightRadius: 5,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
      borderTopLeftRadius: 5,
    },
    userText: { color: '#fff', fontSize: 15, lineHeight: 23 },
    aiText: { color: semantic.text.primary, fontSize: 15, lineHeight: 24 },
    typingDots: { minWidth: 44, height: 20, flexDirection: 'row', alignItems: 'center' },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 3,
      backgroundColor: semantic.icon.tertiary,
    },
    sourcesWrap: { width: '100%', marginTop: 9 },
    sourcesHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    sourcesTitle: { marginLeft: 5, fontSize: 11, fontWeight: '600', color: brand.primary },
    sourceCard: {
      minHeight: 58,
      marginBottom: 6,
      paddingVertical: 9,
      paddingRight: 10,
      borderRadius: 13,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
    },
    sourceAccent: {
      width: 3,
      alignSelf: 'stretch',
      marginRight: 10,
      backgroundColor: brand.primary,
    },
    sourceCopy: { flex: 1 },
    sourceTopRow: { flexDirection: 'row', alignItems: 'center' },
    sourceTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: semantic.text.primary },
    sourceDate: { marginLeft: 7, fontSize: 10, color: semantic.text.tertiary },
    sourceExcerpt: { marginTop: 4, fontSize: 11, lineHeight: 16, color: semantic.text.secondary },
    speakButton: { marginTop: 7, marginLeft: 2, flexDirection: 'row', alignItems: 'center' },
    speakText: { marginLeft: 4, color: semantic.text.secondary, fontSize: 11 },
    statusCard: {
      alignSelf: 'flex-start',
      marginLeft: 38,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: brand.primaryGhost,
    },
    statusText: { marginLeft: 8, color: semantic.text.secondary, fontSize: 12 },
    composerWrap: {
      paddingHorizontal: 12,
      paddingTop: 9,
      paddingBottom: Platform.OS === 'ios' ? 8 : 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: semantic.border.subtle,
      backgroundColor: semantic.bg.card,
    },
    composer: {
      minHeight: 50,
      maxHeight: 116,
      paddingLeft: 15,
      paddingRight: 6,
      paddingVertical: 5,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: semantic.bg.input,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 96,
      paddingTop: Platform.OS === 'ios' ? 10 : 8,
      paddingBottom: Platform.OS === 'ios' ? 9 : 7,
      color: semantic.text.primary,
      fontSize: 14,
      lineHeight: 20,
      textAlignVertical: 'center',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    sendButtonDisabled: { opacity: 0.35 },
    composerHint: {
      marginTop: 5,
      textAlign: 'center',
      fontSize: 9,
      color: semantic.text.tertiary,
    },
  })
}
