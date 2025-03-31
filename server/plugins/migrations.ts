import { SequelizeStorage, Umzug } from 'umzug'
import { sequelize } from '~~/server/models'

export default defineNitroPlugin(async () => {
  console.log('Running database migrations on server startup...')

  try {
    const umzug = new Umzug({
      migrations: { glob: 'migrations/*.cjs' },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    })

    const migrations = await umzug.pending()

    if (migrations.length === 0) {
      console.log('No pending migrations.')
      return
    }

    await umzug.up()

    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Failed to run migrations:', error)
  }
})
