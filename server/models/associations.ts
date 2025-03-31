import { Repository } from './Repository'
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
}
