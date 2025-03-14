import { getDatabase } from '../utils/db'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || ''
  const accessToken = process.env.ACCESS_TOKEN

  if (!accessToken || token !== accessToken) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid token',
    })
  }

  const body = await readBody(event)
  const { repository: name } = body

  if (!name || typeof name !== 'string' || !name.includes('/')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid repository name. Must be in format "namespace/repository"',
    })
  }

  const [namespace, repository] = name.split('/')

  if (!namespace || !repository) {
    throw createError({
      statusCode: 400,
      message: 'Invalid repository name. Must be in format "namespace/repository"',
    })
  }

  const db = getDatabase()

  try {
    const existing = db
      .prepare('SELECT id FROM repositories WHERE namespace = ? AND repository = ?')
      .get(namespace, repository)

    if (existing) {
      throw createError({
        statusCode: 409,
        message: `Repository ${name} already exists`,
      })
    }

    const result = db
      .prepare('INSERT INTO repositories (namespace, repository, name) VALUES (?, ?, ?)')
      .run(namespace, repository, name)

    return {
      id: result.lastInsertRowid,
      namespace,
      repository,
      name,
    }
  } finally {
    db.close()
  }
})
