import { Op } from 'sequelize'
import { BaseService } from './BaseService'
import { PullStatistic } from '~~/server/models/PullStatistic'
import type { PullStatisticCreationAttributes } from '~~/server/models/PullStatistic'
import type { DCreationOptions } from '~~/server/types/service'

export class PullStatisticsService extends BaseService {
  public async findByRepositoryId(repositoryId: number) {
    return PullStatistic.findAll({
      where: { repositoryId },
      order: [['createdAt', 'ASC']],
    })
  }

  public async findInTimeRange(payload: {
    repositoryId: number
    fromTimestamp: number
    toTimestamp: number
  }) {
    return PullStatistic.findAll({
      where: {
        repositoryId: payload.repositoryId,
        createdAt: {
          [Op.gte]: new Date(payload.fromTimestamp),
          [Op.lte]: new Date(payload.toTimestamp),
        },
      },
      order: [['createdAt', 'ASC']],
    })
  }

  public async create(payload: PullStatisticCreationAttributes, options?: DCreationOptions) {
    return PullStatistic.create(payload, options)
  }
}
