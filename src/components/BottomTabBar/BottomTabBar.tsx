/**
 * BottomTabBar - 底部 Tab 导航栏
 *
 * 4 个一级 Tab：Home / Notebook / Album / Profile
 *
 * 两种使用方式：
 * 1. 受控：传入 currentTab + onTabPress（推荐，由 navigation 驱动）
 * 2. 非受控：传入 defaultTab，内部维护 state
 *
 * 当前实现为纯展示组件，切换 Tab 由业务侧（导航）处理。
 */

import React, { useState } from 'react'
import { Pressable, View, Text } from 'react-native'

import { Icon } from '@/components/Icon'
import { colors } from '@theme'
import { styles } from './styles'
import type { BottomTabBarProps, BottomTabName } from './types'
import { BOTTOM_TABS } from './types'

/**
 * BottomTabBar 组件
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabPress,
  defaultTab = 'Home',
  tabs = BOTTOM_TABS,
  testID,
  style,
}) => {
  // 非受控模式下的内部激活态
  const [internalTab, setInternalTab] = useState<BottomTabName>(defaultTab)
  const isControlled = currentTab !== undefined && onTabPress !== undefined
  const activeTab = isControlled ? currentTab : internalTab

  const handlePress = (tab: BottomTabName) => {
    if (isControlled) {
      onTabPress!(tab)
    } else {
      setInternalTab(tab)
    }
  }

  return (
    <View testID={testID} style={[styles.container, style]}>
      {tabs.map(tab => {
        const isActive = tab.name === activeTab
        const iconName = isActive ? tab.activeIcon ?? tab.icon : tab.icon
        const iconColor = isActive ? colors.brand.primary : colors.semantic.icon.tertiary
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => handlePress(tab.name)}
            style={({ pressed }) => [
              styles.tab,
              pressed && { opacity: 0.6 },
              isActive && styles.tabActive,
            ]}
            hitSlop={8}
          >
            <Icon name={iconName} size={26} color={iconColor} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default BottomTabBar
