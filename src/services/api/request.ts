/**
 * Request - 请求封装
 *
 * 业务请求统一在此处封装，便于维护。
 */

import {apiClient} from './client';
import type {RequestConfig} from './client';

/**
 * 通用 GET
 */
export function get<T = any>(url: string, config?: RequestConfig) {
  return apiClient.get<T>(url, config);
}

/**
 * 通用 POST
 */
export function post<T = any>(url: string, data?: any, config?: RequestConfig) {
  return apiClient.post<T>(url, data, config);
}

/**
 * 通用 PUT
 */
export function put<T = any>(url: string, data?: any, config?: RequestConfig) {
  return apiClient.put<T>(url, data, config);
}

/**
 * 通用 DELETE
 */
export function del<T = any>(url: string, config?: RequestConfig) {
  return apiClient.delete<T>(url, config);
}