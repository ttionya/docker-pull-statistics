import { sequelize } from '~~/server/models'
import type { Transaction } from 'sequelize'

export class BaseService {
  public async transaction<T>(callback: (transaction: Transaction) => T): Promise<T> {
    return sequelize.transaction(async (transaction) => {
      try {
        return await callback(transaction)
      } catch (error) {
        console.error('Transaction error:', error)
        throw error
      }
    })
  }
}
