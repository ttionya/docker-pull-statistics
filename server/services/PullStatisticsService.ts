import { Op } from 'sequelize'
import { BaseService } from './BaseService'
import { PullStatistic } from '~~/server/models/PullStatistic'
import type {
  PullStatisticCreationAttributes,
  PullStatisticBulkCreationAttributes,
} from '~~/server/models/PullStatistic'
import type { DModelOperationOptions } from '~~/server/types/service'

export class PullStatisticsService extends BaseService {
  public async findByRepositoryId(repositoryId: number, options?: DModelOperationOptions) {
    return PullStatistic.findAll({
      where: {
        repositoryId,
      },
      order: [['createdAt', 'ASC']],
      ...options,
    })
  }

  public async findInTimeRange(
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
