// @flow

import { createReadStream } from 'fs'
import { hashStream } from '@mainframe/utils-crypto'

export const createFileHash = (
  path: string,
  size?: number,
): Promise<Buffer> => {
  return hashStream(createReadStream(path), size)
}
