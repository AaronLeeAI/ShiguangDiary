/**
 * TextField - 单行输入框
 *
 * 基于 React Native TextInput 封装，支持 label / leftIcon / rightIcon / clearable / error。
 *
 * 多行输入请使用 TextArea。
 */

import React, {useState} from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputFocusEventData,
  type NativeSyntheticEvent,
} from 'react-native';

import {Icon} from '@/components/Icon';
import {colors} from '@theme';
import {styles, TEXT_FIELD_FONT_SIZE, TEXT_FIELD_HEIGHT} from './styles';
import type {TextFieldProps} from './types';

/**
 * TextField 组件
 */
export const TextField: React.FC<TextFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  error,
  size = 'medium',
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
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const containerStyle = [
    styles.container,
    {height: TEXT_FIELD_HEIGHT[size]},
    focused && !error && styles.containerFocused,
    error && styles.containerError,
    !editable && styles.containerDisabled,
    style,
  ];

  const showClear = clearable && value.length > 0 && editable;

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.semantic.text.tertiary}
          editable={editable}
          style={[styles.input, TEXT_FIELD_FONT_SIZE[size], inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {showClear && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="清空输入"
            onPress={handleClear}
            hitSlop={8}
            style={styles.clearButton}>
            <Icon name="close" size={16} color={colors.semantic.icon.tertiary} />
          </Pressable>
        )}
        {rightIcon && !showClear && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default TextField;