import type { H3Event } from 'h3'

/**
 * Check if the request is authorized
 */
export function isAuthorized(event: H3Event): boolean {
  return !!event.context.authorized
}

/**
 * Throw an error when the request is not authorized
 */
export function requireAuth(event: H3Event): void {
  if (!isAuthorized(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid token',
    })
  }
}
