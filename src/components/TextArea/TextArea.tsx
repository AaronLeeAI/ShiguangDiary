/**
 * TextArea - 多行输入
 *
 * 日记正文编辑器。基于 RN TextInput multiline 实现，支持：
 * - minHeight / maxHeight 自动撑高
 * - showCount 字符计数（maxLength 警告/危险阈值）
 * - error 错误态
 */

import React, {useState} from 'react';
import {Text, TextInput, View, type NativeSyntheticEvent, type TextInputFocusEventData} from 'react-native';

import {colors} from '@theme';
import {styles} from './styles';
import type {TextAreaProps} from './types';

/**
 * TextArea 组件
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChangeText,
  placeholder,
  minHeight = 120,
  maxHeight = 400,
  showCount = false,
  maxLength,
  error,
  editable = true,
  style,
  inputStyle,
  testID,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const containerStyle = [
    styles.container,
    focused && !error && styles.containerFocused,
    error && styles.containerError,
    style,
  ];

  const len = value.length;
  const countStyle = (() => {
    if (!maxLength) return styles.countText;
    const ratio = len / maxLength;
    if (ratio >= 1) return [styles.countText, styles.countTextDanger];
    if (ratio >= 0.9) return [styles.countText, styles.countTextWarn];
    return styles.countText;
  })();

  return (
    <View>
      <View style={containerStyle}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.semantic.text.tertiary}
          editable={editable}
          multiline
          textAlignVertical="top"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {minHeight, maxHeight},
            inputStyle,
          ]}
          maxLength={maxLength}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : showCount ? (
        <View style={styles.footer}>
          <Text style={countStyle}>
            {len}
            {maxLength ? ` / ${maxLength}` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default TextArea;