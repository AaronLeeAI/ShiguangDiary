/**
 * SearchBar - 搜索输入
 *
 * 基于 TextField 的搜索专用包装：内置 search 图标 + clearable。
 * 支持右侧"取消"按钮（受控）。
 */

import React from 'react'
import { Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { TextField } from '@/components/TextField'
import { useTheme } from '@theme'
import type { SearchBarProps } from './types'

/**
 * SearchBar 组件
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = '搜索日记...',
  autoFocus = false,
  style,
  testID,
  rightAction,
  showCancel = false,
  onCancel,
}) => {
  const { colors, spacing, typography } = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        backgroundColor: colors.semantic.bg.canvas,
      }}
    >
      <View style={{ flex: 1, ...style }}>
        <TextField
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          autoFocus={autoFocus}
          size="medium"
          leftIcon={<Icon name="search" size={18} color={colors.semantic.icon.tertiary} />}
          clearable
          returnKeyType="search"
        />
      </View>
      {(showCancel || rightAction) && (
        <Pressable onPress={onCancel} hitSlop={8} style={{ paddingHorizontal: spacing.xs }}>
          {rightAction ?? (
            <Text style={{ ...typography.bodyL, color: colors.brand.primary }}>取消</Text>
          )}
        </Pressable>
      )}
    </View>
  )
}

export default SearchBar
