/**
 * Transaction - 事务管理
 *
 * 提供统一的事务执行入口，保证多表写入的原子性。
 *
 * 设计：
 * - 业务层通过 `withTransaction` 执行一组数据库操作。
 * - scope 内的 executeSql 全部成功才 commit，任一失败则 rollback。
 * - 失败统一抛出 DatabaseError(TRANSACTION_FAILED)。
 *
 * 禁止 Repository 之外直接调用底层 transaction API。
 */

import { getDatabase } from '../connection'
import type {
  SQLiteDatabase,
  Transaction,
  TransactionErrorCallback,
} from 'react-native-sqlite-storage'
import { DatabaseError, toDatabaseError } from './errors'

/**
 * 在事务中执行一组操作。
 *
 * @param scope 接收 Transaction，在其中执行 SQL；可返回值作为结果。
 * @returns scope 的返回值。
 * @throws DatabaseError(code='TRANSACTION_FAILED') 事务失败时。
 */
export async function withTransaction<T>(scope: (tx: Transaction) => Promise<T>): Promise<T> {
  let db: SQLiteDatabase
  try {
    db = await getDatabase()
  } catch (error) {
    throw toDatabaseError(error, 'INIT_FAILED')
  }

  let result: T
  try {
    // react-native-sqlite-storage 的 transaction 使用回调式 + Promise，
    // 但在 promise 模式下 scope 需自行 await executeSql。
    // 为保证 scope 内 await 正常，这里用一个 Promise 包装回调式 API。
    result = await new Promise<T>((resolve, reject) => {
      const onError: TransactionErrorCallback = txError => {
        reject(toDatabaseError(txError, 'TRANSACTION_FAILED'))
      }
      db.transaction(
        async (tx: Transaction) => {
          try {
            const value = await scope(tx)
            resolve(value)
          } catch (inner) {
            reject(inner)
          }
        },
        onError,
        () => {
          // success - resolve 已在 scope 中处理
        },
      )
    })
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw toDatabaseError(error, 'TRANSACTION_FAILED')
  }

  return result
}

export type { Transaction }
