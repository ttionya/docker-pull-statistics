export interface Repository {
  id: number
  namespace: string
  repository: string
  name: string
  createdAt: string
  updatedAt: string
  repositoryStats: Nullable<{
    id: number
    repositoryId: number
    latestCount: number | null
    latestUpdatedAt: string | null
    previousCount: number | null
    previousUpdatedAt: string | null
    createdAt: string
    updatedAt: string
  }>
}

export interface RepositoriesGetRsp {
  repositories: Repository[]
}
