import { StatisticsImportPostSchema } from '~~/server/constants/requestSchema'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { RepositoryStatsService } from '~~/server/services/RepositoryStatsService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import { requireAuth } from '~~/server/utils/authorization'
import { readValidatedFormData } from '~~/server/utils/formDataValidation'
import type { PullStatisticBulkCreationAttributes } from '~~/server/models/PullStatistic'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const { repository: name, file } = await readValidatedFormData(event, StatisticsImportPostSchema)

  const fileLines = Buffer.from(file.data)
    .toString('utf-8')
    .split('\n')
    .filter((line) => line.trim())

  // Skip header line
  const dataLines = fileLines.slice(1)
  console.log(`Read ${dataLines.length} records from CSV file`)

  // Process and insert records
  let inserted = 0
  let skipped = 0
  let repositoryId: number

  console.log(`Starting import for ${name}...`)

  const repositoryService = new RepositoryService()
  const repositoryStatsService = new RepositoryStatsService()
  const pullStatisticsService = new PullStatisticsService()

  await repositoryService.transaction(async (transaction) => {
    // Find or create repository
    const existing = await repositoryService.findByName(name)

    if (!existing) {
      const [namespace, repository] = name.split('/')
      const createdRepository = await repositoryService.create(
        { namespace, repository, name },
        { transaction }
      )
      repositoryId = createdRepository.id
      console.log(`Created repository with ID: ${repositoryId}`)
    } else {
      repositoryId = existing.id
      console.log(`Repository found with ID: ${repositoryId}`)
    }

    const bulkCreateData: PullStatisticBulkCreationAttributes[] = []

    for (const line of dataLines) {
      const [timeStr, countStr] = line.split(',')
      if (!timeStr || !countStr) {
        skipped++
        continue
      }

      const timestamp = parseInt(timeStr)
      const count = parseInt(countStr)

      // Validate count is a valid number
      if (isNaN(count)) {
        console.log(`Skipping record with invalid count: ${line}`)
        skipped++
        continue
      }

      const date = new Date(timestamp)
      const minutes = date.getMinutes()

      // Keep only XX:00 and XX:30 entries
      if (minutes === 0 || minutes === 30) {
        bulkCreateData.push({
          repositoryId,
          count,
          createdAt: date,
        })
        inserted++
      } else {
        skipped++
      }
    }

    if (bulkCreateData.length > 0) {
      await pullStatisticsService.bulkCreate(bulkCreateData, { transaction })
      await repositoryStatsService.updateStatsByRepositoryId(repositoryId, { transaction })
    }
  })

  return {
    name,
    repositoryId: repositoryId!,
    total: dataLines.length,
    inserted,
    skipped,
  }
})
