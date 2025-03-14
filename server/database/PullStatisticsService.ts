import BaseDatabaseService from './BaseDatabaseService'
import type { DBPullStatistics } from '~~/server/types/db'

export class PullStatisticsService extends BaseDatabaseService<DBPullStatistics> {
  constructor() {
    super('pull_statistics')
  }

  findByRepositoryId(repositoryId: number): DBPullStatistics[] {
    return this.execute(
      (db) =>
        db
          .prepare('SELECT * FROM pull_statistics WHERE repository_id = ? ORDER BY created_at ASC')
          .all(repositoryId) as DBPullStatistics[]
    )
  }

  findInTimeRange(
    repositoryId: number,
    fromTimestamp: number,
    toTimestamp: number
  ): DBPullStatistics[] {
    return this.execute((db) => {
      return db
        .prepare(
          'SELECT * FROM pull_statistics WHERE repository_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
        )
        .all(repositoryId, fromTimestamp, toTimestamp) as DBPullStatistics[]
    })
  }

  create(repositoryId: number, count: number, timestamp = Date.now()): number {
    return this.execute((db) => {
      const result = db
        .prepare('INSERT INTO pull_statistics (repository_id, count, created_at) VALUES (?, ?, ?)')
        .run(repositoryId, count, timestamp)

      return Number(result.lastInsertRowid)
    })
  }

  deleteByRepositoryId(repositoryId: number): number {
    return this.execute((db) => {
      const result = db
        .prepare('DELETE FROM pull_statistics WHERE repository_id = ?')
        .run(repositoryId)

      return result.changes
    })
  }
}
