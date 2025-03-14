import fs from 'fs-extra'
import { RepositoriesService } from '~~/server/database/RepositoriesService'
import { PullStatisticsService } from '~~/server/database/PullStatisticsService'

function importCSV() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/import-csv.ts <csv-file-path> <repository>')
    process.exit(1)
  }

  const csvPath = args[0] as string
  const name = args[1] as string

  const [namespace, repository] = name.split('/')

  if (!namespace || !repository) {
    console.error('Invalid repository name. Should be in format "namespace/repository"')
    process.exit(1)
  }

  // Verify CSV file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  try {
    console.log(`Starting import for ${name}...`)

    const repositoriesService = new RepositoriesService()
    const statisticsService = new PullStatisticsService()

    repositoriesService.transaction(() => {
      // Find or create repository
      const existing = repositoriesService.findByName(name)
      let repositoryId: number

      if (!existing) {
        console.log('Repository not found, creating it...')
        repositoryId = repositoriesService.create(namespace, repository, name)
        console.log(`Created repository with ID: ${repositoryId}`)
      } else {
        repositoryId = existing.id
        console.log(`Repository found with ID: ${repositoryId}`)
      }

      // Read CSV file
      const fileContent = fs.readFileSync(csvPath, 'utf8')
      const lines = fileContent.split('\n').filter((line) => line.trim())

      // Skip header line
      const dataLines = lines.slice(1)
      console.log(`Read ${dataLines.length} records from CSV file`)

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
          statisticsService.create(repositoryId, count, timestamp)
          inserted++
        } else {
          skipped++
        }
      }

      console.log(`Successfully imported ${inserted} records, skipped ${skipped} records`)
    })
  } catch (error) {
    console.error('Error during import:', error)
    process.exit(1)
  }
}

importCSV()
