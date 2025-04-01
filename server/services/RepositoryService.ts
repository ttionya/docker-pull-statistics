import { BaseService } from './BaseService'
import { Repository } from '~~/server/models/Repository'
import { RepositoryStats } from '~~/server/models/RepositoryStats'
import type { RepositoryCreationAttributes } from '~~/server/models/Repository'
import type { DModelOperationOptions } from '~~/server/types/service'

export class RepositoryService extends BaseService {
  public async findByName(name: string, options?: DModelOperationOptions) {
    return Repository.findOne({
      where: {
        name,
      },
      ...options,
    })
  }

  public async findAll(options?: DModelOperationOptions) {
    return Repository.findAll({
      order: [['name', 'ASC']],
      ...options,
    })
  }

  public async findAllWithStats(options?: DModelOperationOptions) {
    return Repository.findAll({
      include: [
        {
          model: RepositoryStats,
          as: 'repositoryStats',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
      ...options,
    })
  }

  public async create(payload: RepositoryCreationAttributes, options?: DModelOperationOptions) {
    return Repository.create(payload, options)
  }
}
