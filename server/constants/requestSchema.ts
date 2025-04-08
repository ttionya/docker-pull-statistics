import { z } from 'zod'

const stringToNumber = () =>
  z.string().transform((val, ctx) => {
    const parsed = Number(val)
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid number',
      })
      return z.NEVER
    }
    return parsed
  })

const repository = z
  .string({ required_error: 'Parameter "repository" is required' })
  .regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/, {
    message: 'Invalid repository name. It should be in the format "namespace/repository"',
  })

/**
 * api/repositories/index.post.ts
 */
export const RepositoriesPostSchema = z.object({
  repository,
})

/**
 * api/statistics/count.get.ts
 */
export const StatisticsCountGetSchema = z.object({
  repository,
  from: stringToNumber().optional(),
  to: stringToNumber().optional(),
  timezoneOffset: stringToNumber().optional(),
  dimension: z
    .enum(['month', 'day', 'hour'], {
      message: 'Invalid dimension. Must be "month", "day", or "hour"',
    })
    .optional(),
})

/**
 * api/statistics/import.post.ts
 */
export const StatisticsImportPostSchema = z.object({
  repository,
  file: z.object(
    {
      filename: z.string().regex(/\.csv$/, { message: 'Invalid file type. Must be a CSV file' }),
      type: z.string(),
      data: z.instanceof(Buffer).refine((buffer) => buffer.length > 0, {
        message: 'Invalid file',
      }),
    },
    {
      required_error: 'Parameter "file" is required',
    }
  ),
})
