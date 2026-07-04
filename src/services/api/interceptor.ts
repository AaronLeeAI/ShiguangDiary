/**
 * Interceptor - 拦截器
 */

import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * 请求拦截器
 */
export interface RequestInterceptor {
  onFulfilled?: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  onRejected?: (error: AxiosError) => unknown
}

/**
 * 响应拦截器
 */
export interface ResponseInterceptor {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  onRejected?: (error: AxiosError) => unknown
}

/**
 * 注册请求拦截器
 */
export function registerRequestInterceptor(client: AxiosInstance, interceptor: RequestInterceptor) {
  client.interceptors.request.use(interceptor.onFulfilled, interceptor.onRejected)
}

/**
 * 注册响应拦截器
 */
export function registerResponseInterceptor(
  client: AxiosInstance,
  interceptor: ResponseInterceptor,
) {
  client.interceptors.response.use(interceptor.onFulfilled, interceptor.onRejected)
}

/**
 * 常用拦截器：Token 注入
 */
export const tokenInterceptor: RequestInterceptor = {
  onFulfilled: config => {
    // TODO: 从 store / MMKV 读取 token 并注入
    return config
  },
}

/**
 * 常用拦截器：错误处理
 */
export const errorInterceptor: ResponseInterceptor = {
  onRejected: error => {
    // 统一错误日志
    if (__DEV__) {
      console.error('[API Error]', error?.response?.status, error?.message)
    }
    return Promise.reject(error)
  },
}
