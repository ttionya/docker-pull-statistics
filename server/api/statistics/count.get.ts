import { getDatabase } from '../../utils/db'
import type { DBRepositories, DBPullStatistics } from '~~/server/types/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const repository = query.repository as string
  const fromTimestamp = query.from ? Number(query.from) : null
  const toTimestamp = query.to ? Number(query.to) : Date.now()
  const dimension = (query.dimension as string) || 'day'
  const timezoneOffset = query.timezone ? Number(query.timezone) : 0

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

  const db = getDatabase()

  try {
    const repoRecord = db
      .prepare('SELECT id FROM repositories WHERE name = ?')
      .get(repository) as Pick<DBRepositories, 'id'>

    if (!repoRecord) {
      return { data: [] }
    }

    const repositoryId = repoRecord.id

    // Get all records for this repository in the time range
    let query = 'SELECT created_at, count FROM pull_statistics WHERE repository_id = ?'
    const params: unknown[] = [repositoryId]

    if (fromTimestamp) {
      query += ' AND created_at >= ?'
      params.push(fromTimestamp)
    }

    if (toTimestamp) {
      query += ' AND created_at <= ?'
      params.push(toTimestamp)
    }

    query += ' ORDER BY created_at ASC'

    const records = db.prepare(query).all(...params) as Pick<
      DBPullStatistics,
      'count' | 'created_at'
    >[]

    if (records.length === 0) {
      return { data: [] }
    }

    // Generate time points based on dimension
    const timePoints = generateTimePoints(
      records[0].created_at,
      toTimestamp,
      dimension,
      timezoneOffset
    )

    // Map records to the generated time points
    const result = mapRecordsToTimePoints(timePoints, records, dimension, timezoneOffset)

    return { data: result }
  } finally {
    db.close()
  }
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
    // Set to first day of month
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else if (dimension === 'day') {
    // Set to midnight
    startDate.setHours(0, 0, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else {
    // hour
    // Round to nearest half hour
    const minutes = startDate.getMinutes()
    startDate.setMinutes(minutes < 30 ? 0 : 30, 0, 0)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      timePoints.push(new Date(currentDate))
      // Add 30 minutes
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
    // hour
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}

function mapRecordsToTimePoints(
  timePoints: Date[],
  records: { created_at: number; count: number }[],
  dimension: string,
  timezoneOffset: number
) {
  const result: { time: string; count: number; delta: number }[] = []
  let lastCount = null

  for (let i = 0; i < timePoints.length; i++) {
    const timePoint = timePoints[i]
    const timePointTimestamp = timePoint.getTime() - timezoneOffset * 60 * 1000

    // Find the latest record before this time point
    let matchingRecord = null
    for (let j = records.length - 1; j >= 0; j--) {
      if (records[j].created_at <= timePointTimestamp) {
        matchingRecord = records[j]
        break
      }
    }

    // If no matching record found, use the last known count
    const count = (matchingRecord ? matchingRecord.count : lastCount) as number

    // Only add to result if we have a count
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
