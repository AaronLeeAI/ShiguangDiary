/**
 * EditorToolbar - 编辑器底部工具栏
 *
 * 横向排列的工具按钮。点击回调 onToolPress(tool)。
 * 当前激活的工具可显示高亮（activeTools 数组）。
 */

import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';

import {Icon} from '@/components/Icon';
import {colors} from '@theme';
import {styles} from './styles';
import {DEFAULT_EDITOR_TOOLS} from './types';
import type {EditorToolbarProps, EditorTool} from './types';

/**
 * EditorToolbar 组件
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onToolPress,
  activeTools = [],
  tools = DEFAULT_EDITOR_TOOLS,
  testID,
  style,
}) => {
  const handlePress = (tool: EditorTool) => {
    onToolPress?.(tool);
  };

  const activeSet = new Set<EditorTool>(activeTools);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      testID={testID}>
      {tools.map(t => {
        const isActive = activeSet.has(t.tool);
        return (
          <Pressable
            key={t.tool}
            accessibilityRole="button"
            accessibilityLabel={t.label}
            accessibilityState={{selected: isActive}}
            onPress={() => handlePress(t.tool)}
            hitSlop={4}
            style={({pressed}) => [
              styles.toolButton,
              pressed && styles.toolButtonPressed,
              isActive && styles.toolButtonActive,
            ]}>
            <Icon
              name={t.icon}
              size={22}
              color={isActive ? colors.brand.primary : colors.semantic.icon.primary}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

// re-export View（备用：当不需要横向滚动时可包成 View）
export {View as EditorToolbarView};

export default EditorToolbar;