/**
 * AboutCard - 关于页卡片(应用图标/名/版本/简介 + 占位入口)
 *
 * 纯展示受控组件,token 样式。开源许可与检查更新为预留入口(本 Task 不实现,
 * onPress 留 undefined 即不渲染按钮)。
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'

export interface AboutCardProps {
  appName: string
  version: string
  description: string
  testID?: string
}

export const AboutCard: React.FC<AboutCardProps> = ({ appName, version, description, testID }) => {
  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>📔</Text>
      </View>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.version}>版本 {version}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const APP_NAME_SIZE = 64

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  iconCircle: {
    width: APP_NAME_SIZE,
    height: APP_NAME_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primaryGhost,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconEmoji: {
    fontSize: 32,
  },
  appName: {
    ...typography.titleL,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyM,
    color: colors.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: typography.bodyM.lineHeight,
  },
})

export default AboutCard
