import { RepositoryService } from '~~/server/services/RepositoryService'
import { RepositoryStatsService } from '~~/server/services/RepositoryStatsService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import { requireAuth } from '~~/server/utils/authorization'
import type { MultiPartData } from 'h3'
import type { PullStatisticBulkCreationAttributes } from '~~/server/models/PullStatistic'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'Invalid formdata.',
    })
  }

  const name = getRepository(formData)
  const lines = getCsvLines(formData)

  // Skip header line
  const dataLines = lines.slice(1)
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
      console.log(1111)
      await pullStatisticsService.bulkCreate(bulkCreateData, { transaction })
      console.log(2222)
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

function getRepository(formData: MultiPartData[]): string {
  const repositoryPart = formData.find((part) => part.name === 'repository')

  if (!repositoryPart || !repositoryPart.data) {
    throw createError({
      statusCode: 400,
      message: 'Repository parameter is required',
    })
  }

  const name = Buffer.from(repositoryPart.data).toString('utf-8')
  const [namespace, repository] = name.split('/')

  if (!namespace || !repository) {
    throw createError({
      statusCode: 400,
      message: 'Invalid repository name. Should be in format "namespace/repository"',
    })
  }

  return name
}

function getCsvLines(formData: MultiPartData[]): string[] {
  const filePart = formData.find((part) => part.name === 'file')

  if (!filePart || !filePart.data) {
    throw createError({
      statusCode: 400,
      message: 'File parameter is required',
    })
  }

  const fileContent = Buffer.from(filePart.data).toString('utf-8')
  const lines = fileContent.split('\n').filter((line) => line.trim())

  return lines
}
