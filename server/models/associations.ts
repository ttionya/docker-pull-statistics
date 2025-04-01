import { Repository } from './Repository'
import { RepositoryStats } from './RepositoryStats'
import { PullStatistic } from './PullStatistic'

export function setupAssociations() {
  Repository.hasMany(PullStatistic, {
    constraints: false,
    foreignKey: 'repositoryId',
    as: 'pullStatistics',
  })
  PullStatistic.belongsTo(Repository, {
    constraints: false,
    foreignKey: 'repositoryId',
    as: 'repository',
  })

  Repository.hasOne(RepositoryStats, {
    constraints: false,
    foreignKey: 'repositoryId',
    as: 'repositoryStats',
  })
  RepositoryStats.belongsTo(Repository, {
    constraints: false,
    foreignKey: 'repositoryId',
    as: 'repository',
  })
}
