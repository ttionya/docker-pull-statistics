import BaseDatabaseService from './BaseDatabaseService'
import type { DBRepositories, FindDBRepositories } from '~~/server/types/db'

export class RepositoriesService extends BaseDatabaseService<DBRepositories> {
  constructor() {
    super('repositories')
  }

  findByName(name: string): FindDBRepositories {
    return this.execute(
      (db) =>
        db.prepare('SELECT * FROM repositories WHERE name = ?').get(name) as FindDBRepositories
    )
  }

  findAllWithLatestStats() {
    type LatestStats = DBRepositories & {
      latestCount: number
      latestUpdate: string
      previousCount: number | null
      previousUpdate: string | null
    }

    return this.execute(
      (db) =>
        db
          .prepare(
            `
          WITH ranked_stats AS (
            SELECT
              repository_id,
              count,
              created_at,
              ROW_NUMBER() OVER (PARTITION BY repository_id ORDER BY created_at DESC) as rn
            FROM pull_statistics
          )
          SELECT
            r.id,
            r.namespace,
            r.repository,
            r.name,
            s1.count as latestCount,
            s1.created_at as latestUpdate,
            s2.count as previousCount,
            s2.created_at as previousUpdate
          FROM repositories r
          LEFT JOIN ranked_stats s1 ON s1.repository_id = r.id AND s1.rn = 1
          LEFT JOIN ranked_stats s2 ON s2.repository_id = r.id AND s2.rn = 2
          ORDER BY r.name
          `
          )
          .all() as LatestStats[]
    )
  }

  create(namespace: string, repository: string, name: string, timestamp = Date.now()): number {
    return this.execute((db) => {
      const result = db
        .prepare(
          'INSERT INTO repositories (namespace, repository, name, created_at) VALUES (?, ?, ?, ?)'
        )
        .run(namespace, repository, name, timestamp)

      return Number(result.lastInsertRowid)
    })
  }
}
