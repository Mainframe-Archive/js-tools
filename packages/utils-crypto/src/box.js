// @flow

import sodium from 'sodium-universal'

import {
  hashPassword,
  PASSWORDHASH_MEMLIMIT_SENSITIVE,
  PASSWORDHASH_OPSLIMIT_SENSITIVE,
} from './password'
import { randomBytes, secureRandomBytes } from './random'
import type { KeyPair, EncryptedBox } from './types'

// Constants re-exports

export const BOX_MACBYTES: number = sodium.crypto_box_MACBYTES
export const BOX_NONCEBYTES: number = sodium.crypto_box_NONCEBYTES
export const BOX_PUBLICKEYBYTES: number = sodium.crypto_box_PUBLICKEYBYTES
export const BOX_SECRETKEYBYTES: number = sodium.crypto_box_SECRETKEYBYTES
export const BOX_SEEDBYTES: number = sodium.crypto_box_SEEDBYTES
export const SECRETBOX_KEYBYTES: number = sodium.crypto_secretbox_KEYBYTES
export const SECRETBOX_MACBYTES: number = sodium.crypto_secretbox_MACBYTES
export const SECRETBOX_NONCEBYTES: number = sodium.crypto_secretbox_NONCEBYTES

// Asymmetric encryption

export const createBoxKeyPair = (seed?: Buffer): KeyPair => {
  if (seed != null && seed.length < BOX_SEEDBYTES) {
    throw new Error(
      `Invalid seed, must be at least ${BOX_SEEDBYTES} bytes long`,
    )
  }

  const publicKey = Buffer.allocUnsafe(BOX_PUBLICKEYBYTES)
  const secretKey = sodium.sodium_malloc(BOX_SECRETKEYBYTES)

  if (seed == null) {
    sodium.crypto_box_keypair(publicKey, secretKey)
  } else {
    sodium.crypto_box_seed_keypair(publicKey, secretKey, seed)
  }

  return { publicKey, secretKey }
}

export const createBoxPublicFromSign = (signKey: Buffer): Buffer => {
  const boxKey = Buffer.allocUnsafe(BOX_PUBLICKEYBYTES)
  sodium.crypto_sign_ed25519_pk_to_curve25519(boxKey, signKey)
  return boxKey
}

export const createBoxKeyPairFromSign = (signPair: KeyPair): KeyPair => {
  const secretKey = sodium.sodium_malloc(BOX_SECRETKEYBYTES)
  sodium.crypto_sign_ed25519_sk_to_curve25519(secretKey, signPair.secretKey)
  return {
    publicKey: createBoxPublicFromSign(signPair.publicKey),
    secretKey,
  }
}

export const encryptBox = (
  message: Buffer,
  forPublicKey: Buffer,
  fromSecretKey: Buffer,
): EncryptedBox => {
  const cipher = Buffer.allocUnsafe(message.length + BOX_MACBYTES)
  const nonce = randomBytes(BOX_NONCEBYTES)
  sodium.crypto_box_easy(cipher, message, nonce, forPublicKey, fromSecretKey)
  return { cipher, nonce }
}

export const decryptBox = (
  encrypted: EncryptedBox,
  fromPublicKey: Buffer,
  forSecretKey: Buffer,
): ?Buffer => {
  const message = Buffer.allocUnsafe(encrypted.cipher.length - BOX_MACBYTES)
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
  return secureRandomBytes(SECRETBOX_KEYBYTES)
}

export const createSecretBoxKeyFromPassword = (
  password: Buffer,
  salt: Buffer,
  opslimit?: number = PASSWORDHASH_OPSLIMIT_SENSITIVE,
  memlimit?: number = PASSWORDHASH_MEMLIMIT_SENSITIVE,
  algorithm?: number,
): Promise<Buffer> => {
  const key = sodium.sodium_malloc(SECRETBOX_KEYBYTES)
  return hashPassword(key, password, salt, opslimit, memlimit, algorithm)
}

export const encryptSecretBox = (
  message: Buffer,
  key: Buffer,
): EncryptedBox => {
  const cipher = Buffer.allocUnsafe(message.length + SECRETBOX_MACBYTES)
  const nonce = randomBytes(SECRETBOX_NONCEBYTES)
  sodium.crypto_secretbox_easy(cipher, message, nonce, key)
  return { cipher, nonce }
}

export const decryptSecretBox = (
  encrypted: EncryptedBox,
  key: Buffer,
): ?Buffer => {
  const message = Buffer.allocUnsafe(
    encrypted.cipher.length - SECRETBOX_MACBYTES,
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
