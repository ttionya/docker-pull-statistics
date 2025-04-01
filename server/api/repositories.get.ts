import { RepositoryService } from '~~/server/services/RepositoryService'

export default defineEventHandler(async () => {
  const repositories = await new RepositoryService().findAllWithStats()

  return { repositories }
})
