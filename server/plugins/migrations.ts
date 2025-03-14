import { runMigrations } from '../utils/migration'

export default defineNitroPlugin(async () => {
  try {
    console.log('Running database migrations on server startup...')
    await runMigrations()
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Failed to run migrations:', error)
  }
})
