import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '@/components/Icon'
import {
  createTTSAdapter,
  getLLMConfig,
  memoryAdapter,
  repoAdapter,
  saveLLMCredentials,
} from '@/agent'
import { LLM_DEFAULTS } from '@/agent/defaults'
import { initAgent } from '@/agent/setup'
import { localSemanticRag } from '@/agent/rag/localRag'
import AgentChat from '@/components/AgentChat/AgentChat'
import { ROUTES } from '@/constants/routes'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme, type Theme } from '@theme'

const ttsAdapter = createTTSAdapter()

export default function AgentChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])
  const [ready, setReady] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState(LLM_DEFAULTS.baseURL)
  const [model, setModel] = useState(LLM_DEFAULTS.model)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    initAgent()
      .then(() => {
        if (!active) {
          return
        }
        const config = getLLMConfig()
        const hasKey = Boolean(config.apiKey)
        setBaseURL(config.baseURL)
        setModel(config.model)
        setConfigured(hasKey)
        setShowSettings(!hasKey)
        setReady(true)
      })
      .catch(cause => {
        if (!active) {
          return
        }
        setError(cause instanceof Error ? cause.message : String(cause))
        setShowSettings(true)
        setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const save = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }
    setSaving(true)
    setError('')
    try {
      await saveLLMCredentials({ apiKey, baseURL, model })
      await initAgent()
      setApiKey('')
      setConfigured(true)
      setShowSettings(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="返回"
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="back" size={22} color={theme.colors.semantic.icon.primary} />
        </TouchableOpacity>
        <View style={styles.identity}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>拾</Text>
          </View>
          <View>
            <Text style={styles.title}>拾光</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.subtitle}>懂你的日记伙伴</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={showSettings && configured ? '关闭模型设置' : '模型设置'}
          onPress={() => setShowSettings(value => (configured ? !value : true))}
          style={styles.headerButton}
        >
          <Icon
            name={showSettings && configured ? 'close' : 'settings'}
            size={21}
            color={theme.colors.semantic.icon.secondary}
          />
        </TouchableOpacity>
      </View>

      {!ready ? (
        <View style={styles.loading}>
          <View style={styles.loadingLogo}>
            <Text style={styles.loadingLogoText}>拾</Text>
          </View>
          <ActivityIndicator color={theme.colors.brand.primary} />
          <Text style={styles.loadingText}>正在整理你的拾光空间…</Text>
        </View>
      ) : showSettings ? (
        <ScrollView
          style={styles.settingsPage}
          contentContainerStyle={styles.settingsContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.settingsHero}>
            <View style={styles.settingsHeroIcon}>
              <Icon name="settings" size={22} color={theme.colors.brand.primary} />
            </View>
            <View style={styles.settingsHeroCopy}>
              <Text style={styles.formTitle}>
                {configured ? '更新模型连接' : '连接一个语言模型'}
              </Text>
              <Text style={styles.formDescription}>
                本地语义检索负责寻找日记，语言模型只负责理解问题和组织回答。
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder={configured ? '输入新 Key（原 Key 不会显示）' : '请输入 API Key'}
              placeholderTextColor={theme.colors.semantic.text.tertiary}
              style={styles.field}
            />
            <Text style={styles.label}>接口地址</Text>
            <TextInput
              value={baseURL}
              onChangeText={setBaseURL}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.semantic.text.tertiary}
              style={styles.field}
            />
            <Text style={styles.label}>模型</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.semantic.text.tertiary}
              style={styles.field}
            />
            {!!error && (
              <View style={styles.errorCard}>
                <Text style={styles.error}>{error}</Text>
              </View>
            )}
            <View style={styles.securityNote}>
              <Icon name="bookmark" size={16} color={theme.colors.brand.primary} />
              <Text style={styles.hint}>
                密钥只保存在系统安全存储中，不会写入源码、日记或聊天记录。
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving}
              onPress={save}
              style={[styles.saveButton, saving && styles.disabled]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>{configured ? '保存新配置' : '保存并开始'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.chat}>
          <AgentChat
            repo={repoAdapter}
            tts={ttsAdapter}
            rag={localSemanticRag}
            memory={memoryAdapter}
            onOpenDiary={id => navigation.navigate(ROUTES.DIARY_VIEW, { id })}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

function createStyles(theme: Theme) {
  const { semantic, brand } = theme.colors
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: semantic.bg.card },
    header: {
      height: 62,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: semantic.bg.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: semantic.border.subtle,
    },
    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identity: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 2 },
    logo: {
      width: 38,
      height: 38,
      borderRadius: 13,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    logoText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    title: { fontSize: 17, fontWeight: '700', color: semantic.text.primary },
    subtitleRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
      backgroundColor: brand.primary,
    },
    subtitle: { fontSize: 10, color: semantic.text.tertiary },
    chat: { flex: 1 },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: semantic.bg.subtle,
    },
    loadingLogo: {
      width: 58,
      height: 58,
      borderRadius: 20,
      marginBottom: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    loadingLogoText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    loadingText: { marginTop: 12, color: semantic.text.tertiary, fontSize: 13 },
    settingsPage: { flex: 1, backgroundColor: semantic.bg.subtle },
    settingsContent: { padding: 16, paddingBottom: 40 },
    settingsHero: {
      padding: 16,
      borderRadius: 18,
      flexDirection: 'row',
      backgroundColor: brand.primaryLight,
      marginBottom: 14,
    },
    settingsHeroIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: semantic.bg.card,
      marginRight: 12,
    },
    settingsHeroCopy: { flex: 1 },
    formTitle: { fontSize: 17, fontWeight: '700', color: semantic.text.primary },
    formDescription: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 20,
      color: semantic.text.secondary,
    },
    formCard: {
      padding: 17,
      borderRadius: 18,
      backgroundColor: semantic.bg.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: semantic.border.subtle,
    },
    label: { color: semantic.text.secondary, fontSize: 12, fontWeight: '600', marginBottom: 7 },
    field: {
      minHeight: 48,
      borderRadius: 14,
      paddingHorizontal: 13,
      marginBottom: 16,
      backgroundColor: semantic.bg.input,
      color: semantic.text.primary,
      fontSize: 14,
    },
    securityNote: {
      padding: 12,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: brand.primaryGhost,
    },
    hint: { flex: 1, marginLeft: 8, color: semantic.text.secondary, fontSize: 11, lineHeight: 17 },
    errorCard: {
      padding: 11,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(250,81,81,0.09)',
    },
    error: { color: semantic.text.danger, fontSize: 12, lineHeight: 18 },
    saveButton: {
      minHeight: 48,
      marginTop: 18,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brand.primary,
    },
    disabled: { opacity: 0.6 },
    saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  })
}
