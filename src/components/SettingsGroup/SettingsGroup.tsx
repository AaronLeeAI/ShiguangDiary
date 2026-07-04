/**
 * SettingsGroup - 设置项容器
 *
 * 自动为子节点添加分隔线（最后一项除外）。子节点应为 SettingsRow。
 */

import React, { Children } from 'react'
import { Text, View } from 'react-native'

import { styles } from './styles'
import type { SettingsGroupProps } from './types'

/**
 * SettingsGroup 组件
 */
export const SettingsGroup: React.FC<SettingsGroupProps> = ({ children, title, style, testID }) => {
  const arr = Children.toArray(children)

  return (
    <View style={[styles.container, style]} testID={testID}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.card}>
        {arr.map((child, idx) => (
          <React.Fragment key={(child as { key?: string }).key ?? idx}>
            {child}
            {idx < arr.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

export default SettingsGroup
