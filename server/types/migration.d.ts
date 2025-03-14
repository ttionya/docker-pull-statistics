import type { DBInstance } from '~~/server/types/db'

export interface Migration {
  up: (db: DBInstance) => Promise<void> | void
  down?: (db: DBInstance) => Promise<void> | void
}
