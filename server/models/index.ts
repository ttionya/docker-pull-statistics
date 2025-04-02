import { Sequelize } from 'sequelize'
import 'sqlite3'

const config = useRuntimeConfig()

const databaseUri = process.env.DATABASE_URI || 'sqlite:data/database.sqlite'

const sequelize = new Sequelize(databaseUri, {
  timezone: '+00:00',
  logging: !config.isProd ? console.log : false,

  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  },
})

;(async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)

    process.exit(1)
  }

  const { setupAssociations } = await import('./associations')
  setupAssociations()
})()

export { sequelize }
