export function createUuid(): string {
  return new Array(4)
    .fill(null)
    .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
    .join('-')
}
