/**
 * Loading Component
 *
 * 加载状态展示。基于设计规范 docs/project-设计-docs/components/Loading.md
 *
 * 三种形态：
 * - full：全屏（P001 开屏 + 内容加载）
 * - dialog：弹窗（会员中心等）
 * - inline：内联（按钮内或固定区域，使用父组件处理 visibility）
 */

import React from 'react'
import { View, Text, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'

import { Spinner } from './Spinner'
import { styles } from './styles'
import type { LoadingProps } from './types'

export const Loading: React.FC<LoadingProps> = ({
  variant,
  visible,
  text,
  iconSize,
  backdropDismiss,
  onDismiss,
  style,
  testID,
}) => {
  // full：全屏展示
  if (variant === 'full') {
    if (!visible) {
      return null
    }
    return (
      <View testID={testID} style={[styles.fullContainer, style]}>
        <Spinner size={iconSize ?? 64} />
        {!!text && <Text style={styles.text}>{text}</Text>}
      </View>
    )
  }

  // dialog：弹窗
  if (variant === 'dialog') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
        statusBarTranslucent
      >
        <Pressable
          style={styles.dialogBackdrop}
          onPress={() => {
            if (backdropDismiss && onDismiss) {
              onDismiss()
            }
          }}
        >
          <TouchableWithoutFeedback>
            <View testID={testID} style={styles.dialogBox}>
              <Spinner size={iconSize ?? 24} />
              {!!text && <Text style={styles.dialogText}>{text}</Text>}
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    )
  }

  // inline：内联（自行控制 visibility）
  if (!visible) {
    return null
  }
  return (
    <View testID={testID} style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Spinner size={iconSize ?? 24} />
      {!!text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

export default Loading
