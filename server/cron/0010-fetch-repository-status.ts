// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-cron.d.ts" />
import { defineCronHandler } from '#nuxt/cron'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { RepositoryStatsService } from '~~/server/services/RepositoryStatsService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import type { Repository } from '~~/server/models/Repository'

export default defineCronHandler(
  () => '0,30 * * * *',
  async () => {
    try {
      const repositories = await new RepositoryService().findAll()

      if (repositories.length === 0) {
        console.log('No repositories found in the database')
        return
      }

      await Promise.allSettled(repositories.map(processRepository))
    } catch (error) {
      console.error('Error fetching repositories:', error)
    }
  }
)

async function processRepository(repository: Repository) {
  const name = repository.name
  try {
    console.log(`Fetching stats for ${name}...`)

    const response = await fetch(`https://hub.docker.com/v2/repositories/${name}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch Docker Hub stats: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const count = data.pull_count

    if (typeof count !== 'number' || isNaN(count)) {
      throw new Error(`Invalid pull count received: ${count}`)
    }

    await new PullStatisticsService().create({ repositoryId: repository.id, count })

    await new RepositoryStatsService().updateStatsByRepositoryId(repository.id)

    console.log(`Stored Docker Hub stats: ${count} pulls for ${name}`)
  } catch (error) {
    console.error(`Error processing repository ${name}:`, error)
  }
}
