import { AsyncLocalStorage } from 'async_hooks'
import { getDatabase } from '../utils/db'
import type { DBInstance } from '~~/server/types/db'

const transactionStorage = new AsyncLocalStorage<DBInstance>()

export default class BaseDatabaseService<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  protected execute<R>(callback: (db: DBInstance) => R): R {
    const existingConnection = transactionStorage.getStore()

    if (existingConnection) {
      return callback(existingConnection)
    }

    const db = getDatabase()

    try {
      return callback(db)
    } finally {
      db.close()
    }
  }

  protected transaction<R>(callback: (db: DBInstance) => R): R {
    const db = getDatabase()

    return transactionStorage.run(db, () => {
      db.prepare('BEGIN').run()

      try {
        const result = callback(db)
        db.prepare('COMMIT').run()
        return result
      } catch (error) {
        db.prepare('ROLLBACK').run()
        throw error
      } finally {
        db.close()
      }
    })
  }

  findById(id: number): T | undefined {
    return this.execute(
      (db) => db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) as T | undefined
    )
  }

  findAll(): T[] {
    return this.execute((db) => db.prepare(`SELECT * FROM ${this.tableName}`).all() as T[])
  }

  count(): number {
    type Count = { count: number }

    return this.execute((db) => {
      const result = db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`).get() as Count

      return result.count
    })
  }

  delete(id: number): number {
    return this.execute((db) => {
      const result = db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id)

      return result.changes
    })
  }
}
