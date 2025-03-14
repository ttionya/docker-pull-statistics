export interface DBMigrations {
  id: number
  migration: string
  batch: number
  created_at: number
}

export interface DBRepositories {
  id: number
  namespace: string
  repository: string
  name: string
  created_at: number
}

export interface DBPullStatistics {
  id: number
  repository_id: number
  count: number
  created_at: number
}
