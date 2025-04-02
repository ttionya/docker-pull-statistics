const accessToken = process.env.ACCESS_TOKEN

export default defineEventHandler((event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '') || ''

  event.context.authorized = accessToken && token === accessToken
})
