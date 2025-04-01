const config = useRuntimeConfig()

export default defineEventHandler((event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || ''

  event.context.authorized = config.accessToken && token === config.accessToken
})
