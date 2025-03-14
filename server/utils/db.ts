import path from 'path'
import fs from 'fs-extra'
import Database from 'better-sqlite3'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'database.sqlite')

fs.ensureDirSync(DB_DIR)

export function getDatabase() {
  return new Database(DB_PATH)
}
