import React, { useCallback } from 'react'
import { Switch as RNSwitch } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, neutral } from '@theme'
import type { SwitchProps } from './types'

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  trackColorOn = brand.primary,
  trackColorOff = neutral.gray30,
  thumbColor = neutral.white,
  style,
  testID,
  accessibilityLabel,
}) => {
  const handleChange = useCallback(
    (next: boolean) => {
      haptic('tap')
      onValueChange?.(next)
    },
    [onValueChange],
  )

  return (
    <RNSwitch
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      ios_backgroundColor={trackColorOff}
      onValueChange={handleChange}
      style={style}
      testID={testID}
      thumbColor={thumbColor}
      trackColor={{ false: trackColorOff, true: trackColorOn }}
      value={value}
    />
  )
}

export default Switch
