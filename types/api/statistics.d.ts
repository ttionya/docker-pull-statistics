export interface StatisticsGetReq {
  repository: string
  from?: number
  to?: number
  dimension?: 'month' | 'day' | 'hour'
  timezoneOffset?: number
}

export interface Statistics {
  time: number
  count: number
  delta: number
}

export interface StatisticsGetRes {
  data: Statistics[]
}
