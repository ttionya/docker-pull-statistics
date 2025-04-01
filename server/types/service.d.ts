import type { Transaction, Order } from 'sequelize'

export interface DModelTransactionOptions {
  transaction?: Transaction
}

export interface DModelFindOptions {
  limit?: number
  order?: Order
}

export interface DModelOperationOptions extends DModelTransactionOptions, DModelFindOptions {}
