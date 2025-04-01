import { RepositoryService } from '~~/server/services/RepositoryService'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || ''

  if (!config.accessToken || token !== config.accessToken) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid token',
    })
  }

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
