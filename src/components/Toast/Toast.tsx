/**
 * Toast - 全局轻提示（Provider + Hook）
 *
 * 使用方式：
 * 1. 在 App 根节点包裹 <ToastProvider>
 * 2. 在任意组件中调用 const toast = useToast(); toast.show({...})
 *
 * 也支持静态 API：import {toast} from '@/components/Toast'; toast.success('保存成功')
 * 但需要先在 App 根调用 setToastHandler（注册全局 Provider）。
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { View } from 'react-native'

import { styles } from './styles'
import { ToastView } from './ToastView'
import type {
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastProviderProps,
  ToastVariant,
} from './types'

let toastIdCounter = 0
const nextId = () => `toast-${Date.now()}-${++toastIdCounter}`

/** Toast API（hook 与静态都暴露） */
export interface ToastApi {
  show: (options: ToastOptions) => string
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 全局 handler（用于静态 API） */
let globalHandler: ToastApi | null = null
export const setToastHandler = (api: ToastApi | null) => {
  globalHandler = api
}

/**
 * ToastProvider
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultDuration = 2000,
  defaultPosition = 'top',
}) => {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const show = useCallback(
    (options: ToastOptions): string => {
      const id = nextId()
      const variant: ToastVariant = options.variant ?? 'info'
      const position: ToastPosition = options.position ?? defaultPosition
      const duration = options.duration ?? defaultDuration
      const item: ToastItem = {
        id,
        message: options.message,
        variant,
        position,
        duration,
        icon: options.icon,
        action: options.action,
      }
      setItems(prev => [...prev, item])
      return id
    },
    [defaultDuration, defaultPosition],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, opts) => show({ ...opts, message, variant: 'success' }),
      error: (message, opts) => show({ ...opts, message, variant: 'error' }),
      info: (message, opts) => show({ ...opts, message, variant: 'info' }),
      warning: (message, opts) => show({ ...opts, message, variant: 'warning' }),
      dismiss,
      clear,
    }),
    [show, dismiss, clear],
  )

  // 注册全局 handler
  React.useEffect(() => {
    setToastHandler(api)
    return () => setToastHandler(null)
  }, [api])

  // 按 position 分组
  const groupedItems = useMemo(() => {
    const groups: Record<ToastPosition, ToastItem[]> = { top: [], center: [], bottom: [] }
    items.forEach(item => {
      groups[item.position].push(item)
    })
    return groups
  }, [items])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Top */}
      {groupedItems.top.length > 0 && (
        <View pointerEvents="box-none" style={styles.containerTop}>
          {groupedItems.top.map(item => (
            <ToastView key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </View>
      )}
      {/* Center */}
      {groupedItems.center.length > 0 && (
        <View pointerEvents="box-none" style={styles.containerCenter}>
          {groupedItems.center.map(item => (
            <ToastView key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </View>
      )}
      {/* Bottom */}
      {groupedItems.bottom.length > 0 && (
        <View pointerEvents="box-none" style={styles.containerBottom}>
          {groupedItems.bottom.map(item => (
            <ToastView key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  )
}

/**
 * useToast - 在组件中获取 Toast API
 */
export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error(
      'useToast must be used within ToastProvider. Wrap your app with <ToastProvider>.',
    )
  }
  return ctx
}

/**
 * 静态 toast（在 Provider 外也可使用，会调用全局 handler）
 */
export const toast: ToastApi = {
  show: options => {
    if (globalHandler) return globalHandler.show(options)
    if (__DEV__) {
      console.warn('[toast] ToastProvider not mounted. Fallback to console:', options.message)
    }
    return ''
  },
  success: (message, opts) => {
    if (globalHandler) return globalHandler.success(message, opts)
    if (__DEV__) console.warn('[toast]', message)
    return ''
  },
  error: (message, opts) => {
    if (globalHandler) return globalHandler.error(message, opts)
    if (__DEV__) console.warn('[toast]', message)
    return ''
  },
  info: (message, opts) => {
    if (globalHandler) return globalHandler.info(message, opts)
    if (__DEV__) console.warn('[toast]', message)
    return ''
  },
  warning: (message, opts) => {
    if (globalHandler) return globalHandler.warning(message, opts)
    if (__DEV__) console.warn('[toast]', message)
    return ''
  },
  dismiss: id => globalHandler?.dismiss(id),
  clear: () => globalHandler?.clear(),
}

export default ToastProvider
