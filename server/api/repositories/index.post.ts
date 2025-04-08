import { RepositoriesPostSchema } from '~~/server/constants/requestSchema'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { requireAuth } from '~~/server/utils/authorization'
import { convertDateToString } from '~~/server/utils/convert'
import type { Repository } from '~~/server/models/Repository'
import type { RepositoriesPostRsp } from '~~/types/api/repositories'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const { repository: name } = await readValidatedBody(event, RepositoriesPostSchema.parse)

  const repositoryService = new RepositoryService()

  const existingRepository = await repositoryService.findByName(name)

  if (existingRepository) {
    throw createError({
      statusCode: 409,
      message: `Repository "${name}" already exists`,
    })
  }

  const [namespace, repository] = name.split('/')
  const createdRepository = await repositoryService.create({ namespace, repository, name })

  return serializeRes(createdRepository)
})

function serializeRes(repository: Repository): RepositoriesPostRsp {
  return {
    id: repository.id,
    namespace: repository.namespace,
    repository: repository.repository,
    name: repository.name,
    createdAt: convertDateToString(repository.createdAt),
    updatedAt: convertDateToString(repository.updatedAt),
  }
}
