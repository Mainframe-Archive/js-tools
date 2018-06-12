// @flow

import { outputJson, readJson } from 'fs-extra'

import type { SecureContents, SecureFile } from './types'

export const readSecureFile = async (
  path: string,
): Promise<SecureFile<SecureContents>> => {
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

export const writeSecureFile = (
  path: string,
  contents: SecureContents,
  metadata?: Object,
): Promise<void> => {
  return outputJson(path, {
    version: 1,
    contents,
    metadata,
  })
}
