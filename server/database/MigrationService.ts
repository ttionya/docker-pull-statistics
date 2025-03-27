import BaseDatabaseService from './BaseDatabaseService'
import type { DBMigrations, FindDBMigrations } from '~~/server/types/db'
import type { Migration } from '~~/server/types/migration'

export class MigrationService extends BaseDatabaseService<DBMigrations> {
  constructor() {
    super('migrations')
  }

  public createTable(): void {
    return this.execute((db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          migration TEXT NOT NULL,
          batch INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
      `)
    })
  }

  public runMigration(migration: Migration, migrationName: string, batch: number): void {
    return this.transaction((db) => {
      migration.up(db)

      this.create(migrationName, batch)
    })
  }

  public findLastBatch(): number {
    return this.execute((db) => {
      type Batch = Pick<DBMigrations, 'batch'> | undefined

      const result = db.prepare('SELECT MAX(batch) as batch FROM migrations').get() as Batch

      return result?.batch || 0
    })
  }

  public findByMigration(migrationName: string): FindDBMigrations {
    return this.execute(
      (db) =>
        db
          .prepare('SELECT * FROM migrations WHERE migration = ?')
          .get(migrationName) as FindDBMigrations
    )
  }

  private create(migrationName: string, batch: number, timestamp = Date.now()): number {
    return this.execute((db) => {
      const result = db
        .prepare('INSERT INTO migrations (migration, batch, created_at) VALUES (?, ?, ?)')
        .run(migrationName, batch, timestamp)

      return Number(result.lastInsertRowid)
    })
  }

  public rollbackBatch(batch: number): number {
    return this.execute((db) => {
      const result = db.prepare('DELETE FROM migrations WHERE batch = ?').run(batch)

      return result.changes
    })
  }
}
