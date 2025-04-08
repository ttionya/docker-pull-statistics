import Papa from 'papaparse'
import { StatisticsImportPostSchema } from '~~/server/constants/requestSchema'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { RepositoryStatsService } from '~~/server/services/RepositoryStatsService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import { requireAuth } from '~~/server/utils/authorization'
import { readValidatedFormData } from '~~/server/utils/formDataValidation'
import type { PullStatisticBulkCreationAttributes } from '~~/server/models/PullStatistic'
import type { StatisticsImportPostRes } from '~~/types/api/statistics'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const { repository: name, file } = await readValidatedFormData(event, StatisticsImportPostSchema)

  const csvData = getValidatedCsvData(file.data)
  console.log('Read from the CSV file:', `${csvData.length} rows`)

  // Process and insert records
  const statisticRows = { total: csvData.length, insert: 0, skip: 0, invalid: 0, exist: 0 }
  let repositoryId: number

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
      console.log('Created repository with ID:', repositoryId)
    } else {
      repositoryId = existing.id
      console.log('Repository found with ID:', repositoryId)
    }

    const bulkCreateData: PullStatisticBulkCreationAttributes[] = []

    for (const row of csvData) {
      const { time, count } = row
      const numCount = Number(count)

      if (isNaN(numCount)) {
        console.log('Skipping row with invalid count:', count)
        statisticRows.invalid++
        continue
      }

      const numTime = Number(time)
      const date = new Date(isNaN(numTime) ? time : numTime)
      const minutes = date.getMinutes()

      // Keep only XX:00 and XX:30 entries
      if (![0, 30].includes(minutes)) {
        statisticRows.skip++
        continue
      }

      const existingRecord = await pullStatisticsService.findByRepositoryIdAndCreatedAt(
        { repositoryId, createdAt: date },
        { transaction }
      )

      if (existingRecord) {
        console.log('Skipping row with existing record:', time)
        statisticRows.exist++
        continue
      }

      bulkCreateData.push({
        repositoryId,
        count: numCount,
        createdAt: date,
      })
      statisticRows.insert++
    }

    if (bulkCreateData.length > 0) {
      await pullStatisticsService.bulkCreate(bulkCreateData, { transaction })
      await Promise.all([
        repositoryStatsService.updateStatsByRepositoryId(repositoryId, { transaction }),
        pullStatisticsService.findAllByRepositoryIdWithCache(
          { repositoryId, forceUpdate: true },
          { transaction }
        ),
      ])
    }
  })

  console.log('Import statistics:', statisticRows)

  return serializeRes(name, repositoryId!, statisticRows)
})

function serializeRes(
  repository: string,
  repositoryId: number,
  rows: StatisticsImportPostRes['rows']
): StatisticsImportPostRes {
  return {
    repository,
    repositoryId,
    rows,
  }
}

function getValidatedCsvData(csvBuffer: Buffer) {
  const csvContent = csvBuffer.toString('utf-8')
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true })

  if (parsed.errors?.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Invalid CSV format. ${parsed.errors.map((error) => error.message).join(', ')}`,
    })
  }

  const data = parsed.data as { time: string; count: string }[]

  if (data.length === 0 || !('time' in data[0]) || !('count' in data[0])) {
    throw createError({
      statusCode: 400,
      message: 'Invalid CSV format. CSV file must contain "time" and "count" headers',
    })
  }

  return data
}
