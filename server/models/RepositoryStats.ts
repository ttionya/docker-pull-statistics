import { sequelize } from './index'
import { Model, DataTypes } from 'sequelize'
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'

export type RepositoryStatsCreationAttributes = InferCreationAttributes<
  RepositoryStats,
  { omit: 'id' | 'createdAt' | 'updatedAt' }
>

export class RepositoryStats extends Model<
  InferAttributes<RepositoryStats>,
  RepositoryStatsCreationAttributes
> {
  declare id: CreationOptional<number>
  declare repositoryId: number
  declare latestCount: number | null
  declare latestUpdatedAt: Date | null
  declare previousCount: number | null
  declare previousUpdatedAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

RepositoryStats.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    repositoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
    },
    latestCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    latestUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    previousCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    previousUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'repositories_stats',
    indexes: [
      {
        fields: ['repositoryId'],
      },
    ],
  }
)
