import path from 'path'
import { packageDirectorySync } from 'pkg-dir'
import Database from 'better-sqlite3'

const dbPath = path.join(packageDirectorySync({ cwd: import.meta.url })!, 'data/database.sqlite')

export function getDatabase() {
  return new Database(dbPath)
}
