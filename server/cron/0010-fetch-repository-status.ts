// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-cron.d.ts" />
import { defineCronHandler } from '#nuxt/cron'
import { getDatabase } from '../utils/db'
import type { DBRepositories } from '../types/db'

export default defineCronHandler(
  () => '0,30 * * * *',
  async () => {
    const db = getDatabase()

    try {
      const repositories = db.prepare('SELECT id, name FROM repositories').all() as DBRepositories[]

      if (repositories.length === 0) {
        console.log('No repositories found in the database')
        return
      }

      for (const repo of repositories) {
        let transactionActive = false
        const repositoryName = repo.name

        try {
          console.log(`Fetching stats for ${repositoryName}...`)

          const response = await fetch(`https://hub.docker.com/v2/repositories/${repositoryName}`)

          if (!response.ok) {
            throw new Error(
              `Failed to fetch Docker Hub stats: ${response.status} ${response.statusText}`
            )
          }

          const data = await response.json()
          const count = data.pull_count

          if (typeof count !== 'number' || isNaN(count)) {
            throw new Error(`Invalid pull count received: ${count}`)
          }

          db.exec('BEGIN TRANSACTION')
          transactionActive = true

          db.prepare(
            'INSERT INTO pull_statistics (repository_id, count, created_at) VALUES (?, ?, ?)'
          ).run(repo.id, count, Date.now())

          db.exec('COMMIT')
          transactionActive = false

          console.log(`Stored Docker Hub stats: ${count} pulls for ${repositoryName}`)
        } catch (error) {
          console.error(`Error processing repository ${repositoryName}:`, error)
          if (transactionActive) {
            db.exec('ROLLBACK')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching repositories:', error)
    } finally {
      db.close()
    }
  }
)
