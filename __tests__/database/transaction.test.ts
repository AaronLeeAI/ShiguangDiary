import type { SQLiteDatabase, Transaction } from 'react-native-sqlite-storage'
import { DatabaseError } from '../../src/database/core/errors'
import { withTransaction } from '../../src/database/core/transaction'

const mockGetDatabase = jest.fn()

jest.mock('../../src/database/connection', () => ({
  getDatabase: () => mockGetDatabase(),
}))

const createDatabase = () => {
  const transaction = {
    executeSql: jest.fn(),
  } as unknown as Transaction
  const database = {
    transaction: jest.fn((scope, onError, onSuccess) => {
      try {
        scope(transaction)
        onSuccess()
      } catch (error) {
        onError(error)
      }
    }),
  } as unknown as SQLiteDatabase
  mockGetDatabase.mockResolvedValue(database)
  return { database, transaction }
}

describe('withTransaction', () => {
  beforeEach(() => {
    mockGetDatabase.mockReset()
  })

  it('在提交前同步登记全部 SQL，并返回 scope 结果', async () => {
    const { transaction } = createDatabase()

    await expect(
      withTransaction(tx => {
        tx.executeSql('DELETE FROM diary_embedding')
        tx.executeSql('INSERT INTO diary_embedding VALUES (?)', ['vector'])
        return 'done'
      }),
    ).resolves.toBe('done')

    expect(transaction.executeSql).toHaveBeenNthCalledWith(1, 'DELETE FROM diary_embedding')
    expect(transaction.executeSql).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO diary_embedding VALUES (?)',
      ['vector'],
    )
  })

  it('拒绝会让原生事务提前提交的异步 scope', async () => {
    createDatabase()

    await expect(withTransaction(async () => undefined)).rejects.toEqual(
      expect.objectContaining({
        name: 'DatabaseError',
        code: 'TRANSACTION_FAILED',
        message: '事务回调必须同步登记 SQL，不能返回 Promise',
      } satisfies Partial<DatabaseError>),
    )
  })
})
