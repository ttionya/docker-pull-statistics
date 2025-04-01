const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('repositories_stats', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      repository_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        unique: true,
        allowNull: false,
      },
      latest_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      latest_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      previous_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      previous_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    })

    await queryInterface.addIndex('repositories_stats', {
      name: 'idx_repositories_stats_repository_id',
      fields: ['repository_id'],
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('repositories_stats', 'idx_repositories_stats_repository_id')
    await queryInterface.dropTable('repositories_stats')
  },
}
