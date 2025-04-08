import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc.js'
import { StatisticsCountGetSchema } from '~~/server/constants/requestSchema'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { PullStatisticsService } from '~~/server/services/PullStatisticsService'
import type { PullStatistic } from '~~/server/models/PullStatistic'
import type { StatisticsCountGetRes, StatisticsCount, Dimension } from '~~/types/api/statistics'

dayjs.extend(dayjsUtc)

export default defineEventHandler(async (event) => {
  const {
    repository,
    from,
    to,
    dimension = 'day',
    timezoneOffset = 0,
  } = await getValidatedQuery(event, StatisticsCountGetSchema.parse)
  const { fromTimestamp, toTimestamp } = formatTimestamp(from, to)

  const queryRepository = await new RepositoryService().findByName(repository)

  if (!queryRepository) {
    return serializeRes()
  }

  // Get statistics records
  const totalRecords = await new PullStatisticsService().findAllByRepositoryIdWithCache({
    repositoryId: queryRepository.id,
  })

  const records = totalRecords.slice(
    totalRecords.findIndex((record) => new Date(record.createdAt).getTime() >= fromTimestamp),
    totalRecords.findLastIndex(
      (record) => new Date(record.createdAt).getTime() <= toTimestamp + getMaxTimeDiff(dimension)
    ) + 1
  )

  if (records.length === 0) {
    return serializeRes()
  }

  // Generate time points based on dimension
  const timePoints = generateTimePoints(
    new Date(records[0].createdAt).getTime(),
    toTimestamp,
    dimension,
    timezoneOffset
  )

  // Map records to the generated time points
  const result = mapRecordsToTimePoints(timePoints, records, dimension)

  return serializeRes(result)
})

function serializeRes(data: StatisticsCount[] = []): StatisticsCountGetRes {
  return {
    data,
  }
}

function generateTimePoints(
  fromTimestamp: number,
  toTimestamp: number,
  dimension: Dimension,
  timezoneOffset: number
): number[] {
  /**
   * The time needs to be segmented based on the client's time zone,
   * so the generated time points are based on the client's time zone.
   * You need to use `utcOffset` from `dayjs` and remember to take the negative value of `timezoneOffset`.
   */
  const startTime = dayjs(fromTimestamp).utcOffset(-timezoneOffset)
  const endTime = dayjs(toTimestamp).utcOffset(-timezoneOffset)

  const timePoints: number[] = []

  if (dimension === 'month') {
    const newStartTime = startTime.date(1).hour(0).minute(0).second(0).millisecond(0)

    let currentTime = newStartTime
    while (currentTime.isBefore(endTime) || currentTime.isSame(endTime)) {
      timePoints.push(currentTime.valueOf())
      currentTime = currentTime.add(1, 'month')
    }
  } else if (dimension === 'day') {
    const newStartTime = startTime.hour(0).minute(0).second(0).millisecond(0)

    let currentTime = newStartTime
    while (currentTime.isBefore(endTime) || currentTime.isSame(endTime)) {
      timePoints.push(currentTime.valueOf())
      currentTime = currentTime.add(1, 'day')
    }
  } else {
    const newStartTime = startTime
      .minute(startTime.minute() < 30 ? 0 : 30)
      .second(0)
      .millisecond(0)

    let currentTime = newStartTime
    while (currentTime.isBefore(endTime) || currentTime.isSame(endTime)) {
      timePoints.push(currentTime.valueOf())
      currentTime = currentTime.add(30, 'minute')
    }
  }

  return timePoints
}

function mapRecordsToTimePoints(
  timePoints: number[],
  records: PullStatistic[],
  dimension: Dimension
) {
  const result: StatisticsCount[] = []
  let lastCount: number | null = null
  let recordIndex = 0

  const maxTimeDiff = getMaxTimeDiff(dimension)

  for (const timePoint of timePoints) {
    let matchingRecord = null
    while (
      recordIndex < records.length &&
      new Date(records[recordIndex].createdAt).getTime() <= timePoint
    ) {
      recordIndex++
    }

    const nextRecordTimestamp =
      recordIndex < records.length ? new Date(records[recordIndex].createdAt).getTime() : Infinity

    if (nextRecordTimestamp - timePoint <= maxTimeDiff) {
      matchingRecord = records[recordIndex]
    } else if (recordIndex > 0) {
      matchingRecord = records[recordIndex - 1]
    }

    const count = (matchingRecord ? matchingRecord.count : lastCount) as number

    if (count !== null) {
      const prevItem = result.length > 0 ? result[result.length - 1] : null
      const delta = prevItem ? count - prevItem.count : 0

      result.push({
        time: timePoint,
        count: count,
        delta: delta,
      })

      lastCount = count
    }
  }

  return result
}

function formatTimestamp(from: unknown, to: unknown) {
  const currentTimestamp = Date.now()
  const fromTimestamp = Number(from) > 0 && Number(from) <= currentTimestamp ? Number(from) : 0
  const toTimestamp =
    Number(to) > fromTimestamp && Number(to) <= currentTimestamp ? Number(to) : currentTimestamp

  return { fromTimestamp, toTimestamp }
}

function minutesToMillisecond(minutes: number) {
  return minutes * 60 * 1000
}

function getMaxTimeDiff(dimension: Dimension) {
  return dimension === 'hour' ? minutesToMillisecond(15) : minutesToMillisecond(60)
}
