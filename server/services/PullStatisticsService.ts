import { Op } from 'sequelize'
import { BaseService } from './BaseService'
import { PullStatistic } from '~~/server/models/PullStatistic'
import cache, { getPullStatisticsRawDataCacheKey } from '~~/server/utils/cache'
import type {
  PullStatisticCreationAttributes,
  PullStatisticBulkCreationAttributes,
} from '~~/server/models/PullStatistic'
import type { DModelOperationOptions } from '~~/server/types/service'

export class PullStatisticsService extends BaseService {
  public async findByRepositoryIdAndCreatedAt(
    data: { repositoryId: number; createdAt: Date },
    options?: DModelOperationOptions
  ) {
    return PullStatistic.findOne({
      where: {
        repositoryId: data.repositoryId,
        createdAt: data.createdAt,
      },
      ...options,
    })
  }

  public async findAllByRepositoryId(repositoryId: number, options?: DModelOperationOptions) {
    return PullStatistic.findAll({
      where: {
        repositoryId,
      },
      order: [['createdAt', 'ASC']],
      ...options,
    })
  }

  public async findAllByRepositoryIdWithCache(
    data: { repositoryId: number; forceUpdate?: boolean },
    options?: DModelOperationOptions
  ) {
    const cacheKey = getPullStatisticsRawDataCacheKey(data.repositoryId)
    const cachedData = await cache.get<PullStatistic[]>(cacheKey)

    if (cachedData && !data.forceUpdate) {
      return cachedData
    }

    const findData = await this.findAllByRepositoryId(data.repositoryId, options)

    await cache.set(cacheKey, findData)

    return findData
  }

  public async findAllBetweenTimeRange(
    data: {
      repositoryId: number
      fromTimestamp: number
      toTimestamp: number
    },
    options?: DModelOperationOptions
  ) {
    return PullStatistic.findAll({
      where: {
        repositoryId: data.repositoryId,
        createdAt: {
          [Op.gte]: new Date(data.fromTimestamp),
          [Op.lte]: new Date(data.toTimestamp),
        },
      },
      order: [['createdAt', 'ASC']],
      ...options,
    })
  }

  public async create(payload: PullStatisticCreationAttributes, options?: DModelOperationOptions) {
    return PullStatistic.create(payload, options)
  }

  public async bulkCreate(
    payload: PullStatisticBulkCreationAttributes[],
    options?: DModelOperationOptions
  ) {
    return PullStatistic.bulkCreate(payload, options)
  }
}
