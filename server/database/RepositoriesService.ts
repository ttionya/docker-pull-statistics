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
