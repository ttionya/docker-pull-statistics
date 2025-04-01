import { sequelize } from '~~/server/models'
import type { Transaction } from 'sequelize'

export class BaseService {
  public async transaction<T>(
    callback: (transaction: Transaction) => T,
    transaction?: Transaction
  ): Promise<T> {
    const cb = async (transaction: Transaction) => {
      try {
        return await callback(transaction)
      } catch (error) {
        console.error('Transaction error:', error)
        throw error
      }
    }

    if (transaction) {
      return cb(transaction)
    }

    return sequelize.transaction(cb)
  }
}
