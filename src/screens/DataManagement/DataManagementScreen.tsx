/**
 * Data Management Screen - 数据管理(P0 数据生命周期)
 *
 * Task15:备份/恢复/导出/导入/完整性检查/同步状态统一入口。
 * 数据流:DataManagementScreen → useDataManagement → backupService/syncService
 * → @database Repository/fileStorage/mmkvStorage。
 *
 * Out of Scope:ZIP 打包/附件二进制/真实云同步/文件选择器导入(本 Task 仅建立框架 +
 * JSON 导出/备份/列表/删除,导入校验接口已就位,真实导入文件选取留 TODO)。
 */

import React, { useCallback } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LoadingOverlay } from '@/components/LoadingOverlay'
import { SettingsGroup } from '@/components/SettingsGroup'
import { SettingsRow } from '@/components/SettingsRow'
import { TopBar } from '@/components/TopBar'
import { BackupCard, SyncStatusCard, useDataManagement } from '@features/data-management'
import type { BackupMetadata } from '@features/data-management'
import { haptic } from '@animations/haptics'
import { syncService, localSyncProvider } from '@services'
import type { RootStackParamList } from '@navigation/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors, spacing, typography } from '@theme'

export type DataManagementScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Export'
>
export interface DataManagementScreenProps {
  navigation: DataManagementScreenNavigationProp
}

export const DataManagementScreen: React.FC<DataManagementScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const dm = useDataManagement()
  const isBusy = dm.busy !== 'idle'

  const confirmDanger = useCallback((message: string, onConfirm: () => void) => {
    haptic('warning')
    Alert.alert('确认操作', message, [
      { text: '取消', style: 'cancel' },
      { text: '确认', style: 'destructive', onPress: onConfirm },
    ])
  }, [])

  const handleCreateBackup = useCallback(async () => {
    const meta = await dm.createBackup()
    if (meta) {
      haptic('saveSuccess')
      Alert.alert('备份完成', `已创建备份(${meta.stats.diaries} 日记)`)
    } else {
      haptic('error')
    }
  }, [dm])

  const handleDeleteBackup = useCallback(
    (filename: string) => {
      confirmDanger(`确定删除备份 ${filename}?此操作不可撤销。`, () => {
        haptic('delete')
        dm.deleteBackup(filename)
      })
    },
    [confirmDanger, dm],
  )

  const handleRestore = useCallback(
    (meta: BackupMetadata) => {
      confirmDanger(
        `恢复备份 ${meta.filename}?\n` +
          '当前为最佳努力恢复:逐表 upsert,不具备强原子回滚。\n' +
          '恢复后应用缓存将自动刷新,顶部出现的旧数据将被覆盖。',
        async () => {
          const stats = await dm.restore(meta)
          if (stats) {
            haptic('complete')
            Alert.alert(
              '恢复完成',
              `已恢复 ${stats.diaries} 日记 · ${stats.notebooks} 日记本 · ${stats.albums} 相册\n应用缓存已刷新。`,
            )
          } else {
            haptic('error')
            Alert.alert('恢复失败', dm.lastError ?? '未知错误')
          }
        },
      )
    },
    [confirmDanger, dm],
  )

  const handleExport = useCallback(async () => {
    const file = await dm.exportJSON()
    if (file) {
      haptic('saveSuccess')
      Alert.alert(
        '导出完成',
        `JSON 已生成(${file.content.length} 字符)\n文件名:${file.filename}\n(分享面板为后续 TODO)`,
      )
    }
  }, [dm])

  const handleIntegrity = useCallback(async () => {
    const report = await dm.runIntegrityCheck()
    if (report) {
      haptic(report.ok ? 'complete' : 'warning')
      const msg = report.ok
        ? `完整性检查通过\n${report.stats.diaries} 日记 · ${report.stats.attachments} 附件`
        : `发现 ${report.issues.length} 个问题\n${report.issues
            .slice(0, 3)
            .map(i => '· ' + i.message)
            .join('\n')}${report.issues.length > 3 ? '\n...' : ''}`
      Alert.alert('完整性检查', msg)
    }
  }, [dm])

  const handleSync = useCallback(async () => {
    try {
      const result = await syncService.sync()
      haptic('complete')
      Alert.alert(
        '同步完成',
        `提供者:${result.providerId}\npush ${result.pushed} · pull ${result.pulled} · 冲突 ${result.conflicts}`,
      )
    } catch (e) {
      haptic('error')
      Alert.alert('同步失败', e instanceof Error ? e.message : String(e))
    }
    dm.refreshSyncStatus()
  }, [dm])

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <TopBar title="数据管理" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.huge }}
        scrollEnabled={!isBusy}
      >
        {/* 同步状态 */}
        <SyncStatusCard
          providerId={dm.syncProviderId}
          providerName={localSyncProvider.displayName}
          lastSyncedAt={dm.syncLastSyncedAt}
          isConfigured={dm.syncIsConfigured}
          pending={0}
        />
        <SettingsGroup>
          <SettingsRow
            icon="save"
            label="立即同步"
            hint={dm.syncIsConfigured ? '本地' : '未配置'}
            onPress={handleSync}
          />
        </SettingsGroup>

        {/* 备份操作 */}
        <SettingsGroup title="备份">
          <SettingsRow
            icon="save"
            label="创建备份"
            hint={
              dm.lastBackupAt
                ? `上次:${new Date(dm.lastBackupAt).toLocaleDateString()}`
                : '尚未备份'
            }
            onPress={handleCreateBackup}
          />
          <SettingsRow
            icon="export"
            label="导出数据(JSON)"
            hint="生成 JSON"
            onPress={handleExport}
          />
        </SettingsGroup>

        {/* 维护 */}
        <SettingsGroup title="维护">
          <SettingsRow icon="check" label="数据完整性检查" onPress={handleIntegrity} />
          <SettingsRow
            icon="doc"
            label="关于数据管理"
            hint="v0.1.0"
            showArrow={false}
            onPress={() =>
              Alert.alert(
                '关于数据管理',
                'Local First:本地数据为唯一可信来源。\n本版本支持 JSON 备份/导出 + 完整性检查 + 同步框架(Local)。\nZIP 打包/附件二进制/云同步/导入文件选取为后续版本。',
              )
            }
          />
        </SettingsGroup>

        {/* 备份列表 */}
        <Text style={styles.sectionTitle}>备份列表</Text>
        {dm.backups.length === 0 ? (
          <Text style={styles.empty}>暂无备份。点击「创建备份」开始。</Text>
        ) : (
          dm.backups.map(b => (
            <BackupCard
              key={b.filename}
              data={b}
              onRestore={() => handleRestore(b)}
              onDelete={() => handleDeleteBackup(b.filename)}
            />
          ))
        )}

        {dm.lastError && <Text style={styles.error}>错误:{dm.lastError}</Text>}

        {__DEV__ && (
          <SettingsGroup title="调试(开发)">
            <SettingsRow
              icon="tune"
              label="路由 export stub 已替换"
              hint="ROUTES.EXPORT"
              showArrow={false}
              disabled
            />
          </SettingsGroup>
        )}
      </ScrollView>

      <LoadingOverlay
        visible={isBusy}
        message={
          dm.progress ? `${dm.progress.stage}… ${Math.round(dm.progress.value * 100)}%` : '处理中…'
        }
      />
    </View>
  )
}

const styles = {
  sectionTitle: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  empty: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  error: {
    ...typography.bodyS,
    color: colors.func.danger,
    marginTop: spacing.md,
    textAlign: 'center',
  },
} as const

export default DataManagementScreen
