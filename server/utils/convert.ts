export function convertDateToString<T extends Date | null | undefined>(
  date: T
): T extends Date ? string : T {
  return (date ? date.toISOString() : date) as never
}
