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

  // findInTimeRange(repositoryId: number, fromTimestamp: number, toTimestamp: number) {
  //   return this.execute((db) => {
  //     return db
  //       .prepare(
  //         'SELECT * FROM pull_statistics WHERE repository_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
  //       )
  //       .all(repositoryId, fromTimestamp, toTimestamp)
  //   })
  // }

  public async create(payload: PullStatisticCreationAttributes, options?: DCreationOptions) {
    return PullStatistic.create(payload, options)
  }
}
