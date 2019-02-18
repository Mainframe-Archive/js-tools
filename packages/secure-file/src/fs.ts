import { outputJson, readJson } from 'fs-extra'

// seems like the parser doesn't recognise "type" exports
// eslint-disable-next-line import/named
import { SecureContents, SecureFile } from './types'

export async function readSecureFile<T>(path: string): Promise<SecureFile<T>> {
  const file = await readJson(path)
  if (
    typeof file !== 'object' ||
    file.version !== 1 ||
    typeof file.contents !== 'object'
  ) {
    throw new Error('Invalid file')
  }
  return file
}

export async function writeSecureFile<C = SecureContents, M = any>(
  path: string,
  contents: C,
  metadata?: M,
): Promise<void> {
  await outputJson(path, {
    version: 1,
    contents,
    metadata,
  })
}
