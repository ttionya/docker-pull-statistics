export interface Repository {
  id: number
  namespace: string
  repository: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface RepositoryWithStats extends Repository {
  repositoryStats: {
    id: number
    repositoryId: number
    latestCount: number | null
    latestUpdatedAt: string | null
    previousCount: number | null
    previousUpdatedAt: string | null
    createdAt: string
    updatedAt: string
  } | null
}

/**
 * api/statistics/count.get.ts Response
 */
export interface RepositoriesGetRsp {
  repositories: RepositoryWithStats[]
}

/**
 * api/repositories/index.post.ts Request
 */
export interface RepositoriesPostReq {
  repository: string
}

/**
 * api/repositories/index.post.ts Response
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RepositoriesPostRsp extends Repository {}
