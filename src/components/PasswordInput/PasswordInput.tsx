/**
 * PasswordInput Component
 *
 * 密码输入框。基于 TextField，内置密码显示/隐藏切换。
 *
 * Theme 集成：颜色、间距来自 useTheme()。
 */

import React, {useState} from 'react';
import {Pressable} from 'react-native';

import {Icon} from '@/components/Icon';
import {TextField} from '@/components/TextField';
import {useTheme} from '@theme';
import type {PasswordInputProps} from './types';

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = '请输入密码',
  label,
  error,
  disabled = false,
  autoFocus = false,
  style,
  testID,
}) => {
  const {colors} = useTheme();
  const [secure, setSecure] = useState(true);

  const toggleSecure = () => setSecure(prev => !prev);

  return (
    <TextField
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      label={label}
      error={error}
      editable={!disabled}
      autoFocus={autoFocus}
      secureTextEntry={secure}
      size="medium"
      rightIcon={
        <Pressable onPress={toggleSecure} hitSlop={8}>
          <Icon
            name={secure ? 'visibility-off' : 'visibility'}
            size={20}
            color={colors.semantic.icon.tertiary}
          />
        </Pressable>
      }
      style={style}
    />
  );
};

export default PasswordInput;