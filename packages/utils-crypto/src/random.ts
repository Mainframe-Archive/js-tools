// @ts-ignore
import sodium from 'sodium-universal'

export function randomBytes(size: number): Buffer {
  const buffer = Buffer.allocUnsafe(size)
  sodium.randombytes_buf(buffer)
  return buffer
}

export function secureRandomBytes(size: number): Buffer {
  const buffer = sodium.sodium_malloc(size)
  sodium.randombytes_buf(buffer)
  return buffer
}
