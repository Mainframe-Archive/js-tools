// @flow

import type { Readable } from 'stream'
import sodium from 'sodium-universal'

export const GENERICHASH_BYTES: number = sodium.crypto_generichash_BYTES
export const GENERICHASH_BYTES_MAX: number = sodium.crypto_generichash_BYTES_MAX
export const GENERICHASH_BYTES_MIN: number = sodium.crypto_generichash_BYTES_MIN

export const hash = (
  input: Buffer,
  size?: number = GENERICHASH_BYTES,
  key?: Buffer,
): Buffer => {
  const output = Buffer.allocUnsafe(size)
  sodium.crypto_generichash(output, input, key)
  return output
}

export const hashStream = (
  stream: Readable,
  size?: number = GENERICHASH_BYTES,
): Promise<Buffer> => {
  const instance = sodium.crypto_generichash_instance(null, size)
  return new Promise((resolve, reject) => {
    stream
      .on('data', chunk => {
        instance.update(chunk)
      })
      .on('error', reject)
      .on('end', () => {
        const output = Buffer.allocUnsafe(size)
        instance.final(output)
        resolve(output)
      })
  })
}
