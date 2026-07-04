/**
 * Database Error - 统一数据层错误对象
 *
 * 所有 Repository / DAO 抛出的异常都应归一化为 DatabaseError，
 * 保证上层（Store / 页面）无需区分底层异常类型即可统一处理。
 *
 * 禁止将底层原始异常直接抛给业务层。
 */

export type DatabaseErrorCode =
  | 'INIT_FAILED'
  | 'QUERY_FAILED'
  | 'INSERT_FAILED'
  | 'UPDATE_FAILED'
  | 'DELETE_FAILED'
  | 'TRANSACTION_FAILED'
  | 'NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'STORAGE_FAILED'
  | 'FILE_IO_FAILED'
  | 'UNKNOWN'

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode
  readonly cause?: unknown

  constructor(code: DatabaseErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    if (cause !== undefined) {
      this.cause = cause
    }

    // Maintain proper stack trace where supported
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DatabaseError)
    }
  }
}

/**
 * 将未知异常归一化为 DatabaseError。
 *
 * 若已是 DatabaseError 则原样返回，避免包装嵌套。
 */
export function toDatabaseError(
  error: unknown,
  code: DatabaseErrorCode = 'UNKNOWN',
): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }
  const message = error instanceof Error ? error.message : String(error)
  return new DatabaseError(code, message, error)
}
