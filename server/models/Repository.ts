import { sequelize } from './index'
import { Model, DataTypes } from 'sequelize'
import type { RepositoryStats } from './RepositoryStats'
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize'

export type RepositoryCreationAttributes = InferCreationAttributes<
  Repository,
  { omit: 'id' | 'createdAt' | 'updatedAt' }
>

export class Repository extends Model<InferAttributes<Repository>, RepositoryCreationAttributes> {
  declare id: CreationOptional<number>
  declare namespace: string
  declare repository: string
  declare name: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare repositoryStats: NonAttribute<RepositoryStats | null>
}

Repository.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    namespace: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    repository: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'repositories',
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
  }
)
