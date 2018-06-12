// @flow

import { encodeBase64, decodeBase64 } from '@mainframe/utils-base64'
import {
  openSigned,
  sign,
  type KeyPair, // eslint-disable-line import/named
} from '@mainframe/utils-crypto'

import { readSecureFile, writeSecureFile } from './fs'
import type {
  EncryptedContents,
  SignedContents,
  OpenedSecureFile,
} from './types'

export const verifyContents = (
  contents: SignedContents,
  keys?: Array<Buffer>,
): ?Buffer => {
  if (contents.version !== 1 || contents.type !== 'signed') {
    throw new Error('Invalid input')
  }

  let message = decodeBase64(contents.signed.message)
  // Clone array as `reverse()` mutates in-place
  // Array is reversed as verifying must be done in reverse order from signing
  const verifyKeys = keys
    ? [...keys]
    : [...contents.signed.keys].map(decodeBase64)
  for (const key of verifyKeys.reverse()) {
    if (message == null) {
      return
    }
    message = openSigned(message, key)
  }

  return message
}

export const signContents = (
  data: Buffer,
  keyPairs: KeyPair | Array<KeyPair>,
): SignedContents => {
  let keys, signed

  if (Array.isArray(keyPairs)) {
    const size = keyPairs.length
    if (size === 0) {
      throw new Error('Missing signing keys')
    }

    keys = new Array(size) // Public keys returned in reverse (decoding) order
    const signKeys = new Array(size) // Secret keys used to sign

    signed = data
    keyPairs.forEach((pair, i) => {
      keys[i] = encodeBase64(pair.publicKey)
      signKeys[i] = pair.secretKey
    })

    for (const key of signKeys) {
      signed = sign(signed, key)
    }
  } else {
    keys = [encodeBase64(keyPairs.publicKey)]
    signed = sign(data, keyPairs.secretKey)
  }

  return {
    version: 1,
    type: 'signed',
    signed: { keys, message: encodeBase64(signed) },
  }
}

export const readSignedFile = async (
  path: string,
  keys?: Array<Buffer>,
): Promise<OpenedSecureFile<SignedContents>> => {
  // $FlowFixMe: file type
  const file: SecureFile<SignedContents> = await readSecureFile(path)
  return { file, opened: verifyContents(file.contents, keys) }
}

export const writeSignedFile = (
  path: string,
  data: Buffer,
  keyPairs: KeyPair | Array<KeyPair>,
  metadata?: Object,
): Promise<void> => {
  return writeSecureFile(path, signContents(data, keyPairs), metadata)
}
