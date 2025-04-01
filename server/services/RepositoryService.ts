import { BaseService } from './BaseService'
import { Repository } from '~~/server/models/Repository'
import { RepositoryStats } from '~~/server/models/RepositoryStats'
import type { RepositoryCreationAttributes } from '~~/server/models/Repository'
import type { DCreationOptions } from '~~/server/types/service'

export class RepositoryService extends BaseService {
  public async findByName(name: string) {
    return Repository.findOne({
      where: {
        name,
      },
    })
  }

  public async findAll() {
    return Repository.findAll({
      order: [['name', 'ASC']],
    })
  }

  public async findAllWithStats() {
    return Repository.findAll({
      include: [
        {
          model: RepositoryStats,
          as: 'repositoryStats',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    })
  }

  public async create(payload: RepositoryCreationAttributes, options?: DCreationOptions) {
    return Repository.create(payload, options)
  }
}
