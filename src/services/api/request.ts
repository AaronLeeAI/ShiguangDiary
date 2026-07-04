/**
 * Request - 请求封装
 *
 * 业务请求统一在此处封装，便于维护。
 */

import { apiClient } from './client'
import type { RequestConfig } from './client'

/**
 * 通用 GET
 */
export function get<T = unknown>(url: string, config?: RequestConfig) {
  return apiClient.get<T>(url, config)
}

/**
 * 通用 POST
 */
export function post<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
  return apiClient.post<T>(url, data, config)
}

/**
 * 通用 PUT
 */
export function put<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
  return apiClient.put<T>(url, data, config)
}

/**
 * 通用 DELETE
 */
export function del<T = unknown>(url: string, config?: RequestConfig) {
  return apiClient.delete<T>(url, config)
}
