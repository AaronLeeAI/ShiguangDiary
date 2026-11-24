/**
 * Transaction - 事务管理
 *
 * 提供统一的事务执行入口，保证多表写入的原子性。
 *
 * 设计：
 * - 业务层通过 `withTransaction` 同步登记一组数据库操作。
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
 * react-native-sqlite-storage 要求事务回调在同一个同步调用栈内登记完全部
 * SQL。不能在回调里 await `tx.executeSql`，否则事务会在 Promise 的下一个
 * tick 之前提交，后续 SQL 会收到 InvalidStateError。
 *
 * @param scope 接收 Transaction，在其中同步登记 SQL；可返回值作为结果。
 * @returns scope 的返回值。
 * @throws DatabaseError(code='TRANSACTION_FAILED') 事务失败时。
 */
export async function withTransaction<T>(scope: (tx: Transaction) => T): Promise<T> {
  let db: SQLiteDatabase
  try {
    db = await getDatabase()
  } catch (error) {
    throw toDatabaseError(error, 'INIT_FAILED')
  }

  try {
    return await new Promise<T>((resolve, reject) => {
      let result: T
      let scopeError: unknown
      const onError: TransactionErrorCallback = txError => {
        reject(scopeError ?? toDatabaseError(txError, 'TRANSACTION_FAILED'))
      }
      db.transaction(
        (tx: Transaction) => {
          try {
            const value = scope(tx)
            if (
              typeof value === 'object' &&
              value !== null &&
              'then' in value &&
              typeof (value as { then?: unknown }).then === 'function'
            ) {
              throw new Error('事务回调必须同步登记 SQL，不能返回 Promise')
            }
            result = value
          } catch (error) {
            scopeError = error
            throw error
          }
        },
        onError,
        () => resolve(result),
      )
    })
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    throw toDatabaseError(error, 'TRANSACTION_FAILED')
  }
}

export type { Transaction }
