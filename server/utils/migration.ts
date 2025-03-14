import path from 'path'
import fs from 'fs-extra'
import { getDatabase } from './db'
import type { Database } from 'better-sqlite3'
import type { DBMigrations } from '~~/server/types/db'

export interface Migration {
  up: (db: Database) => Promise<void> | void
  down?: (db: Database) => Promise<void> | void
}

export async function runMigrations() {
  const db = getDatabase()

  try {
    tryCreateMigrationsTable(db)

    // Get completed migrations
    const completedMigrations = (
      db.prepare('SELECT migration FROM migrations').all() as DBMigrations[]
    ).map((m) => m.migration)

    // Get migration files
    const migrationsDir = path.join(process.cwd(), 'server', 'migrations')
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
    const batchResult = db
      .prepare('SELECT MAX(batch) as batch FROM migrations')
      .get() as DBMigrations
    const batch = (batchResult?.batch || 0) + 1

    // Run pending migrations
    for (const file of pendingMigrations) {
      const migrationName = path.basename(file, path.extname(file))
      console.log(`Running migration: ${migrationName}`)

      // Import migration file
      const migrationPath = path.join(migrationsDir, file)
      const fileUrl = new URL(`file://${migrationPath.replace(/\\/g, '/')}`)
      const migration: Migration = await import(fileUrl.href).then((m) => m.default)

      // Execute migration within transaction
      db.exec('BEGIN TRANSACTION')
      try {
        await migration.up(db)

        // Record migration
        db.prepare('INSERT INTO migrations (migration, batch) VALUES (?, ?)').run(
          migrationName,
          batch
        )

        db.exec('COMMIT')
        console.log(`Migration complete: ${migrationName}`)
      } catch (error) {
        db.exec('ROLLBACK')
        console.error(`Migration failed: ${migrationName}`, error)
        throw error
      }
    }
  } finally {
    db.close()
  }
}

function tryCreateMigrationsTable(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration TEXT NOT NULL,
      batch INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `)
}
