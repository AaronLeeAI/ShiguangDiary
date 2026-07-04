/**
 * Logging - 统一日志接口
 *
 * 提供 debug / info / warn / error 四级日志，发布版本统一关闭 debug。
 * 所有 Service / Repository 应通过 logger 输出，禁止散落 console.*。
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

let minLevel: LogLevel = __DEV__ ? 'debug' : 'warn'

/**
 * 设置全局最低日志级别。
 */
export function setLogLevel(level: LogLevel): void {
  minLevel = level
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel]
}

/**
 * 统一日志器。带 scope 前缀，便于过滤来源。
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`
  return {
    debug(message, ...args) {
      if (shouldLog('debug')) {
        console.debug(prefix, message, ...args)
      }
    },
    info(message, ...args) {
      if (shouldLog('info')) {
        console.info(prefix, message, ...args)
      }
    },
    warn(message, ...args) {
      if (shouldLog('warn')) {
        console.warn(prefix, message, ...args)
      }
    },
    error(message, ...args) {
      if (shouldLog('error')) {
        console.error(prefix, message, ...args)
      }
    },
  }
}

/** 全局默认日志器。 */
export const logger = createLogger('App')
