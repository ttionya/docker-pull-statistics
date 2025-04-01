export function isNumber(num?: unknown): boolean {
  return typeof num === 'number' && !isNaN(num)
}
