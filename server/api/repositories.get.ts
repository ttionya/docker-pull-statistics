import { RepositoriesService } from '~~/server/database/RepositoriesService'

export default defineEventHandler(async () => {
  const repositories = new RepositoriesService().findAllWithLatestStats()

  return { repositories }
})
