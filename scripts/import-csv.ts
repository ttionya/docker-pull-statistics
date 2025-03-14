import fs from 'fs-extra'
import { getDatabase } from '~~/server/utils/db'
import type { DBRepositories } from '~~/server/types/db'

async function importCSV() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/import-csv.ts <csv-file-path> <repository>')
    process.exit(1)
  }

  const CSV_PATH = args[0] as string
  const repoName = args[1] as string

  // Split the full repository name
  const [NAMESPACE, REPOSITORY] = repoName.split('/')

  if (!NAMESPACE || !REPOSITORY) {
    console.error('Invalid repository name. Should be in format "namespace/repository"')
    process.exit(1)
  }

  // Verify CSV file exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV file not found: ${CSV_PATH}`)
    process.exit(1)
  }

  const db = getDatabase()

  try {
    console.log(`Starting import for ${repoName}...`)

    db.exec('BEGIN TRANSACTION')

    const repo = db
      .prepare('SELECT id FROM repositories WHERE name = ?')
      .get(repoName) as DBRepositories

    let repositoryId: number

    if (!repo) {
      console.log('Repository not found, creating it...')
      const result = db
        .prepare('INSERT INTO repositories (namespace, repository, name) VALUES (?, ?, ?)')
        .run(NAMESPACE, REPOSITORY, repoName)

      repositoryId = result.lastInsertRowid as number
      console.log(`Created repository with ID: ${repositoryId}`)
    } else {
      repositoryId = repo.id
      console.log(`Repository found with ID: ${repositoryId}`)
    }

    // Read CSV file
    const fileContent = fs.readFileSync(CSV_PATH, 'utf8')
    const lines = fileContent.split('\n').filter((line) => line.trim())

    // Skip header line
    const dataLines = lines.slice(1)
    console.log(`Read ${dataLines.length} records from CSV file`)

    // Prepare insert statement
    const insertStat = db.prepare(
      'INSERT INTO pull_statistics (repository_id, count, created_at) VALUES (?, ?, ?)'
    )

    // Process and insert records
    let inserted = 0
    let skipped = 0

    for (const line of dataLines) {
      const [timeStr, countStr] = line.split(',')
      if (!timeStr || !countStr) {
        skipped++
        continue
      }

      const timestamp = parseInt(timeStr)
      const count = parseInt(countStr)

      // Validate count is a valid number
      if (isNaN(count)) {
        console.log(`Skipping record with invalid count: ${line}`)
        skipped++
        continue
      }

      const date = new Date(timestamp)
      const minutes = date.getMinutes()

      // Keep only XX:00 and XX:30 entries
      if (minutes === 0 || minutes === 30) {
        // Convert to Unix timestamp (seconds)
        const unixTimestamp = Math.floor(timestamp)
        insertStat.run(repositoryId, count, unixTimestamp)
        inserted++
      } else {
        skipped++
      }
    }

    // Commit transaction
    db.exec('COMMIT')
    console.log(`Successfully imported ${inserted} records, skipped ${skipped} records`)
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK')
    console.error('Error during import:', error)
  } finally {
    // Close database connection
    db.close()
  }
}

importCSV().catch(console.error)
