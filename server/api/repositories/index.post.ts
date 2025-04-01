import { RepositoriesPostSchema } from '~~/server/constants/requestSchema'
import { RepositoryService } from '~~/server/services/RepositoryService'
import { requireAuth } from '~~/server/utils/authorization'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const { repository: name } = await readValidatedBody(event, RepositoriesPostSchema.parse)
  const [namespace, repository] = name.split('/')

  const repositoryService = new RepositoryService()
  const existing = await repositoryService.findByName(name)

  if (existing) {
    throw createError({
      statusCode: 409,
      message: `Repository "${name}" already exists`,
    })
  }

  const createdRepository = await repositoryService.create({ namespace, repository, name })

  return createdRepository
})
