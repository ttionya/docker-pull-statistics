export interface StatisticsCount {
  time: number
  count: number
  delta: number
}

export type Dimension = 'month' | 'day' | 'hour'

/**
 * api/statistics/count.get.ts Request
 */
export interface StatisticsCountGetReq {
  repository: string
  from?: number
  to?: number
  dimension?: Dimension
  timezoneOffset?: number
}

/**
 * api/statistics/count.get.ts Response
 */
export interface StatisticsCountGetRes {
  data: StatisticsCount[]
}

/**
 * api/statistics/import.post.ts Request
 */
export interface StatisticsImportPostReq {
  repository: string
  file: File
}

/**
 * api/statistics/import.post.ts Response
 */
export interface StatisticsImportPostRes {
  repository: string
  repositoryId: number
  rows: {
    total: number
    insert: number
    skip: number
    invalid: number
    exist: number
  }
}
