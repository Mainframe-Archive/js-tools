export function base64decode(input: string): Buffer {
  return Buffer.from(input, 'base64')
}

export function base64encode(input: Buffer): string {
  return input.toString('base64')
}
