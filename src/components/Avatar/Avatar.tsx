/**
 * Avatar Component
 *
 * 头像组件。基于设计规范 docs/project-设计-docs/components/Avatar.md
 *
 * - 支持图片源（uri/require）展示
 * - 无图片时回退到 name 首字 + 浅灰背景
 * - 可选圆形或方形
 * - 支持 editable 时叠加相机角标
 *
 * 注意：当前 Task1 阶段不集成 react-native-fast-image（依赖 rnpm link），
 * 使用 RN 内置 Image。后续可在性能瓶颈时切换。
 */

import React from 'react'
import { View, Text, Image, TouchableOpacity, type ImageSourcePropType } from 'react-native'

import { AVATAR_SIZE, type AvatarProps, type AvatarSize } from './types'
import { styles, avatarSizeStyle } from './styles'

const FIRST_LETTER_BG = ['#E8F8EF', '#FDE8E8', '#E8F4FD', '#FDF8E8', '#F8E8FD']

const getInitialBg = (name?: string): string => {
  if (!name) {
    return FIRST_LETTER_BG[0]
  }
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff
  }
  return FIRST_LETTER_BG[Math.abs(hash) % FIRST_LETTER_BG.length]
}

const getInitial = (name?: string): string => {
  if (!name) {
    return '?'
  }
  return name.trim().charAt(0).toUpperCase()
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  shape = 'circle',
  onPress,
  editable,
  style,
  testID,
}) => {
  const sizeStyle = avatarSizeStyle(size)
  const initialFontSize =
    typeof size === 'number'
      ? Math.round(size * 0.45)
      : Math.round(AVATAR_SIZE[size as AvatarSize] * 0.45)

  const containerStyle = [styles.container, sizeStyle, shape === 'square' && styles.square, style]

  const content = source ? (
    <Image
      source={source as ImageSourcePropType}
      style={[styles.image, shape === 'square' && styles.square]}
      resizeMode="cover"
    />
  ) : (
    <View style={[styles.fallback, { backgroundColor: getInitialBg(name) }]}>
      <Text style={[styles.textInitial, { fontSize: initialFontSize }]}>{getInitial(name)}</Text>
    </View>
  )

  const inner = (
    <View testID={testID} style={containerStyle}>
      {content}
      {editable && (
        <View style={styles.editBadge}>
          <Text style={styles.editIcon}>✎</Text>
        </View>
      )}
    </View>
  )

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{inner}</TouchableOpacity>
  }

  return inner
}

export default Avatar
