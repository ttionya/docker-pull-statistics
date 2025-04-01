import { z } from 'zod'
import type { H3Event } from 'h3'

export async function readValidatedFormData<T extends z.ZodType>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'Invalid formdata',
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formFields: Record<string, any> = {}

  for (const part of formData) {
    if (!part.name) continue

    if (part.filename) {
      // file
      formFields[part.name] = {
        filename: part.filename,
        type: part.type,
        data: part.data,
      }
    } else {
      // other
      formFields[part.name] = Buffer.from(part.data).toString('utf-8')
    }
  }

  try {
    return schema.parse(formFields)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors.map((e) => e.message).join(', '),
      })
    }
    throw error
  }
}
