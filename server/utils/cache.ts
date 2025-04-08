import { createCache } from 'cache-manager'

export default createCache()

export const getPullStatisticsRawDataCacheKey = (repositoryId: number): string =>
  `pull-statistics-raw-${repositoryId}`

export const getPullStatisticsCountDataCacheKey = (
  repositoryId: number,
  dimension: string,
  timezoneOffset: number
): string => `pull-statistics-count-${repositoryId}-${dimension}-${timezoneOffset}`
