import { RepositoryService } from '~~/server/services/RepositoryService'
import { requireAuth } from '~~/server/utils/authorization'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = await readBody(event)
  const { repository: name } = body

  if (!name || typeof name !== 'string' || !name.includes('/')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid repository name. Must be in format "namespace/repository"',
    })
  }

  const [namespace, repository] = name.split('/')

  if (!namespace || !repository) {
    throw createError({
      statusCode: 400,
      message: 'Invalid repository name. Must be in format "namespace/repository"',
    })
  }

  const repositoryService = new RepositoryService()
  const existing = await repositoryService.findByName(name)

  if (existing) {
    throw createError({
      statusCode: 409,
      message: `Repository ${name} already exists`,
    })
  }

  const createdRepository = await repositoryService.create({ namespace, repository, name })

  return createdRepository
})
