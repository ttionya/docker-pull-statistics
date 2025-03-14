import { getDatabase } from '../utils/db'
import type { DBRepositories } from '~~/server/types/db'

export default defineEventHandler(async () => {
  const db = getDatabase()

  try {
    const repositories = db
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
        ) as latest_count,
        (
          SELECT ps.created_at
          FROM pull_statistics ps
          WHERE ps.repository_id = r.id
          ORDER BY ps.created_at DESC
          LIMIT 1
        ) as latest_update
      FROM repositories r
      ORDER BY r.namespace, r.repository
    `
      )
      .all() as (DBRepositories & { latest_count: number; latest_update: number })[]

    return { repositories }
  } finally {
    db.close()
  }
})
