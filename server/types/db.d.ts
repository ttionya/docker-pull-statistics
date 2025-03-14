export type DBInstance = import('better-sqlite3').Database

export interface DBMigrations {
  id: number
  migration: string
  batch: number
  created_at: number
}

export type FindDBMigrations = DBMigrations | undefined

export interface DBRepositories {
  id: number
  namespace: string
  repository: string
  name: string
  created_at: number
}

export type FindDBRepositories = DBRepositories | undefined

export interface DBPullStatistics {
  id: number
  repository_id: number
  count: number
  created_at: number
}

export type FindDBPullStatistics = DBPullStatistics | undefined
