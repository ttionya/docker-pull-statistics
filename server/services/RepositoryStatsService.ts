import { BaseService } from './BaseService'
import { RepositoryStats } from '~~/server/models/RepositoryStats'
import { PullStatisticsService } from './PullStatisticsService'
import type { RepositoryStatsCreationAttributes } from '~~/server/models/RepositoryStats'
import type { DModelOperationOptions } from '~~/server/types/service'

export class RepositoryStatsService extends BaseService {
  public async findByRepositoryId(repositoryId: number, options?: DModelOperationOptions) {
    return RepositoryStats.findOne({
      where: {
        repositoryId,
      },
      ...options,
    })
  }

  public async updateStatsByRepositoryId(repositoryId: number, options?: DModelOperationOptions) {
    const findByRepositoryId1P = this.findByRepositoryId(repositoryId, options)
    const findByRepositoryId2P = new PullStatisticsService().findByRepositoryId(repositoryId, {
      ...options,
      limit: 2,
      order: [['createdAt', 'DESC']],
    })

    const [findRepositoryStats, [latestData, previousData]] = await Promise.all([
      findByRepositoryId1P,
      findByRepositoryId2P,
    ])

    return this.transaction(async (transaction) => {
      let payload: Partial<RepositoryStats>

      if (findRepositoryStats) {
        payload = {
          id: findRepositoryStats.id,
        }
      } else {
        const createdRepositoryStats = await this.create(
          {
            repositoryId,
            latestCount: null,
            latestUpdatedAt: null,
            previousCount: null,
            previousUpdatedAt: null,
          },
          { transaction }
        )
        payload = {
          id: createdRepositoryStats.id,
        }
      }

      if (latestData) {
        payload.latestCount = latestData.count
        payload.latestUpdatedAt = latestData.createdAt
      }
      if (previousData) {
        payload.previousCount = previousData.count
        payload.previousUpdatedAt = previousData.createdAt
      }

      return this.update(payload, { transaction })
    }, options?.transaction)
  }

  private async update(payload: Partial<RepositoryStats>, options?: DModelOperationOptions) {
    return RepositoryStats.update(payload, {
      where: {
        id: payload.id,
      },
      ...options,
    })
  }

  private async create(
    payload: RepositoryStatsCreationAttributes,
    options?: DModelOperationOptions
  ) {
    return RepositoryStats.create(payload, options)
  }
}
