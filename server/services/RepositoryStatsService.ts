import { BaseService } from './BaseService'
import { RepositoryStats } from '~~/server/models/RepositoryStats'
import { PullStatistic } from '~~/server/models/PullStatistic'
import type { RepositoryStatsCreationAttributes } from '~~/server/models/RepositoryStats'
import type { DCreationOptions } from '~~/server/types/service'

export class RepositoryStatsService extends BaseService {
  public async findByRepositoryId(repositoryId: number) {
    return RepositoryStats.findOne({
      where: {
        repositoryId,
      },
    })
  }

  public async updateStatsByRepositoryId(repositoryId: number) {
    const [findRepositoryStats, [latestData, previousData]] = await Promise.all([
      this.findByRepositoryId(repositoryId),
      PullStatistic.findAll({
        where: {
          repositoryId,
        },
        order: [['createdAt', 'DESC']],
        limit: 2,
      }),
    ])

    return this.transaction(async (transaction) => {
      let payload: RepositoryStats

      if (findRepositoryStats) {
        payload = findRepositoryStats
      } else {
        payload = await this.create(
          {
            repositoryId,
            latestCount: null,
            latestUpdatedAt: null,
            previousCount: null,
            previousUpdatedAt: null,
          },
          { transaction }
        )
      }

      if (latestData) {
        payload.latestCount = latestData.count
        payload.latestUpdatedAt = latestData.createdAt
      }
      if (previousData) {
        payload.previousCount = previousData.count
        payload.previousUpdatedAt = previousData.createdAt
      }

      return await this.update(payload, { transaction })
    })
  }

  private async update(payload: RepositoryStats, options?: DCreationOptions) {
    return RepositoryStats.update(payload, {
      where: {
        id: payload.id,
      },
      ...options,
    })
  }

  private async create(payload: RepositoryStatsCreationAttributes, options?: DCreationOptions) {
    return RepositoryStats.create(payload, options)
  }
}
