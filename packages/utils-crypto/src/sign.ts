// @ts-ignore
import sodium from 'sodium-universal'

import { KeyPair } from './types'

export const SIGN_BYTES: number = sodium.crypto_sign_BYTES
export const SIGN_PUBLICKEYBYTES: number = sodium.crypto_sign_PUBLICKEYBYTES
export const SIGN_SECRETKEYBYTES: number = sodium.crypto_sign_SECRETKEYBYTES
export const SIGN_SEEDBYTES: number = sodium.crypto_sign_SEEDBYTES

export function createSignKeyPair(seed?: Buffer): KeyPair {
  if (seed != null && seed.length < SIGN_SEEDBYTES) {
    throw new Error(
      `Invalid seed, must be at least ${SIGN_SEEDBYTES} bytes long`,
    )
  }

  const publicKey = Buffer.allocUnsafe(SIGN_PUBLICKEYBYTES)
  const secretKey = sodium.sodium_malloc(SIGN_SECRETKEYBYTES)

  if (seed == null) {
    sodium.crypto_sign_keypair(publicKey, secretKey)
  } else {
    sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed)
  }

  return { publicKey, secretKey }
}

export function getSignature(data: Buffer, secretKey: Buffer): Buffer {
  const signature = Buffer.allocUnsafe(SIGN_BYTES)
  sodium.crypto_sign_detached(signature, data, secretKey)
  return signature
}

export function verifySignature(
  data: Buffer,
  signature: Buffer,
  publicKey: Buffer,
): boolean {
  return sodium.crypto_sign_verify_detached(signature, data, publicKey)
}

export function sign(data: Buffer, secretKey: Buffer): Buffer {
  const signed = Buffer.allocUnsafe(SIGN_BYTES + data.length)
  sodium.crypto_sign(signed, data, secretKey)
  return signed
}

export function openSigned(signed: Buffer, publicKey: Buffer): Buffer | null {
  const data = Buffer.allocUnsafe(signed.length - SIGN_BYTES)
  const verified = sodium.crypto_sign_open(data, signed, publicKey)
  return verified ? data : null
}
