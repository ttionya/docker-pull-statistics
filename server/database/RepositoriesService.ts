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
    type LatestStats = DBRepositories | { latestCount: number; latestUpdate: string }

    return this.execute(
      (db) =>
        db
          .prepare(
            `
          SELECT
            r.id,
            r.namespace,
            r.repository,
            r.name,
            (
              SELECT ps.count
              FROM pull_statistics ps
              WHERE ps.repository_id = r.id
              ORDER BY ps.created_at DESC
              LIMIT 1
            ) as latestCount,
            (
              SELECT ps.created_at
              FROM pull_statistics ps
              WHERE ps.repository_id = r.id
              ORDER BY ps.created_at DESC
              LIMIT 1
            ) as latestUpdate
          FROM repositories r
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
