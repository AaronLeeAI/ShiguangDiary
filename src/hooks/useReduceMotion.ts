/**
 * useReduceMotion — 尊重系统"减少动画"设置(Task17 Motion System 无障碍)
 *
 * 设计规范 08_Animation.md §8.16:启用减少动画时禁用 scale/translate,仅保留 fade。
 * 订阅 AccessibilityInfo.isReduceMotionEnabled + 'reduceMotionChanged',返回布尔。
 *
 * 使用:PressableScale / Toast 入场 / 列表 stagger 用本 hook 判定是否降级动画。
 */

import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'

export const useReduceMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    let subscription: { remove: () => void } | undefined

    const read = async (): Promise<void> => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled()
        if (mounted) {
          setReduceMotion(enabled)
        }
      } catch {
        // 无障碍 API 不可用时按"未启用"处理(默认走动画)
        if (mounted) {
          setReduceMotion(false)
        }
      }
    }

    void read()

    // iOS/Android 均支持 'reduceMotionChanged' 订阅
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
          if (mounted) {
            setReduceMotion(enabled)
          }
        }) as unknown as { remove: () => void }
      } catch {
        // 个别 RN 版本无该事件:静默退回轮询态(read 已读初始值)
      }
    }

    return () => {
      mounted = false
      subscription?.remove()
    }
  }, [])

  return reduceMotion
}
