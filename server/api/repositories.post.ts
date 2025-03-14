import { RepositoriesService } from '~~/server/database/RepositoriesService'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || ''
  const accessToken = process.env.ACCESS_TOKEN

  if (!accessToken || token !== accessToken) {
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

  const repositoriesService = new RepositoriesService()
  const existing = repositoriesService.findByName(name)

  if (existing) {
    throw createError({
      statusCode: 409,
      message: `Repository ${name} already exists`,
    })
  }

  const id = repositoriesService.create(namespace, repository, name)

  return {
    id,
    namespace,
    repository,
    name,
  }
})
