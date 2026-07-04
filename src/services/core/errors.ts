/**
 * Service Error - 服务层统一错误对象
 *
 * 所有 Service 抛出的异常归一化为 ServiceError，区分业务错误与底层错误。
 * 页面 / Store 只处理 ServiceError，不感知 Repository / HTTP 细节。
 *
 * 禁止将底层原始异常（DatabaseError / AxiosError）直接抛给业务层。
 */

import { DatabaseError } from '@database'

export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'REMOTE_ERROR'
  | 'DATA_ERROR'
  | 'UNKNOWN'

export class ServiceError extends Error {
  readonly code: ServiceErrorCode
  readonly cause?: unknown

  constructor(code: ServiceErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    if (cause !== undefined) {
      this.cause = cause
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ServiceError)
    }
  }
}

/**
 * 将底层异常归一化为 ServiceError。
 *
 * - DatabaseError → DATA_ERROR（数据层故障）
 * - 已是 ServiceError → 原样返回
 * - 其他 → UNKNOWN
 */
export function toServiceError(
  error: unknown,
  fallbackCode: ServiceErrorCode = 'UNKNOWN',
): ServiceError {
  if (error instanceof ServiceError) {
    return error
  }
  if (error instanceof DatabaseError) {
    return new ServiceError('DATA_ERROR', error.message, error)
  }
  const message = error instanceof Error ? error.message : String(error)
  return new ServiceError(fallbackCode, message, error)
}
