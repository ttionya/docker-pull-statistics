import path from 'path'
import fs from 'fs-extra'
import { packageDirectorySync } from 'pkg-dir'
import { MigrationService } from '~~/server/database/MigrationService'
import type { Migration } from '~~/server/types/migration'

const migrationsDir = path.join(packageDirectorySync({ cwd: import.meta.url })!, 'migrations')

export default defineNitroPlugin(async () => {
  console.log('Running database migrations on server startup...')

  try {
    await runMigrations()
  } catch (error) {
    console.error('Failed to run migrations:', error)
  }
})

async function runMigrations() {
  const migrationService = new MigrationService()

  // Create migrations table if it doesn't exist
  migrationService.createTable()

  // Get completed migrations
  const completedMigrations = migrationService.findAll().map((row) => row.migration)

  // Get migration files
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js'))
    .sort()

  // Find pending migrations
  const pendingMigrations = migrationFiles.filter(
    (file) => !completedMigrations.includes(path.basename(file, path.extname(file)))
  )

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations')
    return
  }

  console.log(`Running ${pendingMigrations.length} migrations...`)

  // Get current batch number
  const batch = migrationService.findLastBatch() + 1

  // Run pending migrations
  for (const file of pendingMigrations) {
    const migrationName = path.basename(file, path.extname(file))

    console.log(`Running migration: ${migrationName}`)

    // Import migration file
    const migrationPath = path.join(migrationsDir, file)
    const fileUrl = new URL(`file://${migrationPath.replace(/\\/g, '/')}`)
    const migration: Migration = await import(fileUrl.href).then((m) => m.default)

    // Execute migration within transaction
    try {
      migrationService.runMigration(migration, migrationName, batch)

      console.log(`Migration complete: ${migrationName}`)
    } catch (error) {
      console.error(`Migration failed: ${migrationName}`, error)
      throw error
    }
  }

  console.log('Migrations completed successfully')
}
