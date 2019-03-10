import { KeyPair, openSigned, sign } from '@mainframe/utils-crypto'

import { base64decode, base64encode } from './base64'
import { readSecureFile, writeSecureFile } from './fs'
import { SignedContents, SecureFile, SecureFileOpened } from './types'

export function verifyContents(
  contents: SignedContents,
  keys?: Array<Buffer>,
): Buffer | null {
  if (contents.version !== 1 || contents.type !== 'signed') {
    throw new Error('Invalid input')
  }

  let message: Buffer | null = base64decode(contents.signed.message)
  // Clone array as `reverse()` mutates in-place
  // Array is reversed as verifying must be done in reverse order from signing
  const verifyKeys = keys
    ? [...keys]
    : [...contents.signed.keys].map(base64decode)
  for (const key of verifyKeys.reverse()) {
    if (message == null) {
      return null
    }
    message = openSigned(message, key)
  }

  return message
}

export function signContents(
  data: Buffer,
  keyPairs: KeyPair | Array<KeyPair>,
): SignedContents {
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
      keys[i] = base64encode(pair.publicKey)
      signKeys[i] = pair.secretKey
    })

    for (const key of signKeys) {
      signed = sign(signed, key)
    }
  } else {
    keys = [base64encode(keyPairs.publicKey)]
    signed = sign(data, keyPairs.secretKey)
  }

  return {
    version: 1,
    type: 'signed',
    signed: { keys, message: base64encode(signed) },
  }
}

export async function readSignedFile<T = any>(
  path: string,
  keys?: Array<Buffer>,
): Promise<SecureFileOpened<SignedContents, T>> {
  const file: SecureFile<SignedContents, T> = await readSecureFile(path)
  return { file, opened: verifyContents(file.contents, keys) }
}

export async function writeSignedFile<T = any>(
  path: string,
  data: Buffer,
  keyPairs: KeyPair | Array<KeyPair>,
  metadata?: T,
): Promise<void> {
  await writeSecureFile(path, signContents(data, keyPairs), metadata)
}
