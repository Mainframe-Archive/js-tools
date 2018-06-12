// @flow

import { hashStream } from '@mainframe/utils-crypto'
import { createReadStream } from 'fs-extra'

export const createFileHash = (
  path: string,
  size?: number,
): Promise<Buffer> => {
  return hashStream(createReadStream(path), size)
}
