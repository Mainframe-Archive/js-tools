// @flow

import sodium from 'sodium-universal'

export const randomBytes = (size: number): Buffer => {
  const buffer = Buffer.allocUnsafe(size)
  sodium.randombytes_buf(buffer)
  return buffer
}

export const secureRandomBytes = (size: number): Buffer => {
  const buffer = sodium.sodium_malloc(size)
  sodium.randombytes_buf(buffer)
  return buffer
}
