import Database from 'better-sqlite3'
import { useRuntimeConfig } from '#imports'

export function getDatabase() {
  return new Database(useRuntimeConfig().dbPath)
}
