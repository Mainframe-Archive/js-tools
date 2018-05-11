// @flow

import sodium from 'sodium-universal'

import { randomBytes, secureRandomBytes } from './random'
import type { KeyPair, EncryptedBox } from './types'

// Asymmetric encryption

export const createBoxKeyPair = (seed?: Buffer): KeyPair => {
  if (seed != null && seed.length < sodium.crypto_box_SEEDBYTES) {
    throw new Error(
      `Invalid seed, must be at least ${
        sodium.crypto_box_SEEDBYTES
      } bytes long`,
    )
  }

  const publicKey = Buffer.allocUnsafe(sodium.crypto_box_PUBLICKEYBYTES)
  const secretKey = sodium.sodium_malloc(sodium.crypto_box_SECRETKEYBYTES)

  if (seed == null) {
    sodium.crypto_box_keypair(publicKey, secretKey)
  } else {
    sodium.crypto_box_seed_keypair(publicKey, secretKey, seed)
  }

  return { publicKey, secretKey }
}

export const encryptBox = (
  message: Buffer,
  forPublicKey: Buffer,
  fromSecretKey: Buffer,
): EncryptedBox => {
  const cipher = Buffer.allocUnsafe(message.length + sodium.crypto_box_MACBYTES)
  const nonce = randomBytes(sodium.crypto_box_NONCEBYTES)
  sodium.crypto_box_easy(cipher, message, nonce, forPublicKey, fromSecretKey)
  return { cipher, nonce }
}

export const decryptBox = (
  encrypted: EncryptedBox,
  fromPublicKey: Buffer,
  forSecretKey: Buffer,
): ?Buffer => {
  const message = Buffer.allocUnsafe(
    encrypted.cipher.length - sodium.crypto_box_MACBYTES,
  )
  const decrypted = sodium.crypto_box_open_easy(
    message,
    encrypted.cipher,
    encrypted.nonce,
    fromPublicKey,
    forSecretKey,
  )
  if (decrypted) {
    return message
  }
}

// Symmetric encryption

export const createSecretBoxKey = (): Buffer => {
  return secureRandomBytes(sodium.crypto_secretbox_KEYBYTES)
}

export const encryptSecretBox = (
  message: Buffer,
  key: Buffer,
): EncryptedBox => {
  const cipher = Buffer.allocUnsafe(
    message.length + sodium.crypto_secretbox_MACBYTES,
  )
  const nonce = randomBytes(sodium.crypto_secretbox_NONCEBYTES)
  sodium.crypto_secretbox_easy(cipher, message, nonce, key)
  return { cipher, nonce }
}

export const decryptSecretBox = (
  encrypted: EncryptedBox,
  key: Buffer,
): ?Buffer => {
  const message = Buffer.allocUnsafe(
    encrypted.cipher.length - sodium.crypto_secretbox_MACBYTES,
  )
  const decrypted = sodium.crypto_secretbox_open_easy(
    message,
    encrypted.cipher,
    encrypted.nonce,
    key,
  )
  if (decrypted) {
    return message
  }
}
