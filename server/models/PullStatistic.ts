import { sequelize } from './index'
import { Model, DataTypes } from 'sequelize'
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'

export class PullStatistic extends Model<
  InferAttributes<PullStatistic>,
  InferCreationAttributes<PullStatistic>
> {
  declare id: CreationOptional<number>
  declare repositoryId: number
  declare count: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

PullStatistic.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    repositoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'pull_statistics',
    indexes: [
      {
        fields: ['repositoryId'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['repositoryId', 'createdAt'],
      },
    ],
  }
)
