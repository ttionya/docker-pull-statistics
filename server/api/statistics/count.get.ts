import { RepositoryService } from '~~/server/services/RepositoryService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import type { PullStatistic } from '~~/server/models/PullStatistic'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const repository = query.repository as string
  const dimension = (query.dimension as string) || 'day'
  const { fromTimestamp, toTimestamp } = formatTimestamp(query.from, query.to)
  const timezoneOffset = Number(query.timezone) || 0

  if (!repository) {
    throw createError({
      statusCode: 400,
      message: 'Repository parameter is required',
    })
  }

  if (!['month', 'day', 'hour'].includes(dimension)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid dimension. Must be month, day, or hour',
    })
  }

  const queryRepository = await new RepositoryService().findByName(repository)

  if (!queryRepository) {
    return { data: [] }
  }

  // Get statistics records
  const records = await new PullStatisticsService().findInTimeRange({
    repositoryId: queryRepository.id,
    fromTimestamp,
    toTimestamp,
  })

  if (records.length === 0) {
    return { data: [] }
  }

  // Generate time points based on dimension
  const timePoints = generateTimePoints(
    new Date(records[0].createdAt).getTime(),
    toTimestamp,
    dimension,
    timezoneOffset
  )

  // Map records to the generated time points
  const result = mapRecordsToTimePoints(timePoints, records, dimension, timezoneOffset)

  return { data: result }
})

function generateTimePoints(
  fromTimestamp: number,
  toTimestamp: number,
  dimension: string,
  timezoneOffset: number
): Date[] {
  const startDate = new Date(fromTimestamp + timezoneOffset * 60 * 1000)
  const endDate = new Date(toTimestamp + timezoneOffset * 60 * 1000)
  const timePoints: Date[] = []

  if (dimension === 'month') {
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else if (dimension === 'day') {
    startDate.setHours(0, 0, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else {
    const minutes = startDate.getMinutes()
    startDate.setMinutes(minutes < 30 ? 0 : 30, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      currentDate.setMinutes(currentDate.getMinutes() + 30)
    }
  }

  return timePoints
}

function formatTimePoint(date: Date, dimension: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  if (dimension === 'month') {
    return `${year}-${month}`
  } else if (dimension === 'day') {
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}

function mapRecordsToTimePoints(
  timePoints: Date[],
  records: PullStatistic[],
  dimension: string,
  timezoneOffset: number
) {
  const result: { time: string; count: number; delta: number }[] = []
  let lastCount = null

  for (let i = 0; i < timePoints.length; i++) {
    const timePoint = timePoints[i]
    const timePointTimestamp = timePoint.getTime() - timezoneOffset * 60 * 1000

    let matchingRecord = null
    for (let j = records.length - 1; j >= 0; j--) {
      if (new Date(records[j].createdAt).getTime() <= timePointTimestamp) {
        matchingRecord = records[j]
        break
      }
    }

    const count = (matchingRecord ? matchingRecord.count : lastCount) as number

    if (count !== null) {
      const prevItem = result.length > 0 ? result[result.length - 1] : null
      const delta = prevItem ? count - prevItem.count : 0

      result.push({
        time: formatTimePoint(timePoint, dimension),
        count: count,
        delta: delta,
      })

      lastCount = count
    }
  }

  return result
}

function formatTimestamp(from: unknown, to: unknown) {
  const currentTime = Date.now()
  const fromTimestamp = Number(from) > 0 && Number(from) <= currentTime ? Number(from) : 0
  const toTimestamp =
    Number(to) > fromTimestamp && Number(to) <= currentTime ? Number(to) : currentTime

  return { fromTimestamp, toTimestamp }
}
