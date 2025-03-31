const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('pull_statistics', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      repository_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

    await queryInterface.addIndex('pull_statistics', {
      name: 'idx_pull_statistics_repository_id',
      fields: ['repository_id'],
    })

    await queryInterface.addIndex('pull_statistics', {
      name: 'idx_pull_statistics_created_at',
      fields: ['created_at'],
    })

    await queryInterface.addIndex('pull_statistics', {
      name: 'idx_pull_statistics_repository_created',
      fields: ['repository_id', 'created_at'],
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('pull_statistics', 'idx_pull_statistics_repository_created')
    await queryInterface.removeIndex('pull_statistics', 'idx_pull_statistics_created_at')
    await queryInterface.removeIndex('pull_statistics', 'idx_pull_statistics_repository_id')
    await queryInterface.dropTable('pull_statistics')
  },
}
