import { RepositoryService } from '~~/server/services/RepositoryService'
import { convertDateToString } from '~~/server/utils/convert'
import type { Repository } from '~~/server/models/Repository'
import type { RepositoriesGetRsp } from '~~/types/api/repositories'

export default defineEventHandler(async () => {
  const repositoryService = new RepositoryService()

  const repositories = await repositoryService.findAllWithStats()

  return serializeRes(repositories)
})

function serializeRes(repositories: Repository[]): RepositoriesGetRsp {
  return {
    repositories: repositories.map((repository) => {
      const rs = repository.repositoryStats
      let repositoryStats = null

      if (rs) {
        repositoryStats = {
          id: rs.id,
          repositoryId: rs.repositoryId,
          latestCount: rs.latestCount,
          previousCount: rs.previousCount,
          latestUpdatedAt: convertDateToString(rs.latestUpdatedAt),
          previousUpdatedAt: convertDateToString(rs.previousUpdatedAt),
          createdAt: convertDateToString(rs.createdAt),
          updatedAt: convertDateToString(rs.updatedAt),
        }
      }

      return {
        id: repository.id,
        namespace: repository.namespace,
        repository: repository.repository,
        name: repository.name,
        createdAt: convertDateToString(repository.createdAt),
        updatedAt: convertDateToString(repository.updatedAt),
        repositoryStats,
      }
    }),
  }
}
